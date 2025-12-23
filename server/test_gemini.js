const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function testModels() {
    const models = [
        "gemini-2.0-flash",
        "gemini-2.0-flash-lite-preview-02-05",
        "gemini-2.0-flash-exp",
        "gemini-1.5-flash",
        "gemini-1.5-flash-8b",
        "gemini-pro"
    ];

    console.log("Testing API Key:", process.env.GOOGLE_API_KEY ? "Present" : "Missing");

    for (const modelName of models) {
        process.stdout.write(`Testing ${modelName}... `);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Say 'Hello'");
            console.log(`✅ SUCCESS!`);
            // console.log(result.response.text());
        } catch (e) {
            console.log(`❌ Failed. (${e.message.split(']')[1]?.trim() || e.message})`);
        }
    }
}

testModels();
