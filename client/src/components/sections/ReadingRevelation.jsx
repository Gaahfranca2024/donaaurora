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

            {/* Reading Text */}
            {revealedIndices.size >= cards.length && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="space-y-8"
                >
                    {(() => {
                        // Robust Markdown Splitting Logic
                        const fullText = readingData.reading || "";

                        // normalize newlines
                        const normalizedText = fullText.replace(/\r\n/g, '\n');

                        // 1. Split by Headers (## or ### or just bold **Title**)
                        // We look for lines starting with # or lines that are purely **Title**
                        let sections = normalizedText.split(/(?:\n|^)(?:#{2,3}|(?:\*\*([^\n]+)\*\*))(?:\s+|$)/)
                            .filter(s => s && s.trim().length > 5); // Filter out empty or too short splits

                        // Re-attach titles if the split removed them (regex capture group behavior varies)
                        // Actually, simplified approach: Split by specific known markers if generic fails
                        if (sections.length < 2) {
                            sections = normalizedText.split(/(?:\n|^)##\s+/).filter(s => s.trim().length > 10);
                        }

                        // Fallback: If no headers found, try to look for our known keywords
                        const keywords = ["Sinfonia", "Raiz", "Passado", "Véu", "Presente", "Horizonte", "Futuro", "Inconsciente", "Benção", "Insight", "Ritual", "Alma", "Amor", "Gancho", "Aviso"];
                        if (sections.length < 2) {
                            // Manual construction if regex failed completely
                            sections = [];
                            let currentSection = "";
                            const lines = normalizedText.split('\n');
                            lines.forEach(line => {
                                const isHeader = line.startsWith('#') || (line.startsWith('**') && line.endsWith('**')) || keywords.some(k => line.includes(k) && line.length < 50);
                                if (isHeader) {
                                    if (currentSection) sections.push(currentSection);
                                    currentSection = line + "\n";
                                } else {
                                    currentSection += line + "\n";
                                }
                            });
                            if (currentSection) sections.push(currentSection);
                        }

                        if (sections.length === 0) {
                            return (
                                <div className="bg-twilight/60 backdrop-blur-2xl p-10 rounded-[2.5rem] border border-amethyst/30">
                                    <p className="text-gray-300">Aguardando a revelação...</p>
                                </div>
                            );
                        }

                        return (
                            <div className="max-w-4xl mx-auto space-y-8">
                                {sections.map((section, idx) => {
                                    const parts = section.split('\n').filter(line => line.trim().length > 0);
                                    let titleLine = parts[0] || "Revelação";

                                    // 🚫 STRICT FILTER: Remove internal AI artifacts or leaked instructions
                                    const lowerTitle = titleLine.toLowerCase();
                                    if (lowerTitle.includes("upsell") || lowerTitle.includes("bloqueio") || lowerTitle.includes("instrução")) {
                                        return null;
                                    }

                                    // Remove the title line from the parts to get content
                                    // Also filter out any lines that are just repeating the icon or title
                                    let contentLines = parts.slice(1).filter(line => {
                                        const trimmed = line.trim();
                                        const lowerLine = trimmed.toLowerCase();
                                        // 🚫 Strict Content Filter
                                        if (lowerLine.includes("upsell") || lowerLine.includes("bloqueio")) return false;

                                        // Filter out lines that are just emojis or very short (unless it's a short valid sentence? risky. Let's filter just emojis)
                                        const isJustEmoji = /^[\p{Emoji}\s]+$/u.test(trimmed);
                                        // Filter out lines that look like the title repeated
                                        const isTitleRepeat = trimmed.includes(titleLine.replace(/[^\w\s]/g, '').trim().substring(0, 10)); // fuzzy match start
                                        return !isJustEmoji && !isTitleRepeat;
                                    });

                                    titleLine = titleLine.replace(/^[:\s*#-]+/, '').trim();
                                    // Remove embedded emojis from title if I am going to render my own
                                    titleLine = titleLine.replace(/[\p{Emoji}]/gu, '').trim();

                                    let icon = "🔮";
                                    if (titleLine.includes("Sinfonia") || titleLine.includes("Introdução")) icon = "✨";
                                    else if (titleLine.includes("Raiz") || titleLine.includes("Passado")) icon = "🌱";
                                    else if (titleLine.includes("Véu") || titleLine.includes("Presente")) icon = "🌫️";
                                    else if (titleLine.includes("Horizonte") || titleLine.includes("Futuro")) icon = "🌅";
                                    else if (titleLine.includes("Inconsciente")) icon = "🌑";
                                    else if (titleLine.includes("Benção")) icon = "🕊️";
                                    else if (titleLine.includes("Insight") || titleLine.includes("Segredo")) icon = "👁️";
                                    else if (titleLine.includes("Ritual")) icon = "🕯️";
                                    else if (titleLine.includes("Alma") || titleLine.includes("Amor") || titleLine.includes("Sinastria") || titleLine.includes("Love")) icon = "❤️";

                                    const isHook = (titleLine.toUpperCase().includes("GANCHO") || titleLine.toUpperCase().includes("AVISO") || titleLine.includes("⚠️") || titleLine.toUpperCase().includes("ALERTA"))
                                        && !titleLine.includes("Amor")
                                        && !titleLine.includes("Alma");

                                    if (isHook) {
                                        return (
                                            <div key={idx} className="bg-gradient-to-r from-red-950/80 to-black p-8 rounded-[2.5rem] border border-red-900/50 shadow-lg text-center animate-pulse">
                                                <p className="text-red-200 font-serif text-lg tracking-wide">{contentLines.join('\n') || titleLine}</p>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div key={idx} className="relative group">
                                            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-[2.5rem] opacity-20 blur group-hover:opacity-50 transition duration-1000"></div>
                                            <div className="relative bg-[#1d192b]/95 backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] border border-white/5 shadow-2xl">
                                                <div className="flex items-center gap-4 mb-6 border-b border-white/5 pb-4">
                                                    <div className="w-12 h-12 rounded-full bg-purple-900/40 flex items-center justify-center text-2xl border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                                                        {icon}
                                                    </div>
                                                    <h3 className="text-2xl font-serif text-purple-100 tracking-wide capitalize">
                                                        {titleLine}
                                                    </h3>
                                                </div>
                                                <div className="prose prose-invert prose-lg max-w-none prose-p:text-gray-300 prose-p:leading-relaxed prose-strong:text-purple-300">
                                                    {contentLines.map((line, i) => (
                                                        <p key={i} className="mb-4 last:mb-0">{line}</p>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })()}

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
            )}
        </div>
    );
};
export default ReadingRevelation;
