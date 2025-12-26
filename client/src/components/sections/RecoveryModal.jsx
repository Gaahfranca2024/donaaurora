import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const RecoveryModal = ({ isOpen, onClose, onRecover }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await onRecover(email);
            // If successful, onRecover should handle the transition or we close
            // If onRecover throws, catch below
        } catch (err) {
            setError('Não encontramos um pagamento aprovado para este e-mail. Verifique se digitou corretamente ou aguarde alguns instantes.');
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="relative w-full max-w-md bg-[#1a0b2e] border border-amethyst/30 rounded-xl p-6 shadow-2xl shadow-amethyst/20"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                        >
                            ✕
                        </button>

                        <h2 className="text-2xl font-serif text-white mb-2 text-center">Recuperar Leitura</h2>
                        <p className="text-gray-400 text-center mb-6 text-sm">
                            Já fez seu pagamento? Digite seu e-mail abaixo para acessar sua leitura imediatamente.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-amethyst mb-1">SEU E-MAIL</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="exemplo@email.com"
                                    className="w-full bg-[#0f0518] border border-amethyst/30 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-amethyst transition-colors"
                                />
                            </div>

                            {error && (
                                <p className="text-red-400 text-xs text-center bg-red-900/20 p-2 rounded border border-red-900/50">
                                    {error}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-amethyst to-rose text-white font-bold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Buscando...
                                    </>
                                ) : (
                                    'ACESSAR LEITURA'
                                )}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default RecoveryModal;
