import React from 'react';

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
    Conjunction: "#FCD34D",
    Opposition: "#EF4444",
    Square: "#EF4444",
    Trine: "#38BDF8",
    Sextile: "#38BDF8"
};

const toRad = (deg) => deg * (Math.PI / 180);

const AstralChart = ({ data }) => {
    if (!data || !data.planets) {
        return <div className="text-white text-center p-10">Carregando...</div>;
    }

    const { planets, cusps, aspects, ascendant } = data;
    const SIZE = 600;
    const CENTER = SIZE / 2;
    const RADIUS = SIZE / 2 - 40;
    const R_ZODIAC_OUTER = RADIUS;
    const R_ZODIAC_INNER = RADIUS * 0.85;
    const R_HOUSES_INNER = RADIUS * 0.45;
    const R_PLANETS = (R_ZODIAC_INNER + R_HOUSES_INNER) / 2;
    const chartRotation = 180 - (ascendant || 0);

    const getPos = (deg, r) => {
        const rad = toRad(deg + chartRotation);
        return {
            x: CENTER + r * Math.cos(rad),
            y: CENTER - r * Math.sin(rad)
        };
    };

    return (
        <svg viewBox="0 0 600 600" className="w-full h-full">
            <defs>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="#0B101B" />

            {ZODIAC_SIGNS.map((sign, i) => {
                const startAngle = i * 30;
                const endAngle = (i + 1) * 30;
                const p1 = getPos(startAngle, R_ZODIAC_OUTER);
                const p2 = getPos(startAngle, R_ZODIAC_INNER);
                const p3 = getPos(endAngle, R_ZODIAC_INNER);
                const p4 = getPos(endAngle, R_ZODIAC_OUTER);

                const pathStr = "M " + p1.x + " " + p1.y + " L " + p2.x + " " + p2.y +
                    " A " + R_ZODIAC_INNER + " " + R_ZODIAC_INNER + " 0 0 0 " + p3.x + " " + p3.y +
                    " L " + p4.x + " " + p4.y +
                    " A " + R_ZODIAC_OUTER + " " + R_ZODIAC_OUTER + " 0 0 1 " + p1.x + " " + p1.y;

                const midAngle = startAngle + 15;
                const glyphPos = getPos(midAngle, (R_ZODIAC_OUTER + R_ZODIAC_INNER) / 2);
                const rotateStr = "rotate(" + (-chartRotation + 90) + "," + glyphPos.x + "," + glyphPos.y + ")";

                return (
                    <g key={sign.name}>
                        <path d={pathStr} fill="none" stroke="#1E293B" strokeWidth="1" />
                        <text
                            x={glyphPos.x}
                            y={glyphPos.y}
                            fill={sign.color}
                            fontSize="24"
                            textAnchor="middle"
                            dominantBaseline="central"
                            transform={rotateStr}
                        >
                            {sign.symbol}
                        </text>
                    </g>
                );
            })}

            {(cusps || []).map((cusp, i) => {
                const pStart = getPos(cusp, R_ZODIAC_INNER);
                const pEnd = getPos(cusp, R_HOUSES_INNER);
                const labelPos = getPos(cusp + 15, R_HOUSES_INNER + 15);
                return (
                    <g key={i}>
                        <line
                            x1={pStart.x} y1={pStart.y}
                            x2={pEnd.x} y2={pEnd.y}
                            stroke="#334155"
                            strokeWidth="0.5"
                        />
                        <text
                            x={labelPos.x}
                            y={labelPos.y}
                            fill="#475569"
                            fontSize="10"
                            textAnchor="middle"
                            dominantBaseline="central"
                        >
                            {i + 1}
                        </text>
                    </g>
                );
            })}

            {(aspects || []).map((aspect, i) => {
                const pInfo1 = planets[aspect.p1];
                const pInfo2 = planets[aspect.p2];
                if (!pInfo1 || !pInfo2) return null;

                const pos1 = getPos(pInfo1.lon, R_PLANETS * 0.82);
                const pos2 = getPos(pInfo2.lon, R_PLANETS * 0.82);

                return (
                    <line
                        key={i}
                        x1={pos1.x} y1={pos1.y}
                        x2={pos2.x} y2={pos2.y}
                        stroke={ASPECT_COLORS[aspect.type] || "#ffffff"}
                        strokeWidth={aspect.orb < 2 ? 1.5 : 0.8}
                        opacity={aspect.orb < 3 ? 0.8 : 0.4}
                    />
                );
            })}

            {Object.entries(planets).map(([name, info]) => {
                const glyph = PLANET_GLYPHS[name];
                if (!glyph) return null;

                const pos = getPos(info.lon, R_PLANETS);

                return (
                    <g key={name} className="cursor-pointer hover:opacity-80 transition-opacity">
                        <line
                            x1={CENTER} y1={CENTER}
                            x2={pos.x} y2={pos.y}
                            stroke={PLANET_COLORS[name]}
                            strokeWidth="0.5"
                            opacity="0.15"
                        />
                        <circle
                            cx={pos.x}
                            cy={pos.y}
                            r="14"
                            fill="#0B101B"
                            stroke={PLANET_COLORS[name]}
                            strokeWidth="1.5"
                        />
                        <text
                            x={pos.x}
                            y={pos.y}
                            fill={PLANET_COLORS[name]}
                            fontSize="16"
                            textAnchor="middle"
                            dominantBaseline="central"
                            filter="url(#glow)"
                        >
                            {glyph}
                        </text>
                        {info.isRetrograde && (
                            <text
                                x={pos.x + 10}
                                y={pos.y - 8}
                                fill="#fb7185"
                                fontSize="8"
                                fontWeight="bold"
                            >
                                Rx
                            </text>
                        )}
                    </g>
                );
            })}

            <circle cx={CENTER} cy={CENTER} r="3" fill="#64748B" />
        </svg>
    );
};

export default AstralChart;
