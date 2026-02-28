"use server";

import { fetchGraphQL } from "@/externalapis";

export interface FamilyMember {
  name: string;
  dateOfBirth: string;
  gender: string;
}

export interface RescheduleEntry {
  oldDate: string | null;
  oldTime: string | null;
  newDate: string | null;
  newTime: string | null;
  rescheduledAt: string | null;
  rescheduledByName: string | null;
  reason: string | null;
}

export interface AppointmentDetail {
  id: string;
  trackingId: number | null;
  // Patient
  patientName: string;
  patientEmail: string | null;
  patientPhone: string | null;
  patientAddress: string | null;
  patientPostalCode: string | null;
  patientDateOfBirth: string | null;
  patientGender: string | null;
  familyMembers: FamilyMember[];
  // Appointment
  date: string;
  time: string;
  status: string;
  appointmentType: string | null;
  fee: number | null;
  notes: string | null;
  statusNotes: string | null;
  doctorId: string;
  doctorTimeZone?: string;
  // Attendance
  attendance: string | null;
  attendanceNotes: string | null;
  attendanceUpdatedAt: string | null;
  attendanceUpdatedByName: string | null;
  // Reschedule
  rescheduleAttemptUsed: boolean;
  rescheduleRequestStatus: string | null;
  rescheduleHistory: RescheduleEntry[];
  // Cancellation
  cancellationStatus: string | null;
  cancellationReason: string | null;
  // Meta
  createdAt: string | null;
  updatedAt: string | null;
}

const GET_APPOINTMENT_BY_ID_QUERY = `
  query GetAppointmentById($id: ID!, $doctorId: ID!) {
    getAppointmentById(id: $id, doctorId: $doctorId) {
      id
      trackingId
      patientName
      patientEmail
      patientPhone
      patientAddress
      patientPostalCode
      patientDateOfBirth
      patientGender
      familyMembers {
        name
        dateOfBirth
        gender
      }
      date
      time
      status
      appointmentType
      fee
      notes
      statusNotes
      doctorId
      doctorTimeZone
      attendance
      attendanceNotes
      attendanceUpdatedAt
      attendanceUpdatedByName
      rescheduleAttemptUsed
      rescheduleRequestStatus
      rescheduleHistory {
        oldDate
        oldTime
        newDate
        newTime
        rescheduledAt
        rescheduledByName
        reason
      }
      cancellationStatus
      cancellationReason
      createdAt
      updatedAt
    }
  }
`;

export async function fetchAppointmentDetail(
  id: string,
  doctorId: string
): Promise<AppointmentDetail | null> {
  try {
    const data = await fetchGraphQL<{ getAppointmentById: AppointmentDetail | null }>(
      GET_APPOINTMENT_BY_ID_QUERY,
      { id, doctorId }
    );
    return data.getAppointmentById ?? null;
  } catch (err) {
    console.error("fetchAppointmentDetail error:", err);
    throw err;
  }
}
