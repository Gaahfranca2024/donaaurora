import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Button from './ui/Button';
import { useReading } from '../context/ReadingContext';
import { QrCode, Copy, CheckCircle } from 'lucide-react';

const PaymentSimulation = () => {
    const { confirmPayment } = useReading();
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto bg-mystic-900/40 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-2xl text-center"
        >
            <h2 className="text-2xl font-serif mb-2 text-white">Desbloquear Sua Leitura</h2>
            <p className="text-mystic-300 mb-6">Complete a troca de energia para revelar as cartas.</p>

            <div className="bg-white p-4 rounded-xl mx-auto w-48 h-48 mb-6 flex items-center justify-center">
                <QrCode size={160} className="text-black" />
            </div>

            <div className="flex items-center justify-center gap-2 mb-8 bg-mystic-950/50 p-3 rounded-lg border border-mystic-800">
                <code className="text-mystic-300 text-sm truncate max-w-[200px]">00020126580014BR.GOV.BCB.PIX...</code>
                <button onClick={handleCopy} className="text-mystic-400 hover:text-white transition-colors">
                    {copied ? <CheckCircle size={18} className="text-green-400" /> : <Copy size={18} />}
                </button>
            </div>

            <div className="space-y-3">
                <div className="text-xs text-mystic-400 uppercase tracking-widest mb-2 font-bold">
                    Modo de Desenvolvimento
                </div>
                <Button variant="primary" onClick={confirmPayment} className="w-full">
                    Simular Pagamento Recebido
                </Button>
            </div>
        </motion.div>
    );
};

export default PaymentSimulation;
