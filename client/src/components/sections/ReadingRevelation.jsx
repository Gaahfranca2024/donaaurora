import React, { useState } from 'react';
import { motion } from 'framer-motion';
import TarotCard from '../cards/TarotCard';
import html2pdf from 'html2pdf.js';

import UpsellModal from './UpsellModal';
import HoroscopePortal from './HoroscopePortal';

const ReadingRevelation = ({ readingData = {}, deck = [], userData = {} }) => {
    // readingData should contain: { reading: "string", cards: [] }
    const cards = deck.length > 0 ? deck : [{}, {}, {}]; // Fallback
    const [revealedIndices, setRevealedIndices] = useState(new Set());
    const [isUpsellOpen, setIsUpsellOpen] = useState(false);
    const [isHoroscopeOpen, setIsHoroscopeOpen] = useState(false);
    const [extraReading, setExtraReading] = useState(null);
    const [horoscopeReading, setHoroscopeReading] = useState(null);

    const handleReveal = (index) => {
        setRevealedIndices(prev => {
            const newSet = new Set(prev);
            newSet.add(index);
            return newSet;
        });
    };

    const handlePurchaseSuccess = async () => {
        // Handle success
        setIsUpsellOpen(false);
        setExtraReading(`
## 🛡️ RITUAL DE PROTEÇÃO & BLINDAGEM

**A Fonte do Bloqueio:**
As cartas indicam uma inveja velada vinda de alguém próximo ao seu círculo de convivência. Essa energia densa tenta minar sua autoconfiança e bloquear sua prosperidade.

**Oração de Quebra (Faça hoje à noite):**
*"Eu sou luz, eu sou força. Nenhuma sombra penetra meu campo. O que não é meu, retorna à origem. Estou blindado(a) pelo manto estelar."*

**O Ritual Prático:**
1. Escreva o que você deseja proteger em um papel branco.
2. Coloque um copo com água e sal grosso ao lado do papel.
3. Reze a oração acima em voz alta 3 vezes.
4. Queime o papel com cuidado e jogue as cinzas na terra (ou vaso), devolvendo a energia para transmutação.
`);
    };

    const handleDownloadPDF = () => {
        const element = document.createElement('div');
        element.style.padding = '40px';
        element.style.fontFamily = 'serif';
        element.style.color = '#000';
        element.style.background = '#fff';

        let htmlContent = `
            <div style="text-align: center; margin-bottom: 40px;">
                <h1 style="font-size: 32px; color: #333;">Mystic Tarot</h1>
                <p style="color: #666;">Seu Grimório Pessoal</p>
                <hr style="border: 1px solid #eee; margin: 20px 0;" />
            </div>
            
            <div style="margin-bottom: 30px;">
                <h2 style="color: #4a1d96;">🔮 Revelação das Cartas</h2>
                <div style="white-space: pre-wrap; line-height: 1.6; color: #333;">
                    ${readingData.reading?.replace(/\*\*/g, '') || "Leitura não disponível."}
                </div>
            </div>
        `;

        if (extraReading) {
            htmlContent += `
                <div style="margin-bottom: 30px; page-break-before: always;">
                    <h2 style="color: #ca8a04;">🛡️ Ritual de Blindagem</h2>
                    <div style="white-space: pre-wrap; line-height: 1.6; color: #333;">
                        ${extraReading.replace(/\*\*/g, '')}
                    </div>
                </div>
            `;
        }

        if (horoscopeReading) {
            htmlContent += `
                <div style="margin-bottom: 30px; page-break-before: always;">
                    <h2 style="color: #1e3a8a;">🌌 Horóscopo Semanal</h2>
                    <div style="white-space: pre-wrap; line-height: 1.6; color: #333;">
                        ${horoscopeReading.replace(/\*\*/g, '')}
                    </div>
                </div>
            `;
        }

        element.innerHTML = htmlContent;

        const opt = {
            margin: 10,
            filename: `Grimorio-MysticTarot-${userData.name || 'Destino'}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(element).save();
    };

    return (
        <div className="max-w-6xl mx-auto py-10 px-4 min-h-screen">
            <UpsellModal
                isOpen={isUpsellOpen}
                onClose={() => setIsUpsellOpen(false)}
                userData={userData}
                onPurchaseSuccess={handlePurchaseSuccess}
            />

            <HoroscopePortal
                isOpen={isHoroscopeOpen}
                onClose={() => setIsHoroscopeOpen(false)}
                userData={userData}
                onPaymentSuccess={(text) => setHoroscopeReading(text)}
            />

            {/* Float Button for PDF */}
            {(revealedIndices.size >= cards.length) && (
                <motion.button
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={handleDownloadPDF}
                    className="fixed bottom-6 right-6 z-40 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-full shadow-2xl hover:bg-white/20 transition-all group"
                    title="Baixar Grimório (PDF)"
                >
                    <span className="text-2xl group-hover:scale-110 block transition-transform">📜</span>
                </motion.button>
            )}

            <h2 className="text-4xl font-serif text-center mb-2 bg-gradient-to-r from-rose to-gold bg-clip-text text-transparent">
                Revelação Cósmica
            </h2>
            <p className="text-center text-mist mb-12">Toque nas cartas para revelar seu destino</p>

            {/* Spread Area */}
            {cards.length <= 3 ? (
                // Layout Padrão (3 Cartas)
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 px-4 md:px-20 items-center justify-center max-w-5xl mx-auto">
                    {cards.map((card, i) => (
                        <div key={i} className="flex justify-center w-full">
                            <TarotCard
                                card={card}
                                position={i}
                                isRevealed={revealedIndices.has(i)}
                                onReveal={() => handleReveal(i)}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                // Layout 5 Cartas (3 em cima, 2 em baixo)
                <div className="flex flex-col gap-8 mb-16 items-center max-w-6xl mx-auto">
                    {/* Linha 1: 3 Cartas */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full px-4">
                        {cards.slice(0, 3).map((card, i) => (
                            <div key={i} className="flex justify-center w-full">
                                <TarotCard
                                    card={card}
                                    position={i}
                                    isRevealed={revealedIndices.has(i)}
                                    onReveal={() => handleReveal(i)}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Linha 2: 2 Cartas (Centralizadas) */}
                    <div className="flex flex-col md:flex-row gap-8 justify-center w-full px-4 md:w-2/3">
                        {cards.slice(3, 5).map((card, index) => {
                            const actualIndex = index + 3; // Corrigir índice para 3 e 4
                            return (
                                <div key={actualIndex} className="flex justify-center w-full md:w-1/2">
                                    <TarotCard
                                        card={card}
                                        position={actualIndex}
                                        isRevealed={revealedIndices.has(actualIndex)}
                                        onReveal={() => handleReveal(actualIndex)}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Reading Text Area */}
            {revealedIndices.size >= cards.length && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="space-y-8 mt-12"
                >
                    <div className="max-w-4xl mx-auto space-y-12">
                        {(() => {
                            const fullText = readingData.reading || "";
                            const normalizedText = fullText.replace(/\r\n/g, '\n');

                            // --- ROBUST PARSING: Group headers with chunks of text ---
                            const finalSections = [];
                            let currentSection = null;
                            const lines = normalizedText.split('\n').filter(l => l.trim().length > 0);

                            lines.forEach(line => {
                                const trimmed = line.trim();
                                // Detect if line is a header (starts with # or bounded by **)
                                const isHeader = trimmed.startsWith('#') || (trimmed.startsWith('**') && (trimmed.endsWith('**') || trimmed.length < 50));

                                if (isHeader) {
                                    if (currentSection) finalSections.push(currentSection);
                                    currentSection = { title: trimmed.replace(/[#*:]/g, '').trim(), content: [] };
                                } else {
                                    if (currentSection) {
                                        currentSection.content.push(trimmed);
                                    } else {
                                        currentSection = { title: "Introdução", content: [trimmed] };
                                    }
                                }
                            });
                            if (currentSection) finalSections.push(currentSection);

                            if (finalSections.length === 0) return (
                                <div className="text-center p-20 bg-white/5 rounded-3xl border border-white/10">
                                    <p className="text-mist animate-pulse">Sintonizando as frequências cósmicas...</p>
                                </div>
                            );

                            return finalSections.map((section, idx) => {
                                const { title: titleLine, content: contentLines } = section;
                                const lowerTitle = titleLine.toLowerCase();

                                // Filter out internal AI instructions
                                if (lowerTitle.includes("upsell") || lowerTitle.includes("instrução") || lowerTitle.includes("bloqueio")) return null;

                                // Icon logic
                                let icon = "🔮";
                                if (lowerTitle.includes("sinfonia") || lowerTitle.includes("introdução")) icon = "✨";
                                else if (lowerTitle.includes("raiz") || lowerTitle.includes("passado")) icon = "🌱";
                                else if (lowerTitle.includes("véu") || lowerTitle.includes("presente")) icon = "🌫️";
                                else if (lowerTitle.includes("horizonte") || lowerTitle.includes("futuro")) icon = "🌅";
                                else if (lowerTitle.includes("inconsciente")) icon = "🌑";
                                else if (lowerTitle.includes("alma") || lowerTitle.includes("amor") || lowerTitle.includes("sinastria") || lowerTitle.includes("love")) icon = "❤️";
                                else if (lowerTitle.includes("ritual")) icon = "🕯️";
                                else if (lowerTitle.includes("benção")) icon = "🕊️";

                                const isHook = lowerTitle.includes("gancho") || lowerTitle.includes("aviso") || lowerTitle.includes("alerta") || lowerTitle.includes("⚠️");

                                if (isHook) {
                                    return (
                                        <motion.div
                                            key={idx}
                                            initial={{ x: -20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            className="bg-gradient-to-r from-red-500/10 to-transparent p-8 rounded-3xl border-l-4 border-red-500/50"
                                        >
                                            <p className="text-red-300 font-serif italic text-lg line-clamp-none">
                                                {contentLines.join(' ')}
                                            </p>
                                        </motion.div>
                                    );
                                }

                                return (
                                    <motion.div
                                        key={idx}
                                        initial={{ y: 20, opacity: 0 }}
                                        whileInView={{ y: 0, opacity: 1 }}
                                        viewport={{ once: true }}
                                        className="relative bg-cosmic/40 backdrop-blur-xl p-10 rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden group hover:border-amethyst/30 transition-colors"
                                    >
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-amethyst/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-amethyst/10 transition-colors" />

                                        <div className="flex items-center gap-6 mb-8 border-b border-white/5 pb-6">
                                            <div className="w-16 h-16 rounded-full bg-amethyst/20 flex flex-shrink-0 items-center justify-center text-3xl border border-white/10 shadow-lg">
                                                {icon}
                                            </div>
                                            <h3 className="text-3xl font-serif text-moon tracking-wide">
                                                {titleLine}
                                            </h3>
                                        </div>

                                        <div className="space-y-6 text-left">
                                            {contentLines.map((line, i) => (
                                                <p key={i} className="text-mist text-lg leading-relaxed first-letter:text-2xl first-letter:font-serif first-letter:text-gold/80">
                                                    {line}
                                                </p>
                                            ))}
                                        </div>
                                    </motion.div>
                                );
                            });
                        })()}
                    </div>
                </motion.div>
            )}

            {/* Upsell/Purchase Logic */}
            <div className="mt-16 text-center pt-8 pb-20">
                {!extraReading && (
                    <>
                        <p className="text-rose-300/80 text-sm mb-4 animate-pulse">⚠️ Energia Densa Detectada</p>
                        <button
                            onClick={() => setIsUpsellOpen(true)}
                            className="group relative inline-flex items-center gap-3 px-12 py-5 bg-gradient-to-r from-purple-800 to-indigo-900 rounded-full overflow-hidden shadow-[0_0_30px_rgba(88,28,135,0.4)] hover:scale-105 transition-all duration-300 border border-purple-500/30"
                        >
                            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:250%_250%,100%_100%] animate-[shimmer_2s_infinite]" />
                            <span className="relative text-xl font-serif text-white font-bold tracking-widest uppercase">
                                🛡️ Ativar Proteção
                            </span>
                        </button>
                    </>
                )}

                {/* Premium Full Screen Reveal (Portal) */}
                {extraReading && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-3xl"
                    >
                        <div className="max-w-3xl w-full bg-[#151020] border-2 border-amber-500/50 rounded-[2rem] shadow-[0_0_100px_rgba(217,119,6,0.2)] overflow-hidden relative max-h-[90vh] overflow-y-auto">

                            <div className="absolute top-6 right-6 flex items-center gap-4 z-50">
                                <button
                                    onClick={handleDownloadPDF}
                                    className="text-amber-200/70 hover:text-amber-100 transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest border border-amber-500/30 px-3 py-1.5 rounded-lg bg-black/40 hover:bg-amber-900/40"
                                    title="Baixar PDF do Ritual"
                                >
                                    <span>📜 Baixar PDF</span>
                                </button>
                                <button
                                    onClick={() => setExtraReading(null)}
                                    className="text-gray-400 hover:text-white transition-colors text-2xl"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="bg-gradient-to-r from-amber-900/40 to-black p-10 text-center border-b border-amber-500/20">
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/40 mb-4 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                                    <span className="text-4xl">🛡️</span>
                                </div>
                                <h2 className="text-3xl md:text-4xl font-serif text-amber-200 tracking-wide">Ritual de Blindagem</h2>
                                <p className="text-amber-500/60 uppercase tracking-[0.2em] text-sm mt-2">Acesso Exclusivo Liberado</p>
                            </div>

                            <div className="p-10 space-y-6">
                                {extraReading.split('\n').filter(l => l.trim().length > 0).map((line, idx) => {
                                    if (line.includes("##")) return null;
                                    if (line.includes("**")) {
                                        const clean = line.replace(/\*\*/g, '');
                                        return <h4 key={idx} className="text-xl font-serif text-amber-100 mt-6 border-l-4 border-amber-500/50 pl-4">{clean}</h4>
                                    }
                                    return <p key={idx} className="text-gray-300 text-lg leading-relaxed">{line}</p>
                                })}
                            </div>

                            {/* Footer with SEPARATED Horoscope Button */}
                            <div className="bg-black/50 p-6 text-center border-t border-white/5 space-y-6">
                                <p className="text-sm text-gray-500">Este ritual é sagrado. Mantenha em segredo.</p>

                                {/* HOROSCOPE CTA BLOCK (Separated) */}
                                <div className="mt-8 p-6 bg-indigo-950/40 rounded-2xl border border-indigo-500/30 hover:border-indigo-400/60 transition-all shadow-[0_0_30px_rgba(79,70,229,0.1)] group">
                                    <h4 className="text-xl font-serif text-indigo-200 mb-2 flex items-center justify-center gap-2">
                                        <span>🌌</span> Espere... Os Astros Têm Mais a Dizer
                                    </h4>
                                    <p className="text-indigo-200/60 text-sm mb-6 max-w-lg mx-auto leading-relaxed">
                                        Existe uma mensagem urgente nos astros sobre o seu **destino financeiro** e **amoroso** que foi ocultada nesta leitura básica.
                                    </p>
                                    <button
                                        onClick={() => {
                                            setIsHoroscopeOpen(true);
                                        }}
                                        className="relative px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold transition-all transform hover:scale-105 hover:shadow-[0_0_40px_rgba(99,102,241,0.6)] overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite]" />
                                        <span className="relative flex items-center gap-2">
                                            👁️ Ver Último Segredo
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    )
}
        </div >
    );
};
export default ReadingRevelation;
