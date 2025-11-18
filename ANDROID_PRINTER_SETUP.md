# Android Wintec SDP Printer Integration Guide

## Overview
This guide explains how to implement the native Android side of the Capacitor printer plugin to work with the Wintec SDP thermal printer.

---

## Prerequisites

1. **Wintec SDP SDK** - Obtain from Wintec (usually a `.aar` or `.jar` file)
2. **Android Studio** installed
3. **USB permissions** configured
4. **Project synced** with latest code from GitHub

---

## Step 1: Add Wintec SDK to Android Project

### 1.1 Copy SDK Files
```bash
# Navigate to your Android project
cd C:\AndroidStudioProjects\YeoEat-k\android

# Create libs directory if it doesn't exist
mkdir -p app\libs

# Copy Wintec SDK file (example names - yours may differ)
# Copy wintec-sdk.aar to app\libs\
```

### 1.2 Update `app/build.gradle`
```gradle
dependencies {
    // Existing dependencies...

    // Add Wintec SDK
    implementation files('libs/wintec-sdk.aar')
    // OR if it's a jar:
    // implementation files('libs/wintec-sdk.jar')
}
```

### 1.3 Add USB Permissions to `AndroidManifest.xml`
```xml
<!-- In android/app/src/main/AndroidManifest.xml -->
<manifest>
    <!-- Add USB permissions -->
    <uses-permission android:name="android.permission.USB_PERMISSION" />
    <uses-feature android:name="android.hardware.usb.host" />

    <application>
        <!-- Existing config... -->

        <!-- USB device filter -->
        <activity>
            <intent-filter>
                <action android:name="android.hardware.usb.action.USB_DEVICE_ATTACHED" />
            </intent-filter>
            <meta-data
                android:name="android.hardware.usb.action.USB_DEVICE_ATTACHED"
                android:resource="@xml/device_filter" />
        </activity>
    </application>
</manifest>
```

### 1.4 Create USB Device Filter
Create `android/app/src/main/res/xml/device_filter.xml`:
```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <!-- Wintec SDP USB Printer -->
    <!-- Replace vendor-id and product-id with your Wintec printer's IDs -->
    <usb-device vendor-id="YOUR_VENDOR_ID" product-id="YOUR_PRODUCT_ID" />
</resources>
```

> **Note**: Find your printer's vendor-id and product-id using `adb shell dumpsys usb` when the printer is connected.

---

## Step 2: Create Printer Plugin Implementation

Create `android/app/src/main/java/com/yeloeat/kiosk/PrinterPlugin.java`:

