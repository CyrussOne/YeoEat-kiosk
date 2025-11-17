import { WebPlugin } from '@capacitor/core';
import type { PrinterPlugin } from './printer';

export class PrinterWeb extends WebPlugin implements PrinterPlugin {
  async initPrinter(): Promise<{ success: boolean; message: string }> {
    console.log('Printer plugin not available on web');
    return { 
      success: false, 
      message: 'Printer is only available on Android devices' 
    };
  }

  async printReceipt(): Promise<{ success: boolean; message: string }> {
    console.log('Print receipt called on web - using window.print() instead');
    window.print();
    return { 
      success: true, 
      message: 'Browser print dialog opened' 
    };
  }

  async getPrinterStatus(): Promise<{ isConnected: boolean; status: string }> {
    return { 
      isConnected: false, 
      status: 'Web environment - no hardware printer' 
    };
  }
}
