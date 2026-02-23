import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import {
    Mail,
    MapPin,
    Stethoscope,
    Building2,
    BadgeCheck,
    Hash,
    Calendar,
    ShieldCheck,
} from "lucide-react";

function InfoTile({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
}) {
    return (
        <div className="flex flex-col gap-2 rounded-xl border bg-muted/30 px-4 py-3.5">
            <div className="flex items-center gap-2 text-muted-foreground">
                <span className="shrink-0">{icon}</span>
                <span className="text-[11px] font-semibold uppercase tracking-wider">{label}</span>
            </div>
            <p className="text-sm font-semibold text-foreground leading-snug">{value ?? "—"}</p>
        </div>
    );
}

export default async function AccountPage() {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.id) redirect("/login");

    const doctorId = (session.user as any).id as string;

    const doctor = await prisma.doctor.findUnique({
        where: { id: doctorId },
        select: {
            firstName: true,
            lastName: true,
            email: true,
            clinicName: true,
            mapleimeReferenceId: true,
            memberId: true,
            isNonCommunity: true,
            specialization: true,
            city: true,
            createdAt: true,
        },
    });

    if (!doctor) redirect("/login");

    const fullName = `${doctor.firstName} ${doctor.lastName}`;
    const initials = `${doctor.firstName[0]}${doctor.lastName[0]}`.toUpperCase();
    const memberSince = new Date(doctor.createdAt).toLocaleDateString("en-CA", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <div className="flex flex-col gap-5 h-full">

            {/* ── Hero card ── */}
            <Card className="border overflow-hidden">
                {/* Coloured banner */}
                <div className="h-28 w-full bg-linear-to-r from-primary/20 via-primary/10 to-transparent" />

                <CardContent className="px-6 pb-6 -mt-10">
                    {/* Avatar */}
                    <div className="h-20 w-20 rounded-2xl border-4 border-background bg-primary/15 flex items-center justify-center shadow-sm">
                        <span className="text-2xl font-bold text-primary tracking-tight">{initials}</span>
                    </div>

                    <div className="mt-3 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                        <div>
                            <h2 className="text-2xl font-bold text-foreground">Dr. {fullName}</h2>
                            <p className="text-sm text-muted-foreground mt-0.5">{doctor.specialization} · {doctor.city}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
                                <BadgeCheck className="h-3.5 w-3.5" />
                                Active
                            </span>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${doctor.isNonCommunity
                                ? "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700"
                                : "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20"
                                }`}>
                                <ShieldCheck className="h-3.5 w-3.5" />
                                {doctor.isNonCommunity ? "Non-Community" : "Community"}
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground border">
                                <Building2 className="h-3.5 w-3.5" />
                                {doctor.clinicName}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ── Bottom two-column layout ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 flex-1">

                {/* Personal Information */}
                <div className="flex flex-col gap-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-0.5">Personal Information</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <InfoTile icon={<Mail className="h-3.5 w-3.5" />}        label="Email"          value={doctor.email} />
                        <InfoTile icon={<MapPin className="h-3.5 w-3.5" />}      label="City"           value={doctor.city} />
                        <InfoTile icon={<Stethoscope className="h-3.5 w-3.5" />} label="Specialization" value={doctor.specialization} />
                        <InfoTile icon={<Building2 className="h-3.5 w-3.5" />}   label="Clinic"         value={doctor.clinicName} />
                    </div>
                </div>

                {/* Account Details */}
                <div className="flex flex-col gap-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-0.5">Account Details</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <InfoTile icon={<Hash className="h-3.5 w-3.5" />}        label="Member ID"             value={doctor.memberId ?? "—"} />
                        <InfoTile icon={<Hash className="h-3.5 w-3.5" />}        label="Mapleime Reference ID" value={doctor.mapleimeReferenceId ?? "—"} />
                        <InfoTile icon={<ShieldCheck className="h-3.5 w-3.5" />} label="Account Type"          value={doctor.isNonCommunity ? "Non-Community" : "Community"} />
                        <InfoTile icon={<Calendar className="h-3.5 w-3.5" />}    label="Member Since"          value={memberSince} />
                    </div>
                </div>

            </div>

        </div>
    );
}
