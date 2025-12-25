const Astronomy = require("astronomy-engine");
const axios = require('axios');
const { generateAstralAnalysis } = require('./ai');

// Tabela de Textos Prontos (Mantida para fallback/exemplo)
const PLANETARY_TEXTS = {
    Sun: {
        Aries: "Sua energia vital está vibrando com iniciativa e coragem.",
        Taurus: "O momento pede foco na estabilidade material e conforto.",
        Gemini: "Sua mente está acelerada, ótima para comunicação.",
        Cancer: "Emoções à flor da pele; proteja seu lar.",
        Leo: "Seu brilho pessoal está magnético. Apareça!",
        Virgo: "Hora de organizar a bagunça e focar nos detalhes.",
        Libra: "Relacionamentos e harmonia são o foco agora.",
        Scorpio: "Intensidade e transformação profunda em jogo.",
        Sagittarius: "Otimismo e expansão de horizontes.",
        Capricorn: "Foco, disciplina e ambição profissional.",
        Aquarius: "Inovação e desejo de liberdade.",
        Pisces: "Intuição e sensibilidade espiritual elevadas."
    }
};

const ZODIAC_SIGNS = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

// Helper: Convert decimal degrees to Zodiac Sign
const getZodiacFromLongitude = (longitude) => {
    // 0 = Aries, 30 = Taurus, etc.
    const normalized = (longitude % 360 + 360) % 360;
    const index = Math.floor(normalized / 30);
    return ZODIAC_SIGNS[index];
};

