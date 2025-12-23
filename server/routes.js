const express = require('express');
const router = express.Router();
const { getDraw } = require('./services/tarot');
const { generateReading } = require('./services/ai');
const { saveLead } = require('./services/supabase');
const { createPixPayment, checkPaymentStatus } = require('./services/payment');

// ... existing routes

// --- PAYMENT ROUTES ---

router.post('/payment', async (req, res) => {
    // Keep this for backward compatibility or direct MP usage if needed
    // ... logic remains same as before but uses environment variables
});

router.get('/payment/status/:email', async (req, res) => {
    try {
        const { email } = req.params;

        // Actually, we should query Supabase for a lead with this email that is 'paid'
        const { data: lead, error: dbError } = await require('./services/supabase').supabase
            .from('leads')
            .select('status')
            .eq('email', email)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (dbError) {
            return res.json({ status: 'pending' });
        }

        res.json({ status: lead.status });
    } catch (error) {
        res.status(500).json({ status: 'error' });
    }
});

router.post('/webhooks/cakto', async (req, res) => {
    // Kakto sends a POST with payment info
    console.log("🔔 CAKTO WEBHOOK RECEIVED:", req.body);

    try {
        const { event, data } = req.body;

        // Corrected events for Kakto (using 'purchase_approved' as seen in logs)
        if (event === 'purchase_approved' || event === 'payment.paid' || data?.status === 'paid' || req.body.status === 'paid') {
            const email = data?.customer?.email || req.body.customer_email;

            if (email) {
                console.log(`💰 Payment confirmed for ${email}. Updating Supabase...`);
                await require('./services/supabase').supabase
                    .from('leads')
                    .update({ status: 'paid' })
                    .eq('email', email)
                    .eq('status', 'pending_payment');
            }
        }

        res.sendStatus(200);
    } catch (error) {
        console.error("Cakto Webhook Error:", error);
        res.sendStatus(500);
    }
});

router.post('/webhook', async (req, res) => {
    const { type, data } = req.body;
    console.log("🔔 WEBHOOK RECEIVED:", type, data?.id);

    try {
        if (type === 'payment') {
            const status = await checkPaymentStatus(data.id);
            console.log(`💰 Payment ${data.id} is now: ${status}`);

            // Here you would update your order in database
            // await updateOrderStatus(data.id, status);
        }
        res.sendStatus(200);
    } catch (error) {
        console.error("Webhook Error:", error);
        res.sendStatus(500);
    }
});

// --- READING ROUTES ---

const { generateHoroscope } = require('./services/horoscope');

// ... existing routes ...

// --- HOROSCOPE ROUTE (Offline Upsell) ---
router.post('/horoscope', async (req, res) => {
    console.log("HIT /api/horoscope with body:", req.body);
    try {
        const { birthDate } = req.body;
        if (!birthDate) return res.status(400).json({ error: 'Data de nascimento obrigatória' });

        console.log("Calling generateHoroscope...");
        const horoscopeText = await generateHoroscope(birthDate, req.body.birthTime, req.body.city);
        console.log("generateHoroscope RETURNED:", horoscopeText ? Object.keys(horoscopeText) : "NULL");

        // DEBUG: Log the output to a file
        try {
            require('fs').writeFileSync('debug_horoscope_output.json', JSON.stringify(horoscopeText, null, 2));
            console.log("DEBUG: Horoscope output saved to debug_horoscope_output.json");
        } catch (err) {
            console.error("DEBUG: Failed to save log file", err);
        }

        res.json(horoscopeText);

    } catch (error) {
        console.error("Horoscope error:", error);

        // DEBUG: Capture error to file
        try {
            require('fs').writeFileSync('error_log.txt', `Date: ${new Date().toISOString()}\nError: ${error.message}\nStack: ${error.stack}`);
        } catch (e) { console.error("Log failed", e); }

        res.status(500).json({ error: 'Erro interno ao gerar horóscopo' });
    }
});

// --- READING ROUTES ---

router.post('/readings', async (req, res) => {
    try {
        const { name, birthDate, question, selectedBumps } = req.body;

        if (!name || !question) {
            return res.status(400).json({ error: 'Name and Question are required.' });
        }

        // 0. Save Lead
        // Fire & Forget to not slow down response excessively, or await if safety is priority.
        // Given earlier context, awaiting is safer for now.
        try {
            await saveLead({ name, birthDate, question, selectedBumps });
        } catch (err) {
            console.error('Lead save error:', err);
        }

        // 1. Fetch Tarot Cards
        // Default 3, but if extra_cards bought, draw 5
        const cardCount = selectedBumps && selectedBumps.includes('extra_cards') ? 5 : 3;
        const cards = await getDraw(cardCount);

        // 2. Generate AI Reading
        const reading = await generateReading({ name, birthDate, question, selectedBumps }, cards);

        // 3. Return Result
        res.json({
            cards,
            reading
        });

    } catch (error) {
        console.error('Error in /readings endpoint:', error);
        res.status(500).json({ error: 'Failed to generate reading.' });
    }
});

module.exports = router;
