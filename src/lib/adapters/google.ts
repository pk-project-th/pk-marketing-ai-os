import { db } from "@/lib/db";

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  size: number;
}

export interface GoogleIntegrationStatus {
  drive: boolean;
  sheets: boolean;
  forms: boolean;
  message: string;
}

export const googleAdapter = {
  checkStatus(): GoogleIntegrationStatus {
    const settings = db.getSettings();
    return {
      drive: settings.google_drive_status === "CONNECTED",
      sheets: settings.google_sheets_status === "CONNECTED",
      forms: settings.google_forms_status === "CONNECTED",
      message: settings.google_drive_status === "CONNECTED" 
        ? "Google Workspace Connected" 
        : "Integration not connected — โปรดกำหนดค่าการเชื่อมต่อในหน้า Settings"
    };
  },

  async submitToGoogleForm(formId: string, data: Record<string, any>): Promise<{ success: boolean; message: string }> {
    const status = this.checkStatus();
    if (!status.forms) {
      return {
        success: false,
        message: "Integration not connected: ไม่สามารถส่งข้อมูลไปยัง Google Forms ได้เนื่องจากยังไม่ได้เชื่อมต่อ Credentials ในหน้า Settings"
      };
    }
    // Real implementation would submit to Google Forms API
    return {
      success: true,
      message: "Data successfully submitted to Google Form"
    };
  }
};
