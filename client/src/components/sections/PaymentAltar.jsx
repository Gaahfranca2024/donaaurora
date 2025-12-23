import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useReading } from '../../context/ReadingContext';

const PaymentAltar = ({ userData, onPaymentComplete }) => {
    const {
        selectedBumps = [],
        toggleBump,
        totalPrice,
        bumps
    } = useReading();

    const [paymentData, setPaymentData] = useState(null);
    const [loadingPayment, setLoadingPayment] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

    useEffect(() => {
        if (timeLeft > 0) {
            const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timerId);
        }
    }, [timeLeft]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    // POLLING PAYMENT STATUS via Supabase/API
    useEffect(() => {
        let interval;
        if (loadingPayment) { // If user clicked the button, start checking
            interval = setInterval(async () => {
                try {
                    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
                    // We poll by email to see if Kakto sent the webhook
                    const res = await fetch(`${API_URL}/api/payment/status/${userData.email || 'cliente@teste.com'}`);
                    const data = await res.json();
                    if (data.status === 'paid' || data.status === 'approved') {
                        clearInterval(interval);
                        onPaymentComplete();
                    }
                } catch (e) {
                    console.error("Polling error", e);
                }
            }, 6000); // Polling every 6s for Kakto
        }
        return () => clearInterval(interval);
    }, [loadingPayment, userData.email, onPaymentComplete]);

    const handleCreatePayment = () => {
        setLoadingPayment(true);
        // Prefill email and name for better conversion and less errors on Kakto
        const email = encodeURIComponent(userData.email || '');
        const name = encodeURIComponent(userData.name || '');
        const checkoutUrl = `https://pay.cakto.com.br/rkysko4_697498?email=${email}&name=${name}`;

        console.log("🚀 Redirecionando para check-out Kakto:", checkoutUrl);
        // Abrir link da Cakto em nova aba
        window.open(checkoutUrl, '_blank');
    };

    const copyToClipboard = () => {
        if (paymentData?.qr_code) {
            navigator.clipboard.writeText(paymentData.qr_code);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-4xl mx-auto py-10 px-4"
        >
            {/* Cabeçalho ritualístico */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border border-gold/30 mb-4 bg-gold/10">
                    <span className="text-2xl">⚡</span>
                </div>
                <h2 className="text-3xl font-serif text-moon mb-2">Altar de Energia</h2>
                <p className="text-mist">Complete a oferenda para revelar seu destino</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

                {/* Lado Esquerdo: Order Bumps - NOW ORDER 1 ON MOBILE */}
                <div className="space-y-6 order-1 lg:order-1">
                    <div className="bg-twilight/40 backdrop-blur-md rounded-2xl border border-white/10 p-6">
                        <h3 className="text-xl font-serif text-amber-200 mb-4 flex items-center gap-2">
                            <span>💎</span> Profundidade Extra
                        </h3>
                        <p className="text-sm text-mist mb-6">
                            Aproveite a conexão aberta agora para revelar detalhes que normalmente custariam o triplo.
                        </p>

                        <div className="space-y-4">
                            {bumps.map(bump => (
                                <div
                                    key={bump.id}
                                    onClick={() => !paymentData && toggleBump(bump.id)} // Disable toggle if payment created
                                    className={`relative cursor-pointer group p-4 rounded-xl border-2 transition-all duration-300 
                                        ${selectedBumps.includes(bump.id) ? 'bg-amethyst/20 border-amethyst shadow-[0_0_15px_rgba(157,78,221,0.3)]' : 'bg-black/20 border-white/5 hover:border-white/20'}
                                        ${paymentData ? 'opacity-50 cursor-not-allowed' : ''}
                                    `}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`w-6 h-6 rounded border-2 flex items-center justify-center mt-1 transition-colors ${selectedBumps.includes(bump.id) ? 'bg-amethyst border-amethyst' : 'border-mist/50'}`}>
                                            {selectedBumps.includes(bump.id) && <span className="text-white text-xs">✓</span>}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <h4 className={`font-bold ${selectedBumps.includes(bump.id) ? 'text-white' : 'text-gray-300'}`}>{bump.label}</h4>
                                                <span className="text-green-400 font-bold text-sm">+ R$ {bump.price.toFixed(2).replace('.', ',')}</span>
                                            </div>
                                            <p className="text-xs text-gray-400">
                                                {bump.id === 'love' ? 'Descubra se ele(a) é sua alma gêmea ou lição cármica.' : 'Interpretação expandida com 5 arcanos para visão total.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Lado Direito: Pagamento - NOW ORDER 2 ON MOBILE */}
                <div className="order-2 lg:order-2 bg-gradient-to-br from-twilight/50 to-nebula/50 backdrop-blur-lg rounded-3xl border border-amber-300/20 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amethyst/10 blur-[100px] pointer-events-none" />

                    {/* RED URGENCY BANNER */}
                    <div className="bg-red-600 text-white text-center py-2 font-bold animate-pulse uppercase tracking-widest text-xs md:text-sm">
                        ⚠️ Oferta expira em {formatTime(timeLeft)}
                    </div>

                    <div className="p-8 text-center relative z-10">
                        <div className="relative inline-block p-6 bg-cosmic/50 rounded-2xl border border-crystal/30 w-full">

                            <div className="mb-6">
                                <h3 className="text-xl font-serif text-moon mb-2">
                                    {paymentData ? 'Escaneie o QR Code' : 'Valor da Oferenda'}
                                </h3>
                                <div className="text-4xl font-bold text-green-400 mb-1">
                                    R$ {totalPrice.toFixed(2).replace('.', ',')}
                                </div>
                                {paymentData && <p className="text-amber-300 text-xs animate-pulse">Aguardando pagamento...</p>}
                            </div>

                            {/* Área do Botão Kakto */}
                            {!paymentData && (
                                <div className="mt-8 text-center w-full">
                                    <button
                                        onClick={handleCreatePayment}
                                        className="group relative w-full py-4 text-lg font-serif rounded-xl overflow-hidden shadow-lg hover:scale-[1.02] transition-transform"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-90 group-hover:opacity-100 transition-opacity" />
                                        <span className="relative flex items-center justify-center gap-2 text-white font-bold">
                                            {loadingPayment ? 'Aguardando Pagamento...' : 'Pagar e Ver Revelação ⚡'}
                                        </span>
                                    </button>

                                    {loadingPayment && (
                                        <div className="mt-4 p-6 bg-indigo-500/10 rounded-xl border border-indigo-500/30 text-sm text-indigo-300 animate-pulse flex flex-col items-center gap-3">
                                            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                            <p className="font-medium">O oráculo está aguardando a confirmação do seu ritual...</p>
                                            <p className="text-[10px] opacity-70">Não feche esta página. A revelação aparecerá assim que o pagamento for aprovado.</p>
                                        </div>
                                    )}

                                    <p className="text-mist mt-3 text-xs w-full text-center">
                                        Ambiente seguro 🔒 (Processado por Cakto)
                                    </p>
                                    <p className="text-[10px] text-mist/60 mt-4 leading-relaxed max-w-[280px] mx-auto italic">
                                        Ao clicar, você será levado para o checkout seguro da Cakto.
                                    </p>
                                </div>
                            )}

                        </div>
                    </div>
                </div>

            </div>

        </motion.div>
    );
};

export default PaymentAltar;
