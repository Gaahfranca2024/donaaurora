import React from 'react';
import Hero from '../components/Hero';
import BookingForm from '../components/BookingForm';
import PaymentSimulation from '../components/PaymentSimulation';
import ReadingView from '../components/ReadingView';
import { useReading } from '../context/ReadingContext';
import { AnimatePresence, motion } from 'framer-motion';

const Home = () => {
    const { readingState } = useReading();

    return (
        <main className="relative min-h-screen">
            <Hero />

            <section id="reading-section" className="min-h-[80vh] bg-mystic-950/50 backdrop-blur-lg border-t border-white/5 relative z-10 py-20 flex items-center justify-center">
                <div className="container mx-auto">
                    <AnimatePresence mode="wait">
                        {readingState === 'idle' && (
                            <motion.div key="booking" exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }}>
                                <BookingForm />
                            </motion.div>
                        )}
                        {readingState === 'payment_pending' && (
                            <motion.div key="payment" exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }}>
                                <PaymentSimulation />
                            </motion.div>
                        )}
                        {(readingState === 'paid' || readingState === 'complete') && (
                            <motion.div key="reading" exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
                                <ReadingView />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </section>
        </main>
    );
};

export default Home;
