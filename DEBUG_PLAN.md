# 🔍 Complete Debug & Fix Plan - YeoEat Kiosk

## 🎯 Two Critical Issues to Fix

1. **Printer Plugin "Not Implemented" Error**
2. **Order Creation "Cannot be Generated" Error**

---

# ISSUE 1: Printer Plugin Not Working

## Step 1.1: Verify MainActivity.java Registration

**Location:** `C:\AndroidStudioProjects\YeoEat-k\android\app\src\main\java\com\yeloeat\kiosk\MainActivity.java`

**Open file and verify it contains:**

```java
package com.yeloeat.kiosk;

import com.getcapacitor.BridgeActivity;
import android.os.Bundle;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // ✅ THIS LINE MUST BE PRESENT
        registerPlugin(PrinterPlugin.class);
    }
}
```

**❌ If missing:** Add the line and rebuild
**✅ If present:** Continue to Step 1.2

---

## Step 1.2: Check if Wintec SDK Service is Installed

**On your computer, with device connected:**

```bash
# Check if Wintec service APK is installed
adb shell pm list packages | findstr wintec
```

**Expected output:**
```
package:cn.wintec.sdk
```

**❌ If NOT found:**
- Wintec SDK service APK is missing on the device!
- You need `WintecSDKService.apk` (or similar name from Wintec)
- Install it: `adb install WintecSDKService.apk`
- This is REQUIRED for your PrinterPlugin to work!

**✅ If found:** Service is installed, continue to Step 1.3

---

## Step 1.3: Check Android Logcat for Actual Error

**Connect device and run:**

```bash
# Clear logs and start fresh
adb logcat -c

# Monitor logs
adb logcat | findstr /i "PrinterPlugin Capacitor"
```

**Then on device:**
1. Close and restart the YeoEat app
2. Navigate to printer test page
3. Click "Jetzt Drucken"

**Expected logs (if working):**
```
PrinterPlugin: === PrinterPlugin load() ===
PrinterPlugin: ✓ Service binding initiated
PrinterPlugin: ✓ Wintec Manager Service connected
PrinterPlugin: ✓✓✓ Printer opened successfully
PrinterPlugin: === printReceipt() ===
PrinterPlugin: ✓✓✓ Print completed
```

**If you see errors, note them exactly and share!**

---

## Step 1.4: Verify Capacitor Plugin is Loaded

**In logcat, look for:**

```
Capacitor: Loading plugin: Printer
```

**❌ If NOT found:** Plugin not registered properly
- Check MainActivity.java again
- Make sure you rebuilt APK after adding registration
- Run `npx cap sync android` again

---

## Step 1.5: Common Printer Issues & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| "Plugin not implemented" | Not registered in MainActivity | Add `registerPlugin(PrinterPlugin.class);` |
| "Service binding failed" | Wintec SDK not installed | Install Wintec service APK |
| "Printer not ready" | USB not connected | Connect Wintec SDP via USB |
| "Permission denied" | Missing USB permission | Check AndroidManifest.xml permissions |

---

# ISSUE 2: Order Creation Failing

## Step 2.1: Get Exact Error Message

**On device:**
1. Open Chrome on the device
2. Open `https://yeo-eat-kiosk.vercel.app/`
3. Open Chrome DevTools (if testing on computer)
4. Add items to cart
5. Select payment method
6. Watch console for errors

**OR use remote debugging:**

```bash
# On computer, open Chrome
# Navigate to: chrome://inspect
# Find your device
# Inspect the YeoEat app WebView
# Open Console tab
```

**Look for:**
- "Headers: Invalid value" errors
- Supabase connection errors
- Any error messages

**Share the EXACT error message!**

---

## Step 2.2: Test Supabase Connection Directly

**In browser console (F12), run:**

```javascript
// Check if Supabase client is initialized
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase Key exists:', !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);

// Test connection
const testConnection = async () => {
    const { data, error } = await window.supabase
        .from('products')
        .select('*')
        .limit(1);

    console.log('Supabase test - data:', data);
    console.log('Supabase test - error:', error);
};

testConnection();
```

**Expected:** Should return product data
**If error:** Share the error details

---

## Step 2.3: Test Order Creation Directly

**In browser console:**

```javascript
const testOrder = async () => {
    const orderData = {
        order_number: 'TEST123',
        service_type: 'eat-in',
        payment_method: 'card',
        language: 'de',
        subtotal: 10.00,
        tax_amount: 1.90,
        total: 11.90
    };

    const { data, error } = await window.supabase
        .from('orders')
        .insert(orderData)
        .select();

    console.log('Order test - data:', data);
    console.log('Order test - error:', error);
};

testOrder();
```

**Expected:** Should create order
**If error:** This tells us the exact problem!

---

## Step 2.4: Check Supabase RLS Policies

**Go to Supabase Dashboard:**
https://supabase.com/dashboard/project/tnqdlzbsbbyituoexhku

**Navigate to:**
1. **Authentication** → **Policies**
2. **Find `orders` table**
3. **Check policies**

**Required policy:**
```sql
Policy: "Anyone can create orders"
Operation: INSERT
Target: orders
Check: true (allows all inserts)
```

**❌ If missing or different:** The RLS policy is blocking!

**Fix in Supabase SQL Editor:**
```sql
-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Drop old policy if exists
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;

-- Create new policy
CREATE POLICY "Anyone can create orders"
ON orders
FOR INSERT
TO anon, authenticated
WITH CHECK (true);
```

---

## Step 2.5: Common Order Creation Issues & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| "Headers: Invalid value" | Env vars have whitespace | Re-enter in Vercel (trim whitespace) |
| "Row Level Security" | RLS blocking anon users | Update RLS policies (see Step 2.4) |
| "Invalid input" | Data type mismatch | Check order data structure |
| "Foreign key violation" | Product IDs invalid | Use actual product IDs from DB |

---

# 🎯 SYSTEMATIC DEBUGGING WORKFLOW

## Phase 1: Printer Issue

1. ✅ Check MainActivity.java → Add registration if missing → Rebuild
2. ✅ Check Wintec service installed → Install if missing
3. ✅ Check logcat → Note exact error
4. ✅ Fix based on error message

## Phase 2: Order Issue

1. ✅ Get exact error from console
2. ✅ Test Supabase connection
3. ✅ Test order creation directly
4. ✅ Check/fix RLS policies
5. ✅ Fix based on findings

---

# 📋 CHECKLIST - Complete in Order

**Printer:**
- [ ] MainActivity has `registerPlugin(PrinterPlugin.class);`
- [ ] Wintec SDK service APK installed: `adb shell pm list packages | findstr wintec`
- [ ] USB printer connected to device
- [ ] Logcat shows plugin loading
- [ ] Test print works

**Orders:**
- [ ] Console shows exact error message
- [ ] Supabase connection test passes
- [ ] Order insert test identifies exact failure
- [ ] RLS policies allow anonymous inserts
- [ ] Order creation works

---

# 🆘 QUICK HELP

**If stuck, provide:**
1. Screenshot of error message
2. Logcat output (for printer)
3. Console error (for orders)
4. Result of Supabase connection test

---

# 🎯 EXPECTED END STATE

✅ Printer plugin loads and connects to Wintec SDK
✅ Test print successfully prints receipt
✅ Orders can be created in database
✅ Full ordering flow works end-to-end
✅ Kiosk is operational! 🎉
