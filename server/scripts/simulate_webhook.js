const axios = require('axios');

/**
 * Script para simular um webhook da Kakto localmente.
 * Uso: node scripts/simulate_webhook.js [email] [produto]
 * Exemplo: node scripts/simulate_webhook.js teste@email.com "Mapa Astral"
 */

const email = process.argv[2] || 'test@example.com';
const productName = process.argv[3] || 'Leitura de Tarot';
const baseUrl = process.env.API_URL || 'http://localhost:3000';

const payload = {
    event: 'purchase_approved',
    data: {
        customer: {
            email: email
        },
        product: {
            name: productName
        },
        status: 'paid'
    }
};

console.log(`🚀 Simulando webhook para: ${email}`);
console.log(`📦 Produto: ${productName}`);
console.log(`🌐 Alvo: ${baseUrl}/api/webhooks/cakto`);

axios.post(`${baseUrl}/api/webhooks/cakto`, payload)
    .then(res => {
        console.log('✅ Webhook enviado com sucesso!');
        console.log('Status:', res.status);
    })
    .catch(err => {
        if (err.response) {
            console.log(`❌ Erro do servidor: ${err.response.status} ${err.response.statusText}`);
        } else {
            console.error('❌ Erro de conexão (o servidor está rodando?):', err.message);
        }
    });
