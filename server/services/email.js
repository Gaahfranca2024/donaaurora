const nodemailer = require('nodemailer');

const port = process.env.SMTP_PORT || 465;

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: port,
    secure: port == 465, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS, // APP PASSWORD if using Gmail
    },
});

/**
 * Sends an email with the reading access link.
 * @param {string} toEmail - Recipient email
 * @param {string} customerName - Customer's name
 * @param {string} accessLink - Link to the reading/recovery
 */
async function sendReadingEmail(toEmail, customerName, accessLink) {
    try {
        console.log(`📧 Attempting to send email to ${toEmail}...`);

        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.warn("⚠️ SMTP credentials not found. Skipping email sending.");
            return false;
        }

        const info = await transporter.sendMail({
            from: `"Mystic Tarot" <${process.env.SMTP_USER}>`, // sender address
            to: toEmail, // list of receivers
            subject: "🔮 Sua Leitura de Tarot está pronta! (Acesso Vitalício)", // Subject line
            html: `
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0f0518; color: #e9d5ff; border: 1px solid #4ade80; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #1a0b2e; padding: 20px; text-align: center; border-bottom: 1px solid #4ade80;">
                    <h1 style="color: #4ade80; margin: 0; font-size: 24px; letter-spacing: 1px;">Mystic Tarot</h1>
                </div>
                
                <div style="padding: 30px 20px;">
                    <h2 style="color: #ffffff; margin-top: 0;">Olá, ${customerName || 'Viajante'}! ✨</h2>
                    <p style="font-size: 16px; line-height: 1.6; color: #d1d5db;">
                        O universo confirmou o seu chamado. As cartas foram tiradas e sua leitura completa está disponível.
                    </p>
                    <p style="font-size: 16px; line-height: 1.6; color: #d1d5db;">
                        Você garantiu acesso vitalício a esta leitura. Sempre que quiser consultar os conselhos dos arcanos para este momento da sua vida, basta clicar no botão abaixo.
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${accessLink}" style="background-color: #4ade80; color: #0f0518; padding: 15px 30px; text-decoration: none; font-weight: bold; border-radius: 30px; font-size: 18px; box-shadow: 0 0 15px rgba(74, 222, 128, 0.4); display: inline-block;">
                            VER MINHA LEITURA AGORA
                        </a>
                    </div>

                    <p style="font-size: 14px; color: #9ca3af; text-align: center;">
                        Ou acesse pelo link direto: <br>
                        <a href="${accessLink}" style="color: #4ade80; text-decoration: underline;">${accessLink}</a>
                    </p>
                </div>

                <div style="background-color: #050208; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #333;">
                    <p>Feito com magia e tecnologia. 🔮</p>
                    <p>Se você não fez este pedido, por favor desconsidere este e-mail.</p>
                </div>
            </div>
            `,
        });

        console.log("✅ Email sent: %s", info.messageId);
        return true;

    } catch (error) {
        console.error("❌ Error sending email:", error);
        return false;
    }
}

module.exports = { sendReadingEmail };
