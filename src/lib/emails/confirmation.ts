export function buildConfirmationEmail(name: string, phone?: string) {
  const phoneText = phone
    ? `our team will reach out to you shortly via phone at ${phone}.`
    : `our team will reach out to you shortly.`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:32px 16px;background-color:#f4f4f5;font-family:Arial,sans-serif;color:#1a1a1a;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:8px;overflow:hidden;">

          <tr>
            <td style="padding:32px 40px 24px;">
              <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">Hi ${name} ,</p>
              <p style="margin:0 0 24px;font-size:16px;line-height:1.6;">
                Thank you for filling out the form! We've received your details and ${phoneText}
              </p>

              <p style="margin:0 0 12px;font-size:16px;font-weight:700;"><strong>What's Next?</strong></p>
              <ul style="margin:0 0 24px;padding-left:24px;font-size:16px;line-height:2;">
                <li>Our team will contact you within 24 hours</li>
                <li>We'll discuss the course structure and answer any questions</li>
                <li>You can choose between Online, Offline (Bangalore), or Hybrid modes</li>
              </ul>

              <p style="margin:0 0 4px;font-size:16px;">Email: <a href="mailto:music@nathanielschool.com" style="color:#1a1a1a;text-decoration:none;">music@nathanielschool.com</a></p>
              <p style="margin:0 0 24px;font-size:16px;">WhatsApp: <a href="https://wa.me/917760456847" style="color:#1a1a1a;text-decoration:none;">+91 77604 56847</a></p>

              <p style="margin:0 0 24px;font-size:16px;color:#7C3AED;font-weight:500;">Looking forward to helping you begin your musical journey!</p>

              <p style="margin:0;font-size:16px;">— Nathaniel School of Music</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `Hi ${name} ,

Thank you for filling out the form! We've received your details and ${phoneText}

What's Next?
- Our team will contact you within 24 hours
- We'll discuss the course structure and answer any questions
- You can choose between Online, Offline (Bangalore), or Hybrid modes

Email: music@nathanielschool.com
WhatsApp: +91 77604 56847

Looking forward to helping you begin your musical journey!

— Nathaniel School of Music`;

  return { html, text };
}
