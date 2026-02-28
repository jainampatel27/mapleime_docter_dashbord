"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, CheckCircle2, XCircle, Settings2, Save, X, Loader2, Copy } from "lucide-react";
import { updateDoctorSettingsAction } from "@/app/actions/appointment-settings-actions";

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

interface AppointmentSettingsClientProps {
    doctorId: string;
    initialSettings: DoctorSettings;
}

const DAYS_OF_WEEK = [
    { value: "Mon", label: "Monday" },
    { value: "Tue", label: "Tuesday" },
    { value: "Wed", label: "Wednesday" },
    { value: "Thu", label: "Thursday" },
    { value: "Fri", label: "Friday" },
    { value: "Sat", label: "Saturday" },
    { value: "Sun", label: "Sunday" },
];

const TIME_SLOTS = Array.from({ length: 24 * 4 }, (_, i) => {
    const hour = Math.floor(i / 4);
    const minute = (i % 4) * 15;
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return {
        value: `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`,
        label: `${hour12}:${minute.toString().padStart(2, "0")} ${ampm}`,
    };
});

export function AppointmentSettingsClient({ doctorId, initialSettings }: AppointmentSettingsClientProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [settings, setSettings] = useState<DoctorSettings>(initialSettings);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handleSave = async () => {
        setIsLoading(true);
        setErrorMsg(null);
        try {
            const formData = {
                slotInterval: Number(settings.slotInterval) || 30,
                availability: settings.availability.map((a) => ({
                    day: a.day,
                    isAvailable: a.isAvailable,
                    startTime: a.startTime,
                    endTime: a.endTime
                }))
            };
            const res = await updateDoctorSettingsAction(doctorId, formData);
            if (res.success) {
                setIsEditing(false);
            } else {
                setErrorMsg(res.message);
            }
        } catch (e: any) {
            setErrorMsg(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const updateAvailability = (day: string, field: keyof DayAvailability, value: any) => {
        setSettings(prev => ({
            ...prev,
            availability: prev.availability.map(item =>
                item.day === day ? { ...item, [field]: value } : item
            )
        }));
    };

    const copyTimeSlots = (sourceDay: string) => {
        const sourceAvailability = settings.availability.find(a => a.day === sourceDay);
        if (!sourceAvailability) return;

        setSettings(prev => {
            const currentAvailability = [...prev.availability];
            let updated = false;

            currentAvailability.forEach((day, idx) => {
                if (day.day !== sourceDay && day.isAvailable) {
                    currentAvailability[idx] = {
                        ...day,
                        startTime: sourceAvailability.startTime,
                        endTime: sourceAvailability.endTime,
                    };
                    updated = true;
                }
            });

            // Note: Since we are not using useToast here directly, we just return the new state. 
            // In a better UX, a toast should appear.
            return {
                ...prev,
                availability: currentAvailability
            };
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Appointment Settings</h2>
                    <p className="text-muted-foreground text-sm mt-1">
                        Manage your scheduling availability and slots based on your portal setup.
                    </p>
                </div>
                {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)} className="gap-2">
                        <Settings2 className="h-4 w-4" />
                        Edit Settings
                    </Button>
                ) : (
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => {
                            setIsEditing(false);
                            setSettings(initialSettings);
                        }} className="gap-2" disabled={isLoading}>
                            <X className="h-4 w-4" />
                            Cancel
                        </Button>
                        <Button onClick={handleSave} className="gap-2" disabled={isLoading}>
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Save
                        </Button>
                    </div>
                )}
            </div>

            {errorMsg && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {errorMsg}
                </div>
            )}

            <Card>
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" />
                        Setting Details
                    </CardTitle>
                    <CardDescription>Your general scheduling limits.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col space-y-1">
                        <span className="text-sm font-medium text-muted-foreground">Slot Interval</span>
                        {isEditing ? (
                            <Select
                                value={String(settings.slotInterval)}
                                onValueChange={(val) => setSettings({ ...settings, slotInterval: Number(val) })}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select interval" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="15">15 minutes</SelectItem>
                                    <SelectItem value="20">20 minutes</SelectItem>
                                    <SelectItem value="30">30 minutes</SelectItem>
                                    <SelectItem value="60">60 minutes</SelectItem>
                                </SelectContent>
                            </Select>
                        ) : (
                            <span className="text-base font-semibold">{settings.slotInterval} minutes</span>
                        )}
                    </div>
                    <div className="flex flex-col space-y-1">
                        <span className="text-sm font-medium text-muted-foreground">Time Zone</span>
                        <span className="text-base font-semibold flex items-center gap-2">
                            {settings.timeZone}
                            {settings.reference_time_zone && (
                                <Badge variant="outline" className="font-normal text-xs">{settings.reference_time_zone}</Badge>
                            )}
                        </span>
                        {isEditing && (
                            <p className="text-xs text-muted-foreground mt-1">Timezone settings should be updated in the global doctor portal.</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Weekly Availability</CardTitle>
                    <CardDescription>Your regular operating hours for the week.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {settings.availability.map((dayItem, index) => {
                            const fullDayName = DAYS_OF_WEEK.find(d => d.value === dayItem.day)?.label || dayItem.day;
                            return (
                                <div key={dayItem.day} className="flex items-center justify-between py-3 border-b border-border last:border-0 last:pb-0">
                                    <div className="flex items-center gap-3 w-1/3">
                                        {isEditing ? (
                                            <Switch
                                                checked={dayItem.isAvailable}
                                                onCheckedChange={(checked) => updateAvailability(dayItem.day, "isAvailable", checked)}
                                            />
                                        ) : (
                                            dayItem.isAvailable ? (
                                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                            ) : (
                                                <XCircle className="h-4 w-4 text-zinc-300 dark:text-zinc-600" />
                                            )
                                        )}
                                        <span className={`text-sm font-medium ${!dayItem.isAvailable ? "text-muted-foreground line-through opacity-70" : "text-foreground"}`}>
                                            {fullDayName}
                                        </span>
                                    </div>

                                    <div className="flex flex-1 items-center justify-end">
                                        {dayItem.isAvailable ? (
                                            <div className="flex items-center gap-2">
                                                {isEditing ? (
                                                    <>
                                                        <Select
                                                            value={dayItem.startTime}
                                                            onValueChange={(val) => updateAvailability(dayItem.day, "startTime", val)}
                                                        >
                                                            <SelectTrigger className="w-[120px] font-mono text-sm h-9">
                                                                <SelectValue placeholder="Start" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {TIME_SLOTS.map((slot) => (
                                                                    <SelectItem key={slot.value} value={slot.value}>
                                                                        {slot.label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>

                                                        <span className="text-muted-foreground text-sm">-</span>

                                                        <Select
                                                            value={dayItem.endTime}
                                                            onValueChange={(val) => updateAvailability(dayItem.day, "endTime", val)}
                                                        >
                                                            <SelectTrigger className="w-[120px] font-mono text-sm h-9">
                                                                <SelectValue placeholder="End" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {TIME_SLOTS.map((slot) => (
                                                                    <SelectItem key={slot.value} value={slot.value}>
                                                                        {slot.label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>

                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 ml-2"
                                                            disabled={!dayItem.isAvailable}
                                                            onClick={() => copyTimeSlots(dayItem.day)}
                                                            title={`Copy ${fullDayName}'s time to all active days`}
                                                        >
                                                            <Copy className="h-4 w-4" />
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Badge variant="secondary" className="font-mono">{TIME_SLOTS.find(s => s.value === dayItem.startTime)?.label || dayItem.startTime}</Badge>
                                                        <span className="text-muted-foreground text-sm">-</span>
                                                        <Badge variant="secondary" className="font-mono">{TIME_SLOTS.find(s => s.value === dayItem.endTime)?.label || dayItem.endTime}</Badge>
                                                    </>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-sm text-muted-foreground italic">Unavailable</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
