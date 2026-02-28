import { AlertCircle } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fetchGraphQL } from "@/externalapis";
import { redirect } from "next/navigation";
import { AppointmentSettingsClient } from "@/components/appointment-settings-client";

interface DayAvailability {
    day: string;
    isAvailable: boolean;
    startTime: string;
    endTime: string;
}

interface DoctorSettings {
    timeZone: string;
    reference_time_zone: string;
    slotInterval: number;
    availability: DayAvailability[];
}

const GET_DOCTOR_SETTINGS_QUERY = `
  query GetDoctorSettings($doctorId: ID!) {
    getDoctorSettings(doctorId: $doctorId) {
      timeZone
      reference_time_zone
      slotInterval
      availability {
        day
        isAvailable
        startTime
        endTime
      }
    }
  }
`;

export default async function AppointmentSettingsPage() {
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

    let settings: DoctorSettings | null = null;
    let errorMsg = null;

    try {
        const responseData = await fetchGraphQL<{
            getDoctorSettings: DoctorSettings;
        }>(
            GET_DOCTOR_SETTINGS_QUERY,
            {
                doctorId: doctorId,
            }
        );
        settings = responseData.getDoctorSettings;
    } catch (err: any) {
        console.error("Error fetching doctor settings", err);
        errorMsg = err.message || "Failed to fetch appointment settings.";
    }

    return (
        <div className="max-w-4xl space-y-6">
            {errorMsg && (
                <div className="rounded-xl border border-red-200 bg-red-50 dark:border-red-500/20 dark:bg-red-500/5 p-4 flex items-center gap-3 text-sm text-red-700 dark:text-red-400">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {errorMsg}
                </div>
            )}

            {!settings && !errorMsg ? (
                <div className="flex flex-col space-y-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Appointment Settings</h2>
                        <p className="text-muted-foreground text-sm mt-1">
                            Manage your scheduling availability and slots based on your portal setup.
                        </p>
                    </div>
                    <div className="flex items-center justify-center p-10 border rounded-xl bg-card">
                        <p className="text-muted-foreground text-sm">No appointment settings found for your account.</p>
                    </div>
                </div>
            ) : settings && (
                <AppointmentSettingsClient doctorId={doctorId} initialSettings={settings} />
            )}
        </div>
    );
}
