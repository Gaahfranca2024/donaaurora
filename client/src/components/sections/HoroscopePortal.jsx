import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Map, User, Brain, LayoutGrid, Zap, Star, Calendar, Clock, MapPin, ArrowRight, Copy } from 'lucide-react';
import AstralChart from '../charts/AstralChart';
import MysticBackground from '../layout/MysticBackground';
import html2pdf from 'html2pdf.js';

// --- CONSTANTS MOVED FROM ASTRALCHART ---
const ZODIAC_SIGNS = [
    { name: "Aries", symbol: "♈", color: "#FF4500" },
    { name: "Taurus", symbol: "♉", color: "#4ADE80" },
    { name: "Gemini", symbol: "♊", color: "#FDE047" },
    { name: "Cancer", symbol: "♋", color: "#E5E7EB" },
    { name: "Leo", symbol: "♌", color: "#F97316" },
    { name: "Virgo", symbol: "♍", color: "#A3E635" },
    { name: "Libra", symbol: "♎", color: "#F472B6" },
    { name: "Scorpio", symbol: "♏", color: "#EF4444" },
    { name: "Sagittarius", symbol: "♐", color: "#A855F7" },
    { name: "Capricorn", symbol: "♑", color: "#D97706" },
    { name: "Aquarius", symbol: "♒", color: "#06B6D4" },
    { name: "Pisces", symbol: "♓", color: "#14B8A6" }
];

const PLANET_GLYPHS = {
    Sun: "☉", Moon: "☽", Mercury: "☿", Venus: "♀", Mars: "♂",
    Jupiter: "♃", Saturn: "♄", Uranus: "♅", Neptune: "♆", Pluto: "♇"
};

const PLANET_COLORS = {
    Sun: "#FCD34D", Moon: "#E5E7EB", Mercury: "#93C5FD", Venus: "#F9A8D4", Mars: "#F87171",
    Jupiter: "#FBBF24", Saturn: "#D4D4D8", Uranus: "#22D3EE", Neptune: "#60A5FA", Pluto: "#C084FC"
};

const ASPECT_COLORS = {
    Conjunction: "#FCD34D", // Gold
    Opposition: "#EF4444",  // Red
    Square: "#EF4444",      // Red
    Trine: "#38BDF8",       // Light Blue
    Sextile: "#38BDF8"      // Light Blue
};

