import express from "express";
import multer from "multer";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import { InferenceClient } from "@huggingface/inference";
dotenv.config();

const app = express();
const upload = multer();

app.use(cors());

const client = new InferenceClient(process.env.HF_TOKEN);

app.post("/api/analyze-call", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    // Transcripting with Deepgram
    let transcript = "";
    try {
      const dgRes = await axios.post(
        "https://api.deepgram.com/v1/listen",
        req.file.buffer,
        {
          headers: {
            Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
            "Content-Type": req.file.mimetype,
          },
          params: { punctuate: true, language: "en" },
        }
      );
      transcript = dgRes.data.results.channels[0].alternatives[0].transcript;
      if (!transcript) {
        return res.status(500).json({ error: "Transcription failed", raw: dgRes.data });
      }
    } catch (err) {
      console.error("Transcription error:", err.response?.data || err.message || err);
      return res.status(500).json({ error: "Transcription API call failed", details: err.response?.data || err.message || err });
    }

    // Analyizing with Groq Llama 3
    const parameters = [
      { key: "greeting", weight: 5, inputType: "PASS_FAIL" },
      { key: "collectionUrgency", weight: 15, inputType: "SCORE" },
      { key: "rebuttalCustomerHandling", weight: 15, inputType: "SCORE" },
      { key: "callEtiquette", weight: 15, inputType: "SCORE" },
      { key: "callDisclaimer", weight: 5, inputType: "PASS_FAIL" },
      { key: "correctDisposition", weight: 10, inputType: "PASS_FAIL" },
      { key: "callClosing", weight: 5, inputType: "PASS_FAIL" },
      { key: "fatalIdentification", weight: 5, inputType: "PASS_FAIL" },
      { key: "fatalTapeDiscloser", weight: 10, inputType: "PASS_FAIL" },
      { key: "fatalToneLanguage", weight: 15, inputType: "PASS_FAIL" }
    ];

    const prompt = `You are a call evaluator. Analyze the following transcript and ONLY return a valid JSON object (no explanation, no markdown, no extra text):

"${transcript}"

Evaluate it based on these parameters:
${JSON.stringify(parameters, null, 2)}

Return a JSON like:
{
  "scores": { ... },
  "overallFeedback": "...",
  "observation": "..."
}`;

    let generated = "";
    try {
      const groqRes = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: "llama3-8b-8192", 
          messages: [
            { role: "user", content: prompt }
          ]
        },
        {
          headers: {
            "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json"
          }
        }
      );
      generated = groqRes.data.choices[0].message.content || "";
      if (!generated) {
        return res.status(500).json({ error: "Groq Llama returned empty response", raw: groqRes.data });
      }
    } catch (err) {
      console.error("LLM error:", err.response?.data || err.message || err);
      return res.status(500).json({ error: "LLM API call failed", details: err.response?.data || err.message || err });
    }

    let feedback;
    try {
      const jsonMatch = generated.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return res.status(500).json({ error: "No JSON object found in model output", raw: generated });
      }
      feedback = JSON.parse(jsonMatch[0]);
    } catch (err) {
      console.error("JSON parse error:", err, generated);
      return res.status(500).json({ error: "Failed to parse JSON from Groq", raw: generated });
    }

    res.json(feedback);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
