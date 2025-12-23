import React from 'react';
import { motion } from 'framer-motion';

const CrystalBallLoader = ({ message = "Consultando as esferas..." }) => {
    return (
        <div className="fixed inset-0 bg-cosmic/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="text-center">
                {/* Bola de Cristal */}
                <div className="relative w-48 h-48 mx-auto mb-8">
                    {/* Círculo externo */}
                    <motion.div
                        className="absolute inset-0 rounded-full border-4 border-crystal/30"
                        animate={{
                            scale: [1, 1.05, 1],
                            borderColor: ['rgba(56, 189, 248, 0.3)', 'rgba(56, 189, 248, 0.6)', 'rgba(56, 189, 248, 0.3)']
                        }}
                        transition={{ repeat: Infinity, duration: 2 }}
                    />

                    {/* Círculo interno */}
                    <motion.div
                        className="absolute inset-8 rounded-full bg-gradient-to-b from-crystal/20 to-crystal/5"
                        animate={{
                            rotate: 360
                        }}
                        transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                    />

                    {/* Núcleo pulsante */}
                    <motion.div
                        className="absolute inset-16 rounded-full bg-gradient-to-r from-rose/40 to-rose/20"
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 0.8, 0.5]
                        }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                    />

                    {/* Partículas flutuantes */}
                    {[...Array(5)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-2 h-2 bg-rose rounded-full"
                            style={{
                                left: `${30 + Math.cos(i * 72 * Math.PI / 180) * 30}%`,
                                top: `${30 + Math.sin(i * 72 * Math.PI / 180) * 30}%`,
                            }}
                            animate={{
                                y: [0, -10, 0],
                                opacity: [0.3, 0.8, 0.3]
                            }}
                            transition={{
                                repeat: Infinity,
                                duration: 1.5,
                                delay: i * 0.2
                            }}
                        />
                    ))}
                </div>

                {/* Texto */}
                <motion.p
                    className="text-moon text-xl font-serif"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                >
                    {message}
                </motion.p>

                {/* Pontos animados */}
                <div className="flex justify-center mt-4 space-x-2">
                    {['.', '..', '...'].map((dots, i) => (
                        <motion.span
                            key={i}
                            className="text-crystal text-2xl"
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
                        >
                            {dots}
                        </motion.span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CrystalBallLoader;
