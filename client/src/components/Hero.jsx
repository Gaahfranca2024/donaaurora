import React from 'react';
import { motion } from 'framer-motion';
import Button from './ui/Button';
import { Sparkles, Moon, Star } from 'lucide-react';

const Hero = () => {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-mystic-800/40 via-mystic-950 to-mystic-950 z-0" />

            {/* Animated Particles (Simplified) */}
            <motion.div
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute top-1/4 left-1/4 text-mystic-300"
            >
                <Star size={24} />
            </motion.div>
            <motion.div
                animate={{ opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                className="absolute bottom-1/3 right-1/4 text-purple-400"
            >
                <Sparkles size={32} />
            </motion.div>

            <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="flex justify-center mb-6"
                >
                    <div className="p-3 bg-white/5 rounded-full backdrop-blur-sm border border-white/10">
                        <Moon className="text-mystic-200" size={32} />
                    </div>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-5xl md:text-7xl font-serif font-bold bg-clip-text text-transparent bg-gradient-to-br from-white via-mystic-100 to-mystic-300 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                >
                    Revele Seu Destino
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="text-lg md:text-xl text-mystic-200 max-w-2xl mx-auto leading-relaxed"
                >
                    O universo tem uma mensagem para você. Conecte-se com a sabedoria ancestral do Tarot
                    guiada pela clareza da inteligência artificial.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8"
                >
                    <Button variant="glow" className="min-w-[200px] text-lg">
                        Iniciar Leitura
                    </Button>
                    <p className="text-xs text-mystic-400 mt-2 sm:mt-0">
                        *Apenas para fins de entretenimento
                    </p>
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;
