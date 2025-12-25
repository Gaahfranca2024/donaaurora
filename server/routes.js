const express = require('express');
const router = express.Router();
const { getDraw } = require('./services/tarot');
const { generateReading } = require('./services/ai');
const { saveLead } = require('./services/supabase');
const { createPixPayment, checkPaymentStatus } = require('./services/payment');

// ... existing routes

console.log("🚀 [SERVER VERSION: 2.1.8-EXACT-PRODUCT-NAMES]");

// --- LEAD REGISTRATION ---
router.post('/leads', async (req, res) => {
    try {
        const lead = await saveLead(req.body);
        res.json({ success: true, lead });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save lead' });
    }
});

// --- PAYMENT ROUTES ---

router.post('/payment', async (req, res) => {
    // Keep this for backward compatibility or direct MP usage if needed
    // ... logic remains same as before but uses environment variables
});

router.get('/payment/status/:email', async (req, res) => {
    try {
        const { email: rawEmail } = req.params;
        const email = rawEmail.trim().toLowerCase();

        console.log(`🔍 Polling status for: ${email}`);

        // We MUST select both status and selected_bumps for the frontend to work
        const { data: lead, error: dbError } = await require('./services/supabase').supabase
            .from('leads')
            .select('status, selected_bumps')
            .eq('email', email)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (dbError || !lead) {
            console.log(`⚠️ Status check: Lead not found or error for ${email}`);
            return res.json({ status: 'pending', bumps: [] });
        }

        console.log(`✅ Status check for ${email}: ${lead.status}. Bumps: ${JSON.stringify(lead.selected_bumps || [])}`);

        res.json({
            status: lead.status,
            bumps: lead.selected_bumps || []
        });
    } catch (error) {
        console.error("Status check error:", error);
        res.status(500).json({ status: 'error' });
    }
});

// --- WEBHOOK QUEUE TO PREVENT RACE CONDITIONS ---
const webhookQueue = new Map();

router.post('/webhooks/cakto', async (req, res) => {
    // Kakto sends a POST with payment info
    const { event, data } = req.body;
    const email = data?.customer?.email || req.body.customer_email || data?.customerEmail;

    if (!email) {
        console.log("⚠️ Webhook received without email. Ignoring.");
        return res.sendStatus(200);
    }

    // Initialize or get the queue for this email
    if (!webhookQueue.has(email)) {
        webhookQueue.set(email, Promise.resolve());
    }

    // Add this webhook processing to the queue
    webhookQueue.set(email, webhookQueue.get(email).then(async () => {
        try {
            console.log(`🔔 PROCESSING WEBHOOK for ${email} (${event})`);
            console.log("FULL PAYLOAD SNAPSHOT:", JSON.stringify(req.body).substring(0, 1000));

            // Corrected events for Kakto
            const isPaid = event === 'purchase_approved' || event === 'payment.paid' || data?.status === 'paid' || req.body.status === 'paid' || data?.status === 'approved';

            if (isPaid) {
                const productName = data?.product?.name || data?.offer?.name || req.body.product_name || "";
                const offerId = data?.offer?.id || req.body.offer_id || "";
                console.log(`💰 Payment confirmed. Main Product: "${productName}" (ID: ${offerId})`);

                // --- DETECT ORDER BUMPS BY KEYWORD ---
                const selectedBumps = [];

                // Deep scan: check main product and all items (NOT the whole body to avoid false positives)
                const items = data?.items || req.body.items || [];
                const itemNames = Array.isArray(items) ? items.map(i => (i.name || i.product_name || i.title || "").toLowerCase()) : [];
                const allProductNames = [productName.toLowerCase(), ...itemNames];

                // Normalizing for keyword search
                const searchString = allProductNames.join(" ").normalize("NFD").replace(/[\u0300-\u036f]/g, "");

                // 1. Extra Cards (Search only in product names)
                if (searchString.includes('carta') || searchString.includes('extra') || searchString.includes('aprofundada')) {
                    selectedBumps.push('extra_cards');
                }

                // 2. Love (Search only in product names)
                const isLove = searchString.includes('amor') ||
                    searchString.includes('compatibilidade') ||
                    searchString.includes('sinastria') ||
                    searchString.includes('alma') ||
                    searchString.includes('gemea') ||
                    searchString.includes('analise');

                if (isLove) {
                    selectedBumps.push('love');
                }

                // 3. Protection (Specific ID OR keyword)
                if (offerId === 'w4s82ha' || searchString.includes('protecao') || searchString.includes('blindagem')) {
                    selectedBumps.push('protection');
                }

                // 4. Horoscope (Specific ID OR keyword)
                if (offerId === 'd8ci7v9' || searchString.includes('mapa') || searchString.includes('astral')) {
                    selectedBumps.push('horoscope');
                }

                console.log(`📦 Bumps detected after scan: ${selectedBumps.join(', ')}`);
                if (selectedBumps.length === 0) {
                    console.log(`🔍 NO BUMPS detected. Search string excerpt: ${searchString.substring(0, 200)}...`);
                }

                // 1. Get current lead to merge bumps
                const { data: currentLead } = await require('./services/supabase').supabase
                    .from('leads')
                    .select('selected_bumps')
                    .eq('email', email)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();

                const existingBumps = Array.isArray(currentLead?.selected_bumps) ? currentLead.selected_bumps : [];
                const finalBumps = Array.from(new Set([...existingBumps, ...selectedBumps]));

                await require('./services/supabase').supabase
                    .from('leads')
                    .update({
                        status: 'paid',
                        selected_bumps: finalBumps
                    })
                    .eq('email', email);

                console.log(`✅ Supabase updated for ${email}. Final bumps: ${finalBumps.join(', ')}`);
            }
        } catch (error) {
            console.error(`❌ Webhook individual error for ${email}:`, error);
        }
    }));

    res.sendStatus(200);
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
        const horoscopeText = await generateHoroscope(req.body.name, birthDate, req.body.birthTime, req.body.city);
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
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required to retrieve reading.' });
        }

        // 1. Fetch Lead from DB to get the LATEST status and bumps (confirmed by webhook)
        const { data: lead, error: dbError } = await require('./services/supabase').supabase
            .from('leads')
            .select('*')
            .eq('email', email)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (dbError || !lead) {
            return res.status(404).json({ error: 'Lead not found.' });
        }

        // 2. Fetch Tarot Cards
        // Source of truth for bumps is now the database
        const selectedBumps = lead.selected_bumps || [];
        const cardCount = selectedBumps.includes('extra_cards') ? 5 : 3;
        const cards = await getDraw(cardCount);

        // 3. Generate AI Reading
        const reading = await generateReading(lead, cards);

        // 4. Return Result
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
