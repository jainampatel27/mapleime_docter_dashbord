import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, Activity } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Welcome back, Dr. {session?.user?.name}!</h2>
        <p className="text-zinc-500 text-sm">Here is what is happening at your clinic today.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,204</div>
            <p className="text-xs text-green-500 mt-1 font-semibold">+18.0% from last month</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Upcoming Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">8</div>
            <p className="text-xs text-zinc-500 mt-1">Next: 10:30 AM with Sarah Connor</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Awaiting Reports</CardTitle>
            <Activity className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-red-500 mt-1 font-semibold">Needs attention today</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Recent Appointments</CardTitle>
            <CardDescription>
              You have handled 14 appointments this week.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-zinc-200 rounded-lg bg-zinc-50/50">
              <p className="text-sm text-zinc-400 font-medium tracking-wide">(Chart Component Placeholder)</p>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Session Data</CardTitle>
            <CardDescription>Verified NextAuth Credentials</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 rounded-lg bg-zinc-100/50 p-4 border border-zinc-100">
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="text-sm font-semibold text-zinc-500 uppercase tracking-wider col-span-1">Name</span>
                <span className="text-sm font-medium text-zinc-900 col-span-2">{session?.user?.name}</span>
              </div>
              <div className="w-full h-px bg-zinc-200"></div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="text-sm font-semibold text-zinc-500 uppercase tracking-wider col-span-1">Email</span>
                <span className="text-sm text-zinc-900 col-span-2">{session?.user?.email}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
