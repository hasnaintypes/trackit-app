// import { db } from "@/server/db";
// import { NextResponse } from "next/server";

// const data = `description,type,amount,date,notes,categoryId,paymentMethod
// Freelance Writing,credit,420.00,2026-01-01,Payment for article submissions,cmivftwzz00225ku2bmnv98hr,BANK_TRANSFER
// Morning Smoothie,debit,6.25,2026-01-01,Post-gym breakfast,cmivftrfm00065ku2f8hf9ou6,CARD
// Bookstore Purchase,debit,18.70,2026-01-02,New novel,cmivftsu0000n5ku2qv5q5uk2,CASH
// Yoga Class,debit,25.00,2026-01-02,Weekly yoga session,cmivftsr3000m5ku25w0h1erd,CARD
// Electric Scooter Rental,debit,12.50,2026-01-03,Commuting to office,cmivftrfm00065ku2f8hf9ou6,UPI
// Streaming Upgrade,debit,9.99,2026-01-03,Premium music plan,cmivftsu0000n5ku2qv5q5uk2,AUTO_DEBIT
// Consulting Fee,credit,600.00,2026-01-04,Advisory services,cmivftwx400215ku2fmmbb8cg,BANK_TRANSFER
// Coffee Beans,debit,15.30,2026-01-04,Stock up at local shop,cmivftrfm00065ku2f8hf9ou6,CARD
// Dinner at Bistro,debit,55.80,2026-01-05,Friend’s birthday dinner,cmivftr0e00015ku2s4jc7qkd,CASH
// Online Workshop,debit,49.00,2026-01-05,Skill development,cmivftu8400145ku2x2b9plss,CARD
// Gadget Purchase,debit,89.99,2026-01-06,Wireless headphones,cmivfts39000e5ku25k6sp4dl,CARD
// Sandwich Lunch,debit,11.50,2026-01-06,Office lunch,cmivftr0e00015ku2s4jc7qkd,CASH
// ATM Withdrawal,debit,120.00,2026-01-07,Cash for weekend,cmivftvjd001k5ku2oerqpawq,CASH
// Concert Tickets,debit,75.00,2026-01-07,Live music show,cmivftsla000k5ku21esqhzn2,CARD
// Weekly Groceries,debit,130.40,2026-01-08,Local market,cmivftr3k00025ku2q2euh0ee,CARD
// Plant Store,debit,22.50,2026-01-08,Indoor plants,cmivfts69000f5ku2dmzmtu8x,CARD
// Credit Refund,credit,45.00,2026-01-09,Returned item refund,cmivftyut002o5ku26jl6orri,OTHER
// Taxi Ride,debit,18.00,2026-01-09,Airport commute,cmivftrll00085ku23amh8gyw,UPI
// Afternoon Tea,debit,7.25,2026-01-10,Café visit,cmivftrfm00065ku2f8hf9ou6,CARD
// Emergency Savings,debit,300.00,2026-01-10,Monthly reserve deposit,cmivftvjd001k5ku2oerqpawq,BANK_TRANSFER
// Stock Dividend,credit,200.00,2026-01-11,Quarterly payout,cmivftx5s00245ku2nepqrmlm,BANK_TRANSFER
// Pet Grooming,debit,40.00,2026-01-11,Dog grooming service,cmivftvak001h5ku27wao067l,CARD
// Cloud Backup,debit,12.99,2026-01-12,Secure storage plan,cmivftu5400135ku2ozjslgby,AUTO_DEBIT
// Fuel Top-up,debit,54.60,2026-01-12,Car refuel,cmivftrll00085ku23amh8gyw,CARD
// Laundry Service,debit,30.00,2026-01-13,Weekly clothes wash,cmivftsc1000h5ku285uy9y0p,CARD
// Business Lunch,debit,23.50,2026-01-13,Meeting with client,cmivftr0e00015ku2s4jc7qkd,CARD
// Parking Permit,debit,15.00,2026-01-14,Monthly downtown permit,cmivftrok00095ku2pb96gks8,BANK_TRANSFER
// Software Subscription,debit,60.00,2026-01-14,Design tool,cmivftu8400145ku2x2b9plss,AUTO_DEBIT
// Friend Loan Repayment,credit,75.00,2026-01-15,Repaid personal loan,cmivftwu900205ku2ruptyrd4,OTHER
// Weekend Market,debit,48.20,2026-01-15,Fresh produce,cmivftr3k00025ku2q2euh0ee,CARD
// Internet Upgrade,debit,40.00,2026-01-16,Faster plan,cmivftt5k000r5ku2yfyx51mv,BANK_TRANSFER
// Gym Membership,debit,35.00,2026-01-16,Weekly fitness class,cmivftuha00175ku2rabo8m43,CARD`;

// export async function GET() {
//   try {
//     const user = await db.user.findFirst();
//     if (!user) return NextResponse.json({ error: "No user" }, { status: 404 });

//     const account = await db.bankAccount.findFirst({
//       where: { userId: user.id }
//     });
//     if (!account) return NextResponse.json({ error: "No account" }, { status: 404 });

//     const rows = data.split('\n').slice(1);
//     let count = 0;
//     for (const row of rows) {
//       const [description, type, amount, date, notes, categoryId, paymentMethod] = row.split(',');

//       await db.transaction.create({
//         data: {
//           userId: user.id,
//           accountId: account.id,
//           description,
//           type: type.toUpperCase() as any,
//           amount: amount,
//           date: new Date(date),
//           notes,
//           categoryId,
//           paymentMethod: paymentMethod as any,
//         }
//       });
//       count++;
//     }

//     return NextResponse.json({ success: true, count });
//   } catch (err: any) {
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }
