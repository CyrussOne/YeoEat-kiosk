# 🔄 Claude Handoff Prompt - YeoEat Kiosk Printer Issue

**Date:** November 18, 2025
**Session Goal:** Fix Wintec thermal printer integration on Android kiosk tablet

---

## 📋 Project Overview

**Project:** YeoEat Kiosk - React + Capacitor + Supabase food ordering kiosk
**GitHub:** https://github.com/CyrussOne/YeoEat-kiosk
**Environment:**
- Frontend: React + TypeScript + Vite
- Backend: Supabase (PostgreSQL + Auth)
- Mobile: Capacitor 7.4.4 for Android
- Printer: Wintec SDP thermal printer (USB connection)
- Deployment: Vercel (web) + Custom APK (Android tablet)

**User Locations:**
- Development: Windows machine at `C:\AndroidStudioProjects\YeoEat-k`
- Production: Linux Codespaces at `/workspaces/YeoEat-kiosk`
- Kiosk Tablet: Android 11 device (WTB0_3568)

---

## 🎯 Current Issue

**Problem:** Printer plugin shows "not implemented on android" error
**Error Code:** `UNIMPLEMENTED`
**Symptom:** When user tests printer on Android tablet, gets error: `"Printer" plugin is not implemented on android`

**Key Finding:**
- ✅ Plugin IS detected in JavaScript: `✓ Printer plugin found in Capacitor.Plugins`
- ❌ Plugin native methods fail: `✗ initPrinter() failed: UNIMPLEMENTED`
- This suggests annotation processing or native bridge issue

---

## ✅ What We've Accomplished Today

### 1. Created Comprehensive Diagnostic System
- Built `SystemDiagnostics.tsx` page at `/diagnostics` route
- Added "Save to Supabase" functionality
- Created `diagnostic_logs` table in Supabase
- Created admin viewer at `/admin/diagnostic-logs`
- Added fetch script: `fetch-diagnostics.cjs`

**Access diagnostic logs:**
```bash
node fetch-diagnostics.cjs
```

**Latest diagnostic log ID:** `82b6e921-bd38-4caf-835d-33c834ef6ed5`

### 2. Implemented Wintec Printer Plugin (Android Native)

**Files Created:**

**`android/app/src/main/java/com/yeloeat/kiosk/PrinterPlugin.java`**
- Package: `com.yeloeat.kiosk`
- Annotation: `@CapacitorPlugin(name = "Printer")`
- Implements: `initPrinter()`, `printReceipt()`, `getPrinterStatus()`
- Uses: Wintec SDK classes (`cn.wintec.aidl.WintecManagerService`, `cn.wintec.aidl.PrinterService`)
- Status: ✅ Compiled successfully, in GitHub repo

**`android/app/src/main/java/com/yeloeat/kiosk/MainActivity.java`**
- Imports: `com.yeloeat.kiosk.PrinterPlugin`
- Registers: `registerPlugin(PrinterPlugin.class)`
- Status: ✅ Compiled successfully, in GitHub repo

**`android/app/build.gradle`**
- Has: `implementation files('libs/WT-SDK.jar')`
- Has: `implementation project(':capacitor-android')`
- Status: ✅ Build successful

### 3. Built and Deployed New APK

**Latest APK:**
- Location: `C:\AndroidStudioProjects\YeoEat-k\android\app\build\outputs\apk\debug\app-debug.apk`
- Build: ✅ Successful
- Installed: ✅ On Android tablet
- Status: ❌ Still shows "UNIMPLEMENTED" error

### 4. Admin Access Setup
- Bypassed admin role check temporarily
- User can now access admin panel
- Can view diagnostic logs at `/admin/diagnostic-logs`

---

## 🔍 Technical Details

### Capacitor Configuration
- Version: 7.4.4
- Platform: Android
- Plugin Registration: Manual via `MainActivity.registerPlugin()`

### Android Build Details
- Gradle: 8.2.1
- compileSdkVersion: 35
- Java: VERSION_17
- Package: `com.yeloeat.kiosk`

### Wintec SDK
- File: `android/app/libs/WT-SDK.jar`
- Classes: `cn.wintec.aidl.WintecManagerService`, `cn.wintec.aidl.PrinterService`
- Status: ✅ Included in build.gradle

### Diagnostic Logs Access
**Supabase Table:** `diagnostic_logs`
**Fields:**
- `id` (UUID)
- `platform` (android/ios/web)
- `is_native` (boolean)
- `log_text` (full diagnostic output)
- `printer_status` (connected/disconnected/error)
- `error_count` (integer)
- `created_at` (timestamp)

