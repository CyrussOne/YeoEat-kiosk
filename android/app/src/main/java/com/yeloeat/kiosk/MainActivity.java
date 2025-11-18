package com.yeloeat.kiosk;

  import android.os.Bundle;
  import com.getcapacitor.BridgeActivity;
  import com.yeloeat.kiosk.PrinterPlugin;  // ← ADD THIS LINE!

  public class MainActivity extends BridgeActivity {
      @Override
      public void onCreate(Bundle savedInstanceState) {
          super.onCreate(savedInstanceState);

          // Register custom printer plugin
          registerPlugin(PrinterPlugin.class);
      }
  }