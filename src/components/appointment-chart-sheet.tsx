"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
    User, Mail, Phone, MapPin, Calendar, Clock, Activity,
    DollarSign, FileText, ClipboardList, Users, RefreshCw,
    XCircle, CheckCircle2, AlertCircle, Hash, CalendarDays,
} from "lucide-react";
import { fetchAppointmentDetail, AppointmentDetail } from "@/app/actions/fetch-appointment-detail";

interface Props {
    appointmentId: string;
    doctorId: string;
    // Basic preview data already loaded on the list item
    patientName: string;
    status: string;
}

function statusColor(status: string) {
    switch (status.toLowerCase()) {
        case "completed": return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20";
        case "pending": return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20";
        case "approved": return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20";
        case "canceled":
        case "cancelled": return "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20";
        default: return "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700";
    }
}

function attendanceColor(v: string | null) {
    if (!v) return "";
    return v === "shown"
        ? "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
        : "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20";
}

function formatDate(s: string | null) {
    if (!s) return "—";
    return new Date(s).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" });
}

function formatDateTime(s: string | null) {
    if (!s) return "—";
    return new Date(s).toLocaleString("en-CA", { dateStyle: "medium", timeStyle: "short" });
}

function Row({ label, value, icon }: { label: string; value: React.ReactNode; icon?: React.ReactNode }) {
    return (
        <div className="flex items-start gap-3 py-2">
            {icon && <span className="mt-0.5 text-muted-foreground shrink-0">{icon}</span>}
            <div className="flex-1 min-w-0 flex justify-between gap-4">
                <span className="text-xs text-muted-foreground shrink-0">{label}</span>
                <span className="text-xs font-medium text-foreground text-right wrap-break-word max-w-[55%]">{value || "—"}</span>
            </div>
        </div>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">{title}</p>
            <div className="rounded-xl border bg-card px-4 divide-y divide-border">
                {children}
            </div>
        </div>
    );
}

