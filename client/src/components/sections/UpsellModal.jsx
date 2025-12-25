import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const UpsellModal = ({ isOpen, onClose, onPurchaseSuccess, userData }) => {
    const [viewState, setViewState] = useState('offer'); // offer, payment, success
    const [paymentData, setPaymentData] = useState(null);
    const [copySuccess, setCopySuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    // Poll for payment status
    useEffect(() => {
        let interval;
        if (userData.email && viewState === 'payment') {
            interval = setInterval(async () => {
                try {
                    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
                    const email = userData.email.trim().toLowerCase();
                    // We poll the status by email to see if 'protection' appears in selected_bumps
                    const res = await fetch(`${API_URL}/api/payment/status/${encodeURIComponent(email)}`);
                    const data = await res.json();

                    // The backend should return the full lead or at least the status/bumps
                    // Let's assume the status endpoint could be improved or we use a more direct one
                    // Actually, let's check if we can get the bumps from the status

                    if (data.status === 'paid' && data.bumps?.includes('protection')) {
                        clearInterval(interval);
                        setViewState('success');
                        setTimeout(() => onPurchaseSuccess(), 2000);
                    }
                } catch (e) { console.error("Upsell polling error", e); }
            }, 5000);
        }
        return () => clearInterval(interval);
    }, [userData.email, viewState, onPurchaseSuccess, paymentData]);

    const handleBuyClick = () => {
        setLoading(true);
        // Link para o checkout de Proteção da Kakto (R$ 9,90)
        // O usuário deve trocar 'LINK_AQUI' pelo link real no painel da Kakto
        const email = encodeURIComponent(userData.email || '');
        const name = encodeURIComponent(userData.name || '');
        const checkoutUrl = `https://pay.cakto.com.br/w4s82ha_697659?email=${email}&name=${name}`;

        console.log("🚀 Abrindo checkout de UPSSELL (Proteção):", checkoutUrl);
        window.open(checkoutUrl, '_blank');

        // Move to payment view to show polling
        setViewState('payment');
        setLoading(false);
    };

    const copyPix = () => {
        if (paymentData?.qr_code) {
            navigator.clipboard.writeText(paymentData.qr_code);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    onClick={onClose}
                />

                {/* Modal Content */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-lg bg-gradient-to-br from-twilight to-nebula border border-gold/30 rounded-2xl shadow-2xl overflow-hidden"
                >
                    {/* --- OFFER SATE --- */}
                    {viewState === 'offer' && (
                        <>
                            {/* Header Image/Effect */}
                            <div className="h-32 bg-rose-950/40 relative overflow-hidden flex items-center justify-center">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-rose-500/10 to-transparent animate-pulse" />
                                <span className="text-6xl filter drop-shadow-[0_0_15px_rgba(255,50,50,0.5)]">🧿</span>
                            </div>

                            <div className="p-6 md:p-8 text-center">
                                <h2 className="text-2xl md:text-3xl font-serif text-amber-100 mb-2">
                                    ⚠️ Alerta de Energia
                                </h2>
                                <p className="text-mist text-sm mb-6 leading-relaxed">
                                    A leitura revelou seus caminhos, mas também captou uma **vibração de inveja** próxima que pode bloquear sua vitória.
                                </p>

                                {/* Benefits List */}
                                <div className="text-left bg-black/40 p-4 rounded-xl mb-6 space-y-3 border border-rose-500/20">
                                    <div className="flex items-center gap-3">
                                        <span className="text-rose-400">🔥</span>
                                        <span className="text-gray-300 text-sm">Limpeza de Energias Negativas</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-rose-400">⚔️</span>
                                        <span className="text-gray-300 text-sm">Ritual de Quebra de Demandas</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-rose-400">🛡️</span>
                                        <span className="text-gray-300 text-sm">Blindagem Espiritual Completa</span>
                                    </div>
                                </div>

                                {/* Price Action */}
                                <div className="mb-6">
                                    <div className="flex items-end justify-center gap-2 mb-2">
                                        <span className="text-mist text-lg line-through">R$ 49,90</span>
                                        <span className="text-green-400 text-3xl font-bold">R$ 9,90</span>
                                    </div>
                                    <p className="text-xs text-rose-300 animate-pulse">Oferta de Proteção Imediata.</p>
                                </div>

                                <button
                                    onClick={handleBuyClick}
                                    disabled={loading}
                                    className="w-full py-4 bg-gradient-to-r from-red-900 to-rose-900 rounded-xl text-white font-bold text-lg shadow-lg hover:scale-[1.02] transition-transform mb-4 border border-rose-500/30"
                                >
                                    {loading ? 'Preparando...' : '🛡️ Quero Me Proteger Agora'}
                                </button>

                                <button
                                    onClick={onClose}
                                    className="text-mist text-xs hover:text-white underline"
                                >
                                    Não, obrigado. Aceito o risco.
                                </button>
                            </div>
                        </>
                    )}

                    {/* --- PAYMENT STATE --- */}
                    {viewState === 'payment' && (
                        <div className="p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
                            <div className="mb-8">
                                <div className="w-20 h-20 border-4 border-gold/20 border-t-gold rounded-full animate-spin mx-auto"></div>
                            </div>

                            <h3 className="text-2xl font-serif text-gold mb-4">Aguardando Pagamento...</h3>
                            <p className="text-sm text-mist mb-8 max-w-xs mx-auto">
                                Detectamos que você abriu a página de checkout. Assim que o pagamento for confirmado, esta tela será liberada automaticamente.
                            </p>

                            <div className="space-y-4 w-full">
                                <button
                                    onClick={() => window.open(`https://pay.cakto.com.br/w4s82ha_697659?email=${encodeURIComponent(userData.email)}&name=${encodeURIComponent(userData.name)}`, '_blank')}
                                    className="text-gold/60 text-xs hover:text-gold transition-colors underline"
                                >
                                    Não abriu? Clique aqui para tentar novamente
                                </button>
                            </div>

                            {/* Debug Sim */}
                            <div className="mt-8 text-center opacity-20 hover:opacity-100 transition-opacity">
                                <button onClick={() => { setViewState('success'); setTimeout(() => onPurchaseSuccess(), 1000); }} className="text-[10px] text-white/50">
                                    (Confirmar Manualmente)
                                </button>
                            </div>
                        </div>
                    )}

                    {/* --- SUCCESS STATE --- */}
                    {viewState === 'success' && (
                        <div className="p-12 text-center h-96 flex flex-col items-center justify-center">
                            <motion.div
                                initial={{ scale: 0 }} animate={{ scale: 1 }}
                                className="text-6xl mb-4"
                            >
                                🛡️
                            </motion.div>
                            <h2 className="text-3xl font-bold text-gold mb-2">Blindagem Ativada!</h2>
                            <p className="text-mist">Revelando o ritual...</p>
                        </div>
                    )}

                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default UpsellModal;
