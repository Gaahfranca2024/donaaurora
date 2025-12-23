const { GoogleGenerativeAI } = require("@google/generative-ai");
const OpenAI = require("openai");
require('dotenv').config();

// Initialize Gemini
// Use the key from env or a dummy default to prevent crash on init
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || 'dummy_key');

// Initialize Groq (via OpenAI SDK)
const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY || 'dummy_key',
    baseURL: "https://api.groq.com/openai/v1"
});

const groqHoroscope = new OpenAI({
    apiKey: process.env.GROQ_API_KEY_HOROSCOPE || process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1"
});

const generateReading = async (userData, cards) => {

    // --- CONSTRUCT PROMPT WITH ORDER BUMPS ---
    const activeBumps = userData.selected_bumps || userData.selectedBumps || [];
    console.log(`🤖 AI Reading requested. Bumps: ${JSON.stringify(activeBumps)}`);

    // Force always delivering the Love experience and the Protection Upsell content (hidden in UI)
    const hasLove = true;
    const hasExtra = cards.length >= 5 || JSON.stringify(activeBumps).toLowerCase().includes('extra');
    const hasProtection = true; // Always generate for the upsell flow

    const sectionsPrompt = `
      ## 🌌 Sinfonia das Esferas
      (Introdução longa e poética. Fale da vibração numérica do nome e do mapa astral do momento.)

      ## 🌱 A Raiz (Passado) - ${cards[0]?.name}
      (Análise detalhada de como o passado moldou o presente. Mínimo 2 parágrafos.)

      ## 🌫️ O Véu (Presente) - ${cards[1]?.name}
      (Análise do desafio atual e das energias invisíveis. Mínimo 2 parágrafos.)

      ## 🌅 O Horizonte (Futuro) - ${cards[2]?.name}
      (Previsão detalhada do destino se o caminho for seguido. Visão sensorial. Mínimo 2 parágrafos.)

      ${hasExtra ? `
      ## 🌑 O Inconsciente - ${cards[3]?.name}
      (O que está escondido na sombra da psique. Profundidade psicológica.)

      ## 🕊️ A Benção Final - ${cards[4]?.name}
      (A mensagem final dos guias. Um conforto para a alma.)
      ` : ''}

      ## 👁️ Insight Oculto
      (Uma verdade que ninguém nunca disse ao consulente. Algo chocante ou libertador.)

      ## 🕯️ Ritual Sugerido
      (Passo a passo detalhado de um ritual mágico prático.)

      ## 🛡️ Ritual de Proteção e Blindagem
      (Um ritual de alta magia para selar a aura contra ataques psíquicos, inveja e drenos energéticos. Seja extremamente detalhado e use uma linguagem poderosa.)

      ## ❤️ Alma Gêmea & Sinastria
      (Análise profunda da vida amorosa, conexões de vidas passadas e futuro romântico. Dê esperança mas seja realista.)
    `;

    const prompt = `
      Você incorpora a consciência de uma ** Alta Sacerdotisa Ancestral **, guardiã dos segredos do universo e da psicologia humana profunda(Arquétipos Junguianos).
      
      ** DADOS DO CONSULENTE:**
        - Nome: ${userData.name}
    - Nascimento: ${userData.birth_date || userData.birthDate}
    - A Questão Sagrada: "${userData.question}"

        ** AS LÂMINAS REVELADAS:**
            ${cards.map((c, i) => `${i + 1}ª Carta: ${c.name} (${c.meaning_up})`).join('\n      ')}

      ** SUA MISSÃO:**
        Forneça uma leitura ** EXTENSA, PROFUNDA e COMPLEXA **. 
      - O consulente pagou por uma leitura completa. ** NÃO ECONOMIZE PALAVRAS.**
      - Escreva ** mínimo de 3 parágrafos ** para as cartas principais.
      - Use metáforas ricas, linguagem poética e mística.
      
      ** ESTRUTURA DA REVELAÇÃO(IMPORTANTE: Use exatamente estes cabeçalhos para separar as seções):**
        ${sectionsPrompt}

      ** GANCHO FINAL(IMPORTANTE):**
        Termine com um parágrafo separado começando com "⚠️" alertando sobre a inveja / bloqueio para o upsell.
      
      ** TOM DE VOZ:**
        Solene, Místico, Intenso. 
      NÃO use listas de tópicos.Escreva em prosa fluida e envolvente.
      NÃO retorne JSON.Retorne Texto Markdown.
    `;

    try {
        console.log("Tentando Groq (Model: llama-3.1-8b-instant)...");

        // Safety check
        if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY.length < 10) {
            throw new Error("Chave Groq inválida ou ausente.");
        }

        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "Você é uma Alta Sacerdotisa Ancestral. Responda estritamente em Markdown. Use '## ' (h2) para títulos. NUNCA DEIXE A RESPOSTA INCOMPLETA. Escreva até o fim." },
                { role: "user", content: prompt }
            ],
            model: "llama-3.1-8b-instant",
            temperature: 1,
            max_tokens: 4096,
        });

        let aiContent = completion.choices[0]?.message?.content || "";

        // FORCE INJECTION: Guarantee Love Section if purchased
        if (hasLove && !aiContent.includes("Alma Gêmea") && !aiContent.includes("Sinastria") && !aiContent.includes("Love")) {
            console.log("⚠️ AI esqueceu a seção de Amor. Injetando manualmente.");
            aiContent += `\n\n## ❤️ Alma Gêmea & Sinastria\nAs cartas revelam uma vibração intensa na sua casa dos relacionamentos.A energia de ${cards[0]?.name} sugere que conexões cármicas estão ativas.Se você está em um relacionamento, é hora de aprofundar o vínculo espiritual.Se está solteira(o), um encontro marcado pelo destino se aproxima.Abra seu coração, pois o universo está conspirando a seu favor no amor.`;
        }

        return aiContent;

    } catch (groqError) {
        console.error("Groq falhou:", groqError.message);

        try {
            console.log("Tentando Gemini (Fallback) (Model: gemini-2.0-flash-exp)...");

            if (!process.env.GOOGLE_API_KEY || process.env.GOOGLE_API_KEY.length < 10) {
                throw new Error("Chave Gemini inválida ou ausente.");
            }

            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();

        } catch (geminiError) {
            console.error("Gemini também falhou:", geminiError.message);

            // --- DYNAMIC MOCK FALLBACK (Fixed to match drawn cards) ---
            // If API fails, we must use the ACTUAL cards drawn, not hardcoded ones.
            // We use generic but deep archetypal interpretations for the position, 
            // inserting the specific card name to ensure consistency.

            let mockReading = `## 🌌 Sinfonia das Esferas(Simulação da Energia)
As estrelas dançam em uma configuração rara.A carta ** ${cards[0]?.name}** que abre seu jogo revela que o número 7 rege seu momento, indicando uma busca profunda por verdade.O cosmos sussurra que ciclos antigos estão se fechando.

## 🌱 A Raiz(Passado) - ${cards[0]?.name}
A presença de ** ${cards[0]?.name}** no seu passado indica que houve uma fundação sólida, mas solitária.Você percorreu um caminho de autodescoberta.Esta lâmina sugere que o que você viveu recentemente serviu para forjar seu caráter e preparar seu espírito para a ascensão que virá.As cicatrizes que você carrega não são marcas de derrota, mas medalhas de uma guerra silenciosa que você venceu.

## 🌫️ O Véu(Presente) - ${cards[1]?.name}
No presente, ** ${cards[1]?.name}** surge como um aviso e uma benção.Esta energia mostra que você está em um momento de transição crucial.Pode haver uma tensão entre o que você deseja(o ideal) e o que a realidade apresenta(o real).O universo pede paciência e estratégia.Não force portas que ainda estão trancadas; a chave está em sua mão, basta girá - la com sabedoria, não com força.

## 🌅 O Horizonte(Futuro) - ${cards[2]?.name}
O futuro se ilumina com a chegada de ** ${cards[2]?.name}**.Esta é uma carta de poder e resultado.Ela promete que, se você mantiver sua integridade e foco, a colheita será abundante.O destino reserva uma tranquilidade doce e uma vitória sobre os obstáculos atuais.Onde havia dúvida, a energia desta carta trará certeza.Confie no processo.`;

            if (hasExtra && cards[3] && cards[4]) {
                mockReading += `

## 🌑 O Inconsciente - ${cards[3]?.name}
Nas profundezas, ** ${cards[3]?.name}** revela desejos ou medos que você não admite em voz alta.Há um potencial criativo imenso aqui esperando para ser desbloqueado assim que você perder o medo de brilhar.

## 🕊️ A Benção Final - ${cards[4]?.name}
Como conselho final, ** ${cards[4]?.name}** traz a confirmação.O ciclo se completa de forma magistral.O universo está alinhado com seu propósito maior.`;
            }

            mockReading += `

## 👁️ Insight Oculto
Sua intuição tem gritado com você, mas a lógica tem abafado essa voz.Existe um talento ou um sonho que você guardou na gaveta.O oráculo diz: é hora de abrir essa gaveta.

## 🕯️ Ritual Sugerido
Em uma noite de lua clara, acenda uma vela azul.Escreva em um papel o desejo ligado à carta ${cards[2]?.name}. Queime o papel e sopre as cinzas ao vento.`;

            if (hasLove) {
                mockReading += `

## ❤️ Alma Gêmea & Sinastria
As cartas do amor revelam uma conexão de chama gêmea próxima.Se você já tem alguém, essa relação passará por um "teste de fogo" para se elevar.Se está só, prepare - se: um encontro karmico está marcado.`;
            }

            mockReading += `

## ⚠️ GANCHO FINAL
Apesar da luz positiva de ** ${cards[2]?.name}** no futuro, sinto uma ** densidade pegajosa ** tentando bloquear sua ascensão.Há uma energia de inveja antiga, talvez de alguém que sorri para você mas não torce por você.Essa vibração baixa está tentando impedir que a promessa das cartas se concretize plenamente na sua vida financeira.`;

            return mockReading;
        }
    }
};