function LoadingSkeleton() {
    return (
        <div className="flex flex-col gap-4 p-1">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col gap-2">
                    <Skeleton className="h-3 w-24" />
                    <div className="rounded-xl border p-4 flex flex-col gap-3">
                        {[1, 2, 3].map((j) => (
                            <div key={j} className="flex justify-between">
                                <Skeleton className="h-3 w-20" />
                                <Skeleton className="h-3 w-28" />
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

export function AppointmentChartSheet({ appointmentId, doctorId, patientName, status }: Props) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [detail, setDetail] = useState<AppointmentDetail | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function handleOpen() {
        setOpen(true);
        if (detail) return; // Already loaded, don't re-fetch
        setLoading(true);
        setError(null);
        try {
            const result = await fetchAppointmentDetail(appointmentId, doctorId);
            setDetail(result);
        } catch (err: any) {
            setError(err.message ?? "Failed to load appointment detail.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs font-medium hidden sm:flex"
                onClick={handleOpen}
            >
                View Chart
            </Button>

            <Sheet open={open} onOpenChange={setOpen}>
                <SheetContent side="right" className="w-full sm:max-w-130 p-0 flex flex-col">
                    <SheetHeader className="px-6 pt-6 pb-4 border-b shrink-0">
                        <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                                <SheetTitle className="text-base truncate">{patientName}</SheetTitle>
                                <SheetDescription className="text-xs mt-0.5">
                                    Patient Chart
                                    {detail?.trackingId && (
                                        <span className="ml-2 font-mono text-foreground">#{detail.trackingId}</span>
                                    )}
                                </SheetDescription>
                            </div>
                            <Badge className={`text-[11px] border shrink-0 ${statusColor(status)}`} variant="outline">
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </Badge>
                        </div>
                    </SheetHeader>

                    <ScrollArea className="flex-1 px-6 py-4">
                        {loading && <LoadingSkeleton />}

                        {error && (
                            <div className="rounded-xl border border-red-200 bg-red-50 dark:border-red-500/20 dark:bg-red-500/5 p-4 flex items-center gap-3 text-sm text-red-700 dark:text-red-400">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                {error}
                            </div>
                        )}

                        {!loading && !error && detail && (
                            <div className="flex flex-col gap-5 pb-8">

                                {/* Patient Demographics */}
                                <Section title="Patient Information">
                                    <Row icon={<User className="h-3.5 w-3.5" />} label="Full Name" value={detail.patientName} />
                                    <Row icon={<Mail className="h-3.5 w-3.5" />} label="Email" value={detail.patientEmail} />
                                    <Row icon={<Phone className="h-3.5 w-3.5" />} label="Phone" value={detail.patientPhone} />
                                    <Row icon={<CalendarDays className="h-3.5 w-3.5" />} label="Date of Birth" value={detail.patientDateOfBirth ? formatDate(detail.patientDateOfBirth + "T00:00:00") : null} />
                                    <Row icon={<User className="h-3.5 w-3.5" />} label="Gender" value={detail.patientGender ? detail.patientGender.charAt(0).toUpperCase() + detail.patientGender.slice(1) : null} />
                                    <Row icon={<MapPin className="h-3.5 w-3.5" />} label="Address" value={detail.patientAddress} />
                                    <Row icon={<MapPin className="h-3.5 w-3.5" />} label="Postal Code" value={detail.patientPostalCode} />
                                </Section>

                                {/* Appointment Details */}
                                <Section title="Appointment Details">
                                    <Row icon={<Hash className="h-3.5 w-3.5" />} label="Tracking ID" value={detail.trackingId ? `#${detail.trackingId}` : null} />
                                    <Row icon={<Calendar className="h-3.5 w-3.5" />} label="Date" value={detail.date} />
                                    <Row icon={<Clock className="h-3.5 w-3.5" />} label="Time" value={detail.time} />
                                    <Row icon={<Activity className="h-3.5 w-3.5" />} label="Type" value={detail.appointmentType} />
                                    <Row icon={<DollarSign className="h-3.5 w-3.5" />} label="Fee" value={detail.fee != null ? `$${detail.fee}` : null} />
                                    <Row
                                        icon={<ClipboardList className="h-3.5 w-3.5" />}
                                        label="Status"
                                        value={
                                            <Badge className={`text-[11px] border ${statusColor(detail.status)}`} variant="outline">
                                                {detail.status.charAt(0).toUpperCase() + detail.status.slice(1)}
                                            </Badge>
                                        }
                                    />
                                    {detail.statusNotes && <Row icon={<FileText className="h-3.5 w-3.5" />} label="Status Notes" value={detail.statusNotes} />}
                                    {detail.notes && <Row icon={<FileText className="h-3.5 w-3.5" />} label="Patient Notes" value={detail.notes} />}
                                    <Row label="Booked At" value={formatDateTime(detail.createdAt)} />
                                    {detail.updatedAt && <Row label="Last Updated" value={formatDateTime(detail.updatedAt)} />}
                                </Section>

                                {/* Attendance */}
                                {(detail.attendance || detail.attendanceNotes) && (
                                    <Section title="Attendance">
                                        {detail.attendance && (
                                            <Row
                                                label="Status"
                                                value={
                                                    <Badge className={`text-[11px] border ${attendanceColor(detail.attendance)}`} variant="outline">
                                                        {detail.attendance === "shown" ? "Shown" : "Not Shown"}
                                                    </Badge>
                                                }
                                            />
                                        )}
                                        {detail.attendanceNotes && <Row label="Notes" value={detail.attendanceNotes} />}
                                        {detail.attendanceUpdatedByName && <Row label="Recorded By" value={detail.attendanceUpdatedByName} />}
                                        {detail.attendanceUpdatedAt && <Row label="Recorded At" value={formatDateTime(detail.attendanceUpdatedAt)} />}
                                    </Section>
                                )}

                                {/* Family Members */}
                                {detail.familyMembers.length > 0 && (
                                    <div className="flex flex-col gap-1">
                                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                                            Family Members ({detail.familyMembers.length})
                                        </p>
                                        <div className="flex flex-col gap-2">
                                            {detail.familyMembers.map((fm, i) => (
                                                <div key={i} className="rounded-xl border bg-card px-4 py-3 flex items-center gap-3">
                                                    <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                                                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-semibold text-foreground truncate">{fm.name}</p>
                                                        <p className="text-[11px] text-muted-foreground mt-0.5">
                                                            {fm.gender.charAt(0).toUpperCase() + fm.gender.slice(1)} · DOB: {fm.dateOfBirth}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Cancellation */}
                                {detail.cancellationStatus && (
                                    <Section title="Cancellation Request">
                                        <Row icon={<XCircle className="h-3.5 w-3.5" />} label="Status" value={detail.cancellationStatus} />
                                        {detail.cancellationReason && <Row label="Reason" value={detail.cancellationReason} />}
                                    </Section>
                                )}

                                {/* Reschedule History */}
                                {detail.rescheduleHistory.length > 0 && (
                                    <div className="flex flex-col gap-1">
                                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                                            Reschedule History ({detail.rescheduleHistory.length})
                                        </p>
                                        <div className="flex flex-col gap-2">
                                            {detail.rescheduleHistory.map((r, i) => (
                                                <div key={i} className="rounded-xl border bg-card px-4 py-3 flex flex-col gap-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <RefreshCw className="h-3 w-3 text-muted-foreground shrink-0" />
                                                        <span className="text-[11px] text-muted-foreground">Entry {i + 1}</span>
                                                        {r.rescheduledAt && (
                                                            <span className="text-[11px] text-muted-foreground ml-auto">{formatDateTime(r.rescheduledAt)}</span>
                                                        )}
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 pl-5">
                                                        <div>
                                                            <p className="text-[10px] text-muted-foreground">From</p>
                                                            <p className="text-xs font-medium text-foreground">{r.oldDate ?? "—"} {r.oldTime && `· ${r.oldTime}`}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] text-muted-foreground">To</p>
                                                            <p className="text-xs font-medium text-foreground">{r.newDate ?? "—"} {r.newTime && `· ${r.newTime}`}</p>
                                                        </div>
                                                    </div>
                                                    {r.reason && (
                                                        <p className="text-[11px] text-muted-foreground pl-5 italic">"{r.reason}"</p>
                                                    )}
                                                    {r.rescheduledByName && (
                                                        <p className="text-[11px] text-muted-foreground pl-5">By: {r.rescheduledByName}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Reschedule meta */}
                                {(detail.rescheduleAttemptUsed || detail.rescheduleRequestStatus) && (
                                    <Section title="Reschedule Status">
                                        <Row
                                            label="Attempt Used"
                                            value={
                                                detail.rescheduleAttemptUsed
                                                    ? <span className="text-amber-600 dark:text-amber-400 font-medium">Yes</span>
                                                    : "No"
                                            }
                                        />
                                        {detail.rescheduleRequestStatus && (
                                            <Row label="Request Status" value={detail.rescheduleRequestStatus.charAt(0).toUpperCase() + detail.rescheduleRequestStatus.slice(1)} />
                                        )}
                                    </Section>
                                )}

                            </div>
                        )}
                    </ScrollArea>
                </SheetContent>
            </Sheet>
        </>
    );
}
