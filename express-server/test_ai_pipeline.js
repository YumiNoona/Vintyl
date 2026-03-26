require("dotenv").config({ path: "../.env" });
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { OpenAI } = require("openai");
const ffmpegPath = require("ffmpeg-static");
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const withTimeout = (promise, ms = 15000) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), ms)
    ),
  ]);

async function testPipeline(forceFallback = false) {
    console.log(`--- Starting Test (Force Fallback: ${forceFallback}) ---`);
    let aiData = { transcript: "", title: "Untitled", summary: "" };
    
    // Mocking variables normally present in index.js
    const filename = "test_video.webm";
    const filePath = path.join(__dirname, "test_assets", filename);
    const audioPath = `${filePath}.mp3`;

    if (!fs.existsSync(filePath)) {
        console.error("❌ Test asset not found:", filePath);
        return;
    }

    const fileBuffer = fs.readFileSync(filePath);

    try {
        if (!forceFallback) {
            console.log("🤖 Attempting Gemini AI...");
            const base64Data = fileBuffer.toString("base64");
            const geminiPromise = model.generateContent([
                {
                    inlineData: {
                        data: base64Data,
                        mimeType: "video/webm",
                    },
                },
                "Transcribe this video accurately. Then provide a concise title and a 2-sentence summary. Respond ONLY in valid JSON format: { \"transcript\": \"...\", \"title\": \"...\", \"summary\": \"...\" }",
            ]);

            const result = await withTimeout(geminiPromise, 15000);
            const aiResponseText = result.response.text();
            const jsonMatch = aiResponseText.match(/\{[\s\S]*\}/);
            aiData = jsonMatch ? JSON.parse(jsonMatch[0]) : { transcript: "AI transcription failed", title: "Untitled", summary: "Failed to parse AI output." };
            console.log("✨ Gemini Enrichment Complete:", aiData.title);
        } else {
            throw new Error("Simulated Gemini Failure");
        }
    } catch (err) {
        console.log("⚠️ Gemini failed or timed out. Falling back to Groq...", err.message);
        
        try {
            console.log("🎙️ Extracting audio for Groq...");
            execSync(`"${ffmpegPath}" -i "${filePath}" -vn -acodec libmp3lame -ar 16000 -ac 1 "${audioPath}"`);

            console.log("🧠 Groq Whisper Transcription...");
            const transcription = await groq.audio.transcriptions.create({
                file: fs.createReadStream(audioPath),
                model: "whisper-large-v3",
            });
            
            aiData.transcript = transcription.text;
            console.log("📝 Transcript:", aiData.transcript);

            if (!aiData.transcript || aiData.transcript.trim().length < 10) {
                console.log("🔇 No usable audio detected.");
                aiData.title = "Screen recording (no audio)";
                aiData.summary = "This recording appears to contain only visual content. AI fallback cannot analyze visuals without audio.";
            } else {
                console.log("📝 Groq Llama Summarization...");
                const completion = await groq.chat.completions.create({
                    model: "llama-3.3-70b-versatile",
                    messages: [
                        {
                            role: "system",
                            content: "You are a professional video analyzer. Based on the transcript provided, generate a compelling title and a concise 2-sentence summary of the video. Respond ONLY in valid JSON format: { \"title\": \"...\", \"summary\": \"...\" }"
                        },
                        {
                            role: "user",
                            content: aiData.transcript
                        }
                    ],
                    response_format: { type: "json_object" }
                });

                const parsedGroq = JSON.parse(completion.choices[0].message.content);
                aiData.title = parsedGroq.title || "Untitled";
                aiData.summary = parsedGroq.summary || "No summary available.";
                console.log("✨ Groq Enrichment Complete:", aiData.title);
            }
        } catch (groqErr) {
            console.error("❌ Groq Fallback Error:", groqErr.message);
        } finally {
            if (fs.existsSync(audioPath)) {
                fs.unlinkSync(audioPath);
                console.log("🧹 Cleaned up temp audio.");
            }
        }
    }
    console.log("--- Test Finished ---");
}

// Run tests
(async () => {
    // await testPipeline(false); // Test Gemini
    await testPipeline(true);  // Test Groq Fallback
})();