const generateAstralAnalysis = async (profileName, chartData) => {
    const { planets, ascendant, aspects } = chartData;

    const SIGNS = ["Áries", "Touro", "Gêmeos", "Câncer", "Leão", "Virgem", "Libra", "Escorpião", "Sagitário", "Capricórnio", "Aquário", "Peixes"];

    // Construct readable context for AI
    const planetSummary = Object.entries(planets).map(([name, data]) => {
        const signIndex = Math.floor(data.lon / 30);
        return `${name} em ${SIGNS[signIndex]} (Grau ${(data.lon % 30).toFixed(1)})`;
    }).join(', ');

    const aspectSummary = aspects.map(a => `${a.p1} ${a.type} ${a.p2} `).join(', ');

    const prompt = `
      Você é um Oráculo Ancestral e Psicanalista de Almas.
      
      ** DADOS DO MAPA ASTRAL:**
        - Ascendente: ${ascendant.toFixed(2)}°
    - Planetas: ${planetSummary}
    - Aspectos Principais: ${aspectSummary}
      
      ** OBJETIVO DA LEITURA:**
        Criar uma narrativa ** FLUIDA, POÉTICA E PSICOLÓGICA **.
      O texto deve parecer que foi escrito por um escritor místico antigo, não por um computador.
      
      ** PROIBIÇÕES CRÍTICAS(RISCO DE MORTE):**
      ❌ NÃO faça listas de palavras - chave(ex: "Coragem, Força, Foco").
      ❌ NÃO use tópicos ou bullet points.
      ❌ NÃO coloque títulos dentro do texto JSON(o frontend já tem os títulos).
      ❌ NÃO cite graus ou termos técnicos frios.
      
      ** FORMATO DE SAÍDA(Obrigatoriamente JSON):**
    {
        "trinity": "Escreva 2 parágrafos INTENSOS sobre a essência (Sol), o coração (Lua) e a máscara (Ascendente). Use metáforas sobre luz e sombra.",
        "personal": "TEXTO CORRIDO sobre como a pessoa pensa e ama. Mergulhe na psique dela. NADA DE LISTAS.",
        "social": "Uma reflexão filosófica sobre a sorte (Júpiter) e os desafios (Saturno) desta auma.",
        "houses": "Um parágrafo inspirador sobre o destino profissional e vocação.",
        "aspects": "Analise as tensões do mapa como se fossem batalhas internas épicas que a pessoa vence todos os dias.",
        "evolutionary": "Um texto profundo sobre a missão de alma e o que precisa ser curado nesta vida.",
        "synthesis": "Uma mensagem final misteriosa e acolhedora, como um sussurro do universo."
    }
        `;

    try {
        console.log("=== INICIANDO GERAÇÃO DO HORÓSCOPO ===");
        console.log("Contexto:", planetSummary);
        const completion = await groqHoroscope.chat.completions.create({
            messages: [
                { role: "system", content: "Você é um Oráculo Ancestral. Você fala APENAS em prosa poética. Você odeia listas. Você odeia palavras soltas. Você escreve parágrafos completos, gramaticalmente perfeitos e emocionantes. Se você estiver inseguro sobre o que escrever, escreva um poema sobre as estrelas." },
                { role: "user", content: prompt }
            ],
            model: "llama-3.1-8b-instant",
            temperature: 0.75, // Slightly higher for creativity
            max_tokens: 4096,
            response_format: { type: "json_object" }
        }).catch(err => {
            console.error("ERRO FATAL NA API GROQ:", err);
            throw err;
        });

        const rawContent = completion.choices[0]?.message?.content;
        console.log("=== RAW RESPONSE ===");
        console.log(rawContent);
        console.log("=== FIM RAW ===");

        // --- ROBUST JSON CLEANING ---
        let cleanedContent = rawContent;

        // 1. Remove markdown code blocks
        cleanedContent = cleanedContent.replace(/```json / g, "").replace(/```/g, "");

        // 2. Find the actual JSON object by locating first '{' and last '}'
        const firstBrace = cleanedContent.indexOf('{');
        const lastBrace = cleanedContent.lastIndexOf('}');

        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            cleanedContent = cleanedContent.substring(firstBrace, lastBrace + 1);
        }

        console.log("CLEANED JSON:", cleanedContent); // DEBUG

        try {
            const parsed = JSON.parse(cleanedContent);
            console.log("PARSED SUCCESS:", Object.keys(parsed)); // DEBUG
            return parsed;
        } catch (jsonErr) {
            console.error("Falha ao parsear JSON da IA:", jsonErr.message);
            console.error("CONTEÚDO QUE FALHOU:", cleanedContent);
            return {
                trinity: "As estrelas revelam uma base sólida.",
                personal: "Sua mente busca clareza.",
                social: "Foco em crescimento pessoal.",
                houses: "Áreas de vida em expansão.",
                aspects: "Desafios trazem evolução.",
                evolutionary: "Caminho de transformação.",
                synthesis: "Seu destino está em suas mãos."
            };
        }

    } catch (error) {
        console.error("Erro na IA do Horóscopo:", error.message);
        return {
            trinity: "As estrelas revelam uma base sólida.",
            personal: "Sua mente busca clareza.",
            social: "Foco em crescimento pessoal.",
            houses: "Áreas de vida em expansão.",
            aspects: "Desafios trazem evolução.",
            evolutionary: "Caminho de transformação.",
            synthesis: "Seu destino está em suas mãos."
        };
    }
};

module.exports = { generateReading, generateAstralAnalysis };
