import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (token !== process.env.EXTERNAL_API_AUTH_TOKEN) {
        return NextResponse.json(
            { error: "Unauthorized: Invalid or missing token" },
            { status: 401 }
        );
    }

    try {
        const body = await req.json();

        const {
            firstName,
            lastName,
            email,
            password,
            clinicName,
            mapleimeReferenceId,
            memberId,
            isNonCommunity,
            specialization,
            city,
        } = body;

        // Basic validation
        if (!firstName || !lastName || !email || !password || !clinicName || !specialization || !city) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Check if doctor already exists
        const existingDoctor = await prisma.doctor.findUnique({
            where: { email },
        });

        if (existingDoctor) {
            return NextResponse.json(
                { error: "Doctor with this email already exists" },
                { status: 409 }
            );
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the doctor in the database
        const doctor = await prisma.doctor.create({
            data: {
                firstName,
                lastName,
                email,
                password: hashedPassword,
                clinicName,
                mapleimeReferenceId,
                memberId,
                isNonCommunity: isNonCommunity ?? false,
                specialization,
                city,
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                clinicName: true,
                specialization: true,
                createdAt: true,
            }, // Select hides the password from the response
        });

        return NextResponse.json(
            {
                success: true,
                message: "Doctor account created successfully",
                data: doctor,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating doctor:", error);

        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
