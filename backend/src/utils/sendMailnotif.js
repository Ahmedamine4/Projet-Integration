import nodemailer from "nodemailer";

export async function envoyerNotificationEmail({ email, sujet, message ,imageUrl}) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.PLATFORM_EMAIL,
      pass: process.env.PLATFORM_EMAIL_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.PLATFORM_EMAIL,
    to: email,
    subject: sujet,
    html: `
      <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;font-family:Arial,sans-serif;">

  <!-- Header -->
  <div style="background:#1a1a2e;padding:28px 32px;display:flex;align-items:center;gap:16px;">
    <img src="${imageUrl}" style="width:56px;height:56px;border-radius:50%;border:2px solid rgba(255,255,255,0.2);object-fit:cover;" />
    <div>
      <p style="margin:0;color:#fff;font-size:18px;font-weight:500;">FolioCraft</p>
      <p style="margin:0;color:rgba(255,255,255,0.55);font-size:13px;">${process.env.PLATFORM_EMAIL}</p>
    </div>
  </div>

  <!-- Body -->
  <div style="padding:32px;">
    <p style="margin:0 0 8px;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em;font-weight:500;">Notification</p>
    <h2 style="margin:0 0 20px;font-size:20px;font-weight:500;color:#111827;">Bonjour !</h2>
    <p style="margin:0 0 24px;font-size:15px;color:#4b5563;line-height:1.7;">${message}</p>
    <a href="#" style="display:inline-block;background:#1a1a2e;color:#fff;text-decoration:none;padding:11px 24px;border-radius:8px;font-size:14px;font-weight:500;">Voir les détails →</a>
  </div>

  <!-- Footer haut -->
  <div style="border-top:1px solid #e5e7eb;padding:20px 32px;display:flex;align-items:center;justify-content:space-between;">
    <div style="display:flex;align-items:center;gap:10px;">
      <img src="${imageUrl}" style="width:28px;height:28px;border-radius:50%;object-fit:cover;" />
      <span style="font-size:12px;color:#6b7280;">FolioCraft</span>
    </div>
    <div style="text-align:right;">
      <p style="margin:0;font-size:11px;color:#9ca3af;">Ceci est un email automatique.</p>
      <p style="margin:0;font-size:11px;color:#9ca3af;">Merci de ne pas répondre.</p>
    </div>
  </div>

  <!-- Footer bas -->
  <div style="background:#f9fafb;padding:12px 32px;text-align:center;border-top:1px solid #e5e7eb;">
    <span style="font-size:11px;color:#9ca3af;"> Politique de confidentialité · © 2026 FolioCraft</span>
  </div>

</div>
    `,
  });
}
