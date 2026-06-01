"use server";

import { redirect } from "next/navigation";
import { Resend } from "resend";
import { recordAudit } from "@/lib/audit";

export async function submitDemoRequest(formData: FormData) {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const agency = String(formData.get("agency") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const clients = String(formData.get("clients") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  // Audit the inbound (no PHI here, just contact info — still log it).
  await recordAudit({
    action: "demo_request.submitted",
    entityType: "DemoRequest",
    payload: { fullName, agency, email, phone, clients, notes },
  });

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL ?? "KairosCare <demo@kairoscare.com>";
  if (apiKey) {
    try {
      const resend = new Resend(apiKey);
      await resend.emails.send({
        from,
        to: ["hello@kairoscare.com"],
        replyTo: email,
        subject: `KairosCare pilot request: ${agency}`,
        text: [
          `Name:    ${fullName}`,
          `Agency:  ${agency}`,
          `Email:   ${email}`,
          `Phone:   ${phone || "(not provided)"}`,
          `Clients: ${clients || "(not provided)"}`,
          ``,
          `Notes:`,
          notes || "(none)",
        ].join("\n"),
      });
    } catch (err) {
      // Never block the user on email — the audit row is the source of truth.
      console.error("[demo-request] resend failed", err);
    }
  }

  redirect("/request-demo?success=1");
}
