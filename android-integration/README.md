# WINTEC Printer Integration Guide

## Overview
This guide helps you integrate the WINTEC WT-SDK for Android with your Capacitor app to enable hardware printer functionality.

## Prerequisites
- Mac or Windows PC with Android Studio installed
- USB cable for WINTEC device
- WINTEC device (K7, K9, or compatible model)

## Installation Steps

### 1. Export and Clone Repository
1. In Lovable, click "Export to Github"
2. On your local machine, run:
   ```bash
   git clone [your-repository-url]
   cd [your-project-name]
   npm install
   ```

### 2. Initialize Capacitor
```bash
npx cap init
npm run build
npx cap add android
```

### 3. Add WT-SDK to Android Project
1. Copy `WT-SDK.jar` to: `android/app/libs/`
   ```bash
   mkdir -p android/app/libs
   cp android-integration/WT-SDK.jar android/app/libs/
   ```

2. Open `android/app/build.gradle` and add to dependencies:
   ```gradle
   implementation files('libs/WT-SDK.jar')
   ```

3. Sync project in Android Studio:
   - Click "Sync Now" button, or
   - File → Sync Project with Gradle Files

### 4. Create Native Plugin

Create `android/app/src/main/java/[your-package]/PrinterPlugin.java`:

```java
package app.lovable.yeloeat;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.wintec.wtsdk.WTDevice;
import com.wintec.wtsdk.printer.WTPrinter;
import android.util.Log;
import org.json.JSONArray;
import org.json.JSONObject;

@CapacitorPlugin(name = "Printer")
public class PrinterPlugin extends Plugin {
    private static final String TAG = "PrinterPlugin";
    private WTPrinter printer;
    private WTDevice wtDevice;
    
    @Override
    public void load() {
        Log.d(TAG, "=== PrinterPlugin load() called ===");
        try {
            Log.d(TAG, "Getting WTDevice instance...");
            wtDevice = WTDevice.getInstance(getContext());
            Log.d(TAG, "WTDevice obtained: " + (wtDevice != null));
            
            if (wtDevice != null) {
                Log.d(TAG, "Getting printer from WTDevice...");
                printer = wtDevice.getPrinter();
                Log.d(TAG, "Printer obtained: " + (printer != null));
                
                if (printer != null) {
                    Log.d(TAG, "✓ Printer initialized successfully");
                } else {
                    Log.e(TAG, "✗ Printer is null after getPrinter()");
                }
            } else {
                Log.e(TAG, "✗ WTDevice is null");
            }
        } catch (Exception e) {
            Log.e(TAG, "✗ Failed to initialize printer", e);
            Log.e(TAG, "Exception type: " + e.getClass().getName());
            Log.e(TAG, "Exception message: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    @PluginMethod
    public void initPrinter(PluginCall call) {
        Log.d(TAG, "=== initPrinter() called ===");
        JSObject ret = new JSObject();
        
        if (printer != null) {
            Log.d(TAG, "✓ Printer available");
            ret.put("success", true);
            ret.put("message", "Printer initialized");
            call.resolve(ret);
        } else {
            Log.e(TAG, "✗ Printer not available");
            ret.put("success", false);
            ret.put("message", "Printer not initialized - check device and SDK");
            call.reject("Printer not available", ret);
        }
    }
    
    @PluginMethod
    public void printReceipt(PluginCall call) {
        Log.d(TAG, "=== printReceipt() called ===");
        try {
            String orderNumber = call.getString("orderNumber");
            JSONArray items = call.getArray("items");
            Double total = call.getDouble("total");
            String language = call.getString("language", "de");
            
            Log.d(TAG, "Order Number: " + orderNumber);
            Log.d(TAG, "Items count: " + (items != null ? items.length() : 0));
            Log.d(TAG, "Total: €" + total);
            Log.d(TAG, "Language: " + language);
            
            if (printer == null) {
                Log.e(TAG, "✗ Printer is null - cannot print");
                JSObject ret = new JSObject();
                ret.put("success", false);
                ret.put("message", "Printer not initialized");
                call.reject("Printer not initialized", ret);
                return;
            }
            
            Log.d(TAG, "Starting print sequence...");
            
            // Start printing
            printer.setAlignment(1); // Center align
            printer.setFontSize(1); // Large font
            printer.printText("YELOEAT\\n");
            printer.printText("==================\\n");
            printer.setFontSize(0); // Normal font
            printer.setAlignment(0); // Left align
            
            // Order number
            printer.printText(language.equals("en") ? 
                "Order #: " : "Bestellung #: ");
            printer.setFontSize(1);
            printer.printText(orderNumber + "\\n\\n");
            printer.setFontSize(0);
            
            // Items
            for (int i = 0; i < items.length(); i++) {
                JSONObject item = items.getJSONObject(i);
                String name = item.getString("name");
                int quantity = item.getInt("quantity");
                double price = item.getDouble("price");
                
                printer.printText(String.format("%dx %s\\n", quantity, name));
                printer.printText(String.format("  €%.2f\\n", price * quantity));
            }
            
            printer.printText("\\n==================\\n");
            printer.setFontSize(1);
            printer.printText(String.format("Total: €%.2f\\n", total));
            printer.setFontSize(0);
            printer.printText("\\n");
            printer.printText(language.equals("en") ? 
                "Thank you!\\n" : "Vielen Dank!\\n");
            printer.printText("\\n\\n\\n");
            
            // Feed paper and cut
            Log.d(TAG, "Feeding paper...");
            printer.feedPaper(100);
            Log.d(TAG, "Cutting paper...");
            printer.cutPaper();
            
            Log.d(TAG, "✓ Print completed successfully");
            JSObject ret = new JSObject();
            ret.put("success", true);
            ret.put("message", "Receipt printed successfully");
            call.resolve(ret);
                
        } catch (Exception e) {
            Log.e(TAG, "✗ Print failed with exception", e);
            Log.e(TAG, "Exception type: " + e.getClass().getName());
            Log.e(TAG, "Exception message: " + e.getMessage());
            e.printStackTrace();
            
            JSObject ret = new JSObject();
            ret.put("success", false);
            ret.put("message", "Print failed: " + e.getMessage());
            call.reject("Print failed: " + e.getMessage(), ret);
        }
    }
    
    @PluginMethod
    public void getPrinterStatus(PluginCall call) {
        Log.d(TAG, "=== getPrinterStatus() called ===");
        JSObject ret = new JSObject();
        
        Log.d(TAG, "WTDevice: " + (wtDevice != null ? "Available" : "NULL"));
        Log.d(TAG, "Printer: " + (printer != null ? "Available" : "NULL"));
        
        if (printer != null) {
            ret.put("isConnected", true);
            ret.put("status", "Ready");
            ret.put("wtDeviceAvailable", wtDevice != null);
            Log.d(TAG, "✓ Status: Ready");
        } else {
            ret.put("isConnected", false);
            ret.put("status", "Not initialized");
            ret.put("wtDeviceAvailable", wtDevice != null);
            Log.e(TAG, "✗ Status: Not initialized");
        }
        call.resolve(ret);
    }
}
```

