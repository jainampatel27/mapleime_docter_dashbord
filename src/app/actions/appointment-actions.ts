"use server";

import { fetchGraphQL } from "@/externalapis";
import { revalidatePath } from "next/cache";

const UPDATE_STATUS_MUTATION = `
  mutation UpdateAppointmentStatus($id: ID!, $doctorId: ID!, $status: String!, $notes: String) {
    updateAppointmentStatus(id: $id, doctorId: $doctorId, status: $status, notes: $notes) {
      success
      message
    }
  }
`;

const UPDATE_DECISION_MUTATION = `
  mutation UpdateAppointmentDecision($id: ID!, $doctorId: ID!, $decision: String!, $notes: String) {
    updateAppointmentDecision(id: $id, doctorId: $doctorId, decision: $decision, notes: $notes) {
      success
      message
    }
  }
`;

export async function updateAppointmentStatusAction(
  id: string,
  doctorId: string,
  status: string,
  notes?: string
) {
  try {
    const data = await fetchGraphQL<{
      updateAppointmentStatus: { success: boolean; message: string };
    }>(UPDATE_STATUS_MUTATION, {
      id,
      doctorId,
      status,
      notes,
    });

    // Trigger refetch of the server components to reflect status immediately
    revalidatePath("/appointments");
    revalidatePath("/appointment-history");

    return data.updateAppointmentStatus;
  } catch (error: any) {
    console.error("Action error:", error);
    return { success: false, message: error.message || "Failed to update status." };
  }
}

export async function updateAppointmentDecisionAction(
  id: string,
  doctorId: string,
  decision: string,
  notes?: string
) {
  try {
    const data = await fetchGraphQL<{
      updateAppointmentDecision: { success: boolean; message: string };
    }>(UPDATE_DECISION_MUTATION, {
      id,
      doctorId,
      decision,
      notes,
    });

    revalidatePath("/appointments");
    revalidatePath("/appointment-history");

    return data.updateAppointmentDecision;
  } catch (error: any) {
    console.error("Action error:", error);
    return { success: false, message: error.message || "Failed to update decision." };
  }
}
