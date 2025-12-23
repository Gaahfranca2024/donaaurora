const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

let supabase = null;

if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
} else {
    console.warn("Supabase credentials missing. Lead capture will increase memory only (mock).");
}

const saveLead = async (userData) => {
    if (!supabase) return null;

    try {
        const { data, error } = await supabase
            .from('leads')
            .upsert([
                {
                    name: userData.name,
                    email: userData.email,
                    birth_date: userData.birthDate,
                    question: userData.question,
                    status: 'pending_payment', // pending_payment, paid, completed
                    created_at: new Date()
                }
            ], { onConflict: 'id' }) // Assuming we might have an ID later, or just insert
            .select();

        if (error) throw error;
        return data;
    } catch (err) {
        console.error("Supabase Save Error:", err.message);
        return null;
    }
};

module.exports = { supabase, saveLead };
