import { Resend } from "resend";

const TO_EMAIL = "amansprivate@gmail.com";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, message } = req.body ?? {};

  if (!name || !email || !message || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "Please fill in a valid name, email, and message." });
  }

  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not set");
    return res.status(500).json({ error: "Email is not configured." });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "GurNirmal Website <onboarding@resend.dev>",
      to: TO_EMAIL,
      replyTo: email,
      subject: `New connect request from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    });

    if (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to send email." });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to send email." });
  }
}
