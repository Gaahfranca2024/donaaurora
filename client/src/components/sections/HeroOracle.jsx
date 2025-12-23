import React from 'react';
import { motion } from 'framer-motion';

const HeroOracle = ({ onBegin }) => {
    return (
        <section className="min-h-[90vh] flex flex-col items-center justify-center relative overflow-hidden z-10">
            {/* Elementos decorativos flutuantes */}
            <div className="absolute top-1/4 left-1/4 w-32 h-32 opacity-10 pointer-events-none">
                <div className="w-full h-full border border-rose/30 rounded-full" />
            </div>

            <div className="absolute bottom-1/4 right-1/4 w-48 h-48 opacity-5 pointer-events-none">
                <div className="w-full h-full border border-crystal/20 rounded-full" />
            </div>

            {/* Conteúdo principal */}
            <motion.h1
                className="text-6xl md:text-8xl font-serif text-center mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
            >
                <span className="bg-gradient-to-r from-rose via-gold to-crystal bg-clip-text text-transparent">
                    Oráculo
                </span>
                <br />
                <span className="text-moon text-4xl md:text-6xl">das</span>
                <br />
                <span className="bg-gradient-to-r from-rose to-gold bg-clip-text text-transparent">
                    Esferas
                </span>
            </motion.h1>

            <motion.p
                className="text-mist text-xl md:text-2xl max-w-2xl text-center mb-12 leading-relaxed px-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 1 }}
            >
                Descubra o que as cartas revelam sobre seu caminho.
                Uma jornada única através do tarot, astrologia e intuição.
            </motion.p>

            <motion.button
                onClick={onBegin}
                className="group relative px-12 py-4 text-lg font-semibold rounded-full overflow-hidden cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
            >
                {/* Background do botão */}
                <div className="absolute inset-0 bg-gradient-to-r from-rose/20 via-gold/20 to-crystal/20" />
                <div className="absolute inset-0 bg-cosmic/80 backdrop-blur-sm" />

                {/* Brilho animado */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                        backgroundSize: '200% 100%',
                        animation: 'shimmer 2s infinite'
                    }}
                />

                {/* Dopamine Pulse (Heartbeat) */}
                <motion.div
                    className="absolute inset-0 rounded-full border-2 border-rose/50"
                    animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                />

                {/* Texto e ícone */}
                <span className="relative flex items-center gap-3 text-moon">
                    <span>Consultar as Cartas</span>
                    <motion.span
                        animate={{ x: [0, 5, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                        ✨
                    </motion.span>
                </span>

                {/* Borda animada */}
                <div className="absolute inset-0 rounded-full border-2 border-transparent group-hover:border-rose/50 transition-all duration-300" />
            </motion.button>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="absolute bottom-8 text-[10px] uppercase tracking-widest text-moon/30 flex items-center gap-2"
            >
                <span className="w-1 h-1 rounded-full bg-rose/40"></span>
                Conteúdo para maiores de 18 anos | Powered by AI
                <span className="w-1 h-1 rounded-full bg-rose/40"></span>
            </motion.div>
        </section>
    );
};

export default HeroOracle;
