import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import { formatCurrency, formatDate } from '@/shared/lib/format.js';

export default function generateSplitBillPDF(bill, members) {
  const doc = new jsPDF();
  doc.setTextColor('#087f73');
  doc.setFontSize(20);
  doc.text('WANDOOR', 14, 20);
  doc.setTextColor('#172d2a');
  doc.setFontSize(14);
  const title = doc.splitTextToSize(
    String(bill.split_bill_title || 'Split bill'),
    180,
  );
  doc.text(title, 14, 32);
  const tableY = 42 + title.length * 5;
  doc.setFontSize(10);
  doc.text(`Dibuat: ${formatDate(bill.created_time)}`, 14, tableY - 3);
  autoTable(doc, {
    startY: tableY,
    head: [['Peserta', 'Nominal', 'Status']],
    body: members.map((member) => [
      member.member_name,
      formatCurrency(member.amount),
      member.hasPaid ? 'Dibayar' : 'Belum dibayar',
    ]),
    foot: [['Total', formatCurrency(bill.total_bill), '']],
    headStyles: { fillColor: '#087f73' },
    footStyles: { fillColor: '#eef6f1', textColor: '#172d2a' },
    styles: { font: 'helvetica', fontSize: 10, cellPadding: 4 },
    margin: { bottom: 20 },
  });
  return doc;
}
