import { registerPlugin } from '@capacitor/core';

export interface PrinterPlugin {
  /**
   * Initialize the printer connection
   */
  initPrinter(): Promise<{ success: boolean; message: string }>;
  
  /**
   * Print receipt with order details
   */
  printReceipt(options: {
    orderNumber: string;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
    total: number;
    language: string;
  }): Promise<{ success: boolean; message: string }>;
  
  /**
   * Check printer status
   */
  getPrinterStatus(): Promise<{ 
    isConnected: boolean; 
    status: string;
  }>;
}

const Printer = registerPlugin<PrinterPlugin>('Printer', {
  web: () => import('./printer.web').then(m => new m.PrinterWeb()),
});

export default Printer;
