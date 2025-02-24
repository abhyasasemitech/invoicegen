import fs from "fs";
import path from "path";

import { NextResponse } from "next/server";
import prisma from "@/app/utils/db";
import jsPDF from "jspdf";

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ invoiceId: string }>;
  }
) {
  const { invoiceId } = await params;
  const data = await prisma.invoice.findUnique({
    where: {
      id: invoiceId,
    },
    select: {
      invoiceName: true,
      invoiceNumber: true,
      currency: true,
      fromName: true,
      fromEmail: true,
      formAddress: true,
      clientName: true,
      clientAddress: true,
      clientEmail: true,
      date: true,
      dueDate: true,
      invoiceItemDescription: true,
      invoiceItemQuantity: true,
      invoiceItemRate: true,
      total: true,
      note: true,
    },
  });
  if (!data) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  // Create new PDF document
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Add blue top bar
  pdf.setFillColor(28, 102, 177); // #1c66b1
  pdf.rect(0, 0, 210, 15, "F");

  // Add red shape
  pdf.setFillColor(227, 37, 37); // #e32525
  pdf.moveTo(115, 0);
  pdf.lineTo(210, 0);
  pdf.lineTo(210, 15);
  pdf.lineTo(95, 15);
  pdf.fill();
  // First, import the required modules at the top

  // Then in your GET function
  const imagePath = path.join(process.cwd(), "public", "abhlogo.png");
  const imageData = fs.readFileSync(imagePath);
  const base64Image = `data:image/png;base64,${imageData.toString("base64")}`;
  pdf.addImage(base64Image, "PNG", 20, 20, 30, 30);
  // Company Header
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(20);
  pdf.setTextColor(0, 0, 0);
  pdf.text("ABHYASA SEMICON TECHNOLOGIES", 120, 30, { align: "center" });

  // Company Address
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.text(
    [
      "D.no 48-14-31/1, 2nd Floor, Akhila Arcade, Rama Talkies Road,",
      "Visakhapatnam, Andhra Pradesh, India",
      "Email: abhyasasemitech@gmail.com | Phone: +91-9438062982",
    ],
    105,
    40,
    { align: "center" }
  );

  // Add subtle gray background to details section
  pdf.setFillColor(250, 250, 250);
  pdf.rect(15, 55, 180, 45, "F");

  // Details Box with border
  pdf.setDrawColor(221, 221, 221); // #ddd
  pdf.rect(15, 55, 180, 45);
  pdf.line(105, 55, 105, 100);
  pdf.line(15, 70, 195, 70);

  // Left side details
  pdf.setFont("helvetica", "bold");
  pdf.text("Invoice #:", 20, 65);
  pdf.setFont("helvetica", "normal");
  pdf.text(data.invoiceName, 45, 65);

  pdf.setFont("helvetica", "bold");
  pdf.text("Billed To:", 20, 80);
  pdf.setFont("helvetica", "normal");
  // pdf.text([data.clientName, data.clientAddress], 20, 87);
  const wrappedAddress = pdf.splitTextToSize(data.clientAddress, 90);
pdf.text([data.clientName, ...wrappedAddress], 20, 87);

  // Right side details
  pdf.setFont("helvetica", "bold");
  pdf.text("Date:", 110, 65);
  pdf.setFont("helvetica", "normal");
  pdf.text(` ${new Intl.DateTimeFormat("en-US", {
       dateStyle: "long",
    }).format(data.date)}`, 125, 65);

  pdf.setFont("helvetica", "bold");
  pdf.text("Payment Method:", 110, 80);
  pdf.setFont("helvetica", "normal");
  pdf.text(
    [
      "Bank Transfer",
      "Account: 50200099821683",
      "IFSC: HDFC0006274",
      "PAN: ACFFA5400P",
    ],
    110,
    85
  );

  // Items Table
  const tableTop = 110;

  // Table Header background
  pdf.setFillColor(242, 242, 242);
  pdf.rect(15, tableTop - 5, 180, 10, "F");

  // Table Headers
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  const headers = [
    "Description",
    "      Quantity",
    "  Unit Price (Rs)",
    "    Total (Rs)",
  ];
  const headerWidths = [90, 30, 30, 30];
  let currentX = 20;

  headers.forEach((header, i) => {
    pdf.text(header, currentX, tableTop);
    currentX += headerWidths[i];
  });

  // Table Content
  pdf.setFont("helvetica", "normal");
  let yPos = tableTop + 10;

  // Add table row
  pdf.text(data.invoiceItemDescription, 20, yPos);
  pdf.text(data.invoiceItemQuantity.toString(), 115, yPos);
  pdf.text("Rs ", 145, yPos);
  pdf.text(data.invoiceItemRate.toString(), 150, yPos,);
  pdf.text("Rs ", 172, yPos);
  pdf.text(data.total.toString(), 177, yPos);

  // Table grid lines
  pdf.setDrawColor(221, 221, 221);
  pdf.rect(15, tableTop - 5, 180, 25);

  // Vertical lines
  [15, 110, 140, 170, 195].forEach((x) => {
    pdf.line(x, tableTop - 5, x, tableTop + 20);
  });

  // Totals section
  yPos += 25;
  pdf.setFont("helvetica", "bold");
  pdf.text("Subtotal:", 140, yPos);
  pdf.text("Rs ", 170, yPos);
  pdf.text(data.total.toString(), 175, yPos);

  yPos += 8;
  pdf.setFont("helvetica", "bold");
  pdf.text("Total:", 140, yPos);
  pdf.text("Rs ", 170, yPos);
  pdf.text(data.total.toString(), 175, yPos);

  // Note section
  yPos += 15;
  pdf.setFont("helvetica", "bold");
  pdf.text("Note:", 20, yPos);
  pdf.setFont("helvetica", "normal");
  pdf.text(data.note || "", 35, yPos);

  // Footer
  pdf.setFontSize(9);
  pdf.setTextColor(119, 119, 119);
  pdf.text(
    "Thank you for choosing Abhyasa Semicon Technologies for your VLSI training. We wish you success in your learning journey!",
    105,
    yPos + 20,
    { align: "center" }
  );

  // Bottom blue bar
  pdf.setFillColor(28, 102, 177);
  pdf.rect(0, 297 - 8, 210, 8, "F");

  // Generate PDF buffer
  const pdfBuffer = Buffer.from(pdf.output("arraybuffer"));

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline",
    },
  });
}
