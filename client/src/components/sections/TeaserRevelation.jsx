import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../ui_legacy/Button'; // Using legacy button wrapper or simple html button

const TeaserRevelation = ({ userData, onUnlock }) => {
    const [step, setStep] = useState('shuffling'); // shuffling -> teaser

    useEffect(() => {
        // Simulate shuffling/analysis time
        const timer = setTimeout(() => {
            setStep('teaser');
        }, 4000);
        return () => clearTimeout(timer);
    }, []);

    if (step === 'shuffling') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <div className="relative w-32 h-48 mb-8 perspective-1000">
                    {/* Simple CSS animation for shuffling deck feel */}
                    <motion.div
                        animate={{
                            rotateY: [0, 180, 360],
                            y: [0, -20, 0],
                            scale: [1, 1.1, 1]
                        }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        className="w-full h-full bg-gradient-to-br from-purple-900 to-black rounded-xl border-2 border-gold/50 shadow-2xl flex items-center justify-center"
                    >
                        <span className="text-4xl">🃏</span>
                    </motion.div>
                </div>
                <h3 className="text-2xl font-serif text-white mb-2 animate-pulse">Consultando as Estrelas...</h3>
                <p className="text-mystic-300">Conectando sua energia às cartas...</p>
            </div>
        );
    }

    // Teaser State
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-2xl mx-auto px-4 py-12"
        >
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 text-center relative overflow-hidden">
                {/* Lock Overlay Blur effect at bottom */}

                <h2 className="text-3xl font-serif text-amber-300 mb-6">As Cartas Têm uma Mensagem</h2>

                <div className="text-left space-y-4 mb-8 relative">
                    <p className="text-gray-200 text-lg leading-relaxed">
                        "Olá, <strong>{userData.name}</strong>. Sinto uma energia de transformação rondando seu caminho.
                        As cartas mostram que a questão sobre <em>"{userData.question}"</em> tem raízes profundas..."
                    </p>
                    <p className="text-gray-200 text-lg leading-relaxed blur-sm select-none">
                        No entanto, vejo um obstáculo oculto que você precisa evitar. A carta da Lua indica que nem tudo é o que parece e que alguém próximo pode estar influenciando...
                    </p>
                    <p className="text-gray-200 text-lg leading-relaxed blur-md select-none">
                        Para superar isso, o conselho é claro: você deve agir antes da próxima lua cheia. O caminho da prosperidade está aberto, mas exige...
                    </p>

                    {/* Gradient Fade for lock */}
                    <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-cosmic via-cosmic/90 to-transparent flex items-end justify-center pb-4">
                        <span className="text-sm text-gray-400 uppercase tracking-widest">Conteúdo Bloqueado</span>
                    </div>
                </div>

                <div className="relative z-10">
                    <button
                        onClick={onUnlock}
                        className="group relative w-full md:w-auto px-12 py-4 text-xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 rounded-full text-white shadow-[0_0_20px_rgba(16,185,129,0.5)] hover:shadow-[0_0_40px_rgba(16,185,129,0.7)] transition-all transform hover:-translate-y-1 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-white/20 group-hover:bg-white/30 transition-colors" />
                        <span className="relative flex items-center justify-center gap-3">
                            <span>🔓 Destravar Leitura Completa</span>
                            {/* <span className="bg-black/20 text-sm py-1 px-3 rounded-full">R$ 5,00</span> */}
                        </span>
                    </button>
                    <p className="mt-4 text-sm text-gray-400">
                        ⚡ Oferta por tempo limitado: Apenas <span className="text-green-400 font-bold">R$ 9,90</span>
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default TeaserRevelation;
