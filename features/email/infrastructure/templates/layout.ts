export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderEmailLayout(input: {
  storeName: string;
  preview: string;
  title: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  const preview = escapeHtml(input.preview);
  const title = escapeHtml(input.title);
  const storeName = escapeHtml(input.storeName);
  const ctaBlock =
    input.ctaLabel && input.ctaHref
      ? `<p style="margin: 32px 0 0;">
          <a href="${escapeHtml(input.ctaHref)}" style="display:inline-block;background:#111111;color:#ffffff;padding:12px 20px;text-decoration:none;font-size:14px;">
            ${escapeHtml(input.ctaLabel)}
          </a>
        </p>`
      : "";

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
  </head>
  <body style="margin:0;padding:0;background:#f5f3f0;color:#111111;font-family:Georgia, 'Times New Roman', serif;">
    <div style="display:none;max-height:0;overflow:hidden;">${preview}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f3f0;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #e7e2dc;">
            <tr>
              <td style="padding:32px 28px;">
                <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#7a746c;">${storeName}</p>
                <h1 style="margin:0 0 24px;font-size:24px;font-weight:500;line-height:1.3;">${title}</h1>
                ${input.bodyHtml}
                ${ctaBlock}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return html;
}

export function renderPlainLayout(input: { title: string; lines: string[]; ctaLabel?: string; ctaHref?: string }) {
  const lines = [input.title, "", ...input.lines];

  if (input.ctaLabel && input.ctaHref) {
    lines.push("", `${input.ctaLabel}: ${input.ctaHref}`);
  }

  return lines.join("\n");
}
