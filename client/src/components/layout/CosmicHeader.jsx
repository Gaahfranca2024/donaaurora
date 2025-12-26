import React from 'react';
import { motion } from 'framer-motion';

const CosmicHeader = ({ onRecover }) => {
    return (
        <header className="fixed top-0 left-0 right-0 z-40 px-6 py-4 flex justify-between items-center pointer-events-none">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="flex items-center gap-2 pointer-events-auto"
            >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amethyst to-rose animate-pulse-glow" />
                <span className="font-serif text-lg text-moon tracking-widest uppercase">Mystic Tarot</span>
            </motion.div>

            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                onClick={onRecover}
                className="pointer-events-auto text-xs md:text-sm text-amethyst hover:text-rose transition-colors underline decoration-amethyst/30 underline-offset-4"
            >
                Já fiz meu pedido
            </motion.button>
        </header>
    );
};

export default CosmicHeader;
