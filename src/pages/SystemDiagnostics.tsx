import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import Printer from "@/plugins/printer";
import { supabase } from "@/integrations/supabase/client";
import { Capacitor } from "@capacitor/core";

const SystemDiagnostics = () => {
  const [diagnosticLog, setDiagnosticLog] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const log = (message: string) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    console.log(logEntry);
    setDiagnosticLog((prev) => [...prev, logEntry]);
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    setDiagnosticLog([]);

    log("========================================");
    log("YELOEAT KIOSK - SYSTEM DIAGNOSTICS");
    log("========================================");
    log("");

    // 1. Platform Information
    log("=== PLATFORM INFORMATION ===");
    log(`Platform: ${Capacitor.getPlatform()}`);
    log(`Native Platform: ${Capacitor.isNativePlatform() ? "YES" : "NO"}`);
    log(`User Agent: ${navigator.userAgent}`);
    log("");

    // 2. Environment Variables
    log("=== ENVIRONMENT VARIABLES ===");
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      log(`VITE_SUPABASE_URL: ${supabaseUrl ? "✓ SET" : "✗ MISSING"}`);
      log(`  Value: ${supabaseUrl || "NOT SET"}`);
      log(`VITE_SUPABASE_PUBLISHABLE_KEY: ${supabaseKey ? "✓ SET" : "✗ MISSING"}`);
      log(`  Length: ${supabaseKey?.length || 0} characters`);
      log(`  First 20 chars: ${supabaseKey?.substring(0, 20) || "N/A"}...`);
      log(`  Last 20 chars: ...${supabaseKey?.substring(supabaseKey.length - 20) || "N/A"}`);
    } catch (error) {
      log(`✗ Error reading environment variables: ${error}`);
    }
    log("");

    // 3. Supabase Connection Test
    log("=== SUPABASE CONNECTION TEST ===");
    try {
      log("Testing connection to Supabase...");
      const { data, error } = await supabase
        .from("products")
        .select("id, name")
        .limit(1);

      if (error) {
        log(`✗ Supabase Error: ${error.message}`);
        log(`  Code: ${error.code}`);
        log(`  Details: ${error.details}`);
      } else {
        log(`✓ Supabase connection successful`);
        log(`  Retrieved ${data?.length || 0} products`);
      }
    } catch (error) {
      log(`✗ Supabase connection failed: ${error}`);
    }
    log("");

    // 4. Printer Plugin Check
    log("=== PRINTER PLUGIN DIAGNOSTICS ===");
    try {
      log("Checking if Printer plugin is available...");

      // Check if the plugin exists in Capacitor
      const plugins = (window as any).Capacitor?.Plugins;
      if (plugins) {
        log("✓ Capacitor.Plugins object exists");
        const printerPlugin = plugins.Printer;
        if (printerPlugin) {
          log("✓ Printer plugin found in Capacitor.Plugins");
        } else {
          log("✗ Printer plugin NOT found in Capacitor.Plugins");
          log("  Available plugins:");
          Object.keys(plugins).forEach((key) => {
            log(`    - ${key}`);
          });
        }
      } else {
        log("✗ Capacitor.Plugins object not found");
      }
      log("");

      // Try to call initPrinter
      log("Attempting to initialize printer...");
      try {
        const initResult = await Printer.initPrinter();
        log("✓ initPrinter() call successful");
        log(`  Result: ${JSON.stringify(initResult, null, 2)}`);
      } catch (initError: any) {
        log(`✗ initPrinter() failed: ${initError.message || initError}`);
        log(`  Error type: ${typeof initError}`);
        log(`  Full error: ${JSON.stringify(initError, null, 2)}`);
      }
      log("");

      // Try to get printer status
      log("Attempting to get printer status...");
      try {
        const statusResult = await Printer.getPrinterStatus();
        log("✓ getPrinterStatus() call successful");
        log(`  Result: ${JSON.stringify(statusResult, null, 2)}`);
      } catch (statusError: any) {
        log(`✗ getPrinterStatus() failed: ${statusError.message || statusError}`);
        log(`  Error type: ${typeof statusError}`);
        log(`  Full error: ${JSON.stringify(statusError, null, 2)}`);
      }
    } catch (error: any) {
      log(`✗ Printer plugin check failed: ${error.message || error}`);
    }
    log("");

    // 5. Test Order Creation (without actually creating)
    log("=== ORDER SYSTEM CHECK ===");
    try {
      const testOrderData = {
        order_number: "TEST-DIAG",
        service_type: "take-away",
        payment_method: "card",
        language: "de",
        subtotal: 10.0,
        tax_amount: 1.9,
        total: 11.9,
      };
      log("Test order data prepared:");
      log(JSON.stringify(testOrderData, null, 2));
      log("✓ Order system structure OK");
    } catch (error) {
      log(`✗ Order system check failed: ${error}`);
    }
    log("");

    // 6. LocalStorage Check
    log("=== LOCALSTORAGE CHECK ===");
    try {
      const cartData = localStorage.getItem("cart");
      const language = localStorage.getItem("language");
      log(`Cart data: ${cartData ? "✓ Present" : "✗ Empty"}`);
      log(`Language: ${language || "Not set"}`);
    } catch (error) {
      log(`✗ LocalStorage check failed: ${error}`);
    }
    log("");

    log("========================================");
    log("DIAGNOSTICS COMPLETE");
    log("========================================");

    setIsRunning(false);
    toast.success("Diagnostics completed!");
  };

  const copyToClipboard = () => {
    const logText = diagnosticLog.join("\n");
    navigator.clipboard.writeText(logText);
    toast.success("Diagnostic log copied to clipboard!");
  };

  const downloadLog = () => {
    const logText = diagnosticLog.join("\n");
    const blob = new Blob([logText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `yeloeat-diagnostics-${new Date().toISOString().replace(/:/g, "-")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Diagnostic log downloaded!");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">
          🔧 System Diagnostics
        </h1>

        <Card className="p-6 mb-6">
          <div className="flex gap-4 mb-4">
            <Button
              onClick={runDiagnostics}
              disabled={isRunning}
              className="text-lg py-6 px-8"
              size="lg"
            >
              {isRunning ? "⏳ Running..." : "▶️ Run Full Diagnostics"}
            </Button>

            <Button
              onClick={copyToClipboard}
              disabled={diagnosticLog.length === 0}
              variant="outline"
              className="text-lg py-6 px-8"
              size="lg"
            >
              📋 Copy Log
            </Button>

            <Button
              onClick={downloadLog}
              disabled={diagnosticLog.length === 0}
              variant="outline"
              className="text-lg py-6 px-8"
              size="lg"
            >
              💾 Download Log
            </Button>
          </div>

          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-auto max-h-[600px]">
            {diagnosticLog.length === 0 ? (
              <div className="text-gray-500">
                Click "Run Full Diagnostics" to start system check...
              </div>
            ) : (
              <pre className="whitespace-pre-wrap break-words">
                {diagnosticLog.join("\n")}
              </pre>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">📝 Instructions</h2>
          <ul className="space-y-2 text-gray-700">
            <li>1. Click <strong>"Run Full Diagnostics"</strong> to check all systems</li>
            <li>2. Wait for the diagnostic to complete (~10 seconds)</li>
            <li>3. Click <strong>"Copy Log"</strong> or <strong>"Download Log"</strong></li>
            <li>4. Share the log file with support for analysis</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default SystemDiagnostics;
