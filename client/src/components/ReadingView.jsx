import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useReading } from '../context/ReadingContext';
import Button from './ui/Button';

const ReadingView = () => {
    const { userData, drawnCards, readingText } = useReading();

    // Helper to get card Meaning info safely
    const getCardMeaning = (card) => {
        // API might return different fields, assuming 'name' and 'meaning_up' based on TarotService
        return card.meaning_up || card.desc || "Significado velado em mistério.";
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-4xl mx-auto text-center px-4 mb-20"
        >
            <h2 className="text-3xl font-serif mb-6 text-white">As Cartas para {userData.name}</h2>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                {drawnCards.map((card, i) => (
                    <motion.div
                        key={i}
                        initial={{ rotateY: 180, opacity: 0 }}
                        animate={{ rotateY: 0, opacity: 1 }}
                        transition={{ delay: i * 0.5, duration: 0.8 }}
                        className="flex flex-col gap-4"
                    >
                        <div className="aspect-[2/3] bg-gradient-to-br from-mystic-800 to-mystic-950 rounded-xl border border-mystic-600 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden group hover:scale-[1.02] transition-transform duration-500">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30" />

                            <h3 className="text-mystic-200 font-serif text-xl border-b border-mystic-700 pb-2 mb-2 z-10 mx-4 text-center">
                                {card.name}
                            </h3>
                            <p className="text-xs text-mystic-400 px-4 text-center z-10 italic">
                                {card.type ? card.type.toUpperCase() : 'ARCANO'}
                            </p>
                        </div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 2 + (i * 0.3) }}
                            className="bg-black/20 p-3 rounded-lg border border-white/5 text-sm text-mystic-200"
                        >
                            <strong>Significado Chave:</strong> {getCardMeaning(card)}
                        </motion.div>
                    </motion.div>
                ))}
            </div>

            {/* AI Interpretation */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 3 }}
                className="bg-mystic-900/30 p-8 rounded-2xl border border-white/10 text-mystic-100 leading-relaxed text-lg text-left whitespace-pre-line shadow-[0_0_50px_rgba(118,82,214,0.1)]"
            >
                <h3 className="text-2xl font-serif mb-4 text-mystic-300 border-b border-mystic-800 pb-2">O Oráculo Fala</h3>
                {readingText}
            </motion.div>

            <div className="mt-12">
                <Button variant="outline" onClick={() => window.location.reload()}>
                    Fazer Outra Pergunta
                </Button>
            </div>
        </motion.div>
    );
};

export default ReadingView;
