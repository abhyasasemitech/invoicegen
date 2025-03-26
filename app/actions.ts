"use server";

import { requireUser } from "./utils/hook";
import { parseWithZod } from "@conform-to/zod";
import { invoiceSchema, onboardingSchema } from "./utils/zodSchemas";
import prisma from "./utils/db";
import { redirect } from "next/navigation";
import { emailClient } from "./utils/mailtrap";
import { formatCurrency } from "./utils/formatCurrency";
import jsPDF from "jspdf";
import fs from "fs";
import path from "path";



export async function onboardUser(prevState: any, formData: FormData) {
  const session = await requireUser();

  const submission = parseWithZod(formData, {
    schema: onboardingSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const data = await prisma.user.update({
    where: {
      id: session.user?.id,
    },
    data: {
      firstName: submission.value.firstName,
      lastName: submission.value.lastName,
      address: submission.value.address,
    },
  });

  return redirect("/dashboard");
}

export async function createInvoice(prevState: any, formData: FormData) {
  const session = await requireUser();
  const submission = parseWithZod(formData, {
    schema: invoiceSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const data = await prisma.invoice.create({
    data: {
      clientAddress: submission.value.clientAddress,
      clientEmail: submission.value.clientEmail,
      clientName: submission.value.clientName,
      currency: submission.value.currency,
      date: submission.value.date,
      dueDate: submission.value.dueDate,
      formAddress: submission.value.fromAddress,
      fromEmail: submission.value.fromEmail,
      fromName: submission.value.fromName,
      invoiceItemDescription: submission.value.invoiceItemDescription,
      invoiceItemQuantity: submission.value.invoiceItemQuantity,
      invoiceItemRate: submission.value.invoiceItemRate,
      invoiceName: submission.value.invoiceName,
      invoiceNumber: submission.value.invoiceNumber,
      status: submission.value.status,
      total: submission.value.total,
      note: submission.value.note,
      userId: session.user?.id,
    },
  });

  const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
  
    // Add blue top bar
    pdf.setFillColor(28, 102, 177); // #1c66b1
    pdf.rect(0, 0, 210, 10, "F");
  
    // Add red shape
    pdf.setFillColor(227, 37, 37); // #e32525
    pdf.moveTo(115, 0);
    pdf.lineTo(210, 0);
    pdf.lineTo(210, 10);
    pdf.lineTo(95, 10);
    pdf.fill();
    // First, import the required modules at the top
  
    // Then in your GET function
    const imagePath = path.join(process.cwd(), "public", "abhlogo.png");
    const imageData = fs.readFileSync(imagePath);
    const base64Image = `data:image/png;base64,${imageData.toString("base64")}`;
    pdf.addImage(base64Image, "PNG", 15, 20, 30, 30);
    // Company Header
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(20);
    pdf.setTextColor(0, 0, 0);
    pdf.text("ABHYASA SEMICON TECHNOLOGIES", 110, 30, { align: "center" });
  
    // Company Address
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text(
      [
        "D.no 48-14-31/1, 2nd Floor, Akhila Arcade, Rama Talkies Road,",
        "Visakhapatnam, Andhra Pradesh, India",
        "Email: abhyasasemitech@gmail.com | Phone: +91-9438062982",
      ],
      95,
      37,
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
    pdf.text(data.invoiceNumber, 45, 65);
  
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
    const pdfBase64 = Buffer.from(pdfBuffer).toString("base64");
 


  

  const sender = {
    email: "invoice@abhyasa.org.in",
    name: "Abhyasa Semicon Technologies",
  };

  emailClient.send({
    from: sender,
    to: [{ email: submission.value.clientEmail }],
    template_uuid: "05893876-db30-42af-9ad1-9b6bea96f8e9",
    template_variables: {
      invoiceNum: submission.value.invoiceNumber,
      Date: new Intl.DateTimeFormat("en-US", {
        dateStyle: "long",
      }).format(new Date(submission.value.date)),
      client_name: submission.value.clientName,
      client_address: submission.value.clientAddress,
      Description: submission.value.invoiceItemDescription,
      Quantity: submission.value.invoiceItemQuantity,
      rate: submission.value.invoiceItemRate,
      total: submission.value.total,
      note: submission.value.note ?? ""
    },
    attachments:[
      {
        filename:`Invoice_${submission.value.invoiceNumber}.pdf`,
        content:pdfBase64,
        type:"application/pdf",
        disposition:"attachment"
      }
    ]

  
    
  });

  return redirect("/dashboard/invoices");
}

export async function editInvoice(prevState: any, formData: FormData) {
  const session = await requireUser();

  const submission = parseWithZod(formData, {
    schema: invoiceSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const data = await prisma.invoice.update({
    where: {
      id: formData.get("id") as string,
      userId: session.user?.id,
    },
    data: {
      clientAddress: submission.value.clientAddress,
      clientEmail: submission.value.clientEmail,
      clientName: submission.value.clientName,
      currency: submission.value.currency,
      date: submission.value.date,
      dueDate: submission.value.dueDate,
      formAddress: submission.value.fromAddress,
      fromEmail: submission.value.fromEmail,
      fromName: submission.value.fromName,
      invoiceItemDescription: submission.value.invoiceItemDescription,
      invoiceItemQuantity: submission.value.invoiceItemQuantity,
      invoiceItemRate: submission.value.invoiceItemRate,
      invoiceName: submission.value.invoiceName,
      invoiceNumber: submission.value.invoiceNumber,
      status: submission.value.status,
      total: submission.value.total,
      note: submission.value.note,
    },
  });

  const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
  
    // Add blue top bar
    pdf.setFillColor(28, 102, 177); // #1c66b1
    pdf.rect(0, 0, 210, 10, "F");
  
    // Add red shape
    pdf.setFillColor(227, 37, 37); // #e32525
    pdf.moveTo(115, 0);
    pdf.lineTo(210, 0);
    pdf.lineTo(210, 10);
    pdf.lineTo(95, 10);
    pdf.fill();
    // First, import the required modules at the top
  
    // Then in your GET function
    const imagePath = path.join(process.cwd(), "public", "abhlogo.png");
    const imageData = fs.readFileSync(imagePath);
    const base64Image = `data:image/png;base64,${imageData.toString("base64")}`;
    pdf.addImage(base64Image, "PNG", 15, 20, 30, 30);
    // Company Header
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(20);
    pdf.setTextColor(0, 0, 0);
    pdf.text("ABHYASA SEMICON TECHNOLOGIES", 110, 30, { align: "center" });
  
    // Company Address
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text(
      [
        "D.no 48-14-31/1, 2nd Floor, Akhila Arcade, Rama Talkies Road,",
        "Visakhapatnam, Andhra Pradesh, India",
        "Email: abhyasasemitech@gmail.com | Phone: +91-9438062982",
      ],
      95,
      37,
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
    pdf.text(data.invoiceNumber, 45, 65);
  
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
  const pdfBase64 = Buffer.from(pdfBuffer).toString("base64");





const sender = {
  email: "invoice@abhyasa.org.in",
  name: "Abhyasa Semicon Technologies",
};

emailClient.send({
  from: sender,
  to: [{ email: submission.value.clientEmail }],
  template_uuid: "8cbf432d-1ed5-4e18-af2b-d8b8a4916827",
  template_variables: {
    invoiceNum: submission.value.invoiceNumber,
    Date: new Intl.DateTimeFormat("en-US", {
      dateStyle: "long",
    }).format(new Date(submission.value.date)),
    client_name: submission.value.clientName,
    client_address: submission.value.clientAddress,
    Description: submission.value.invoiceItemDescription,
    Quantity: submission.value.invoiceItemQuantity,
    rate: submission.value.invoiceItemRate,
    total: submission.value.total,
    note: submission.value.note ?? ""
  },
  attachments:[
    {
      filename:`Invoice_${submission.value.invoiceNumber}.pdf`,
      content:pdfBase64,
      type:"application/pdf",
      disposition:"attachment"
    }
  ]


  
});

  return redirect("/dashboard/invoices");
}

export async function DeleteInvoice(invoiceId: string) {
  const session = await requireUser();

  const data = await prisma.invoice.delete({
    where: {
      userId: session.user?.id,
      id: invoiceId,
    },
  });

  return redirect("/dashboard/invoices");
}

export async function MarkAsPaidAction(invoiceId: string) {
  const session = await requireUser();

  const data = await prisma.invoice.update({
    where: {
      userId: session.user?.id,
      id: invoiceId,
    },
    data: {
      status: "PAID",
    },
  });

  return redirect("/dashboard/invoices");
}
