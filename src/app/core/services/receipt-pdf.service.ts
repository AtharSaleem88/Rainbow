import { Injectable } from '@angular/core';
import { UserOrder } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ReceiptPdfService {
  async download(order: UserOrder): Promise<void> {
    if (document.fonts) await document.fonts.ready;
    const logo = await this.loadLogo();
    const width = 720, height = 1000, margin = 55;
    const pages: HTMLCanvasElement[] = [];
    let canvas: HTMLCanvasElement;
    let context!: CanvasRenderingContext2D;
    let y = 0;
    const text = (value: string, x: number, size = 22, bold = false, color = '#17234a', align: CanvasTextAlign = 'left') => {
      context.fillStyle = color; context.font = `${bold ? 600 : 400} ${size}px Poppins, Arial, sans-serif`; context.textAlign = align; context.fillText(value, x, y);
    };
    const line = () => { context.strokeStyle = '#d4dce7'; context.setLineDash([4, 5]); context.beginPath(); context.moveTo(margin, y); context.lineTo(width - margin, y); context.stroke(); context.setLineDash([]); y += 30; };
    const newPage = (continued = false) => {
      canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
      context = canvas.getContext('2d')!; context.fillStyle = '#ffffff'; context.fillRect(0, 0, width, height); pages.push(canvas);
      y = 38;
      if (!continued && logo) { context.drawImage(logo, (width - 145) / 2, y, 145, 90); y += 115; }
      else y += 30;
      text(continued ? `ORDER ${order.id} (continued)` : 'ORDER PLACED SUCCESSFULLY', width / 2, 17, true, '#238348', 'center'); y += 34;
      if (!continued) { text('Thank you for shopping with us!', width / 2, 23, true, '#17234a', 'center'); y += 32; text(`ORDER ${order.id}`, width / 2, 17, false, '#69768b', 'center'); y += 32; }
      line();
    };
    const wrap = (value: string, maxWidth: number): string[] => {
      const words = value.split(/\s+/), lines: string[] = []; let current = '';
      for (const word of words) { const candidate = current ? `${current} ${word}` : word; if (current && context.measureText(candidate).width > maxWidth) { lines.push(current); current = word; } else current = candidate; }
      if (current) lines.push(current); return lines;
    };
    newPage();
    text('ORDER DATE', margin, 15, true, '#78849a'); text('PAYMENT METHOD', width / 2 + 15, 15, true, '#78849a'); y += 26;
    text(order.date, margin, 18, true); text(order.paymentMethod, width / 2 + 15, 18, true); y += 35; line();
    text('Payment Summary', margin, 23, true); y += 38;
    for (const item of order.items) {
      context.font = '400 20px Poppins, Arial, sans-serif';
      const lines = wrap(item.title, 365); const rowHeight = Math.max(42, lines.length * 26 + (item.weightOrUnit ? 24 : 0) + 12);
      if (y + rowHeight > height - 100) { newPage(true); text('Payment Summary', margin, 23, true); y += 38; }
      text(`${item.quantity}x`, margin, 19, true, '#30358d'); text(`Rs. ${(item.price * item.quantity).toLocaleString()}`, width - margin, 19, true, '#17234a', 'right');
      for (const itemLine of lines) { text(itemLine, margin + 64, 20); y += 26; }
      if (item.weightOrUnit) { text(item.weightOrUnit, margin + 64, 16, false, '#78849a'); y += 24; }
      y += 12;
    }
    if (y + 120 > height - 50) newPage(true);
    line(); text('Items total', margin, 20, false, '#53617a'); text(`Rs. ${order.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString()}`, width - margin, 20, true, '#17234a', 'right'); y += 42;
    text('Order total', margin, 22, true); text(`Rs. ${order.totalAmount.toLocaleString()}`, width - margin, 22, true, '#17234a', 'right');
    const jpegPages = pages.map(page => Uint8Array.from(atob(page.toDataURL('image/jpeg', 0.92).split(',')[1]), char => char.charCodeAt(0)));
    const blob = this.createPdf(jpegPages, width, height);
    const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `Rainbow-Receipt-${order.id}.pdf`; document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 10000);
  }

  private loadLogo(): Promise<HTMLImageElement | null> {
    return new Promise(resolve => { const image = new Image(); image.onload = () => resolve(image); image.onerror = () => resolve(null); image.src = 'assets/images/logo/rainbow-logo.svg'; });
  }

  private createPdf(images: Uint8Array[], width: number, height: number): Blob {
    const encoder = new TextEncoder(); const chunks: Uint8Array[] = []; const offsets: number[] = [0]; let length = 0;
    const push = (data: string | Uint8Array) => { const bytes = typeof data === 'string' ? encoder.encode(data) : data; chunks.push(bytes); length += bytes.length; };
    const object = (id: number, body: string) => { offsets[id] = length; push(`${id} 0 obj\n${body}\nendobj\n`); };
    push('%PDF-1.4\n'); object(1, '<< /Type /Catalog /Pages 2 0 R >>');
    object(2, `<< /Type /Pages /Count ${images.length} /Kids [${images.map((_, i) => `${3 + i * 3} 0 R`).join(' ')}] >>`);
    images.forEach((image, i) => {
      const page = 3 + i * 3, imageId = page + 1, contentId = page + 2;
      object(page, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /XObject << /Im0 ${imageId} 0 R >> >> /Contents ${contentId} 0 R >>`);
      offsets[imageId] = length; push(`${imageId} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${image.length} >>\nstream\n`); push(image); push('\nendstream\nendobj\n');
      const stream = `q\n${width} 0 0 ${height} 0 0 cm\n/Im0 Do\nQ\n`;
      object(contentId, `<< /Length ${encoder.encode(stream).length} >>\nstream\n${stream}endstream`);
    });
    const xref = length; push(`xref\n0 ${offsets.length}\n0000000000 65535 f \n`); for (let i = 1; i < offsets.length; i++) push(`${String(offsets[i]).padStart(10, '0')} 00000 n \n`);
    push(`trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);
    return new Blob(chunks as BlobPart[], { type: 'application/pdf' });
  }
}