**Fetch logs:**
```bash
VITE_SUPABASE_URL="https://tnqdlzbsbbyituoexhku.supabase.co" \
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRucWRsemJzYmJ5aXR1b2V4aGt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNzQ5NjYsImV4cCI6MjA3ODk1MDk2Nn0.jt1kTYld5rqsyjmqaHwDvRw4bJkoiVeKRNqCaCEflTw" \
node fetch-diagnostics.cjs
```

---

## 🐛 Known Issues & Attempted Solutions

### Issue 1: "UNIMPLEMENTED" Error
**Attempted Solutions:**
1. ❌ Added Capacitor annotation processor to build.gradle (couldn't find Maven dependency)
2. ✅ Verified plugin is registered in MainActivity
3. ✅ Verified @CapacitorPlugin annotation exists
4. ✅ Verified plugin compiles successfully
5. ✅ Rebuilt APK with latest code
6. ❌ Still getting UNIMPLEMENTED error

**Theory:** Capacitor's plugin bridge isn't loading the native implementation, despite:
- Plugin being registered
- Plugin being compiled
- Plugin having correct annotation

### Issue 2: Android Directory in .gitignore
**Solution:** Used `git add -f` to force add specific plugin files
**Files added:**
- `android/app/src/main/java/com/yeloeat/kiosk/PrinterPlugin.java`
- `android/app/src/main/java/com/yeloeat/kiosk/MainActivity.java`

---

## 📂 Important File Locations

**Windows (User's Machine):**
```
C:\AndroidStudioProjects\YeoEat-k\
├── android\
│   ├── app\
│   │   ├── build.gradle (BUILD CONFIG)
│   │   ├── src\main\java\com\yeloeat\kiosk\
│   │   │   ├── PrinterPlugin.java (NATIVE PLUGIN)
│   │   │   └── MainActivity.java (PLUGIN REGISTRATION)
│   │   └── libs\
│   │       └── WT-SDK.jar (WINTEC SDK)
│   └── build\outputs\apk\debug\
│       └── app-debug.apk (LATEST APK)
└── [React source code]
```

**Linux (Codespaces):**
```
/workspaces/YeoEat-kiosk/
├── android/ (synced from Windows)
├── src/ (React frontend)
├── PRINTER_FIX_TASK_PLAN.md (TASK PLAN)
├── DIAGNOSTIC_LOGS_SETUP.md (SETUP GUIDE)
├── fetch-diagnostics.cjs (LOG FETCHER)
└── apply-migrations.sql (DATABASE SCHEMA)
```

---

## 🎯 Next Steps for Tomorrow

### Priority 1: Debug Native Bridge Connection

**Hypothesis:** Capacitor isn't loading the native implementation

**Steps to investigate:**

1. **Check Android Logcat Output**
   ```powershell
   # On Windows, with tablet connected
   adb logcat | Select-String "PrinterPlugin"
   adb logcat | Select-String "Capacitor"
   ```
   Look for:
   - Plugin registration messages
   - Class not found errors
   - Native method errors

2. **Verify Plugin is in APK**
   ```powershell
   # Check if plugin class is in the APK
   cd C:\AndroidStudioProjects\YeoEat-k\android\app\build\outputs\apk\debug
   jar tf app-debug.apk | Select-String "PrinterPlugin"
   ```
   Should see: `com/yeloeat/kiosk/PrinterPlugin.class`

3. **Add Verbose Logging to PrinterPlugin.java**
   Add extensive `Log.d()` statements to track:
   - Plugin initialization
   - Method calls
   - Service connection status
   - SDK initialization

4. **Check Capacitor Plugin Discovery**
   - Look for `capacitor.plugins.json` in the APK
   - Verify PrinterPlugin is listed

### Priority 2: Alternative Registration Methods

If standard registration fails, try:

**Option A: Manual Plugin Proxy**
- Create a JavaScript bridge in `src/plugins/printer.ts`
- Manually call native methods via `Capacitor.execute()`

**Option B: Use capacitor.config.ts**
```typescript
plugins: {
  Printer: {
    androidPackage: 'com.yeloeat.kiosk.PrinterPlugin'
  }
}
```

**Option C: Create Plugin Module**
- Move PrinterPlugin to separate Gradle module
- Include as plugin dependency

### Priority 3: Test Wintec SDK Directly

**Create Test Activity:**
- Bypass Capacitor entirely
- Test Wintec SDK directly in Android Activity
- Verify USB connection and printer communication
- If this works, the issue is Capacitor bridge; if not, it's SDK/hardware

---

## 🔧 Quick Reference Commands

**On Windows (User's Machine):**

```powershell
# Navigate to project
cd C:\AndroidStudioProjects\YeoEat-k

# Pull latest changes
git pull origin main

# Sync Capacitor
npm run build
npx cap sync android

# Build APK
cd android
.\gradlew.bat clean
.\gradlew.bat assembleDebug

# Install on tablet (USB connected)
adb install -r app\build\outputs\apk\debug\app-debug.apk

# View logs
adb logcat | Select-String "PrinterPlugin"
```

**On Linux (Codespaces):**

```bash
# Fetch diagnostic logs
node fetch-diagnostics.cjs

# Check Android files
ls -la android/app/src/main/java/com/yeloeat/kiosk/

# Build and sync
npm run build
npx cap sync android
```

---

## 📊 Progress Checklist

- [x] Created diagnostic logging system
- [x] Implemented Android printer plugin
- [x] Built and installed APK on tablet
- [x] Verified plugin compiles and registers
- [ ] **FIX: Plugin native bridge connection**
- [ ] Test Wintec SDK communication
- [ ] Verify USB printer connection
- [ ] Test actual receipt printing
- [ ] Production deployment

---

## 🆘 If You Get Stuck

**Common Issues:**

1. **"Can't find PrinterPlugin"** → Check package name matches
2. **"UNIMPLEMENTED" error** → Native bridge not connecting (current issue)
3. **Build fails** → Check Gradle version, dependencies
4. **USB printer not detected** → Check Android permissions, USB OTG
5. **Wintec SDK errors** → Check JAR file exists, imports correct

**Useful Debug Commands:**
```bash
# Check if plugin class exists in APK
jar tf app-debug.apk | grep PrinterPlugin

# Check Android logs for errors
adb logcat -s "PrinterPlugin:*" "Capacitor:*"

# List connected USB devices
adb shell lsusb
```

---

## 📞 Context for Tomorrow's Claude

**When the user says:**
- "Printer not working" → They mean the UNIMPLEMENTED error
- "Run diagnostics" → Use the blue Debug button on tablet, save to Supabase
- "Fetch logs" → Run `node fetch-diagnostics.cjs`
- "Build APK" → In Windows PowerShell at `C:\AndroidStudioProjects\YeoEat-k\android`

**Key Files to Check First:**
1. `PrinterPlugin.java` - Native implementation
2. `MainActivity.java` - Plugin registration
3. `build.gradle` - Dependencies and SDK
4. Latest diagnostic log in Supabase

**The user prefers:**
- Exact command-line instructions (copy-paste ready)
- Step-by-step approach with verification
- Using Android Studio terminal on Windows
- Saving diagnostics to Supabase for remote debugging

---

## 🎯 Tomorrow's Starting Point

**Prompt to give Claude:**

```
Hi! I'm continuing work on the YeoEat kiosk printer integration. Yesterday we built and installed a new APK with the Wintec printer plugin, but it's still showing "plugin is not implemented on android" error (code: UNIMPLEMENTED).

The plugin code is in the repo:
- PrinterPlugin.java (compiled ✓, registered ✓, annotated ✓)
- MainActivity.java (registers plugin ✓)
- build.gradle (includes WT-SDK.jar ✓)

Please read HANDOFF_PROMPT.md for full context, then help me debug why Capacitor isn't loading the native implementation. Latest diagnostic log ID: 82b6e921-bd38-4caf-835d-33c834ef6ed5

I can run commands on Windows (C:\AndroidStudioProjects\YeoEat-k) and you have access to the Linux environment. Let's start with checking Android logcat output to see what's happening when the plugin tries to initialize.
```

---

## 📚 Related Documentation Files

- `PRINTER_FIX_TASK_PLAN.md` - Original task breakdown
- `DIAGNOSTIC_LOGS_SETUP.md` - How to use diagnostic system
- `ANDROID_PRINTER_SETUP.md` - Printer setup guide
- `DEBUG_PLAN.md` - Debugging strategies

---

**Good luck tomorrow! 🚀**

The main issue is clear: Capacitor recognizes the plugin exists but can't execute the native methods. The next step is deep Android debugging with logcat to see what's actually happening in the native layer.
