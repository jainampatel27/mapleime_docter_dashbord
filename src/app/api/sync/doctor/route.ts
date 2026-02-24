import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

// Bug fix: Singleton pattern prevents connection pool exhaustion
// in serverless environments (Vercel). Each cold start reuses the
// existing client rather than creating a brand new one.
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }
const prisma = globalForPrisma.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get("x-api-key")
        if (authHeader !== process.env.EXTERNAL_API_AUTH_TOKEN) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const payload = await req.json()
        const mapleimeId = payload._id

        if (!mapleimeId) {
            return NextResponse.json({ message: "Missing Mapleime _id" }, { status: 400 })
        }

        // Split full name (Mapleime 'name') into firstName / lastName for the dashboard schema
        const nameParts = (payload.name || "").trim().split(/\s+/)
        const firstName = nameParts[0] || ""
        const lastName = nameParts.slice(1).join(" ") || ""

        // Bug fix: Try matching by mapleimeReferenceId first (most specific).
        // Only fall back to email if no record with that referenceId exists.
        // The original OR approach could accidentally update the wrong doctor
        // when two doctors share no referenceId but an email collision occurs.
        const byReferenceId = await prisma.doctor.findFirst({
            where: { mapleimeReferenceId: mapleimeId },
        })

        const whereClause = byReferenceId
            ? { mapleimeReferenceId: mapleimeId }
            : { email: payload.email }

        const updatePayload = {
            firstName,
            lastName,
            email: payload.email,
            clinicName: payload.clinicName || "",
            memberId: payload.memberId ?? null,
            isNonCommunity: Boolean(payload.isNonCommunity),
            specialization: payload.specialization || "General",
            city: payload.city || "Unknown",
            mapleimeReferenceId: mapleimeId, // keep reference always up to date
        }

        const updatedDoctor = await prisma.doctor.updateMany({
            where: whereClause,
            data: updatePayload,
        })

        if (updatedDoctor.count === 0) {
            return NextResponse.json(
                { message: "No doctor found in Dashboard matching this Mapleime user" },
                { status: 404 }
            )
        }

        return NextResponse.json({
            message: "Successfully synced doctor details",
            count: updatedDoctor.count,
        })
    } catch (error) {
        console.error("Dashboard Sync Error:", error)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}
