import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getRecentDiagnosticLogs } from "@/services/diagnosticLogs";
import { toast } from "sonner";
import { Loader2, RefreshCw, Eye, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DiagnosticLog {
  id: string;
  device_id: string;
  platform: string;
  is_native: boolean;
  user_agent: string;
  app_version: string;
  log_data: any;
  log_text: string;
  printer_status: string;
  supabase_connected: boolean;
  error_count: number;
  created_at: string;
}

const DiagnosticLogs = () => {
  const [logs, setLogs] = useState<DiagnosticLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<DiagnosticLog | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const data = await getRecentDiagnosticLogs(100);
      setLogs(data);
    } catch (error) {
      console.error("Error loading diagnostic logs:", error);
      toast.error("Failed to load diagnostic logs");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleViewLog = (log: DiagnosticLog) => {
    setSelectedLog(log);
    setIsDialogOpen(true);
  };

  const handleDownloadLog = (log: DiagnosticLog) => {
    const blob = new Blob([log.log_text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `diagnostic-${log.id.substring(0, 8)}-${new Date(log.created_at).toISOString().replace(/:/g, "-")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Diagnostic log downloaded!");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("de-DE", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getPlatformBadgeColor = (platform: string) => {
    switch (platform) {
      case "android":
        return "bg-green-100 text-green-800";
      case "ios":
        return "bg-blue-100 text-blue-800";
      case "web":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadgeColor = (errorCount: number) => {
    if (errorCount === 0) return "bg-green-100 text-green-800";
    if (errorCount <= 2) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            📊 Diagnostic Logs
          </h1>
          <Button
            onClick={loadLogs}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : logs.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-xl text-gray-500">No diagnostic logs found</p>
            <p className="text-sm text-gray-400 mt-2">
              Logs will appear here when diagnostics are saved from the kiosk
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <Card key={log.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPlatformBadgeColor(log.platform)}`}>
                        {log.platform.toUpperCase()} {log.is_native ? "📱" : "🌐"}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(log.error_count)}`}>
                        {log.error_count === 0 ? "✅ OK" : `⚠️ ${log.error_count} Errors`}
                      </span>
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        🖨️ {log.printer_status}
                      </span>
                      {log.supabase_connected && (
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                          ☁️ Connected
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Device ID:</span>
                        <span className="ml-2 font-mono text-gray-900">
                          {log.device_id.substring(0, 40)}...
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Timestamp:</span>
                        <span className="ml-2 text-gray-900">
                          {formatDate(log.created_at)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">App Version:</span>
                        <span className="ml-2 text-gray-900">{log.app_version}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Log ID:</span>
                        <span className="ml-2 font-mono text-gray-900">
                          {log.id.substring(0, 8)}...
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-6">
                    <Button
                      onClick={() => handleViewLog(log)}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                    <Button
                      onClick={() => handleDownloadLog(log)}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Log Detail Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Diagnostic Log Details</DialogTitle>
              <DialogDescription>
                {selectedLog && `Log ID: ${selectedLog.id} • ${formatDate(selectedLog.created_at)}`}
              </DialogDescription>
            </DialogHeader>

            {selectedLog && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <strong>Platform:</strong> {selectedLog.platform}
                  </div>
                  <div>
                    <strong>Native:</strong> {selectedLog.is_native ? "Yes" : "No"}
                  </div>
                  <div>
                    <strong>Printer Status:</strong> {selectedLog.printer_status}
                  </div>
                  <div>
                    <strong>Supabase:</strong> {selectedLog.supabase_connected ? "Connected" : "Disconnected"}
                  </div>
                  <div>
                    <strong>Error Count:</strong> {selectedLog.error_count}
                  </div>
                  <div>
                    <strong>App Version:</strong> {selectedLog.app_version}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold mb-2">User Agent:</h3>
                  <div className="p-3 bg-gray-50 rounded font-mono text-xs break-all">
                    {selectedLog.user_agent}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold mb-2">Full Diagnostic Log:</h3>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs overflow-auto max-h-96">
                    <pre className="whitespace-pre-wrap break-words">
                      {selectedLog.log_text}
                    </pre>
                  </div>
                </div>

                <Button
                  onClick={() => handleDownloadLog(selectedLog)}
                  className="w-full gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download This Log
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default DiagnosticLogs;
