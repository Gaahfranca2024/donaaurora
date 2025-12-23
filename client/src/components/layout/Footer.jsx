import React from 'react';
import { motion } from 'framer-motion';

const Footer = () => {
    return (
        <footer className="relative z-20 py-12 px-4 border-t border-white/5 bg-mystic-950/80 backdrop-blur-xl mt-20">
            <div className="container mx-auto max-w-4xl text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="space-y-6"
                >
                    <div className="flex items-center justify-center space-x-2 text-rose tracking-widest text-xs uppercase font-medium opacity-70">
                        <span className="w-8 h-px bg-rose/30"></span>
                        <span>Aviso Legal & Termos</span>
                        <span className="w-8 h-px bg-rose/30"></span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left text-moon/60 text-sm leading-relaxed">
                        <div className="bg-white/5 p-6 rounded-2xl border border-white/5 hover:border-rose/20 transition-colors">
                            <h4 className="text-moon font-serif mb-3 flex items-center">
                                <span className="w-1 h-4 bg-rose mr-2 rounded-full"></span>
                                Natureza do Serviço
                            </h4>
                            <p>
                                Este site fornece orientações baseadas em práticas esotéricas e espirituais (Tarot e Astrologia).
                                Todo o conteúdo e leituras são <strong>processados por tecnologia de IA</strong> e têm caráter exclusivamente de entretenimento e aconselhamento espiritual.
                                Não garantimos a precisão absoluta das previsões, pois o futuro é mutável.
                            </p>
                        </div>

                        <div className="bg-white/5 p-6 rounded-2xl border border-white/5 hover:border-rose/20 transition-colors">
                            <h4 className="text-moon font-serif mb-3 flex items-center">
                                <span className="w-1 h-4 bg-gold mr-2 rounded-full"></span>
                                Isenção de Responsabilidade
                            </h4>
                            <p>
                                As orientações aqui fornecidas <strong>não substituem em hipótese alguma</strong> o aconselhamento de profissionais qualificados nas áreas médica, psicológica, jurídica ou financeira.
                                Nossos consultores não realizam diagnósticos médicos nem dão conselhos legais. O uso das informações é de total responsabilidade do usuário.
                            </p>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between text-[11px] text-moon/40 uppercase tracking-widest gap-4">
                        <p>© {new Date().getFullYear()} Mystic Tarot - Todos os direitos reservados</p>
                        <div className="flex space-x-6">
                            <button className="hover:text-rose transition-colors">Privacidade</button>
                            <button className="hover:text-rose transition-colors">Termos de Uso</button>
                            <button className="hover:text-rose transition-colors">Contato</button>
                        </div>
                        <p className="px-3 py-1 rounded-full border border-white/10 bg-white/5">
                            Uso restrito para maiores de 18 anos
                        </p>
                    </div>
                </motion.div>
            </div>
        </footer>
    );
};

export default Footer;
