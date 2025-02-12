// import prisma from "@/app/utils/db";
// import { NextResponse } from "next/server";
// import jsPDF from "jspdf";
// import { formatCurrency } from "@/app/utils/formatCurrency";

// export async function GET(
//   request: Request,
//   {
//     params,
//   }: {
//     params: Promise<{ invoiceId: string }>;
//   }
// ) {
//   const { invoiceId } = await params;
//   const data = await prisma.invoice.findUnique({
//     where: {
//       id: invoiceId,
//     },
//     select: {
//       invoiceName: true,
//       invoiceNumber: true,
//       currency: true,
//       fromName: true,
//       fromEmail: true,
//       formAddress: true,
//       clientName: true,
//       clientAddress: true,
//       clientEmail: true,
//       date: true,
//       dueDate: true,
//       invoiceItemDescription: true,
//       invoiceItemQuantity: true,
//       invoiceItemRate: true,
//       total: true,
//       note: true,
//     },
//   });
//   if (!data) {
//     return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
//   }

//   const pdf = new jsPDF({
//     orientation: "portrait",
//     unit: "mm",
//     format: "a4",
//   });

//   pdf.setFont("helvetica");
//   pdf.setFontSize(24);
//   pdf.text(data.invoiceName, 20, 20);

//   pdf.setFontSize(12);
//   pdf.text("From", 20, 40);
//   pdf.setFontSize(10);
//   pdf.text([data.fromName, data.fromEmail, data.formAddress], 20, 45);

//   //client section
//   pdf.setFontSize(12), pdf.text("Bill To", 20, 70);
//   pdf.setFontSize(10);
//   pdf.text([data.clientName, data.clientEmail, data.clientAddress], 20, 75);

//   //invoice section
//   pdf.setFontSize(10);
//   pdf.text(`Invoice Number: # ${data.invoiceNumber}`, 120, 40);
//   pdf.text(
//     `Date: ${new Intl.DateTimeFormat("en-US", {
//       dateStyle: "long",
//     }).format(data.date)}`,
//     120,
//     45
//   );

//   pdf.text(`Due Date:Net ${data.dueDate}`, 120, 50);

//   //Item table header
//   pdf.setFontSize(10);
//   pdf.setFont("helvetica", "bold");
//   pdf.text("Description", 20, 100);
//   pdf.text("Quantity", 100, 100);
//   pdf.text("Rate", 130, 100);
//   pdf.text("Total", 160, 100);

//   //draw header Line
//   pdf.line(20, 102, 190, 102);
//   //item details
//   pdf.setFont("helvetica", "normal");
//   pdf.text(data.invoiceItemDescription, 20, 110);
//   pdf.text(data.invoiceItemQuantity.toString(), 100, 110);
//   pdf.text(
//     formatCurrency({
//       amount: data.invoiceItemRate,
//       currency: data.currency as any,
//     }),
//     130,
//     110
//   );

//   pdf.text(
//     formatCurrency({
//       amount: data.total,
//       currency: data.currency as any,
//     }),
//     160,
//     110
//   );
//   //total section

//   pdf.line(20, 115, 190, 115);
//   pdf.setFont("helvetica", "bold");
//   pdf.text(`Total: (${data.currency})`, 130, 130);
//   pdf.text(formatCurrency({ amount: data.total, currency: data.currency as any }), 160, 130);

//   //note section
//   if(data.note){
//     pdf.setFont("helvetica", "normal");
//     pdf.text("Note:", 20, 150);
//     pdf.text(data.note, 20, 155);
//   }

//   //generate pdf as buffer
//   const pdfbuffer = Buffer.from(pdf.output("arraybuffer"));

//   //return pdf as download
//   return new NextResponse(pdfbuffer, {
//     headers: {
//       "Content-Type": "application/pdf",
//       "Content-Disposition": "inline",
//     },
//   });
// }

import { NextResponse } from "next/server";
import jsPDF from "jspdf";
import { Roboto } from "next/font/google";

export async function GET() {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Company Header
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.text("ABHYASA SEMICON TECHNOLOGIES", 105, 20, { align: "center" });

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.text(
    "D.no 48-14-31/1, 2nd Floor, Akhila Arcade, Rama Talkies Road, Visakhapatnam, Andhra Pradesh, India",
    105,
    27,
    { align: "center" }
  );
  pdf.text(
    "Email: abhyasasemitech@gmail.com | Phone: +91-9438062982",
    105,
    34,
    { align: "center" }
  );

  // Invoice Details Box
  pdf.rect(20, 45, 170, 45); // Main rectangle
  pdf.line(105, 45, 105, 90); // Vertical divider
  pdf.line(20, 60, 190, 60); // Horizontal divider

  // Left side of box
  pdf.text("Invoice #: 000001", 25, 55);

  pdf.setFont("helvetica", "bold");
  pdf.text("Billed To:", 25, 70);
  pdf.setFont("helvetica", "normal");
  pdf.text(
    [
      "AEP CERTIFICATION",
      "Quality Business Hub LLP",
      "Plot No: 8-2-293/82/A/732, Beside Madhapur Metro Station,",
      "Road No. 36, Jubilee Hills, Hyderabad, 500033 India",
    ],
    25,
    77
  );

  // Right side of box
  pdf.text("Date: 11 February 2025", 110, 55);

  pdf.setFont("helvetica", "bold");
  pdf.text("Payment Method:", 110, 70);
  pdf.setFont("helvetica", "normal");
  pdf.text(
    [
      "Bank Transfer",
      "Account: 50200099821683",
      "IFSC: HDFC0006274",
      "PAN: ACFFA5400P",
    ],
    110,
    77
  );

  // Items Table
  const tableTop = 100;

  // Table Headers
  pdf.setFont("helvetica", "bold");
  pdf.text("#", 25, tableTop);
  pdf.text("Description", 45, tableTop);
  pdf.text("Quantity", 120, tableTop);
  pdf.text("Unit Price", 145, tableTop);
  pdf.text("Total", 175, tableTop);

  // Header underline
  pdf.line(20, tableTop + 2, 190, tableTop + 2);

  // Table Content
  pdf.setFont("helvetica", "normal");
  let yPos = tableTop + 10;

  pdf.text("1", 25, yPos);
  pdf.text("Offline VLSI Training", 45, yPos);
  pdf.text("1", 120, yPos);
  pdf.text("₹ 55,000", 145, yPos);
  pdf.text("₹ 55,000", 175, yPos);

  // Bottom line
  pdf.line(20, yPos + 5, 190, yPos + 5);

  // Totals
  yPos += 15;
  pdf.text("Subtotal:", 145, yPos);
  pdf.text("₹ 55,000", 175, yPos);

  yPos += 10;
  pdf.text("Total:", 145, yPos);
  pdf.text("₹ 55,000", 175, yPos);

  // Thank you note
  yPos += 20;
  pdf.setFont("helvetica", "normal");
  pdf.text(
    "Thank you for choosing Abhyasa Semicon Technologies for your VLSI training. We wish you success in your learning journey!",
    105,
    yPos,
    { align: "center" }
  );

  // Generate PDF buffer
  const pdfBuffer = Buffer.from(pdf.output("arraybuffer"));

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline",
    },
  });
}