const HoroscopePortal = ({ isOpen, onClose, userData, onPaymentSuccess }) => {
    const [step, setStep] = useState('input'); // input -> loading -> result
    const [formData, setFormData] = useState({
        birthDate: userData?.birthDate || '',
        birthTime: userData?.birthTime || '12:00',
        city: userData?.city || ''
    });

    const [horoscopeText, setHoroscopeText] = useState(null);
    const reportRef = useRef(null);

    const [showPaymentGate, setShowPaymentGate] = useState(false);
    const [isPremiumUnlocked, setIsPremiumUnlocked] = useState(false);
    const [paymentData, setPaymentData] = useState(null);
    const [pixLoading, setPixLoading] = useState(false);

    // Reset loop if closed
    useEffect(() => {
        if (!isOpen) {
            setStep('input');
            setHoroscopeText(null);
            setShowPaymentGate(false);
            setIsPremiumUnlocked(false);
            setPaymentData(null); // Reset payment
        } else {
            // ... (keep default)
            setFormData(prev => ({
                ...prev,
                birthDate: userData?.birthDate || prev.birthDate,
                birthTime: userData?.birthTime || prev.birthTime,
                city: userData?.city || prev.city
            }));
        }
    }, [isOpen, userData]);

    // POLLING PAYMENT STATUS
    useEffect(() => {
        let interval;
        if (paymentData && paymentData.id && !isPremiumUnlocked && isOpen) {
            interval = setInterval(async () => {
                try {
                    const res = await fetch(`http://127.0.0.1:3000/api/payment/${paymentData.id}`);
                    const data = await res.json();
                    if (data.status === 'approved') {
                        handleGatePaymentSuccess();
                        clearInterval(interval);
                    }
                } catch (err) {
                    console.error("Polling error", err);
                }
            }, 3000); // Check every 3s
        }
        return () => clearInterval(interval);
    }, [paymentData, isPremiumUnlocked, isOpen]);

    const handleGeneratePix = async () => {
        setPixLoading(true);
        try {
            const res = await fetch('http://127.0.0.1:3000/api/payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: userData?.name || "Cliente Mystic",
                    email: "cliente@mystictarot.com.br", // Placeholder as we don't capture email yet
                    amountOverride: 19.90, // Force price
                    description: `Mapa Astral - ${userData?.name}`
                })
            });
            const data = await res.json();
            if (data.qr_code) {
                setPaymentData(data);
            } else {
                alert("Erro ao gerar PIX. Tente novamente.");
            }
        } catch (error) {
            console.error(error);
            alert("Erro de conexão com o banco estelar.");
        } finally {
            setPixLoading(false);
        }
    };

    // ... handleGenerateMap ...

    const handleGenerateMap = async () => {
        setStep('loading');
        try {
            // Force IPv4 to avoid localhost issues
            const res = await fetch('http://127.0.0.1:3000/api/horoscope', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    birthDate: formData.birthDate,
                    birthTime: formData.birthTime,
                    city: formData.city
                }),
            });

            if (!res.ok) throw new Error('Falha na conexão estelar');

            const data = await res.json();
            console.log("Horoscope Received:", data);

            setHoroscopeText(data);

            // "Degustação" Logic: Show Visual Chart immediately.
            // Analysis text will be locked visually in the render phase.
            setStep('result');
            setIsPremiumUnlocked(false);

        } catch (error) {
            console.error("Horoscope Error:", error);
            setStep('input'); // Go back to input on error so user can retry
            // Ideally show toast error here
        }
    };

    const handleGatePaymentSuccess = () => {
        setShowPaymentGate(false); // Close modal
        setIsPremiumUnlocked(true); // Unlock text content
        if (onPaymentSuccess) onPaymentSuccess(horoscopeText?.text?.pillars || "Leitura realizada.");
    };

    const handleDownloadPDF = async () => {
        if (!reportRef.current) return;

        // Clone element
        const element = reportRef.current;
        const clone = element.cloneNode(true);

        // Prep clone for capture - VISIBLE OVERLAY STRATEGY (z-9999 sometimes fails)
        clone.style.position = 'absolute';
        clone.style.top = '0';
        clone.style.left = '0';
        clone.style.width = '1000px';
        clone.style.height = 'auto'; // Allow full expansion
        clone.style.minHeight = '100vh';
        clone.style.overflow = 'visible';
        clone.style.zIndex = '9999'; // Force TOP visibility for capture

        // VISUAL STYLES for PDF
        clone.style.backgroundColor = '#0b0a1d'; // Dark background
        clone.style.color = '#ffffff'; // Ensure base text is white
        clone.style.padding = '40px';

        // Remove scroll classes
        clone.classList.remove('overflow-y-auto', 'h-full', 'custom-scrollbar');

        document.body.appendChild(clone);

        // Wait for rendering
        await new Promise(resolve => setTimeout(resolve, 800));

        const opt = {
            margin: [10, 10, 20, 10],
            filename: `Mapa-Astral-${formData.name || 'Destino'}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                scrollY: 0,
                x: 0,
                y: 0,
                windowWidth: 1000,
                backgroundColor: '#0b0a1d',
                logging: false
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };

        try {
            await html2pdf().set(opt).from(clone).save();
        } catch (err) {
            console.error("PDF Export failed:", err);
        } finally {
            document.body.removeChild(clone);
        }
    };

    // Helper to render AI content (Recursive & Clean)
    const renderContent = (content) => {
        if (!content) return "Consultando o oráculo estelar...";

        // Recursive helper to extract all strings from any nested structure
        const extractStrings = (data) => {
            if (typeof data === 'string') return [data];
            if (typeof data === 'object' && data !== null) {
                return Object.values(data).flatMap(val => extractStrings(val));
            }
            return [];
        };

        const strings = extractStrings(content);
        const finalString = strings.join('\n\n');

        if (!finalString.trim()) return "Interpretando os astros...";

        // SAFER CLEANING: Remove only structural JSON artifacts (braces/brackets)
        // Kept quotes and colons as they might be part of the poetic text
        let cleaned = finalString
            .replace(/[{}[\]]/g, '') // Remove only braces and brackets
            .trim();

        return cleaned.split('\n\n').map((paragraph, idx) => (
            <p key={idx} className="mb-6 last:mb-0">{paragraph}</p>
        ));
    };


    // Helper to get sign symbol for a specific planet
    const getSignSymbol = (planetName) => {
        if (!horoscopeText?.data?.planets?.[planetName]) return "";
        const lon = horoscopeText.data.planets[planetName].lon;
        const index = Math.floor(lon / 30);
        return ZODIAC_SIGNS[index]?.symbol || "";
    };

    // Debugging Logs
    console.log('🔮 Horoscope Data Received:', horoscopeText);
    if (horoscopeText?.text?.prediction) {
        console.log('📜 Prediction Sections:', horoscopeText.text.prediction);
    }

    // Helper to robustly find content by fuzzy matching keys
    const getContentForKey = (obj, searchTerms) => {
        if (!obj) return null;
        // First try exact match
        for (const term of searchTerms) {
            if (obj[term]) return obj[term];
        }
        // Then try partial match in keys
        const keys = Object.keys(obj);
        for (const term of searchTerms) {
            const foundKey = keys.find(k => k.toLowerCase().includes(term.toLowerCase()));
            if (foundKey) return obj[foundKey];
        }
        return null;
    };

    const prediction = horoscopeText?.text?.prediction || {};

    const sections = [
        {
            id: 'trinity',
            icon: User,
            title: "Trindade Principal",
            keywords: ["ESSÊNCIA", "ALMA", "PERSONA"],
            planet: "Sun",
            color: "from-amber-400 to-orange-500",
            text: getContentForKey(prediction, ['trinity', 'trindade', 'principal']),
            span: "col-span-12 bg-gradient-to-br from-amber-500/10 to-orange-500/5 min-h-[300px]"
        },
        {
            id: 'personal',
            icon: Brain,
            title: "Estrutura Pessoal",
            keywords: ["MENTE", "AMOR", "IMPULSO"],
            planet: "Venus",
            color: "from-blue-400 to-indigo-500",
            text: getContentForKey(prediction, ['personal', 'pessoal', 'estrutura']),
            span: "col-span-12 bg-gradient-to-br from-blue-500/10 to-indigo-500/5 min-h-[300px]"
        },
        {
            id: 'social',
            icon: LayoutGrid,
            title: "Destino & Lições",
            keywords: ["EXPANSÃO", "LIMITES", "KARMA"],
            planet: "Jupiter",
            color: "from-emerald-400 to-teal-500",
            text: getContentForKey(prediction, ['social', 'destino', 'social']),
            span: "col-span-12 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 min-h-[300px]"
        },
        {
            id: 'houses',
            icon: MapPin,
            title: "Casas & Vocação",
            keywords: ["LEGADO", "CARREIRA", "MISSÃO"],
            planet: "Saturn",
            color: "from-purple-400 to-pink-500",
            text: getContentForKey(prediction, ['houses', 'casas', 'vocacao', 'vocação']),
            span: "col-span-12 bg-gradient-to-br from-purple-500/10 to-pink-500/5 min-h-[300px]"
        },
        {
            id: 'aspects',
            icon: Zap,
            title: "Aspectos & Tensão",
            keywords: ["CONFLITO", "FLUIDEZ", "PODER"],
            planet: "Pluto",
            color: "from-rose-400 to-red-500",
            text: getContentForKey(prediction, ['aspects', 'aspectos', 'tensao', 'tensão']),
            span: "col-span-12 bg-gradient-to-br from-rose-500/10 to-red-500/5 min-h-[300px]"
        },
        {
            id: 'evolutionary',
            icon: Star,
            title: "Pontos Evolutivos",
            keywords: ["CURA", "DESTINO", "ESPÍRITO"],
            planet: "Neptune",
            color: "from-violet-400 to-fuchsia-500",
            text: getContentForKey(prediction, ['evolutionary', 'evolutivo', 'pontos', 'caminho', 'evolucao', 'evolução']),
            span: "col-span-12 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/5 min-h-[300px]"
        },
    ];

    if (!isOpen) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    // ... existing portal motion props
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 md:p-8"
                >
                    {/* ... Close button ... */}
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 z-50 p-2 bg-white/5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>

                    {/* Main Container */}
                    <div className="relative w-full max-w-[1400px] h-[90vh] bg-[#0b0a1d] border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl shadow-indigo-900/30">

                        {/* Background Effects - Replaced with MysticBackground */}
                        <div className="absolute inset-0 z-0 opacity-60 pointer-events-none">
                            <MysticBackground />
                        </div>

                        {/* ... Input Form ... */}
                        {step === 'input' && (
                            // ... same input code
                            <div className="relative z-10 flex flex-col items-center justify-center h-full p-8 text-center max-w-lg mx-auto w-full animate-in fade-in duration-500">
                                {/* ... content ... */}
                                <div className="inline-flex items-center justify-center p-6 rounded-full bg-indigo-500/10 mb-8 ring-1 ring-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                                    <MapPin className="text-indigo-400 w-10 h-10" />
                                </div>
                                <h2 className="text-4xl font-serif text-white mb-3">Portal Estelar</h2>
                                <p className="text-indigo-200/60 mb-10 text-lg">Confirme as coordenadas do seu nascimento para alinhar o telescópio kármico.</p>

                                <div className="w-full space-y-5 text-left bg-white/5 p-8 rounded-2xl border border-white/5 backdrop-blur-sm">
                                    <div>
                                        <label className="text-xs font-bold text-indigo-300 uppercase tracking-widest ml-1 mb-2 block">Data de Nascimento</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none" />
                                            <input
                                                type="date"
                                                value={formData.birthDate}
                                                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-12 py-4 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col md:grid md:grid-cols-2 gap-6 md:gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-indigo-300 uppercase tracking-widest ml-1 mb-2 block">Horário</label>
                                            <div className="relative">
                                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none" />
                                                <input
                                                    type="time"
                                                    value={formData.birthTime}
                                                    onChange={(e) => setFormData({ ...formData, birthTime: e.target.value })}
                                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-12 py-4 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-indigo-300 uppercase tracking-widest ml-1 mb-2 block">Cidade</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none" />
                                                <input
                                                    type="text"
                                                    placeholder="São Paulo"
                                                    value={formData.city}
                                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-12 py-4 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleGenerateMap}
                                        disabled={!formData.birthDate || !formData.city}
                                        className="w-full py-4 mt-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_auto] animate-gradient rounded-xl text-white font-bold text-lg hover:shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                                    >
                                        <span className="group-hover:tracking-wider transition-all">Revelar Segredos</span>
                                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ... Loading ... */}
                        {step === 'loading' && (
                            <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
                                <div className="relative">
                                    <div className="w-24 h-24 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Star className="text-white fade-in animate-pulse" fill="white" size={12} />
                                    </div>
                                </div>
                                <p className="text-indigo-300 animate-pulse tracking-[0.3em] text-xs font-bold mt-8 uppercase">Calculando Posições Planetárias...</p>
                                <p className="text-indigo-400/50 text-xs mt-2">Consultando Efemérides Suíças</p>
                            </div>
                        )}

                        {/* ... Result ... */}
                        {step === 'result' && horoscopeText && (
                            <div className="relative w-full h-full">

                                {/* PAYMENT GATE OVERLAY */}
                                {showPaymentGate && (
                                    <div className="absolute inset-0 z-[60] flex items-center justify-center p-4">
                                        <div className="absolute inset-0 bg-black/60 backdrop-blur-xl transition-all duration-700"></div>
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            className="relative z-70 max-w-lg w-full bg-[#151020] border border-amber-500/30 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.15)] overflow-hidden"
                                        >
                                            {/* Header */}
                                            <div className="bg-gradient-to-r from-amber-900/20 to-black p-8 text-center border-b border-white/5 relative overflow-hidden">
                                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>
                                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/40 mb-4 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                                                    <span className="text-3xl">🔓</span>
                                                </div>
                                                <h3 className="text-2xl font-serif text-amber-100 mb-2">Destino Mapeado</h3>
                                                <p className="text-amber-500/60 text-xs uppercase tracking-widest">Sua análise está pronta</p>
                                            </div>

                                            {/* Body */}
                                            <div className="p-8 space-y-6">
                                                <div className="space-y-4 text-center">
                                                    <p className="text-gray-300 leading-relaxed">
                                                        Os astros revelaram <span className="text-amber-200 font-bold">7 pontos cruciais</span> sobre seu futuro financeiro e amoroso. O mapa foi gerado com sucesso e está aguardando liberação.
                                                    </p>

                                                    <div className="bg-black/40 rounded-xl p-4 border border-white/5 flex items-center justify-between">
                                                        <span className="text-gray-400 text-sm">Taxa de Operação</span>
                                                        <span className="text-amber-400 font-mono font-bold text-lg">R$ 19,90</span>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={handleGatePaymentSuccess}
                                                    className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-500 hover:to-emerald-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-green-900/50 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 group"
                                                >
                                                    <Zap className="text-yellow-300 fill-yellow-300 group-hover:animate-pulse" size={20} />
                                                    <span>Liberar Acesso Agora</span>
                                                </button>

                                                <p className="text-center text-[10px] text-gray-600">
                                                    Ambiente criptografado. Acesso imediato após confirmação.
                                                </p>
                                            </div>
                                        </motion.div>
                                    </div>
                                )}

                                <div ref={reportRef} className={`relative z-10 flex flex-col w-full h-full overflow-y-auto custom-scrollbar transition-filter duration-500 ${showPaymentGate ? 'blur-md pointer-events-none select-none overflow-hidden' : ''}`}>

                                    {/* Header Section */}
                                    <div className="flex flex-col items-center pt-6 pb-2 px-4 text-center shrink-0">
                                        <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-1 tracking-tight">
                                            {userData.name || "Viajante"}
                                        </h2>
                                        <p className="text-indigo-300/60 text-xs uppercase tracking-widest font-medium">
                                            {formData.city} • {formData.birthTime}
                                        </p>
                                    </div>

                                    {/* Content */}
                                    <div className="flex flex-col items-center w-full max-w-[1400px] mx-auto px-4 md:px-10 pb-20 gap-12">

                                        {/* Chart and Lists code - Kept same but brief here for context */}
                                        <div className="w-full flex flex-col items-center gap-6 mb-8">
                                            <div className="relative w-full aspect-square max-w-[500px] md:max-w-[550px] bg-[#0B101B] rounded-full shadow-[0_0_120px_rgba(79,70,229,0.15)] border border-white/5 p-2 ring-1 ring-white/5 flex items-center justify-center">
                                                <div className="w-full h-full transform scale-110">
                                                    <AstralChart data={horoscopeText.data} location={formData.city} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Lists for Planets/Aspects (Skipping detailed rendering for brevity of replacing chunks) */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                                            {/* Planets */}
                                            <div className="bg-slate-900/40 backdrop-blur-sm p-8 rounded-3xl border border-slate-800">
                                                <h3 className="text-amber-200/80 font-serif mb-6 flex items-center gap-3 text-xl"><span className="text-2xl">🪐</span> Posicionamentos Planetários</h3>
                                                <div className="space-y-3">
                                                    {Object.entries(horoscopeText.data.planets).map(([name, info]) => {
                                                        const deg = Math.floor(info.lon % 30);
                                                        const min = Math.floor((info.lon % 1) * 60);
                                                        const sign = ZODIAC_SIGNS[Math.floor(info.lon / 30)] || { name: '?' };
                                                        return (
                                                            <div key={name} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                                                <div className="flex items-center gap-4">
                                                                    <span className="text-xl w-8 text-center" style={{ color: PLANET_COLORS[name] }}>{PLANET_GLYPHS[name]}</span>
                                                                    <span className="text-slate-200 font-bold text-base capitalize">{name}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2 text-sm font-mono text-indigo-200/70 bg-indigo-950/30 px-3 py-1 rounded-lg">
                                                                    <span>{deg}° {min}' {sign.name}</span>
                                                                    {info.isRetrograde && <span className="bg-red-500/20 text-red-400 px-1 rounded text-[10px] ml-2">Rx</span>}
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                            {/* Aspects */}
                                            <div className="bg-slate-900/40 backdrop-blur-sm p-8 rounded-3xl border border-slate-800">
                                                <h3 className="text-indigo-200/80 font-serif mb-6 flex items-center gap-3 text-xl"><span className="text-2xl">📐</span> Aspectos & Geometria</h3>
                                                <div className="space-y-3">
                                                    {(horoscopeText.data.aspects || []).map((aspect, i) => (
                                                        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-indigo-500/30 transition-all">
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-lg" style={{ color: PLANET_COLORS[aspect.p1] }}>{PLANET_GLYPHS[aspect.p1]}</span>
                                                                <span className="text-xs text-slate-500">vs</span>
                                                                <span className="text-lg" style={{ color: PLANET_COLORS[aspect.p2] }}>{PLANET_GLYPHS[aspect.p2]}</span>
                                                            </div>
                                                            <span className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider" style={{ backgroundColor: `${ASPECT_COLORS[aspect.type]}20`, color: ASPECT_COLORS[aspect.type] }}>{aspect.type}</span>
                                                            <span className="text-xs text-slate-500 font-mono bg-black/20 px-2 py-1 rounded">Orb: {aspect.orb.toFixed(2)}°</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>


                                        {/* 3. INTERPRETATION GRID (7 SECTIONS) */}
                                        <div className="w-full">
                                            <div className="flex items-center gap-4 mb-8">
                                                <h3 className="text-3xl font-serif text-white">Análise Profunda & Evolutiva</h3>
                                                <div className="h-[1px] flex-1 bg-gradient-to-r from-indigo-500/50 to-transparent"></div>
                                            </div>

                                            <div className="flex flex-col gap-8 w-full">
                                                {sections.map((section) => (
                                                    <motion.div
                                                        key={section.id}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        whileInView={{ opacity: 1, y: 0 }}
                                                        viewport={{ once: true }}
                                                        // Animation removed as per user request
                                                        className={`group relative overflow-hidden bg-[#0B101B]/90 hover:bg-[#131b2e] border border-purple-500/30 hover:border-purple-400/50 rounded-3xl p-8 transition-all duration-300 w-full min-h-[300px]`}
                                                    >
                                                        {/* Card Gradient Overlay */}
                                                        <div className={`absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br ${section.color} opacity-[0.03] rounded-full blur-[100px] pointer-events-none group-hover:opacity-[0.08] transition-opacity`}></div>

                                                        {/* Dynamic Sign Watermark - NEW */}
                                                        <div className="absolute -bottom-20 -right-20 text-[300px] opacity-[0.03] pointer-events-none select-none text-white font-serif leading-none rotate-12 group-hover:opacity-[0.06] transition-opacity duration-700">
                                                            {getSignSymbol(section.planet)}
                                                        </div>

                                                        <div className="relative z-10">
                                                            <div className="flex flex-col gap-4 mb-8">
                                                                <div className="flex items-center gap-4">
                                                                    <div className={`p-4 rounded-2xl bg-white/5 border border-white/5 shadow-inner`}>
                                                                        <section.icon className="text-indigo-300 w-8 h-8" />
                                                                    </div>
                                                                    <h4 className="text-2xl font-bold text-white group-hover:text-amber-200 transition-colors">
                                                                        {section.title}
                                                                    </h4>
                                                                </div>
                                                                {/* Power Tags (Keywords) - NEW */}
                                                                <div className="flex flex-wrap gap-2 ml-16">
                                                                    {section.keywords && section.keywords.map((kw, i) => (
                                                                        <span key={i} className="text-[10px] font-bold tracking-[0.2em] uppercase text-indigo-300/80 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.1)]">
                                                                            {kw}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            <div className="w-full h-[1px] bg-white/5 mb-6"></div>

                                                            {/* Text Container with Lock Logic */}
                                                            <div className="relative">
                                                                <div className={`font-['Poppins',sans-serif] text-xl md:text-2xl leading-relaxed text-justify tracking-wide text-indigo-100 drop-shadow-sm transition-all duration-500 ${!isPremiumUnlocked ? 'blur-md select-none opacity-50 max-h-[150px] overflow-hidden' : ''}`}>
                                                                    {renderContent(section.text)}
                                                                </div>

                                                                {/* PREMIUM LOCK OVERLAY */}
                                                                {!isPremiumUnlocked && (
                                                                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-end pb-4 bg-gradient-to-b from-transparent to-[#0B101B]/90">
                                                                        <button
                                                                            onClick={() => setShowPaymentGate(true)}
                                                                            className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-full shadow-[0_0_20px_rgba(245,158,11,0.3)] flex items-center gap-2 transform hover:scale-105 transition-all"
                                                                        >
                                                                            <span>🔒</span> Ler Interpretação
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>

                                            {/* Download Button */}
                                            <div className="w-full flex justify-center pt-8 pb-10">
                                                <button
                                                    onClick={handleDownloadPDF}
                                                    className="px-10 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-indigo-200 font-medium transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(99,102,241,0.2)] flex items-center gap-3 group"
                                                >
                                                    <Map size={20} className="text-indigo-400 group-hover:text-amber-300 transition-colors" />
                                                    <span>Baixar Arquivo Completo</span>
                                                </button>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default HoroscopePortal;