### 5. Register Plugin

In `android/app/src/main/java/[your-package]/MainActivity.java`, add:

```java
import app.lovable.yeloeat.PrinterPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        registerPlugin(PrinterPlugin.class);
    }
}
```

### 6. Build and Run

```bash
npm run build
npx cap sync
npx cap run android
```

## Testing on WINTEC Device

1. Connect WINTEC device via USB
2. Enable USB debugging on device
3. Run: `npx cap run android`
4. Select your WINTEC device when prompted

## Troubleshooting

### Printer not detected
- Ensure WT-SDK.jar is in android/app/libs/
- Check build.gradle has the implementation line
- Restart Android Studio and sync

### Import errors
- Make sure package name matches your project
- Check that WT-SDK classes are available

### Print not working

**Step 1: Check LogCat output**
```bash
adb logcat | grep "PrinterPlugin"
```
Look for the debug messages with "===" markers to see exactly where it fails.

**Step 2: Verify Plugin Registration**
- Make sure `PrinterPlugin.class` is registered in `MainActivity.java`
- Check that the plugin is loaded when app starts

**Step 3: Check SDK Integration**
- Ensure WT-SDK.jar is in `android/app/libs/`
- Verify `build.gradle` has: `implementation files('libs/WT-SDK.jar')`
- Run Gradle sync after adding

**Step 4: Physical Checks**
- Check printer paper is loaded
- Verify device is a genuine WINTEC terminal
- Ensure app has required Android permissions

**Step 5: Review LogCat Output**
The plugin now includes extensive logging:
- `=== PrinterPlugin load() called ===` - Should appear on app start
- `=== getPrinterStatus() called ===` - Shows printer availability
- `=== printReceipt() called ===` - Shows print attempt details
- Look for ✓ (success) or ✗ (error) markers

**Common Issues:**
1. **Plugin not registered**: LogCat won't show any "PrinterPlugin" messages
2. **SDK not found**: Will see ClassNotFoundException or NoClassDefFoundError
3. **WTDevice is null**: Device might not be a WINTEC terminal
4. **Printer is null**: SDK might not support this device model

## Hot Reload During Development

The app is configured to connect to the Lovable sandbox for hot reload. Make code changes in Lovable and see them instantly on your device without rebuilding.

To disable hot reload and use local build:
1. Remove `server` section from `capacitor.config.ts`
2. Run `npx cap sync`

## Support

For WINTEC SDK questions, contact: support@wintec.co
For Capacitor questions: https://capacitorjs.com/docs
