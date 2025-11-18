package com.yeloeat.kiosk;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.os.IBinder;
import android.os.RemoteException;
import android.util.Log;

import org.json.JSONArray;
import org.json.JSONObject;

// ✅ KORREKTE Imports (cn.wintec.aidl statt cn.wintec.sdk)
import cn.wintec.aidl.WintecManagerService;
import cn.wintec.aidl.PrinterService;

@CapacitorPlugin(name = "Printer")
public class PrinterPlugin extends Plugin {
    private static final String TAG = "PrinterPlugin";

    // WINTEC Service-Variablen
    private WintecManagerService WINTEC;
    private PrinterService printerService;
    private boolean isPrinterReady = false;

    /**
     * ServiceConnection für WINTEC SDK
     */
    private ServiceConnection conn = new ServiceConnection() {
        @Override
        public void onServiceConnected(ComponentName name, IBinder service) {
            Log.d(TAG, "✓ Wintec Manager Service connected");

            try {
                WINTEC = WintecManagerService.Stub.asInterface(service);
                Log.d(TAG, "✓ WintecManagerService obtained");

                IBinder printerBinder = WINTEC.getPrinterService();
                printerService = PrinterService.Stub.asInterface(printerBinder);
                Log.d(TAG, "✓ PrinterService obtained");

                boolean isOpen = printerService.PRN_OpenUSB(0, 0);

                if (isOpen) {
                    isPrinterReady = true;
                    Log.d(TAG, "✓✓✓ Printer opened successfully");
                    printerService.PRN_Init();
                    Log.d(TAG, "✓ Printer initialized");
                } else {
                    Log.e(TAG, "✗ Failed to open printer");
                    isPrinterReady = false;
                }

            } catch (RemoteException e) {
                Log.e(TAG, "✗ Error initializing printer", e);
                e.printStackTrace();
                isPrinterReady = false;
            }
        }

        @Override
        public void onServiceDisconnected(ComponentName name) {
            Log.w(TAG, "⚠ Service disconnected");
            WINTEC = null;
            printerService = null;
            isPrinterReady = false;
        }
    };

    @Override
    public void load() {
        Log.d(TAG, "=== PrinterPlugin load() ===");

        try {
            Context context = getContext();
            Intent intent = new Intent();
            intent.setPackage("cn.wintec.sdk");
            intent.setAction("cn.wintec.SERVICE");

            boolean bindResult = context.bindService(intent, conn, Context.BIND_AUTO_CREATE);

            if (bindResult) {
                Log.d(TAG, "✓ Service binding initiated");
            } else {
                Log.e(TAG, "✗ Service binding failed");
            }

        } catch (Exception e) {
            Log.e(TAG, "✗ Failed to bind service", e);
            e.printStackTrace();
        }
    }

    @PluginMethod
    public void initPrinter(PluginCall call) {
        Log.d(TAG, "=== initPrinter() ===");
        JSObject ret = new JSObject();

        if (isPrinterReady && printerService != null) {
            Log.d(TAG, "✓ Printer ready");
            ret.put("success", true);
            ret.put("message", "Printer initialized");
            call.resolve(ret);
        } else {
            Log.e(TAG, "✗ Printer not ready");
            ret.put("success", false);
            ret.put("message", "Printer not initialized");
            call.reject("Printer not available", ret);
        }
    }