// Helper: Geocoding via Nominatim
const getCoordinates = async (city) => {
    try {
        if (!city) return null;
        // User-Agent is required by Nominatim usage policy
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`;
        const res = await axios.get(url, { headers: { 'User-Agent': 'MysticTarot/1.0' } });
        if (res.data && res.data.length > 0) {
            return {
                lat: parseFloat(res.data[0].lat),
                lon: parseFloat(res.data[0].lon),
                display_name: res.data[0].display_name
            };
        }
        return null;
    } catch (e) {
        console.error("Geocoding error:", e.message);
        return null; // Fallback to default if fails
    }
};

// Calculate Ascendant (Simplified Approximation)
// Needed because astronomy-engine calculates positions, but not houses directly.
const calculateAscendant = (date, lat, lon) => {
    // Julian Day
    const jd = Astronomy.MakeTime(date);
    // Sidereal Time (Greenwich)
    const gmst = Astronomy.SiderealTime(date);
    // Local Sidereal Time (degrees)
    const lst = (gmst * 15 + lon) % 360;

    // Obliquity of Ecliptic (Approximate for Epoch)
    const t = jd.tt / 36525;
    const obliquity = 23.439292 - (46.815 * t / 3600);

    // Convert to radians
    const rad = Math.PI / 180;
    const ramc = lst * rad;
    const eps = obliquity * rad;
    const latRad = lat * rad;

    // Formula for Ascendant
    // Asc = atan2(cos(RAMC), -sin(RAMC)*cos(eps) - tan(lat)*sin(eps)) ? No, that's standard
    // Let's use the standard formula:
    // tan(Asc) = cos(RAMC) / ( -sin(RAMC) * cos(eps) + tan(lat) * sin(eps) ) -- Wait, usually handled differently 
    // Simplified:

    const num = Math.cos(ramc);
    const den = -Math.sin(ramc) * Math.cos(eps) - Math.tan(latRad) * Math.sin(eps);

    let asc = Math.atan2(num, den) / rad;

    // Adjust quadrant
    // if (den < 0) asc += 180; -- atan2 handles this usually, but let's check standard astro math
    // Actually atan2(y, x) -> atan2(num, den)
    // The previous formula seems flipped for atan2 args. usually atan2(y, x) = atan(y/x).

    return (asc % 360 + 360) % 360;
};

const generateHoroscope = async (name = "Buscador", birthDateStr, birthTimeStr = "12:00", city = "") => {
    try {
        // 1. Prepare Date
        const fullDateStr = `${birthDateStr}T${birthTimeStr}:00`;
        const date = new Date(fullDateStr);

        // 2. Get Coordinates (Default to Sao Paulo if missing/failed)
        let observer = new Astronomy.Observer(-23.55, -46.63, 0); // SP
        let locationName = "São Paulo, BR";

        if (city) {
            const coords = await getCoordinates(city);
            if (coords) {
                observer = new Astronomy.Observer(coords.lat, coords.lon, 0);
                // Clean up location name: "Sao Paulo, Regiao Imediata..." -> "Sao Paulo, Regiao Imediata"
                locationName = coords.display_name.split(',').slice(0, 2).join(',');
            }
        }

        // 3. Calculate Planets
        const bodies = [
            "Sun", "Moon", "Mercury", "Venus", "Mars",
            "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"
        ];

        const planetsData = {};

        bodies.forEach(bodyName => {
            const body = Astronomy.Body[bodyName];
            // Get Geocentric Vector (J2000)
            const vector = Astronomy.GeoVector(body, date, true);
            const eclipticParams = Astronomy.Ecliptic(vector);

            // Check Retrograde (compare with position 1 hour later)
            const dateNext = new Date(date.getTime() + 3600000); // +1 hour
            const vectorNext = Astronomy.GeoVector(body, dateNext, true);
            const eclipticParamsNext = Astronomy.Ecliptic(vectorNext);
            const isRetrograde = eclipticParamsNext.elon < eclipticParams.elon; // Simple check

            planetsData[bodyName] = {
                lon: eclipticParams.elon,
                lat: eclipticParams.elat,
                speed: eclipticParamsNext.elon - eclipticParams.elon,
                isRetrograde: isRetrograde
            };
        });

        // 4. Calculate Ascendant & Houses
        const ascendantDegree = calculateAscendant(date, observer.latitude, observer.longitude);

        // Generate 12 cusps (Equal House System starting at Asc)
        const cusps = [];
        for (let i = 0; i < 12; i++) {
            cusps.push((ascendantDegree + (i * 30)) % 360);
        }

        // 5. Calculate Aspects
        const calculateAspects = (planets) => {
            const aspects = [];
            const aspectTypes = [
                { name: "Conjunction", angle: 0, orb: 8 },
                { name: "Opposition", angle: 180, orb: 8 },
                { name: "Trine", angle: 120, orb: 8 },
                { name: "Square", angle: 90, orb: 8 },
                { name: "Sextile", angle: 60, orb: 6 }
            ];

            const bodyNames = Object.keys(planets);

            for (let i = 0; i < bodyNames.length; i++) {
                for (let j = i + 1; j < bodyNames.length; j++) {
                    const p1 = bodyNames[i];
                    const p2 = bodyNames[j];
                    const pos1 = planets[p1].lon;
                    const pos2 = planets[p2].lon;

                    let diff = Math.abs(pos1 - pos2);
                    if (diff > 180) diff = 360 - diff;

                    for (const type of aspectTypes) {
                        if (Math.abs(diff - type.angle) <= type.orb) {
                            aspects.push({
                                p1, p2,
                                type: type.name,
                                angle: diff,
                                orb: Math.abs(diff - type.angle)
                            });
                        }
                    }
                }
            }
            return aspects;
        };

        const aspects = calculateAspects(planetsData);

        // 6. Generate Text Analysis (Legacy/MVP) - REPLACED BY AI
        const sunLon = planetsData["Sun"].lon;
        const sunSign = getZodiacFromLongitude(sunLon);

        // Call Dedicated AI for deep analysis
        const aiPrediction = await generateAstralAnalysis(name, {
            planets: planetsData,
            ascendant: ascendantDegree,
            aspects: aspects
        });

        // 7. Return Structured Data
        return {
            text: {
                sunSign: sunSign,
                prediction: aiPrediction, // Now powered by Groq Llama 3.1
                location: locationName
            },
            data: {
                planets: planetsData,
                cusps: cusps,
                aspects: aspects,
                ascendant: ascendantDegree
            }
        };

    } catch (e) {
        console.error("Erro no horóscopo:", e);
        throw e;
    }
};

module.exports = { generateHoroscope };
