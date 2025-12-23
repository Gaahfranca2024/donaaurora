import React, { useState } from 'react';
import { motion } from 'framer-motion';

const TarotCard = ({ card, position, isRevealed = false, onReveal }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // Rotation for the spread effect (fanning out)
    const rotation = position === 0 ? '-5deg' : position === 1 ? '0deg' : '5deg';

    const flippedState = isFlipped || isRevealed;

    return (
        <div
            className="relative w-full aspect-[2/3] perspective-1000"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <motion.div
                className="w-full h-full relative cursor-pointer"
                style={{
                    transformStyle: 'preserve-3d',
                    perspective: '1000px'
                }}
                animate={{
                    rotateY: flippedState ? 180 : 0,
                    y: isHovered && !flippedState ? -10 : 0,
                    rotateZ: flippedState ? 0 : rotation // Straighten when reading
                }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                onClick={() => {
                    if (!flippedState) {
                        setIsFlipped(true);
                        setTimeout(() => onReveal?.(), 600);
                    }
                }}
            >
                {/* ================= BACK FACE (Verso) ================= */}
                <div
                    className="absolute inset-0 w-full h-full rounded-xl mystic-gradient border-2 border-amethyst/30 shadow-2xl overflow-hidden"
                    style={{
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden', // Safari support
                        zIndex: 2
                    }}
                >
                    {/* Design do verso - Padrão místico */}
                    <div className="absolute inset-2 rounded-lg border border-gold/20">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-20 h-20 rounded-full border-2 border-gold/40 flex items-center justify-center">
                                <span className="text-gold text-3xl">☾</span>
                            </div>
                        </div>
                        {/* Cantoneiras */}
                        <div className="absolute top-2 left-2 w-6 h-6 border-t border-l border-crystal/30"></div>
                        <div className="absolute bottom-2 right-2 w-6 h-6 border-b border-r border-crystal/30"></div>
                    </div>

                    {/* Brilho */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-50" />
                </div>


                {/* ================= FRONT FACE (Frente) ================= */}
                <div
                    className="absolute inset-0 w-full h-full rounded-xl bg-gradient-to-br from-twilight to-nebula border-2 border-gold/40 shadow-2xl p-3 flex flex-col items-center"
                    style={{
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                        zIndex: 2
                    }}
                >
                    <div className="w-full flex-1 bg-black/40 rounded-lg mb-2 relative overflow-hidden border border-white/10 flex items-center justify-center group">
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-amethyst/20 to-transparent" />

                        {card?.image ? (
                            <img src={card.image} alt={card.name} className="w-full h-full object-contain p-2" />
                        ) : (
                            <span className="text-4xl filter drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                                {/* Map some simple icons based on card name if possible, else generic */}
                                {['O Sol', 'Sun'].some(s => card?.name?.includes(s)) ? '☀️' :
                                    ['Lua', 'Moon'].some(s => card?.name?.includes(s)) ? '🌙' :
                                        ['Mago', 'Magician'].some(s => card?.name?.includes(s)) ? '🧙‍♂️' :
                                            '🃏'}
                            </span>
                        )}
                    </div>

                    <div className="text-center w-full bg-black/20 p-2 rounded-lg border border-white/5">
                        <h3 className="text-amber-100 font-serif text-sm font-bold leading-tight mb-1">
                            {card?.name || 'O Arcano'}
                        </h3>
                        <p className="text-amethyst text-[10px] uppercase tracking-wider font-bold">
                            {card?.type || 'Arcano Maior'}
                        </p>
                        <p className="text-mist text-[10px] mt-1 line-clamp-2 leading-tight">
                            {card?.meaning_up || "Mistério..."}
                        </p>
                    </div>

                    {/* Holographic Overlay */}
                    <div className="absolute inset-0 rounded-xl pointer-events-none bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

            </motion.div>
        </div>
    );
};

export default TarotCard;
