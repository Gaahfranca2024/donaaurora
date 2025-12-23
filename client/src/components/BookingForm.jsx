import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from './ui/Button';
import { useReading } from '../context/ReadingContext';

const InputField = ({ label, type = "text", ...props }) => (
    <div className="relative mb-6">
        <input
            type={type}
            className="peer w-full bg-mystic-900/50 border border-mystic-700 rounded-lg px-4 py-3 text-white placeholder-transparent focus:border-mystic-400 focus:ring-1 focus:ring-mystic-400 outline-none transition-all"
            placeholder={label}
            {...props}
        />
        <label className="absolute left-4 -top-2.5 bg-mystic-950 px-1 text-xs text-mystic-400 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-mystic-500 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-mystic-400">
            {label}
        </label>
    </div>
);

const BookingForm = () => {
    const { updateUserData, startPaymentFlow } = useReading();
    const [formData, setFormData] = useState({ name: '', birthDate: '', question: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        updateUserData(formData);
        startPaymentFlow();
        // In a real app we would navigate or scroll, but here state controls the view
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-md mx-auto bg-mystic-900/40 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-2xl"
        >
            <h2 className="text-2xl font-serif text-center mb-8 text-white">Consulte o Oráculo</h2>
            <form onSubmit={handleSubmit}>
                <InputField
                    label="Seu Nome Completo"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />
                <InputField
                    label="Data de Nascimento"
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                    required
                />
                <div className="relative mb-8">
                    <textarea
                        className="peer w-full bg-mystic-900/50 border border-mystic-700 rounded-lg px-4 py-3 text-white placeholder-transparent focus:border-mystic-400 focus:ring-1 focus:ring-mystic-400 outline-none transition-all resize-none h-32"
                        placeholder="Qual é a sua pergunta?"
                        name="question"
                        value={formData.question}
                        onChange={handleChange}
                        required
                    />
                    <label className="absolute left-4 -top-2.5 bg-mystic-950 px-1 text-xs text-mystic-400 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-mystic-500 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-mystic-400">
                        Qual é a sua pergunta?
                    </label>
                </div>

                <Button variant="glow" className="w-full">
                    Revelar Meu Destino
                </Button>
            </form>
        </motion.div>
    );
};

export default BookingForm;
