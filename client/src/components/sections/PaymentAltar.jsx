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

    // ... (poll effect)
    useEffect(() => {
        let interval;
        if (paymentData?.id) {
            interval = setInterval(async () => {
                try {
                    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
                    const res = await fetch(`${API_URL}/api/payment/${paymentData.id}`);
                    const data = await res.json();
                    if (data.status === 'approved') {
                        clearInterval(interval);
                        onPaymentComplete(); // Proceed to reading
                    }
                } catch (e) {
                    console.error("Polling error", e);
                }
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [paymentData, onPaymentComplete]);

    const handleCreatePayment = async () => {
        setLoadingPayment(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const res = await fetch(`${API_URL}/api/payment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: userData.name,
                    email: 'cliente@teste.com', // In a real app we would ask for this
                    selectedBumps
                })
            });
            const data = await res.json();
            if (data.qr_code_base64) {
                setPaymentData(data);
            }
        } catch (e) {
            console.error("Payment create error", e);
            alert("Erro ao gerar Pix. Tente novamente.");
        } finally {
            setLoadingPayment(false);
        }
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

                            {/* Área do QR Code ou Botão Inicial */}
                            {!paymentData ? (
                                <div className="mt-8 text-center w-full">
                                    <button
                                        onClick={handleCreatePayment}
                                        disabled={loadingPayment}
                                        className="group relative w-full py-4 text-lg font-serif rounded-xl overflow-hidden shadow-lg hover:scale-[1.02] transition-transform disabled:opacity-50"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 opacity-90 group-hover:opacity-100 transition-opacity" />
                                        <span className="relative flex items-center justify-center gap-2 text-white font-bold">
                                            {loadingPayment ? 'Gerando Oferenda...' : <span>Gerar Pix de R$ {totalPrice.toFixed(2).replace('.', ',')}</span>}
                                            {!loadingPayment && <span>⚡</span>}
                                        </span>
                                    </button>
                                    <p className="text-mist mt-3 text-xs w-full text-center">
                                        Ambiente seguro 🔒
                                    </p>
                                    <p className="text-[10px] text-mist/60 mt-4 leading-relaxed max-w-[280px] mx-auto italic">
                                        Ao clicar, você declara ser maior de 18 anos e concorda que esta leitura (processada por IA) tem caráter espiritual e de entretenimento.
                                    </p>
                                </div>
                            ) : (
                                <div className="animate-in fade-in zoom-in duration-500">
                                    {/* QR CODE REAL */}
                                    <div className="relative mx-auto w-48 h-48 bg-white p-2 rounded-lg flex items-center justify-center overflow-hidden mb-4">
                                        <img
                                            src={`data:image/png;base64,${paymentData.qr_code_base64}`}
                                            alt="Pix QR Code"
                                            className="w-full h-full object-contain"
                                        />
                                    </div>

                                    {/* Copia e Cola */}
                                    <div className="bg-black/30 p-3 rounded-lg border border-white/5 mb-4">
                                        <p className="text-xs text-mist mb-2 break-all line-clamp-2 font-mono opacity-70">
                                            {paymentData.qr_code}
                                        </p>
                                        <button
                                            onClick={copyToClipboard}
                                            className="text-gold text-sm font-bold hover:underline"
                                        >
                                            {copySuccess ? 'Copiado! ✅' : 'Copiar Código Pix 📋'}
                                        </button>
                                    </div>

                                    {/* Botão de Mock (Simulação) para testar sem pagar de vdd se quiser */}
                                    <div className="mt-2 text-centera">
                                        <button onClick={onPaymentComplete} className="text-[10px] text-white/20 hover:text-white/50">
                                            (Debug: Simular Aprovação)
                                        </button>
                                    </div>
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
