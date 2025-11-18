import { supabase } from "@/integrations/supabase/client";

export interface DiagnosticLogData {
  device_id?: string;
  platform: string;
  is_native: boolean;
  user_agent?: string;
  app_version?: string;
  log_data: Record<string, any>;
  log_text: string;
  printer_status?: string;
  supabase_connected?: boolean;
  error_count?: number;
}

/**
 * Save diagnostic log to Supabase
 */
export const saveDiagnosticLog = async (
  data: DiagnosticLogData
): Promise<{ success: boolean; id?: string; error?: string }> => {
  try {
    console.log("Saving diagnostic log to Supabase...", data);

    const { data: log, error } = await supabase
      .from("diagnostic_logs")
      .insert(data)
      .select()
      .single();

    if (error) {
      console.error("Error saving diagnostic log:", error);
      return { success: false, error: error.message };
    }

    console.log("Diagnostic log saved successfully:", log);
    return { success: true, id: log.id };
  } catch (error) {
    console.error("Exception saving diagnostic log:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
};

/**
 * Get recent diagnostic logs (admin)
 */
export const getRecentDiagnosticLogs = async (
  limit: number = 50
): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from("diagnostic_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching diagnostic logs:", error);
    return [];
  }
};

/**
 * Get diagnostic log by ID
 */
export const getDiagnosticLogById = async (
  id: string
): Promise<any | null> => {
  try {
    const { data, error } = await supabase
      .from("diagnostic_logs")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching diagnostic log:", error);
    return null;
  }
};

/**
 * Get diagnostic logs by device ID
 */
export const getDiagnosticLogsByDevice = async (
  deviceId: string
): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from("diagnostic_logs")
      .select("*")
      .eq("device_id", deviceId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching diagnostic logs by device:", error);
    return [];
  }
};

/**
 * Delete old diagnostic logs (keep last 100)
 */
export const cleanupOldLogs = async (): Promise<boolean> => {
  try {
    // Get the 100th log's timestamp
    const { data: logs, error: selectError } = await supabase
      .from("diagnostic_logs")
      .select("created_at")
      .order("created_at", { ascending: false })
      .limit(100);

    if (selectError) throw selectError;
    if (!logs || logs.length < 100) return true; // Less than 100 logs, nothing to delete

    const cutoffDate = logs[99].created_at;

    // Delete logs older than the cutoff
    const { error: deleteError } = await supabase
      .from("diagnostic_logs")
      .delete()
      .lt("created_at", cutoffDate);

    if (deleteError) throw deleteError;
    return true;
  } catch (error) {
    console.error("Error cleaning up old logs:", error);
    return false;
  }
};
