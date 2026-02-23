import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { fetchAppointmentDetail } from "@/app/actions/fetch-appointment-detail";
import { geocodeAddress } from "@/app/actions/geocode";
import { Card, CardContent } from "@/components/ui/card";
import { BackButton } from "@/components/back-button";
import { PatientLocationMapWrapper } from "@/components/patient-location-map-wrapper";
import {
    AlertCircle, User, Mail, Phone, MapPin, Calendar,
    Clock, Activity, DollarSign, FileText, Users, RefreshCw,
    XCircle, CalendarDays, UserCheck, ExternalLink,
} from "lucide-react";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function statusConfig(status: string) {
    switch (status.toLowerCase()) {
        case "completed":
            return { label: "Completed", badge: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20", border: "border-l-emerald-500", dot: "bg-emerald-500" };
        case "approved":
            return { label: "Approved",  badge: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",       border: "border-l-blue-500",    dot: "bg-blue-500" };
        case "pending":
            return { label: "Pending",   badge: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20", border: "border-l-amber-500",   dot: "bg-amber-500" };
        case "canceled":
        case "cancelled":
            return { label: "Cancelled", badge: "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",             border: "border-l-red-400",     dot: "bg-red-400" };
        default:
            return { label: status,      badge: "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700",             border: "border-l-zinc-300",    dot: "bg-zinc-400" };
    }
}

function attendanceBadge(v: string | null) {
    if (!v) return null;
    return v === "shown"
        ? { label: "Shown",     cls: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" }
        : { label: "Not Shown", cls: "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20" };
}

function cap(s: string | null | undefined) {
    if (!s) return "—";
    return s.charAt(0).toUpperCase() + s.slice(1);
}

function fmtDate(s: string | null | undefined) {
    if (!s) return "—";
    try {
        const d = s.includes("T") ? new Date(s) : new Date(s + "T00:00:00");
        return d.toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" });
    } catch { return s ?? "—"; }
}

function fmtDateTime(s: string | null | undefined) {
    if (!s) return "—";
    try {
        return new Date(s).toLocaleString("en-CA", { dateStyle: "medium", timeStyle: "short" });
    } catch { return s ?? "—"; }
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-start gap-2.5">
            <span className="text-muted-foreground mt-0.5 shrink-0">{icon}</span>
            <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground leading-none">{label}</p>
                <p className="text-sm font-medium text-foreground mt-0.5 truncate">{value ?? "—"}</p>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────

export default async function AppointmentViewPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.id) redirect("/login");

    const doctorId = (session.user as any)?.mapleimeReferenceId;
    if (!doctorId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-100 gap-3">
                <AlertCircle className="h-8 w-8 text-red-500" />
                <p className="font-semibold">Session Error</p>
                <p className="text-sm text-muted-foreground">Doctor account is missing a reference ID. Please sign out and sign back in.</p>
            </div>
        );
    }

    const apt = await fetchAppointmentDetail(id, doctorId).catch(() => null);
    if (!apt) notFound();

    const sc = statusConfig(apt.status);
    const ac = attendanceBadge(apt.attendance);

    // Geocode patient location for the map (non-blocking — returns null on failure)
    const geoResult = await geocodeAddress(apt.patientAddress, apt.patientPostalCode).catch(() => null);
    const timeParts = apt.time?.split(" ") ?? [];
    const timeNum = timeParts[0] || apt.time;
    const timePeriod = timeParts[1] || "";

    return (
        <div className="flex flex-col gap-6 h-full">

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="flex items-center gap-3">
                    <BackButton />
                    <div className="w-px h-8 bg-border" />
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">{apt.patientName}</h2>
                        <p className="text-muted-foreground text-sm mt-0.5">
                            Appointment{apt.trackingId ? ` · #${apt.trackingId}` : ""}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border ${sc.badge}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                        {sc.label}
                    </span>
                    {ac && (
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-medium border ${ac.cls}`}>
                            {ac.label}
                        </span>
                    )}
                    {apt.appointmentType && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-medium border bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700">
                            {apt.appointmentType}
                        </span>
                    )}
                </div>
            </div>

            {/* ── Content ── */}
            <div className="flex-1 flex flex-col gap-4 min-h-0 overflow-y-auto">

                {/* Appointment overview — the main "hero" card */}
                <Card className={`border border-l-4 ${sc.border}`}>
                    <CardContent className="p-5">
                        <div className="flex items-center gap-4 mb-5">
                            <div className="shrink-0 w-16 text-center">
                                <p className="text-lg font-bold text-foreground leading-none">{timeNum}</p>
                                {timePeriod && <p className="text-xs text-muted-foreground mt-1 font-medium">{timePeriod}</p>}
                            </div>
                            <div className="w-px h-10 bg-border shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-foreground">{fmtDate(apt.date)}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{apt.appointmentType || "General Consultation"}</p>
                            </div>
                            {apt.fee != null && apt.fee > 0 && (
                                <span className="text-sm font-bold text-foreground bg-muted rounded-lg px-3 py-1.5 shrink-0">${apt.fee}</span>
                            )}
                        </div>

                        {/* Info grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-4">
                            <InfoItem icon={<User className="h-4 w-4" />}         label="Patient"       value={apt.patientName} />
                            <InfoItem icon={<Calendar className="h-4 w-4" />}     label="Appt. Date"    value={fmtDate(apt.date)} />
                            <InfoItem icon={<Clock className="h-4 w-4" />}        label="Appt. Time"    value={apt.time} />
                            <InfoItem icon={<Mail className="h-4 w-4" />}         label="Email"         value={apt.patientEmail} />
                            <InfoItem icon={<Phone className="h-4 w-4" />}        label="Phone"         value={apt.patientPhone} />
                            <InfoItem icon={<CalendarDays className="h-4 w-4" />} label="Date of Birth"  value={apt.patientDateOfBirth || "—"} />
                            <InfoItem icon={<User className="h-4 w-4" />}         label="Gender"        value={cap(apt.patientGender)} />
                            {apt.patientAddress && (
                                <InfoItem icon={<MapPin className="h-4 w-4" />} label="Address" value={apt.patientAddress} />
                            )}
                            {apt.patientPostalCode && (
                                <InfoItem icon={<MapPin className="h-4 w-4" />} label="Postal Code" value={apt.patientPostalCode} />
                            )}
                            <InfoItem icon={<Calendar className="h-4 w-4" />} label="Booked" value={fmtDateTime(apt.createdAt)} />
                        </div>
                    </CardContent>
                </Card>

                {/* Secondary details — notes, attendance, cancellation in a 2-col grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                    {/* Attendance */}
                    <Card className="border">
                        <CardContent className="p-4">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Attendance</p>
                            {ac ? (
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-2">
                                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${ac.cls}`}>
                                            {ac.label}
                                        </span>
                                    </div>
                                    {apt.attendanceNotes && (
                                        <p className="text-sm text-foreground bg-muted/50 rounded-lg p-3">{apt.attendanceNotes}</p>
                                    )}
                                    {(apt.attendanceUpdatedByName || apt.attendanceUpdatedAt) && (
                                        <p className="text-xs text-muted-foreground">
                                            {apt.attendanceUpdatedByName && <>Recorded by <span className="font-medium text-foreground">{apt.attendanceUpdatedByName}</span></>}
                                            {apt.attendanceUpdatedByName && apt.attendanceUpdatedAt && " · "}
                                            {apt.attendanceUpdatedAt && fmtDateTime(apt.attendanceUpdatedAt)}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">Not yet recorded.</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Notes & Status */}
                    <Card className="border">
                        <CardContent className="p-4">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Notes</p>
                            {(apt.statusNotes || apt.notes || apt.cancellationReason) ? (
                                <div className="flex flex-col gap-3">
                                    {apt.notes && (
                                        <div>
                                            <p className="text-[11px] text-muted-foreground mb-1">Patient Notes</p>
                                            <p className="text-sm text-foreground bg-muted/50 rounded-lg p-3">{apt.notes}</p>
                                        </div>
                                    )}
                                    {apt.statusNotes && (
                                        <div>
                                            <p className="text-[11px] text-muted-foreground mb-1">Status Notes</p>
                                            <p className="text-sm text-foreground bg-muted/50 rounded-lg p-3">{apt.statusNotes}</p>
                                        </div>
                                    )}
                                    {apt.cancellationReason && (
                                        <div>
                                            <p className="text-[11px] text-muted-foreground mb-1">Cancellation Reason</p>
                                            <p className="text-sm text-foreground bg-red-50 dark:bg-red-500/5 rounded-lg p-3 border border-red-200 dark:border-red-500/20">{apt.cancellationReason}</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No notes recorded.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Reschedule & Cancellation quick info */}
                {(apt.rescheduleAttemptUsed || apt.cancellationStatus) && (
                    <div className="flex flex-wrap gap-3">
                        {apt.rescheduleAttemptUsed && (
                            <div className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20">
                                <RefreshCw className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                                <span className="text-amber-700 dark:text-amber-400 font-medium">Rescheduled</span>
                                {apt.rescheduleRequestStatus && (
                                    <span className="text-amber-600/70 dark:text-amber-400/70">· {cap(apt.rescheduleRequestStatus)}</span>
                                )}
                            </div>
                        )}
                        {apt.cancellationStatus && (
                            <div className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20">
                                <XCircle className="h-3.5 w-3.5 text-red-500 dark:text-red-400" />
                                <span className="text-red-700 dark:text-red-400 font-medium">Cancellation: {cap(apt.cancellationStatus)}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Family Members */}
                {apt.familyMembers.length > 0 && (
                    <Card className="border">
                        <CardContent className="p-4">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                                Family Members ({apt.familyMembers.length})
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {apt.familyMembers.map((fm, i) => (
                                    <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
                                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-foreground truncate">{fm.name}</p>
                                            <p className="text-xs text-muted-foreground">{cap(fm.gender)} · DOB: {fm.dateOfBirth}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Patient Location Map */}
                {(apt.patientAddress || apt.patientPostalCode) && (
                    <Card className="border">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Patient Location</p>
                                </div>
                                <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([apt.patientAddress, apt.patientPostalCode].filter(Boolean).join(", "))}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                                >
                                    <ExternalLink className="h-3 w-3" />
                                    Open in Maps
                                </a>
                            </div>
                            <p className="text-xs text-muted-foreground mb-3">
                                {[apt.patientAddress, apt.patientPostalCode].filter(Boolean).join(", ")}
                            </p>
                            {geoResult ? (
                                <PatientLocationMapWrapper
                                    lat={geoResult.lat}
                                    lng={geoResult.lng}
                                    displayName={geoResult.displayName}
                                    address={apt.patientAddress}
                                    postalCode={apt.patientPostalCode}
                                />
                            ) : (
                                <div className="h-40 w-full rounded-lg border bg-muted/40 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                    <MapPin className="h-5 w-5" />
                                    <p className="text-xs">Could not load map preview</p>
                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([apt.patientAddress, apt.patientPostalCode].filter(Boolean).join(", "))}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-primary hover:underline flex items-center gap-1"
                                    >
                                        <ExternalLink className="h-3 w-3" />
                                        Open in Google Maps
                                    </a>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Reschedule History */}
                {apt.rescheduleHistory.length > 0 && (
                    <Card className="border">
                        <CardContent className="p-4">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                                Reschedule History ({apt.rescheduleHistory.length})
                            </p>
                            <div className="flex flex-col gap-2">
                                {apt.rescheduleHistory.map((r, i) => (
                                    <div key={i} className="flex items-start gap-3 rounded-lg border p-3">
                                        <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                                            <span className="text-[10px] font-bold text-muted-foreground">{i + 1}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                                                <span className="text-sm font-medium text-foreground">{r.oldDate ?? "—"}</span>
                                                <span className="text-xs text-muted-foreground">→</span>
                                                <span className="text-sm font-medium text-foreground">{r.newDate ?? "—"}</span>
                                                {r.oldTime && r.newTime && (
                                                    <span className="text-xs text-muted-foreground">({r.oldTime} → {r.newTime})</span>
                                                )}
                                            </div>
                                            {r.reason && (
                                                <p className="text-xs text-muted-foreground mt-1 italic">&quot;{r.reason}&quot;</p>
                                            )}
                                            {r.rescheduledByName && (
                                                <p className="text-[11px] text-muted-foreground mt-1">By: {r.rescheduledByName}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

            </div>
        </div>
    );
}
