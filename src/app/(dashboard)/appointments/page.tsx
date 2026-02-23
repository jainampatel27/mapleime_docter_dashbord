import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Clock, Mail, Activity, CheckCircle2, Timer, AlertCircle, Users } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fetchGraphQL } from "@/externalapis";
import { redirect } from "next/navigation";
import { subDays } from "date-fns";
import Link from "next/link";
import { AppointmentCommandCenter } from "@/components/appointment-command-center";

// Define the shape of the data returning from our GraphQL API
interface Appointment {
    id: string;
    trackingId: number | null;
    patientName: string;
    patientEmail: string;
    date: string;
    time: string;
    status: string;
    appointmentType: string;
    fee: number;
    attendance: string | null;
    doctorTimeZone?: string;
}

const GET_APPOINTMENTS_QUERY = `
  query GetDoctorAppointments($doctorId: ID!, $startDate: String, $status: String, $page: Int, $limit: Int) {
    getDoctorAppointments(doctorId: $doctorId, startDate: $startDate, status: $status, page: $page, limit: $limit) {
      hasNextPage
      appointments {
        id
        trackingId
        patientName
        patientEmail
        date
        time
        status
        appointmentType
        fee
        attendance
        doctorTimeZone
      }
    }
  }
`;

function getStatusConfig(status: string) {
    switch (status.toLowerCase()) {
        case "completed":
            return { label: "Completed", className: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" };
        case "pending":
            return { label: "Pending", className: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20" };
        case "in-progress":
            return { label: "In Progress", className: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20" };
        case "cancelled":
            return { label: "Cancelled", className: "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20" };
        default:
            return { label: status, className: "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700" };
    }
}



export default async function AppointmentsPage() {
    const session = await getServerSession(authOptions);

    if (!session || !(session.user as any)?.id) {
        redirect("/login");
    }

    const doctorId = (session.user as any)?.mapleimeReferenceId;

    if (!doctorId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
                <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-semibold">Session Error</h3>
                <p className="text-muted-foreground text-sm text-center max-w-sm">Your doctor account is missing an internal mapping ID. Please sign out and sign back in to refresh your session.</p>
            </div>
        );
    }

    let appointments: Appointment[] = [];
    let errorMsg = null;
    const fifteenDaysAgoStr = subDays(new Date(), 15).toISOString().split("T")[0];

    try {
        const responseData = await fetchGraphQL<{
            getDoctorAppointments: {
                appointments: Appointment[];
                hasNextPage: boolean;
            }
        }>(
            GET_APPOINTMENTS_QUERY,
            {
                doctorId: doctorId,
                startDate: fifteenDaysAgoStr,
                limit: 100,
            }
        );
        appointments = responseData.getDoctorAppointments?.appointments || [];
    } catch (err: any) {
        console.error(err);
        errorMsg = err.message;
    }

    // Since we queried backend for active live appointments already:
    const liveAppointments = appointments;

    const totalCount = liveAppointments.length;
    const completedCount = liveAppointments.filter(a => a.status.toLowerCase() === "completed").length;
    const pendingCount = liveAppointments.filter(a => a.status.toLowerCase() === "pending").length;
    const inProgressCount = liveAppointments.filter(a => a.status.toLowerCase() === "in-progress").length;

    return (
        <div className="flex flex-col gap-6 h-full">

            {/* Header */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Appointments</h2>
                    <p className="text-muted-foreground text-sm mt-1">Sunday, February 22nd 2026</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="font-medium gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        Change Date
                    </Button>
                    <Button size="sm" className="font-medium gap-1.5">
                        <span className="text-base leading-none">+</span>
                        New Appointment
                    </Button>
                </div>
            </div>

            {/* Error Banner */}
            {errorMsg && (
                <div className="rounded-xl border border-red-200 bg-red-50 dark:border-red-500/20 dark:bg-red-500/5 p-4 flex items-center gap-3 text-sm text-red-700 dark:text-red-400">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    Failed to load appointments: {errorMsg}
                </div>
            )}

            {/* Main layout: list + sidebar */}
            <div className="flex gap-6 flex-1 min-h-0">

                {/* Left: Appointment List */}
                <div className="flex-1 flex flex-col gap-3 min-w-0">
                    {liveAppointments.length === 0 && !errorMsg ? (
                        <div className="flex-1 rounded-xl border border-dashed bg-card flex flex-col items-center justify-center py-20 gap-3 text-center">
                            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                                <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <p className="font-medium text-sm">No appointments today</p>
                            <p className="text-xs text-muted-foreground max-w-xs">Your schedule is clear. New appointments will appear here once booked.</p>
                            <Button size="sm" variant="outline" className="mt-2">+ New Appointment</Button>
                        </div>
                    ) : (
                        liveAppointments.map((apt) => {
                            const statusCfg = getStatusConfig(apt.status);
                            const timeParts = apt.time.split(" ");
                            const timeNum = timeParts[0] || apt.time;
                            const timePeriod = timeParts[1] || "";
                            const leftBorder =
                                apt.status.toLowerCase() === "completed" ? "border-l-emerald-500" :
                                    apt.status.toLowerCase() === "pending" ? "border-l-amber-500" :
                                        apt.status.toLowerCase() === "in-progress" ? "border-l-blue-500" :
                                            apt.status.toLowerCase() === "cancelled" ? "border-l-red-400" :
                                                "border-l-zinc-300";

                            return (
                                <div key={apt.id} className="relative">
                                    <Link href={`/appointments/view/${apt.id}`} className="absolute inset-0 sm:hidden rounded-[inherit] z-0" aria-label={`View ${apt.patientName}'s appointment`} />
                                <Card className={`border border-l-4 ${leftBorder} hover:shadow-sm transition-shadow`}>
                                    <CardContent className="p-4 flex items-center gap-4">

                                        {/* Time block */}
                                        <div className="shrink-0 w-16 text-center">
                                            <p className="text-base font-bold text-foreground leading-none">{timeNum}</p>
                                            {timePeriod && <p className="text-xs text-muted-foreground mt-1 font-medium">{timePeriod}</p>}
                                        </div>

                                        <div className="w-px h-10 bg-border shrink-0" />

                                        {/* Patient info */}
                                        <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 items-center">
                                            <div className="min-w-0">
                                                <p className="font-semibold text-sm text-foreground truncate">{apt.patientName}</p>
                                                <p className="text-xs text-muted-foreground truncate mt-0.5">{apt.patientEmail || "No email"}</p>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <Activity className="h-3.5 w-3.5 shrink-0" />
                                                <span className="truncate">{apt.appointmentType || "General Consultation"}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {apt.fee > 0 && (
                                                    <span className="text-xs font-semibold text-foreground bg-muted rounded-md px-2 py-1">${apt.fee}</span>
                                                )}
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${statusCfg.className}`}>
                                                    {statusCfg.label}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="relative z-10 flex items-center gap-1 shrink-0">
                                            <Link href={`/appointments/view/${apt.id}`}>
                                                <Button variant="outline" size="sm" className="h-8 px-3 text-xs font-medium hidden sm:flex">
                                                    View
                                                </Button>
                                            </Link>
                                            <AppointmentCommandCenter
                                                appointment={{
                                                    id: apt.id,
                                                    trackingId: apt.trackingId,
                                                    patientName: apt.patientName,
                                                    date: apt.date,
                                                    time: apt.time,
                                                    status: apt.status || "pending",
                                                    doctorTimeZone: apt.doctorTimeZone,
                                                }}
                                                doctorId={doctorId}
                                            />
                                        </div>

                                    </CardContent>
                                </Card>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Right: Summary Sidebar */}
                <div className="w-64 xl:w-72 shrink-0 hidden lg:flex flex-col gap-4">

                    {/* Stats */}
                    <Card className="border">
                        <CardContent className="p-4 flex flex-col gap-3">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Today's Summary</p>
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between py-2 border-b border-border">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Users className="h-4 w-4" />
                                        <span>Total</span>
                                    </div>
                                    <span className="text-sm font-bold text-foreground">{totalCount}</span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-border">
                                    <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                                        <Activity className="h-4 w-4" />
                                        <span>In Progress</span>
                                    </div>
                                    <span className="text-sm font-bold text-foreground">{inProgressCount}</span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-border">
                                    <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                                        <Timer className="h-4 w-4" />
                                        <span>Pending</span>
                                    </div>
                                    <span className="text-sm font-bold text-foreground">{pendingCount}</span>
                                </div>
                                <div className="flex items-center justify-between py-2">
                                    <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                                        <CheckCircle2 className="h-4 w-4" />
                                        <span>Completed</span>
                                    </div>
                                    <span className="text-sm font-bold text-foreground">{completedCount}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Completion progress */}
                    {totalCount > 0 && (
                        <Card className="border">
                            <CardContent className="p-4 flex flex-col gap-3">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Progress</p>
                                <div className="flex items-end justify-between">
                                    <span className="text-3xl font-bold text-foreground">{Math.round((completedCount / totalCount) * 100)}%</span>
                                    <span className="text-xs text-muted-foreground pb-1">{completedCount} of {totalCount} done</span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                                        style={{ width: `${Math.round((completedCount / totalCount) * 100)}%` }}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Quick actions */}
                    <Card className="border">
                        <CardContent className="p-4 flex flex-col gap-2">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Quick Actions</p>
                            <Button variant="outline" size="sm" className="w-full justify-start gap-2 h-9 font-medium">
                                <CalendarIcon className="h-4 w-4" />
                                View Calendar
                            </Button>
                            <Button variant="outline" size="sm" className="w-full justify-start gap-2 h-9 font-medium">
                                <Users className="h-4 w-4" />
                                Patient List
                            </Button>
                            <Button size="sm" className="w-full justify-start gap-2 h-9 font-semibold mt-1">
                                <span className="text-base leading-none">+</span>
                                New Appointment
                            </Button>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    );
}
