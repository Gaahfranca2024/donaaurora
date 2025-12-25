import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ReadingFlow = ({ userData, onUpdate, onSubmit }) => {

    const [displayDate, setDisplayDate] = useState('');

    const handleChange = (e) => {
        onUpdate({ ...userData, [e.target.name]: e.target.value });
    };

    const handleDateInput = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 8) value = value.slice(0, 8);

        let formatted = value;
        if (value.length > 4) {
            formatted = `${value.slice(0, 2)}/${value.slice(2, 4)}/${value.slice(4)}`;
        } else if (value.length > 2) {
            formatted = `${value.slice(0, 2)}/${value.slice(2)}`;
        }

        setDisplayDate(formatted);

        if (value.length === 8) {
            const day = value.slice(0, 2);
            const month = value.slice(2, 4);
            const year = value.slice(4);
            onUpdate({ ...userData, birthDate: `${year}-${month}-${day}` });
        }
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
                    <div className="relative">
                        <input
                            type="text"
                            inputMode="numeric"
                            placeholder="DD/MM/AAAA"
                            value={displayDate}
                            onChange={handleDateInput}
                            required
                            className="w-full bg-white/90 border border-nebula rounded-xl px-4 py-3 text-black placeholder-gray-400 focus:border-amethyst outline-none transition-colors"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                            📅
                        </div>
                    </div>
                    <p className="text-[10px] text-mist/60 ml-2 italic">Digite apenas os números do seu nascimento.</p>
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
