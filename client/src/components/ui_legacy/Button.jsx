import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
    const variants = {
        primary: "bg-gradient-to-r from-mystic-600 to-mystic-500 hover:from-mystic-500 hover:to-mystic-400 text-white shadow-lg shadow-mystic-500/30",
        outline: "border border-mystic-500 text-mystic-200 hover:bg-mystic-500/10 hover:text-white",
        ghost: "text-mystic-300 hover:text-white hover:bg-white/5",
        glow: "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(124,58,237,0.5)] hover:shadow-[0_0_30px_rgba(124,58,237,0.7)] border border-white/20"
    };

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-6 py-3 rounded-full font-serif font-medium tracking-wide transition-all duration-300 ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </motion.button>
    );
};

export default Button;
