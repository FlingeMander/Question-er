const nodemailer = require("nodemailer");

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatValue(value) {
  if (Array.isArray(value)) return value.join(", ");
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

function json(statusCode, payload) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    },
    body: JSON.stringify(payload)
  };
}

exports.handler = async function (event) {
  if (event.httpMethod === "OPTIONS") {
    return json(200, { ok: true });
  }

  if (event.httpMethod !== "POST") {
    return json(405, { error: "Méthode non autorisée." });
  }

  let body = {};
  try {
    body = JSON.parse(event.body || "{}");
  } catch (error) {
    return json(400, { error: "Données JSON invalides." });
  }

  const answers = body.answers || body;

  if (!answers || typeof answers !== "object" || Array.isArray(answers) || Object.keys(answers).length === 0) {
    return json(400, { error: "Aucune réponse reçue." });
  }

  const gmailUser = process.env.GMAIL_USER;
  const gmailPassword = process.env.GMAIL_APP_PASSWORD;
  const receiverEmail = process.env.RECEIVER_EMAIL || gmailUser;

  if (!gmailUser || !gmailPassword || !receiverEmail) {
    return json(500, {
      error: "Configuration email manquante. Vérifiez GMAIL_USER, GMAIL_APP_PASSWORD et RECEIVER_EMAIL."
    });
  }

  const rows = Object.entries(answers)
    .map(([question, answer]) => `
      <tr>
        <td style="padding:10px;border:1px solid #dbe4ea;font-weight:700;background:#f8fafc;vertical-align:top;">
          ${escapeHtml(question)}
        </td>
        <td style="padding:10px;border:1px solid #dbe4ea;vertical-align:top;">
          ${escapeHtml(formatValue(answer))}
        </td>
      </tr>
    `)
    .join("");

  const submittedAt = body.submittedAt
    ? new Date(body.submittedAt).toLocaleString("fr-FR")
    : new Date().toLocaleString("fr-FR");

  const source = body.source || "Questionnaire Netlify";

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#12212a;line-height:1.5;">
      <h2 style="color:#115e59;margin-bottom:6px;">Nouvelle réponse - Questionnaire CEVITAL</h2>
      <p style="margin:0 0 14px;color:#64748b;">Réponse reçue le ${escapeHtml(submittedAt)}</p>

      <table style="border-collapse:collapse;width:100%;max-width:900px;font-size:14px;">
        <thead>
          <tr>
            <th style="padding:11px;border:1px solid #dbe4ea;background:#0f766e;color:#fff;text-align:left;">Question</th>
            <th style="padding:11px;border:1px solid #dbe4ea;background:#0f766e;color:#fff;text-align:left;">Réponse</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>

      <p style="margin-top:16px;color:#64748b;font-size:13px;">Source : ${escapeHtml(source)}</p>
    </div>
  `;

  const text = [
    "Nouvelle réponse - Questionnaire CEVITAL",
    `Réponse reçue le ${submittedAt}`,
    "",
    ...Object.entries(answers).map(([question, answer]) => `${question}: ${formatValue(answer)}`),
    "",
    `Source: ${source}`
  ].join("\n");

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailPassword
      }
    });

    await transporter.sendMail({
      from: `"Questionnaire CEVITAL" <${gmailUser}>`,
      to: receiverEmail,
      subject: "Nouvelle réponse - Questionnaire CEVITAL",
      html,
      text
    });

    return json(200, { ok: true });
  } catch (error) {
    console.error("Email sending failed:", error);
    return json(500, {
      error: "Impossible d’envoyer l’email. Vérifiez le Gmail App Password et les variables d’environnement."
    });
  }
};
