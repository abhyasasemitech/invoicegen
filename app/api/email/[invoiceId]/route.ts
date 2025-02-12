// import prisma from "@/app/utils/db";
// import { requireUser } from "@/app/utils/hook";
// import { NextResponse } from "next/server";

// export async function POST({
//   params,
// }: {
//   params: Promise<{ invoiceId: string }>;
// }) {
//   const session = await requireUser();
//   const { invoiceId } = await params;

//   const invoiceData = await prisma.invoice.findUnique({
//     where:{
//         id:invoiceId,
//         userId:session.user?.id ,

//     }
//   })

//   if(!invoiceData){
//     return NextResponse.json({error:"Invoice not found"},{status:404})
//   }
// }
