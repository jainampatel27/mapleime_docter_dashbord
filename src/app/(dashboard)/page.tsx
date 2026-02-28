import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fetchGraphQL } from "@/externalapis";
import { redirect } from "next/navigation";
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, Activity, TrendingUp, Clock, CheckCircle2 } from "lucide-react";
import { DashboardCharts } from "@/components/dashboard-charts";

const GET_DASHBOARD_QUERY = `
  query GetDoctorAppointments($doctorId: ID!, $startDate: String, $endDate: String, $page: Int, $limit: Int) {
    getDoctorAppointments(doctorId: $doctorId, startDate: $startDate, endDate: $endDate, page: $page, limit: $limit) {
      hasNextPage
      appointments {
        id
        patientName
        date
        time
        status
        appointmentType
        fee
      }
    }
  }
`;

interface DashboardAppointment {
  id: string;
  patientName: string;
  date: string;
  time: string;
  status: string;
  appointmentType: string;
  fee: number;
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || !(session.user as any)?.id) {
    redirect("/login");
  }

  const doctorId = (session.user as any)?.mapleimeReferenceId;
  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");

  // Fetch today's appointments + last 7 days for chart
  const weekStart = format(subDays(today, 6), "yyyy-MM-dd");

  let todayAppointments: DashboardAppointment[] = [];
  let weekAppointments: DashboardAppointment[] = [];

  if (doctorId) {
    try {
      const [todayRes, weekRes] = await Promise.all([
        fetchGraphQL<{
          getDoctorAppointments: { appointments: DashboardAppointment[]; hasNextPage: boolean };
        }>(GET_DASHBOARD_QUERY, {
          doctorId,
          startDate: todayStr,
          endDate: todayStr,
          page: 1,
          limit: 200,
        }),
        fetchGraphQL<{
          getDoctorAppointments: { appointments: DashboardAppointment[]; hasNextPage: boolean };
        }>(GET_DASHBOARD_QUERY, {
          doctorId,
          startDate: weekStart,
          endDate: todayStr,
          page: 1,
          limit: 500,
        }),
      ]);

      todayAppointments = todayRes.getDoctorAppointments?.appointments || [];
      weekAppointments = weekRes.getDoctorAppointments?.appointments || [];
    } catch (e) {
      console.error("Dashboard fetch error:", e);
    }
  }

  // Today's stats
  const todayTotal = todayAppointments.length;
  const todayCompleted = todayAppointments.filter(a => a.status?.toLowerCase() === "completed").length;
  const todayPending = todayAppointments.filter(a => a.status?.toLowerCase() === "pending").length;
  const todayInProgress = todayAppointments.filter(a => a.status?.toLowerCase() === "in-progress").length;

  // Week stats
  const weekTotal = weekAppointments.length;
  const weekRevenue = weekAppointments
    .filter(a => a.status?.toLowerCase() === "completed" || a.status?.toLowerCase() === "approved")
    .reduce((sum, a) => sum + (a.fee || 0), 0);

  // Build daily chart data for the last 7 days
  const days = eachDayOfInterval({ start: subDays(today, 6), end: today });
  const dailyData = days.map(day => {
    const dayStr = format(day, "yyyy-MM-dd");
    const dayAppts = weekAppointments.filter(a => a.date === dayStr);
    return {
      day: format(day, "EEE"),
      date: format(day, "MMM d"),
      total: dayAppts.length,
      completed: dayAppts.filter(a => a.status?.toLowerCase() === "completed").length,
      pending: dayAppts.filter(a => a.status?.toLowerCase() === "pending").length,
    };
  });

  // Appointment type breakdown
  const typeMap = new Map<string, number>();
  weekAppointments.forEach(a => {
    const type = a.appointmentType || "General";
    typeMap.set(type, (typeMap.get(type) || 0) + 1);
  });
  const typeData = Array.from(typeMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  // Upcoming (pending/approved) from today
  const upcoming = todayAppointments
    .filter(a => ["pending", "approved", "in-progress"].includes(a.status?.toLowerCase()))
    .sort((a, b) => a.time.localeCompare(b.time))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Welcome back, Dr. {session?.user?.name}
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          {format(today, "EEEE, MMMM do yyyy")} — Here&apos;s your clinic overview.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="bg-secondary/50 dark:bg-secondary/30 shadow-none border-0">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">Today</span>
              <div className="size-9 rounded-full bg-primary/[0.08] flex items-center justify-center">
                <Calendar className="size-4 text-primary" />
              </div>
            </div>
            <p className="text-3xl font-bold tabular-nums">{todayTotal}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {todayCompleted} completed · {todayPending} pending
            </p>
          </CardContent>
        </Card>

        <Card className="bg-secondary/50 dark:bg-secondary/30 shadow-none border-0">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">In Progress</span>
              <div className="size-9 rounded-full bg-blue-500/[0.08] flex items-center justify-center">
                <Activity className="size-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-3xl font-bold tabular-nums text-blue-600 dark:text-blue-400">{todayInProgress}</p>
            <p className="text-xs text-muted-foreground mt-1">Active right now</p>
          </CardContent>
        </Card>

        <Card className="bg-secondary/50 dark:bg-secondary/30 shadow-none border-0">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">This Week</span>
              <div className="size-9 rounded-full bg-emerald-500/[0.08] flex items-center justify-center">
                <TrendingUp className="size-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <p className="text-3xl font-bold tabular-nums">{weekTotal}</p>
            <p className="text-xs text-muted-foreground mt-1">Past 7 days</p>
          </CardContent>
        </Card>

        <Card className="bg-secondary/50 dark:bg-secondary/30 shadow-none border-0">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">Revenue</span>
              <div className="size-9 rounded-full bg-amber-500/[0.08] flex items-center justify-center">
                <span className="text-sm font-bold text-amber-600 dark:text-amber-400">$</span>
              </div>
            </div>
            <p className="text-3xl font-bold tabular-nums">${weekRevenue.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">From completed visits</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <DashboardCharts dailyData={dailyData} typeData={typeData} />

      {/* Upcoming Today */}
      <Card className="bg-secondary/50 dark:bg-secondary/30 shadow-none border-0">
        <CardHeader className="px-5 pt-5 pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">Upcoming Today</CardTitle>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
              {upcoming.length} remaining
            </span>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          {upcoming.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="size-10 rounded-full bg-emerald-500/[0.08] flex items-center justify-center mb-3">
                <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-sm font-medium">All caught up!</p>
              <p className="text-xs text-muted-foreground mt-1">No more appointments remaining today.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {upcoming.map((apt, i) => (
                <div key={apt.id}>
                  <div className="flex items-center gap-4 py-3">
                    <div className="size-9 rounded-full bg-primary/[0.08] flex items-center justify-center shrink-0">
                      <Clock className="size-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{apt.patientName}</p>
                      <p className="text-xs text-muted-foreground">
                        {apt.time} · {apt.appointmentType || "General"}
                      </p>
                    </div>
                    <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${
                      apt.status?.toLowerCase() === "in-progress"
                        ? "bg-blue-500/[0.08] text-blue-600 dark:text-blue-400"
                        : "bg-amber-500/[0.08] text-amber-600 dark:text-amber-400"
                    }`}>
                      {apt.status}
                    </span>
                  </div>
                  {i < upcoming.length - 1 && <div className="h-px bg-foreground/[0.08]" />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
