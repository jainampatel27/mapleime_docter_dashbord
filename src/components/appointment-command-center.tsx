"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    CheckCircle2,
    XCircle,
    Loader2,
    ChevronDown,
    ChevronUp,
    Zap,
    AlertCircle,
} from "lucide-react";
import { UserCheck, UserMinus } from "lucide-react";
import { useRouter } from "next/navigation";
import { updateAppointmentStatusAction, updateAppointmentDecisionAction } from "@/app/actions/appointment-actions";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Appointment {
    id: string;
    trackingId: number | null;
    patientName: string;
    date: string;
    time: string;
    status: string;
    doctorTimeZone?: string;
}

interface Props {
    appointment: Appointment;
    doctorId: string;
}

// ─── Action config ────────────────────────────────────────────────────────────

const ACTIONS = [
    {
        status: "approved",
        label: "Approve",
        icon: CheckCircle2,
        className:
            "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600",
        description: "Confirm & notify patient via email + SMS",
    },
    {
        status: "canceled",
        label: "Cancel",
        icon: XCircle,
        className:
            "bg-red-600 hover:bg-red-700 text-white border-red-600",
        description: "Cancel & notify patient via email + SMS",
        requiresNote: true,
    },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function AppointmentCommandCenter({ appointment, doctorId }: Props) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState<string | null>(null);
    const [note, setNote] = useState("");
    const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

    // Determine if appointment has passed based on Doctor's specific Timezone
    const isPast = (() => {
        try {
            if (!appointment.date || !appointment.time) return false;

            // This represents the appointment time as standard system local time for comparison purposes
            const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}:00`);

            if (appointment.doctorTimeZone) {
                // Get the current real-world time in the doctor's specific timezone
                const formatter = new Intl.DateTimeFormat('en-US', {
                    timeZone: appointment.doctorTimeZone,
                    year: 'numeric', month: 'numeric', day: 'numeric',
                    hour: 'numeric', minute: 'numeric', second: 'numeric',
                    hour12: false
                });

                const parts = formatter.formatToParts(new Date());
                const tzMap = Object.fromEntries(parts.map(p => [p.type, p.value]));

                // Construct a local Date object representing "now" in the doctor's timezone
                // If the hour is 24, wrap to 00
                const tzHour = tzMap.hour === "24" ? "00" : tzMap.hour.padStart(2, '0');

                const nowInTz = new Date(
                    `${tzMap.year}-${tzMap.month.padStart(2, '0')}-${tzMap.day.padStart(2, '0')}T${tzHour}:${tzMap.minute.padStart(2, '0')}:00`
                );

                return appointmentDateTime.getTime() < nowInTz.getTime();
            }

            // Fallback if no timezone attached
            return appointmentDateTime.getTime() < Date.now();
        } catch (e) {
            console.error("Timezone computation error", e);
            return false;
        }
    })();

    const isApproved = appointment.status === "approved";
    const currentStatus = (appointment.status || "pending").toLowerCase();

    // Hide command center entirely if the appointment is completed or canceled
    if (currentStatus === "completed" || currentStatus === "canceled") {
        return null;
    }

    // Dynamically build actions list based on current state
    const availableActions = ACTIONS.filter((a) => a.status !== currentStatus);

    if (isApproved && isPast) {
        availableActions.unshift(
            {
                status: "not_shown",
                label: "No Show",
                icon: UserMinus,
                className: "bg-orange-500 hover:bg-orange-600 text-white border-orange-500",
                description: "Mark attendance: Patient did not show up",
                requiresNote: true, // Note why they didn't show
            }
        );
        availableActions.unshift(
            {
                status: "shown",
                label: "Mark Show",
                icon: UserCheck,
                className: "bg-teal-600 hover:bg-teal-700 text-white border-teal-600",
                description: "Mark attendance: Patient showed up",
                requiresNote: false, // Optional
            }
        );
    }

    const showToast = (type: "success" | "error", msg: string) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 4000);
    };

    const handleAction = async (status: string) => {
        if (loading) return;
        setLoading(status);
        try {
            let result;

            if (status === "shown" || status === "not_shown") {
                result = await updateAppointmentDecisionAction(
                    appointment.id,
                    doctorId,
                    status,
                    note || undefined
                );
            } else {
                result = await updateAppointmentStatusAction(
                    appointment.id,
                    doctorId,
                    status,
                    note || undefined
                );
            }

            if (result.success) {
                showToast("success", result.message);
                setNote("");
                setOpen(false);
            } else {
                showToast("error", result.message);
            }
        } catch (err: unknown) {
            showToast("error", err instanceof Error ? err.message : "Unknown error");
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="relative">
            {/* Trigger button */}
            <Button
                size="sm"
                variant="outline"
                className="h-8 px-3 text-xs font-medium gap-1.5"
                onClick={() => setOpen((v) => !v)}
                title="Command Center"
            >
                Decision
                {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </Button>

            {/* Dropdown panel */}
            {open && (
                <div className="absolute right-0 top-9 z-50 w-72 rounded-xl border bg-card shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">

                    {/* Header */}
                    <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/40">
                        <Zap className="h-4 w-4 text-primary shrink-0" />
                        <div className="min-w-0">
                            <p className="text-xs font-semibold text-foreground truncate">
                                {appointment.patientName}
                                {appointment.trackingId ? ` · #${appointment.trackingId}` : ""}
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                                {appointment.date} · {appointment.time}
                            </p>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="p-3 flex flex-col gap-2">
                        {availableActions.map((action) => {
                            const Icon = action.icon;
                            const isLoading = loading === action.status;
                            return (
                                <div key={action.status}>
                                    {action.requiresNote && (
                                        <textarea
                                            className="w-full text-xs rounded-md border bg-background px-2 py-1.5 mb-1.5 resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                                            rows={2}
                                            placeholder="Reason or notes (optional)"
                                            value={note}
                                            onChange={(e) => setNote(e.target.value)}
                                        />
                                    )}
                                    <button
                                        onClick={() => handleAction(action.status)}
                                        disabled={!!loading}
                                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold border transition-all disabled:opacity-60 disabled:cursor-not-allowed ${action.className}`}
                                    >
                                        {isLoading ? (
                                            <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
                                        ) : (
                                            <Icon className="h-3.5 w-3.5 shrink-0" />
                                        )}
                                        <span className="flex-1 text-left">{action.label}</span>
                                        <span className="opacity-75 font-normal text-[10px] hidden sm:block">
                                            {action.description}
                                        </span>
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    {/* Current status badge */}
                    <div className="px-4 py-2.5 border-t bg-muted/30 flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Current:</span>
                        <span className="text-[11px] font-semibold text-foreground capitalize">{appointment.status}</span>
                    </div>
                </div>
            )}

            {/* Toast notification */}
            {toast && (
                <div
                    className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg text-sm font-medium animate-in fade-in slide-in-from-bottom-3 duration-300 ${toast.type === "success"
                        ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-300"
                        : "bg-red-50 border-red-200 text-red-800 dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-300"
                        }`}
                >
                    {toast.type === "success" ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                    ) : (
                        <AlertCircle className="h-4 w-4 shrink-0" />
                    )}
                    {toast.msg}
                </div>
            )}
        </div>
    );
}
