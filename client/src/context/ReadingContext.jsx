import React, { createContext, useContext, useState } from 'react';

const ReadingContext = createContext();

export const ReadingProvider = ({ children }) => {
    const [userData, setUserData] = useState({
        name: '',
        birthDate: '',
        question: ''
    });
    const [readingState, setReadingState] = useState('idle'); // idle, payment_pending, paid, shuffling, drawing, complete
    const [drawnCards, setDrawnCards] = useState([]);
    const [readingText, setReadingText] = useState('');
    const [selectedBumps, setSelectedBumps] = useState([]);

    const basePrice = 5.00;
    const bumps = [
        { id: 'love', label: 'Análise de Compatibilidade Amorosa', price: 4.90 },
        { id: 'extra_cards', label: '+ 2 Cartas (Leitura Aprofundada)', price: 2.50 }
    ];

    const totalPrice = basePrice + selectedBumps.reduce((sum, bumpId) => {
        const bump = bumps.find(b => b.id === bumpId);
        return sum + (bump ? bump.price : 0);
    }, 0);

    const toggleBump = (bumpId) => {
        setSelectedBumps(prev =>
            prev.includes(bumpId)
                ? prev.filter(id => id !== bumpId)
                : [...prev, bumpId]
        );
    };

    const updateUserData = (data) => {
        setUserData(prev => ({ ...prev, ...data }));
    };

    const startPaymentFlow = () => {
        setReadingState('payment_pending');
    };

    const confirmPayment = async () => {
        setReadingState('paid');
        // Simulate some "Verification" time
        await new Promise(resolve => setTimeout(resolve, 1000));

        setReadingState('shuffling');
        // Simulate shuffle
        await new Promise(resolve => setTimeout(resolve, 2000));

        setReadingState('drawing');

        try {
            const response = await fetch('http://localhost:3000/api/readings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...userData, selectedBumps })
            });

            const data = await response.json();

            if (data.error) {
                console.error(data.error);
                // Fallback Deck if API fails
                setDrawnCards([
                    { name: 'O Louco', meaning_up: 'Novos começos, inocência', type: 'major' },
                    { name: 'A Roda da Fortuna', meaning_up: 'Ciclos, destino, mudança', type: 'major' },
                    { name: 'O Sol', meaning_up: 'Alegria, sucesso, celebração', type: 'major' }
                ]);
                setReadingText(data.reading || "As cartas revelam um caminho de luz e renovação. Confie no fluxo do universo.");
                setReadingState('complete');
            } else {
                console.log("Cards received:", data.cards);
                setDrawnCards(data.cards);
                setReadingText(data.reading);
                setReadingState('complete');
            }
        } catch (err) {
            console.error("API Call Failed", err);
            setDrawnCards([
                { name: 'O Mago', meaning_up: 'Manifestação, poder', type: 'major' },
                { name: 'A Sacerdotisa', meaning_up: 'Intuição, mistério', type: 'major' },
                { name: 'A Imperatriz', meaning_up: 'Fertilidade, abundância', type: 'major' }
            ]);
            setReadingText("As energias estão intensas. As cartas pedem foco na sua intuição interna para encontrar as respostas que busca.");
            setReadingState('complete');
        }
    };

    return (
        <ReadingContext.Provider value={{
            userData,
            updateUserData,
            readingState,
            setReadingState,
            startPaymentFlow,
            confirmPayment,
            drawnCards,
            setDrawnCards,
            readingText,
            setReadingText,
            selectedBumps,
            toggleBump,
            totalPrice,
            bumps
        }}>
            {children}
        </ReadingContext.Provider>
    );
};

export const useReading = () => useContext(ReadingContext);
