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
        if (paymentData?.id && viewState === 'payment') {
            interval = setInterval(async () => {
                try {
                    const res = await fetch(`http://localhost:3000/api/payment/${paymentData.id}`);
                    const data = await res.json();
                    if (data.status === 'approved') {
                        clearInterval(interval);
                        setViewState('success');
                        setTimeout(() => onPurchaseSuccess(), 2000); // Wait a bit then trigger success action
                    }
                } catch (e) { console.error(e); }
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [paymentData, viewState, onPurchaseSuccess]);

    const handleBuyClick = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:3000/api/payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: userData.name,
                    email: 'upsell@cliente.com',
                    amountOverride: 9.90, // Protection Ritual Price
                    description: 'Ritual de Proteção - Mystic Tarot'
                })
            });
            const data = await res.json();
            if (data.qr_code_base64) {
                setPaymentData(data);
                setViewState('payment');
            }
        } catch (e) {
            console.error(e);
            alert('Erro ao gerar oferta. Tente novamente.');
        } finally {
            setLoading(false);
        }
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
                        <div className="p-8 text-center">
                            <h3 className="text-2xl font-serif text-gold mb-4">Pagamento Seguro</h3>
                            <p className="text-sm text-mist mb-6">Escaneie para liberar o Ritual de Proteção</p>

                            <div className="bg-white p-2 rounded-lg w-48 h-48 mx-auto mb-4">
                                <img src={`data:image/png;base64,${paymentData?.qr_code_base64}`} className="w-full h-full object-contain" />
                            </div>

                            <button onClick={copyPix} className="text-gold font-bold underline mb-8">
                                {copySuccess ? 'Copiado!' : 'Copiar Código Pix'}
                            </button>

                            {/* Debug Sim */}
                            <div className="mt-2 text-center">
                                <button onClick={() => { setViewState('success'); setTimeout(onPurchaseSuccess, 1000); }} className="text-[10px] text-white/20 hover:text-white/50">
                                    (Debug: Simular Aprovação)
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
