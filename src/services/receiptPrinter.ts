/**
 * Receipt Printer Service
 * Handles Epson ESC/POS thermal receipt printing
 */

export interface ReceiptItem {
  name: string;
  name_de?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface ReceiptData {
  order_number: string;
  company_name: string;
  company_address: string;
  company_tax_id: string;
  items: ReceiptItem[];
  service_type: 'eat-in' | 'take-away';
  payment_method: 'card' | 'cashier';
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  language: 'en' | 'de';
  timestamp: string;
}

/**
 * ESC/POS Command Builder
 */
export class ESCPOSCommands {
  // ESC/POS Control Characters
  static readonly ESC = '\x1B';
  static readonly GS = '\x1D';
  static readonly LF = '\n';

  // Initialize printer
  static init(): string {
    return `${this.ESC}@`;
  }

  // Text alignment
  static alignLeft(): string {
    return `${this.ESC}a\x00`;
  }

  static alignCenter(): string {
    return `${this.ESC}a\x01`;
  }

  static alignRight(): string {
    return `${this.ESC}a\x02`;
  }

  // Text size and style
  static setTextNormal(): string {
    return `${this.ESC}!\x00`;
  }

  static setTextBold(): string {
    return `${this.ESC}E\x01`;
  }

  static setTextBoldOff(): string {
    return `${this.ESC}E\x00`;
  }

  static setTextDoubleHeight(): string {
    return `${this.ESC}!\x10`;
  }

  static setTextDoubleWidth(): string {
    return `${this.ESC}!\x20`;
  }

  static setTextDoubleSize(): string {
    return `${this.ESC}!\x30`;
  }

  // Line feed
  static feed(lines: number = 1): string {
    return this.LF.repeat(lines);
  }

  // Cut paper
  static cut(): string {
    return `${this.GS}V\x00`;
  }

