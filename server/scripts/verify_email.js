const path = require('path');
// Create a priority order: explicit path, then default
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config(); // Fallback to CWD
const nodemailer = require('nodemailer');

async function verifyEmail() {
    console.log("🔍 Testing Email Connection...");

    // DEBUG: Print loaded keys
    const keys = Object.keys(process.env).filter(k => k.startsWith('SMTP_'));
    console.log(`   Keys found in process.env: ${keys.join(', ')}`);

    // Check if variables are empty string or undefined
    console.log(`   Host value type: ${typeof process.env.SMTP_HOST} / Length: ${process.env.SMTP_HOST ? process.env.SMTP_HOST.length : 0}`);
    console.log(`   User value type: ${typeof process.env.SMTP_USER} / Length: ${process.env.SMTP_USER ? process.env.SMTP_USER.length : 0}`);

    const port = process.env.SMTP_PORT || 465;
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: port,
        secure: port == 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    try {
        // 1. Verify connection configuration
        await transporter.verify();
        console.log("✅ SMTP Connection Established Successfully!");

        // 2. Send Test Email
        console.log("📧 Sending test email to:", process.env.SMTP_USER);
        const info = await transporter.sendMail({
            from: `"Mystic Test" <${process.env.SMTP_USER}>`,
            to: process.env.SMTP_USER, // Send to self
            subject: "Teste de Configuração - Mystic Tarot 🔮",
            text: "Se você recebeu este email, sua configuração SMTP está perfeita! O sistema de recuperação está pronto.",
            html: "<h1>🔮 Tudo Certo!</h1><p>Se você recebeu este email, sua configuração SMTP está perfeita! O sistema de recuperação está pronto.</p>"
        });

        console.log("✅ Test Email Sent! Message ID:", info.messageId);
        console.log("🎉 SUCCESS! You are ready to go.");

    } catch (error) {
        console.error("❌ CONNECTION FAILED:");
        console.error(error);
        if (error.code === 'EAUTH') {
            console.error("\n⚠️  AUTHENTICATION ERROR: Check your email and especially the App Password.");
        }
    }
}

verifyEmail();
