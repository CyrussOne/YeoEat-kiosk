# 🖨️ Printer Issue - Task Plan

**Issue:** `"Printer" plugin is not implemented on android` - Code: UNIMPLEMENTED

**Root Cause:** Android native code (PrinterPlugin.java) not in GitHub repo yet

---

## 📋 Task Plan

### PHASE 1: Push Android Native Code to GitHub

#### 👤 **USER Tasks:**

**Task 1.1:** Verify Android files exist on Windows
```powershell
# On Windows PowerShell
cd C:\AndroidStudioProjects\YeoEat-k

# Check PrinterPlugin exists
Get-Content android\app\src\main\java\com\yeloeat\kiosk\PrinterPlugin.java | Select-String "@CapacitorPlugin"

# Check MainActivity is updated
Get-Content android\app\src\main\java\com\yeloeat\kiosk\MainActivity.java | Select-String "PrinterPlugin"
```
✅ **Success criteria:** Both commands return results

---

**Task 1.2:** Check git status and commit Android files
```powershell
cd C:\AndroidStudioProjects\YeoEat-k

# Check what needs to be committed
git status

# Add Android files
git add android/app/src/main/java/com/yeloeat/kiosk/

# Commit
git commit -m "Add Wintec printer plugin for Android

- Created PrinterPlugin.java with Wintec SDK integration
- Updated MainActivity.java to register PrinterPlugin
- Implements initPrinter(), printReceipt(), getPrinterStatus()
"

# Push to GitHub
git push origin main
```
✅ **Success criteria:** Files pushed to GitHub successfully

---

**Task 1.3:** Notify Claude when push is complete
- Reply: "Android code pushed to GitHub"

---

#### 🤖 **CLAUDE Tasks:**

**Task 1.4:** Verify Android files are in GitHub repo
```bash
# Claude will run these commands
git pull origin main
ls -la android/app/src/main/java/com/yeloeat/kiosk/
cat android/app/src/main/java/com/yeloeat/kiosk/PrinterPlugin.java
```
✅ **Success criteria:** PrinterPlugin.java visible in repo

---

### PHASE 2: Sync and Build Android App

#### 🤖 **CLAUDE Tasks:**

**Task 2.1:** Build the web app
```bash
npm run build
```

**Task 2.2:** Sync Capacitor to Android
```bash
npx cap sync android
```

**Task 2.3:** Verify plugin is registered in Capacitor
```bash
# Check capacitor.config files
# Verify android/app/build.gradle has Wintec SDK
```

---

#### 👤 **USER Tasks:**

**Task 2.4:** Build the Android APK on Windows
```powershell
cd C:\AndroidStudioProjects\YeoEat-k\android

# Clean build
.\gradlew.bat clean

# Build debug APK
.\gradlew.bat assembleDebug

# Check if APK was created
ls app\build\outputs\apk\debug\app-debug.apk
```
✅ **Success criteria:** APK file created successfully

---

**Task 2.5:** Install APK on Android tablet
```powershell
# Option 1: Connect via USB and use ADB
adb install -r app\build\outputs\apk\debug\app-debug.apk

# Option 2: Copy APK to tablet and install manually
# - Copy app\build\outputs\apk\debug\app-debug.apk to USB stick
# - Install on tablet
```
✅ **Success criteria:** App installed on tablet

---

### PHASE 3: Test Printer

#### 👤 **USER Tasks:**

**Task 3.1:** Open app on tablet and test printer
1. Open YeloEat Kiosk app
2. Click orange **🖨️ Test** button
3. Click "Test-Beleg Generieren"
4. Click "Jetzt Drucken"
5. Observe result

**Expected outcomes:**
- ✅ **SUCCESS:** Printer prints receipt or shows specific error
- ❌ **FAILURE:** Still shows "not implemented" error

---

**Task 3.2:** Run diagnostics again
1. Click blue **🔧 Debug** button
2. Run full diagnostics
3. Click **☁️ Save to Supabase**
4. Note the Log ID shown

---

**Task 3.3:** Notify Claude with results
Reply with:
- "Test result: [SUCCESS/FAILURE]"
- "Error message: [if any]"
- "Diagnostic log ID: [the ID shown]"

---

#### 🤖 **CLAUDE Tasks:**

**Task 3.4:** Retrieve and analyze new diagnostic log
```bash
node fetch-diagnostics.cjs
```

**Task 3.5:** Diagnose printer issue based on new logs

**Possible outcomes:**

**Scenario A:** Plugin now recognized, but printer connection fails
- 🔧 **Fix:** Wintec SDK initialization issue
- **Next steps:** Debug USB connection, permissions, SDK setup

**Scenario B:** Plugin recognized, printing works!
- 🎉 **Success!** Issue resolved

**Scenario C:** Still showing "not implemented"
- 🔧 **Fix:** Plugin registration issue in Capacitor
- **Next steps:** Check capacitor.config, rebuild with verbose logging

**Scenario D:** Different error (e.g., "WintecManagerService not found")
- 🔧 **Fix:** Wintec SDK not properly linked
- **Next steps:** Check build.gradle, verify WT-SDK.jar

---

### PHASE 4: Advanced Debugging (If Needed)

#### 🤖 **CLAUDE Tasks:**

**Task 4.1:** Create verbose logging version of PrinterPlugin
- Add detailed console.log statements
- Track each step of initialization
- Log SDK method calls

**Task 4.2:** Create test commands for Wintec SDK
- Test USB connection directly
- Test SDK initialization separately
- Verify printer hardware detection

---

#### 👤 **USER Tasks:**

**Task 4.3:** Enable Android debugging
```powershell
# Connect tablet via USB
adb logcat | Select-String "PrinterPlugin"
```

**Task 4.4:** Share logcat output with Claude

---

## 📊 Progress Tracking

- [ ] Phase 1: Push Android Native Code
  - [ ] 1.1: Verify files exist on Windows
  - [ ] 1.2: Commit and push to GitHub
  - [ ] 1.3: Notify Claude
  - [ ] 1.4: Claude verifies files in repo

- [ ] Phase 2: Sync and Build
  - [ ] 2.1: Claude builds web app
  - [ ] 2.2: Claude syncs Capacitor
  - [ ] 2.3: Claude verifies plugin registration
  - [ ] 2.4: User builds APK
  - [ ] 2.5: User installs APK on tablet

- [ ] Phase 3: Test Printer
  - [ ] 3.1: User tests printer
  - [ ] 3.2: User runs diagnostics
  - [ ] 3.3: User shares results
  - [ ] 3.4: Claude retrieves logs
  - [ ] 3.5: Claude diagnoses issue

- [ ] Phase 4: Advanced Debugging (if needed)

---

## 🎯 Current Status

**You are here:** → **Phase 1, Task 1.1**

**Next step:** Run the PowerShell commands on your Windows machine to verify the Android files exist.

---

## 📞 Communication Protocol

**When you complete a task, reply with:**
```
✅ Task [number] complete
Result: [what happened]
```

**If you encounter an error:**
```
❌ Task [number] failed
Error: [exact error message]
```

**When ready for next phase:**
```
✅ Phase [number] complete
Ready for Phase [number+1]
```

---

## ⏱️ Estimated Timeline

- Phase 1: ~5 minutes
- Phase 2: ~10 minutes
- Phase 3: ~5 minutes
- **Total: ~20 minutes** (excluding advanced debugging)

---

**Let's start! Please begin with Phase 1, Task 1.1** 🚀
