const { MercadoPagoConfig, Payment } = require('mercadopago');
require('dotenv').config();

// Initialize client with Access Token (will be set in .env)
const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN || 'TEST-00000000-0000-0000-0000-000000000000'
});

const payment = new Payment(client);

const createPixPayment = async (readingData) => {
    const { name, email, amount, description } = readingData;

    try {
        const body = {
            transaction_amount: Number(amount.toFixed(2)),
            description: description || 'Leitura de Tarot - Mystic Tarot',
            payment_method_id: 'pix',
            payer: {
                email: email || 'cliente@email.com', // MP requires an email
                first_name: name.split(' ')[0],
                last_name: name.split(' ').slice(1).join(' ') || 'Cliente'
            },
            notification_url: process.env.WEBHOOK_URL // Enables Webhook notifications
        };

        const response = await payment.create({ body });

        return {
            id: response.id,
            status: response.status,
            qr_code: response.point_of_interaction.transaction_data.qr_code,
            qr_code_base64: response.point_of_interaction.transaction_data.qr_code_base64,
            ticket_url: response.point_of_interaction.transaction_data.ticket_url
        };

    } catch (error) {
        console.error("Mercado Pago Error:", error);
        return null;
    }
};

const checkPaymentStatus = async (paymentId) => {
    try {
        const response = await payment.get({ id: paymentId });
        return response.status; // 'approved', 'pending', etc.
    } catch (error) {
        return null;
    }
};

module.exports = { createPixPayment, checkPaymentStatus };
