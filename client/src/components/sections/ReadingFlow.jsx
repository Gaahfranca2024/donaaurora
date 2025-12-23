import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ReadingFlow = ({ userData, onUpdate, onSubmit }) => {

    const handleChange = (e) => {
        onUpdate({ ...userData, [e.target.name]: e.target.value });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto py-20 px-4"
        >
            <div className="text-center mb-10">
                <h2 className="text-3xl font-serif text-moon mb-4">Sintonize sua Energia</h2>
                <p className="text-mist">Para que o oráculo possa ver com clareza, precisamos nos conectar.</p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-8 bg-twilight/30 p-8 rounded-3xl border border-white/5 backdrop-blur-md">
                <div className="space-y-2">
                    <label className="text-amber-300 font-serif ml-2 block">Seu Nome Completo</label>
                    <input
                        name="name"
                        value={userData.name}
                        onChange={handleChange}
                        required
                        className="w-full bg-white/90 border border-nebula rounded-xl px-4 py-3 text-black placeholder-gray-500 focus:border-amethyst outline-none transition-colors"
                        placeholder="Digite seu nome..."
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-amber-300 font-serif ml-2 block">Seu Melhor E-mail</label>
                    <input
                        type="email"
                        name="email"
                        value={userData.email}
                        onChange={handleChange}
                        required
                        className="w-full bg-white/90 border border-nebula rounded-xl px-4 py-3 text-black placeholder-gray-500 focus:border-amethyst outline-none transition-colors"
                        placeholder="seu@email.com"
                    />
                    <p className="text-[10px] text-mist/60 ml-2 italic">Usado apenas para identificar sua leitura e enviar o acesso.</p>
                </div>

                <div className="space-y-2">
                    <label className="text-amber-300 font-serif ml-2 block">Data de Nascimento</label>
                    <input
                        type="date"
                        name="birthDate"
                        value={userData.birthDate}
                        onChange={handleChange}
                        required
                        className="w-full bg-white/90 border border-nebula rounded-xl px-4 py-3 text-black placeholder-gray-500 focus:border-amethyst outline-none transition-colors"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-amber-300 font-serif ml-2 block">Sua Pergunta ao Oráculo</label>
                    <textarea
                        name="question"
                        value={userData.question}
                        onChange={handleChange}
                        required
                        className="w-full bg-white/90 border border-nebula rounded-xl px-4 py-3 text-black placeholder-gray-500 focus:border-amethyst outline-none transition-colors h-32 resize-none"
                        placeholder="Em que área você busca iluminação hoje?"
                    />
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-amethyst to-nebula text-white font-serif text-lg tracking-wide hover:shadow-[0_0_30px_rgba(157,78,221,0.5)] transition-all transform hover:-translate-y-1"
                    >
                        Continuar Jornada ➜
                    </button>
                </div>
            </form>
        </motion.div>
    );
};

export default ReadingFlow;