    @PluginMethod
    public void printReceipt(PluginCall call) {
        Log.d(TAG, "=== printReceipt() ===");

        if (!isPrinterReady || printerService == null) {
            Log.e(TAG, "✗ Printer not ready");
            JSObject ret = new JSObject();
            ret.put("success", false);
            ret.put("message", "Printer not initialized");
            call.reject("Printer not initialized", ret);
            return;
        }

        try {
            String orderNumber = call.getString("orderNumber", "N/A");
            JSONArray items = call.getArray("items");
            Double total = call.getDouble("total", 0.0);
            String language = call.getString("language", "de");

            Log.d(TAG, "Order: " + orderNumber + " | Total: €" + total);

            // === DRUCKVORGANG ===

            // Header
            printerService.PRN_Alignment(1);
            printerService.PRN_FontMultiple(22);
            printerService.PRN_Print("YELOEAT\n", "UTF-8", true);

            printerService.PRN_Print("==================\n", "UTF-8", true);
            printerService.PRN_FontMultiple(11);
            printerService.PRN_Alignment(0);

            // Bestellnummer
            printerService.PRN_Print(
                    language.equals("en") ? "Order #: " : "Bestellung #: ",
                    "UTF-8", false
            );
            printerService.PRN_bold(true);
            printerService.PRN_Print(orderNumber + "\n\n", "UTF-8", true);
            printerService.PRN_bold(false);

            // Artikel
            if (items != null) {
                for (int i = 0; i < items.length(); i++) {
                    JSONObject item = items.getJSONObject(i);
                    String name = item.getString("name");
                    int quantity = item.getInt("quantity");
                    double price = item.getDouble("price");

                    printerService.PRN_Print(
                            String.format("%dx %s\n", quantity, name),
                            "UTF-8", true
                    );
                    printerService.PRN_Print(
                            String.format("  €%.2f\n", price * quantity),
                            "UTF-8", true
                    );
                }
            }

            // Summe
            printerService.PRN_Print("\n==================\n", "UTF-8", true);
            printerService.PRN_FontMultiple(22);
            printerService.PRN_bold(true);
            printerService.PRN_Print(
                    String.format("TOTAL: €%.2f\n", total),
                    "UTF-8", true
            );
            printerService.PRN_bold(false);
            printerService.PRN_FontMultiple(11);

            // Danke
            printerService.PRN_Print("\n", "UTF-8", true);
            printerService.PRN_Alignment(1);
            printerService.PRN_Print(
                    language.equals("en") ? "Thank you!\n" : "Vielen Dank!\n",
                    "UTF-8", true
            );
            printerService.PRN_Alignment(0);

            // Papier vorschub und schneiden
            printerService.PRN_PrintAndFeedLine(3);
            printerService.PRN_CutPaper();

            Log.d(TAG, "✓✓✓ Print completed");

            JSObject ret = new JSObject();
            ret.put("success", true);
            ret.put("message", "Receipt printed");
            call.resolve(ret);

        } catch (RemoteException e) {
            Log.e(TAG, "✗ RemoteException", e);

            JSObject ret = new JSObject();
            ret.put("success", false);
            ret.put("message", "Print failed: " + e.getMessage());
            call.reject("Print failed", ret);

        } catch (Exception e) {
            Log.e(TAG, "✗ Exception", e);

            JSObject ret = new JSObject();
            ret.put("success", false);
            ret.put("message", "Print failed: " + e.getMessage());
            call.reject("Print failed", ret);
        }
    }

    @PluginMethod
    public void getPrinterStatus(PluginCall call) {
        Log.d(TAG, "=== getPrinterStatus() ===");
        JSObject ret = new JSObject();

        try {
            if (printerService != null && isPrinterReady) {
                int status = printerService.PRN_GetStatus(1);
                boolean paperOk = printerService.PRN_GetPaperStatus();

                ret.put("isConnected", true);
                ret.put("isPrinterReady", isPrinterReady);
                ret.put("statusCode", status);
                ret.put("paperAvailable", paperOk);
                ret.put("status", paperOk ? "Ready" : "Paper issue");

                Log.d(TAG, "✓ Status: Ready | Paper: " + paperOk);
            } else {
                ret.put("isConnected", false);
                ret.put("isPrinterReady", false);
                ret.put("status", "Not initialized");

                Log.w(TAG, "⚠ Not initialized");
            }

            call.resolve(ret);

        } catch (RemoteException e) {
            Log.e(TAG, "✗ Error getting status", e);

            ret.put("isConnected", false);
            ret.put("status", "Error: " + e.getMessage());
            call.resolve(ret);
        }
    }

    @Override
    protected void handleOnDestroy() {
        Log.d(TAG, "=== PrinterPlugin destroyed ===");

        try {
            if (printerService != null) {
                printerService.PRN_Close();
                Log.d(TAG, "✓ Printer closed");
            }

            if (conn != null) {
                getContext().unbindService(conn);
                Log.d(TAG, "✓ Service unbound");
            }

        } catch (Exception e) {
            Log.e(TAG, "Error during cleanup", e);
        }

        super.handleOnDestroy();
    }
}