import { Resend } from "resend";

const TO_EMAIL = "amansdeeply@gmail.com";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[\d\s()-]{7,20}$/;
const MAX_FILES = 5;
const MAX_TOTAL_BYTES = 4 * 1024 * 1024; // keeps the request under Vercel's 4.5 MB body limit

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, phone, proposal, message, attachments = [] } = req.body ?? {};
  const text = proposal || message;

  if (!name?.trim() || !text?.trim()) {
    return res.status(400).json({ error: "Please add your name and proposal." });
  }
  if (!email || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "Please enter a valid email address." });
  }
  if (phone && !PHONE_RE.test(phone)) {
    return res.status(400).json({ error: "Please enter a valid contact number." });
  }
  if (!Array.isArray(attachments) || attachments.length > MAX_FILES) {
    return res.status(400).json({ error: `You can attach up to ${MAX_FILES} files.` });
  }
  const totalBytes = attachments.reduce((sum, a) => sum + Math.floor(((a?.content?.length || 0) * 3) / 4), 0);
  if (totalBytes > MAX_TOTAL_BYTES) {
    return res.status(400).json({ error: "Attachments must be 4 MB or less in total." });
  }

  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not set");
    return res.status(500).json({ error: "Email is not configured yet. Please call us instead." });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const files = attachments
    .filter((a) => a?.filename && a?.content)
    .map((a) => ({ filename: String(a.filename).slice(0, 120), content: a.content }));

  try {
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "GurNirmal Website <onboarding@resend.dev>",
      to: TO_EMAIL,
      replyTo: email,
      subject: `New proposal from ${name}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        `Contact number: ${phone || "—"}`,
        "",
        "Proposal:",
        text,
        "",
        files.length ? `Attachments: ${files.map((f) => f.filename).join(", ")}` : "No attachments",
      ].join("\n"),
      html: `
        <h2 style="font-family:sans-serif;color:#16241a">New proposal from the GurNirmal website</h2>
        <table style="font-family:sans-serif;font-size:14px;border-collapse:collapse">
          <tr><td style="padding:4px 12px 4px 0;color:#7c8c7c">Name</td><td><b>${escapeHtml(name)}</b></td></tr>
          <tr><td style="padding:4px 12px 4px 0;color:#7c8c7c">Email</td><td>${escapeHtml(email)}</td></tr>
          <tr><td style="padding:4px 12px 4px 0;color:#7c8c7c">Contact</td><td>${escapeHtml(phone || "—")}</td></tr>
        </table>
        <h3 style="font-family:sans-serif;color:#16241a;margin-top:18px">Proposal</h3>
        <p style="font-family:sans-serif;font-size:14px;white-space:pre-wrap">${escapeHtml(text)}</p>
        <p style="font-family:sans-serif;font-size:13px;color:#7c8c7c">
          ${files.length ? `Attachments: ${files.map((f) => escapeHtml(f.filename)).join(", ")}` : "No attachments"}
        </p>`,
      attachments: files,
    });

    if (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to send. Please try again or call us." });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to send. Please try again or call us." });
  }
}
