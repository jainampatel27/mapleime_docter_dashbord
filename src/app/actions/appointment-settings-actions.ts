"use server"

import { fetchGraphQL } from "@/externalapis"

export async function updateDoctorSettingsAction(doctorId: string, settings: any) {
    const UPDATE_SETTINGS_QUERY = `
    mutation UpdateDoctorSettings($doctorId: ID!, $settings: UpdateDoctorSettingsInput!) {
        updateDoctorSettings(doctorId: $doctorId, settings: $settings) {
            success
            message
        }
    }
  `;

    try {
        const responseData = await fetchGraphQL<{
            updateDoctorSettings: { success: boolean; message: string };
        }>(UPDATE_SETTINGS_QUERY, { doctorId, settings });

        return {
            success: responseData.updateDoctorSettings?.success || false,
            message: responseData.updateDoctorSettings?.message || "Unknown error occurred"
        };
    } catch (error: any) {
        console.error("Error updating settings:", error);
        return {
            success: false,
            message: error.message || "Failed to update settings"
        };
    }
}