```java
package com.yeloeat.kiosk;

import android.hardware.usb.UsbDevice;
import android.hardware.usb.UsbManager;
import android.content.Context;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import org.json.JSONArray;
import org.json.JSONObject;

// Import Wintec SDK classes here
// import com.wintec.printer.WintecPrinter; // Example - adjust based on actual SDK

@CapacitorPlugin(name = "Printer")
public class PrinterPlugin extends Plugin {

    private WintecPrinter printer; // Adjust based on SDK
    private UsbManager usbManager;

    @Override
    public void load() {
        usbManager = (UsbManager) getContext().getSystemService(Context.USB_SERVICE);
    }

    @PluginMethod
    public void initPrinter(PluginCall call) {
        try {
            // Initialize Wintec printer
            // This is example code - adjust based on Wintec SDK documentation

            UsbDevice device = findWintecDevice();
            if (device == null) {
                call.reject("Wintec SDP printer not found");
                return;
            }

            printer = new WintecPrinter(getContext(), device);
            boolean initialized = printer.initialize();

            if (initialized) {
                JSObject ret = new JSObject();
                ret.put("success", true);
                ret.put("message", "Printer initialized successfully");
                call.resolve(ret);
            } else {
                call.reject("Failed to initialize printer");
            }

        } catch (Exception e) {
            call.reject("Initialization error: " + e.getMessage());
        }
    }

    @PluginMethod
    public void printReceipt(PluginCall call) {
        try {
            String orderNumber = call.getString("orderNumber");
            JSONArray items = call.getArray("items");
            Double total = call.getDouble("total");
            String language = call.getString("language", "de");

            if (printer == null) {
                call.reject("Printer not initialized. Call initPrinter() first.");
                return;
            }

            // Build receipt using Wintec SDK commands
            printer.printText("YeloEat Restaurant", WintecPrinter.ALIGN_CENTER, WintecPrinter.TEXT_SIZE_DOUBLE);
            printer.printText("Musterstraße 123, 12345 Berlin", WintecPrinter.ALIGN_CENTER, WintecPrinter.TEXT_SIZE_NORMAL);
            printer.printLineFeed(2);

            printer.printText("KASSENBON", WintecPrinter.ALIGN_CENTER, WintecPrinter.TEXT_SIZE_BOLD);
            printer.printSeparator();

            printer.printText("Bestellnr: " + orderNumber, WintecPrinter.ALIGN_LEFT, WintecPrinter.TEXT_SIZE_NORMAL);
            printer.printText("Datum: " + getCurrentDateTime(), WintecPrinter.ALIGN_LEFT, WintecPrinter.TEXT_SIZE_NORMAL);
            printer.printSeparator();

            // Print items
            for (int i = 0; i < items.length(); i++) {
                JSONObject item = items.getJSONObject(i);
                String name = item.getString("name");
                int quantity = item.getInt("quantity");
                double price = item.getDouble("price");

                printer.printText(name, WintecPrinter.ALIGN_LEFT, WintecPrinter.TEXT_SIZE_NORMAL);
                printer.printText(String.format("%dx %.2f EUR", quantity, price),
                                WintecPrinter.ALIGN_RIGHT, WintecPrinter.TEXT_SIZE_NORMAL);
            }

            printer.printSeparator();

            // Print totals
            double subtotal = total / 1.19; // Remove 19% tax
            double taxAmount = total - subtotal;

            printer.printText(String.format("Zwischensumme: %.2f EUR", subtotal),
                            WintecPrinter.ALIGN_RIGHT, WintecPrinter.TEXT_SIZE_NORMAL);
            printer.printText(String.format("MwSt (19%%): %.2f EUR", taxAmount),
                            WintecPrinter.ALIGN_RIGHT, WintecPrinter.TEXT_SIZE_NORMAL);
            printer.printSeparator();
            printer.printText(String.format("BRUTTO: %.2f EUR", total),
                            WintecPrinter.ALIGN_RIGHT, WintecPrinter.TEXT_SIZE_DOUBLE_BOLD);

            printer.printLineFeed(2);

            // Fiskaly placeholder
            printer.printText("TSE-Signatur (Fiskaly)", WintecPrinter.ALIGN_CENTER, WintecPrinter.TEXT_SIZE_BOLD);
            printer.printSeparator();
            printer.printText("TSE-ID: [WIRD SPÄTER IMPLEMENTIERT]", WintecPrinter.ALIGN_LEFT, WintecPrinter.TEXT_SIZE_SMALL);
            printer.printLineFeed(2);

            // Footer
            printer.printText("Vielen Dank für Ihren Besuch!", WintecPrinter.ALIGN_CENTER, WintecPrinter.TEXT_SIZE_NORMAL);
            printer.printText("Guten Appetit!", WintecPrinter.ALIGN_CENTER, WintecPrinter.TEXT_SIZE_NORMAL);
            printer.printLineFeed(3);

            // Cut paper
            printer.cutPaper();

            JSObject ret = new JSObject();
            ret.put("success", true);
            ret.put("message", "Receipt printed successfully");
            call.resolve(ret);

        } catch (Exception e) {
            call.reject("Print error: " + e.getMessage());
        }
    }

    @PluginMethod
    public void getPrinterStatus(PluginCall call) {
        try {
            boolean isConnected = printer != null && printer.isConnected();
            String status = isConnected ? "Connected" : "Not connected";

            JSObject ret = new JSObject();
            ret.put("isConnected", isConnected);
            ret.put("status", status);
            call.resolve(ret);

        } catch (Exception e) {
            JSObject ret = new JSObject();
            ret.put("isConnected", false);
            ret.put("status", "Error: " + e.getMessage());
            call.resolve(ret);
        }
    }

    private UsbDevice findWintecDevice() {
        for (UsbDevice device : usbManager.getDeviceList().values()) {
            // Check vendor ID and product ID
            // Replace with actual Wintec IDs
            if (device.getVendorId() == YOUR_VENDOR_ID &&
                device.getProductId() == YOUR_PRODUCT_ID) {
                return device;
            }
        }
        return null;
    }

    private String getCurrentDateTime() {
        return new java.text.SimpleDateFormat("dd.MM.yyyy HH:mm", java.util.Locale.GERMAN)
            .format(new java.util.Date());
    }
}
```

---

## Step 3: Register Plugin in MainActivity

Edit `android/app/src/main/java/com/yeloeat/kiosk/MainActivity.java`:

```java
package com.yeloeat.kiosk;

import com.getcapacitor.BridgeActivity;
import android.os.Bundle;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Register custom plugins
        registerPlugin(PrinterPlugin.class);
    }
}
```

---

## Step 4: Sync and Build

```bash
# From project root
npx cap sync android

# Open in Android Studio
npx cap open android

# In Android Studio:
# 1. Wait for Gradle sync to complete
# 2. Build → Build Bundle(s) / APK(s) → Build APK(s)
# 3. Install on device
```

---

## Step 5: Test

1. Connect Wintec SDP to Android device via USB
2. Open the app
3. Navigate to `/printer-test`
4. Click "Test-Beleg Generieren"
5. Click "Jetzt Drucken"
6. Receipt should print!

---

## Troubleshooting

### Printer Not Found
- Check USB cable connection
- Verify printer is powered on
- Check vendor/product IDs match in device_filter.xml
- Run `adb shell dumpsys usb` to see connected USB devices

### Permission Denied
- Make sure USB_PERMISSION is in AndroidManifest.xml
- App may need to request USB permission at runtime
- Check Android system settings → Apps → YeloEat → Permissions

### SDK Import Errors
- Ensure Wintec SDK .aar/.jar is in `android/app/libs/`
- Sync Gradle after adding
- Check SDK documentation for correct import paths

### Print Quality Issues
- Check paper loaded correctly
- Adjust print density in SDK if available
- Verify ESC/POS commands match printer capabilities

---

## Next Steps

After printer works:
1. Integrate printing into checkout flow
2. Add company settings for customizing receipt header
3. Implement real Fiskaly TSE integration
4. Add receipt email/digital option

---

## Resources

- Wintec SDP SDK Documentation (from manufacturer)
- [Capacitor Plugin Development](https://capacitorjs.com/docs/plugins)
- [Android USB Host API](https://developer.android.com/guide/topics/connectivity/usb/host)
