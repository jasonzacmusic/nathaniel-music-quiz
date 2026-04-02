export function buildInternalNotificationEmail(data: {
  name: string;
  email: string;
  phone?: string;
  instrument?: string;
  message?: string;
}) {
  const row = (label: string, value?: string) =>
    value
      ? `<tr>
          <td style="padding:10px 16px;font-size:14px;font-weight:600;color:#64748B;width:160px;vertical-align:top;">${label}</td>
          <td style="padding:10px 16px;font-size:14px;color:#1E293B;vertical-align:top;">${value}</td>
        </tr>`
      : '';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:32px 16px;background-color:#F1F5F9;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #E2E8F0;">

          <!-- Header -->
          <tr>
            <td style="background-color:#7C3AED;padding:20px 24px;">
              <p style="margin:0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.7);">Nathaniel School of Music</p>
              <h1 style="margin:6px 0 0;font-size:20px;font-weight:700;color:#ffffff;">New Contact Form Submission</h1>
            </td>
          </tr>

          <!-- Fields -->
          <tr>
            <td style="padding:8px 0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                ${row('Name', data.name)}
                ${row('Email', data.email)}
                ${row('Phone', data.phone)}
                ${row('Instrument', data.instrument)}
                ${row('Message', data.message)}
              </table>
            </td>
          </tr>

          <!-- Sheet link -->
          <tr>
            <td style="padding:16px 24px 24px;border-top:1px solid #F1F5F9;">
              <p style="margin:0;font-size:13px;color:#64748B;">
                Full response in Google Sheet: <strong>NSM Website - Form Responses &gt; Main</strong>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `New Contact Form Submission

Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone || '—'}
Instrument: ${data.instrument || '—'}
Message: ${data.message || '—'}

Full response in Google Sheet: NSM Website - Form Responses > Main`;

  return { html, text };
}