  // Print line separator
  static separator(char: string = '-', width: number = 42): string {
    return char.repeat(width) + this.LF;
  }
}

/**
 * Format receipt for Epson thermal printer
 */
export function formatReceipt(data: ReceiptData): string {
  const ESC = ESCPOSCommands;
  let receipt = '';

  // Initialize printer
  receipt += ESC.init();

  // Header - Company Name (centered, double size)
  receipt += ESC.alignCenter();
  receipt += ESC.setTextDoubleSize();
  receipt += ESC.setTextBold();
  receipt += data.company_name + ESC.feed();
  receipt += ESC.setTextNormal();
  receipt += ESC.setTextBoldOff();

  // Company Address (centered, normal size)
  receipt += data.company_address + ESC.feed();
  receipt += `Steuernummer: ${data.company_tax_id}` + ESC.feed(2);

  // Receipt Title
  receipt += ESC.setTextBold();
  receipt += 'KASSENBON' + ESC.feed();
  receipt += ESC.setTextBoldOff();
  receipt += ESC.alignLeft();

  // Order Info
  receipt += ESC.separator();
  receipt += `Bestellnr: ${data.order_number}` + ESC.feed();
  receipt += `Datum: ${new Date(data.timestamp).toLocaleString('de-DE')}` + ESC.feed();
  receipt += `Service: ${data.service_type === 'eat-in' ? 'Vor Ort' : 'Außer Haus'}` + ESC.feed();
  receipt += `Zahlung: ${data.payment_method === 'card' ? 'Karte' : 'Bar'}` + ESC.feed();
  receipt += ESC.separator();
  receipt += ESC.feed();

  // Items Header
  receipt += ESC.setTextBold();
  receipt += padText('Artikel', 'Menge', 'Preis') + ESC.feed();
  receipt += ESC.setTextBoldOff();
  receipt += ESC.separator('-', 42);

  // Items
  data.items.forEach(item => {
    const itemName = data.language === 'de' && item.name_de ? item.name_de : item.name;
    // Item name (full width)
    receipt += itemName + ESC.feed();
    // Quantity and price
    const qtyPrice = `${item.quantity}x ${formatCurrency(item.unit_price)}`;
    const total = formatCurrency(item.total_price);
    receipt += padText('', qtyPrice, total) + ESC.feed();
  });

  receipt += ESC.feed();
  receipt += ESC.separator();

  // Calculate net amount (without tax)
  const netAmount = data.subtotal;
  const grossAmount = data.total;

  // Totals
  receipt += ESC.alignRight();
  receipt += `Zwischensumme: ${formatCurrency(data.subtotal)}` + ESC.feed();
  receipt += ESC.feed();

  // Tax breakdown
  receipt += ESC.setTextBold();
  receipt += 'Steueraufschlüsselung:' + ESC.feed();
  receipt += ESC.setTextBoldOff();
  receipt += `Netto (${data.tax_rate}%): ${formatCurrency(netAmount)}` + ESC.feed();
  receipt += `MwSt (${data.tax_rate}%): ${formatCurrency(data.tax_amount)}` + ESC.feed();
  receipt += ESC.separator();
  receipt += ESC.setTextDoubleHeight();
  receipt += ESC.setTextBold();
  receipt += `BRUTTO: ${formatCurrency(grossAmount)}` + ESC.feed();
  receipt += ESC.setTextNormal();
  receipt += ESC.setTextBoldOff();
  receipt += ESC.alignLeft();

  receipt += ESC.feed(2);

  // Fiskaly TSE Placeholder
  receipt += ESC.separator('=', 42);
  receipt += ESC.alignCenter();
  receipt += ESC.setTextBold();
  receipt += 'TSE-Signatur (Fiskaly)' + ESC.feed();
  receipt += ESC.setTextBoldOff();
  receipt += ESC.separator('-', 42);
  receipt += ESC.alignLeft();
  receipt += `TSE-ID: [WIRD SPÄTER IMPLEMENTIERT]` + ESC.feed();
  receipt += `Transaktions-Nr: [PLACEHOLDER]` + ESC.feed();
  receipt += `Signatur-Counter: [PLACEHOLDER]` + ESC.feed();
  receipt += `Start: ${new Date(data.timestamp).toISOString()}` + ESC.feed();
  receipt += `Ende: ${new Date(data.timestamp).toISOString()}` + ESC.feed();
  receipt += `Signatur: [TSE-SIGNATUR-HASH]` + ESC.feed();
  receipt += ESC.separator('=', 42);

  receipt += ESC.feed(2);

  // Footer
  receipt += ESC.alignCenter();
  receipt += 'Vielen Dank für Ihren Besuch!' + ESC.feed();
  receipt += 'Guten Appetit!' + ESC.feed(3);

  // Cut paper
  receipt += ESC.cut();

  return receipt;
}

/**
 * Helper: Format currency
 */
function formatCurrency(amount: number): string {
  return amount.toFixed(2) + ' EUR';
}

/**
 * Helper: Pad text for alignment (42 char width for thermal printer)
 */
function padText(left: string, center: string, right: string, width: number = 42): string {
  const centerStart = Math.floor((width - center.length) / 2);
  const rightStart = width - right.length;

  let line = ' '.repeat(width);
  const chars = line.split('');

  // Place left text
  for (let i = 0; i < left.length && i < width; i++) {
    chars[i] = left[i];
  }

  // Place center text
  for (let i = 0; i < center.length && (centerStart + i) < width; i++) {
    chars[centerStart + i] = center[i];
  }

  // Place right text
  for (let i = 0; i < right.length && (rightStart + i) < width; i++) {
    chars[rightStart + i] = right[i];
  }

  return chars.join('');
}

/**
 * Print receipt using Web Serial API (for testing)
 */
export async function printReceiptToSerial(receiptText: string): Promise<void> {
  try {
    // Request serial port
    const port = await (navigator as any).serial.requestPort();
    await port.open({ baudRate: 9600 });

    const writer = port.writable.getWriter();
    const encoder = new TextEncoder();

    await writer.write(encoder.encode(receiptText));

    writer.releaseLock();
    await port.close();

    console.log('✅ Receipt printed successfully');
  } catch (error) {
    console.error('❌ Print error:', error);
    throw error;
  }
}

/**
 * Generate test receipt data
 */
export function generateTestReceipt(): ReceiptData {
  return {
    order_number: '1234',
    company_name: 'YeloEat Restaurant',
    company_address: 'Musterstraße 123, 12345 Berlin',
    company_tax_id: 'DE123456789',
    items: [
      {
        name: 'Classic Burger',
        name_de: 'Klassischer Burger',
        quantity: 2,
        unit_price: 8.99,
        total_price: 17.98,
      },
      {
        name: 'French Fries',
        name_de: 'Pommes Frites',
        quantity: 1,
        unit_price: 3.99,
        total_price: 3.99,
      },
      {
        name: 'Cola',
        name_de: 'Cola',
        quantity: 2,
        unit_price: 2.99,
        total_price: 5.98,
      },
    ],
    service_type: 'eat-in',
    payment_method: 'card',
    subtotal: 27.95,
    tax_rate: 19,
    tax_amount: 5.31,
    total: 33.26,
    language: 'de',
    timestamp: new Date().toISOString(),
  };
}
