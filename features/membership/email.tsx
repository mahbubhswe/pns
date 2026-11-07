import { renderToBuffer } from "@react-pdf/renderer";
import ApplicationPDF, { type ApplicationData } from "@/lib/pdf-generator";
import type { User } from "@/lib/generated/prisma";
import { sendMail } from "@/lib/server/mail/mailer";
import { logger } from "@/lib/server/logger";

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function toApplicationData(user: User): ApplicationData {
  return {
    sectorNumber: user.sectorNumber,
    roadNumber: user.roadNumber,
    plotNumber: user.plotNumber,
    plotSize: user.plotSize,
    ownershipProofType: user.ownershipProofType,
    ownerNameEnglish: user.ownerNameEnglish,
    ownerNameBangla: user.ownerNameBangla,
    contactNumber: user.contactNumber,
    nidNumber: user.nidNumber,
    presentAddress: user.presentAddress,
    permanentAddress: user.permanentAddress,
    email: user.email,
    paymentMethod: user.paymentMethod,
    membershipFee: user.membershipFee,
    bkashTransactionId: user.bkashTransactionId,
    bkashAccountNumber: user.bkashAccountNumber,
    bankAccountNumberFrom: user.bankAccountNumberFrom,
  };
}

/**
 * Render the application PDF and email it to the applicant.
 * Never throws: registration must succeed even when mail delivery fails.
 */
export async function sendApplicationEmail(user: User): Promise<boolean> {
  try {
    const pdfBuffer = await renderToBuffer(<ApplicationPDF data={toApplicationData(user)} />);

    const name = escapeHtml(user.ownerNameEnglish);
    const { sent } = await sendMail({
      to: user.email,
      subject: "PNS Membership Application Confirmation",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Purbachal Newtown Society - Membership Application</h2>
          <p>Dear ${name},</p>
          <p>Thank you for submitting your membership application to Purbachal Newtown Society.</p>
          <p>Your application has been received and is being processed. Please find attached a PDF copy of your application form for your records.</p>
          <p><strong>Application Details:</strong></p>
          <ul>
            <li>Name: ${name}</li>
            <li>Email: ${escapeHtml(user.email)}</li>
            <li>Plot: Sector ${escapeHtml(user.sectorNumber)}, Road ${escapeHtml(user.roadNumber)}, Plot ${escapeHtml(user.plotNumber)}</li>
            <li>Payment Method: ${escapeHtml(user.paymentMethod)}</li>
            <li>Membership Fee: BDT ${escapeHtml(user.membershipFee)}</li>
          </ul>
          <p>You will receive further updates regarding your application status.</p>
          <p>Best regards,<br>Purbachal Newtown Society Team</p>
        </div>
      `,
      attachments: [
        {
          filename: `PNS_Application_${user.sectorNumber}_${user.plotNumber}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });
    return sent;
  } catch (err) {
    logger.error("Failed to send application email", { userId: user.id, err });
    return false;
  }
}
