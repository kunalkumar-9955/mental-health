require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');
const axios = require('axios');

// ─── Clients ──────────────────────────────────────────────────────────────────
const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const GEMINI_MODEL = 'gemini-2.5-flash';

// ─── Gemini with retry on 429 ─────────────────────────────────────────────────
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const geminiGenerateWithRetry = async (model, prompt, retries = 2) => {
  for (let i = 0; i <= retries; i++) {
    try {
      return await model.generateContent(prompt);
    } catch (e) {
      const is429 = e.message?.includes('429') || e.message?.includes('quota');
      if (is429 && i < retries) {
        // Extract retry delay from error message if available
        const delayMatch = e.message?.match(/retry.*?(\d+)s/i);
        const waitMs = delayMatch ? parseInt(delayMatch[1]) * 1000 : (i + 1) * 3000;
        console.log(`Gemini 429 — waiting ${waitMs}ms before retry ${i + 1}...`);
        await sleep(Math.min(waitMs, 8000)); // cap at 8s
        continue;
      }
      throw e;
    }
  }
};

// ─── Crisis Keywords ──────────────────────────────────────────────────────────
const CRISIS_KEYWORDS = [
  'want to die', 'kill myself', 'end my life', 'suicide', 'suicidal',
  'nobody needs me', 'want to disappear', 'life is meaningless',
  'no reason to live', 'better off dead', "can't go on", 'cant go on',
  'give up on life', 'hurt myself', 'self harm', 'self-harm',
  'worthless', 'no point living', 'ending it all', 'final goodbye',
  'dont want to be here', "don't want to be here", 'wish i was dead'
];

// ─── Emotion Keyword Patterns ─────────────────────────────────────────────────
const EMOTION_PATTERNS = {
  sadness:   ['sad', 'crying', 'tears', 'cry', 'depressed', 'unhappy', 'miserable',
              'heartbroken', 'grief', 'sorrow', 'hopeless', 'empty', 'numb', 'broken'],
  anxiety:   ['anxious', 'anxiety', 'worried', 'worry', 'nervous', 'panic', 'fear',
              'scared', 'dread', 'overwhelmed', 'tense', 'uneasy', 'restless', 'phobia'],
  stress:    ['stressed', 'stress', 'pressure', 'burden', 'exhausted', 'burnout',
              'overloaded', 'deadline', 'exam', 'tired', 'drained', 'overwhelmed'],
  anger:     ['angry', 'anger', 'furious', 'rage', 'frustrated', 'frustration',
              'irritated', 'mad', 'annoyed', 'hate', 'furious', 'livid'],
  happiness: ['happy', 'happiness', 'joy', 'excited', 'grateful', 'wonderful',
              'amazing', 'great', 'fantastic', 'blessed', 'content', 'cheerful'],
  loneliness:['lonely', 'alone', 'isolated', 'no friends', 'nobody cares',
              'abandoned', 'left out', 'invisible', 'disconnected', 'unwanted'],
  fear:      ['afraid', 'terrified', 'scared', 'frightened', 'horror', 'dread',
              'phobia', 'nightmare', 'terror'],
  neutral:   []
};

// ─── Therapy System Prompts ───────────────────────────────────────────────────
const THERAPY_PROMPTS = {
  general: `You are MindCare AI, a compassionate and empathetic AI mental health companion. You provide emotional support, active listening, and evidence-based coping strategies. You speak warmly, ask thoughtful follow-up questions, and never give medical diagnoses. You remember context from the conversation and personalize your responses. Always validate feelings before offering advice. Keep responses concise (2-3 paragraphs max) and human-like.`,

  student_stress: `You are MindCare AI in Student Support Mode. You specialize in helping students with academic pressure, exam anxiety, time management, and study-life balance. Use encouraging language, practical study tips, and stress-relief techniques tailored for students. Be relatable and understanding.`,

  anxiety_relief: `You are MindCare AI in Anxiety Relief Mode. You guide users through anxiety with calming techniques, breathing exercises, grounding methods (5-4-3-2-1), and cognitive reframing. Speak slowly and soothingly. Validate their experience and help them feel safe. Use short, calming sentences.`,

  depression_support: `You are MindCare AI in Depression Support Mode. You provide gentle, non-judgmental support for those experiencing low mood or depression. Focus on small wins, behavioral activation, self-compassion, and connecting with life's meaning. Never minimize their pain. Be patient and warm.`,

  relationship: `You are MindCare AI in Relationship Support Mode. You help users navigate relationship challenges, communication issues, heartbreak, and interpersonal conflicts with empathy and practical guidance. Be non-judgmental and balanced.`,

  motivation: `You are MindCare AI in Motivation Mode. You inspire users with personalized encouragement, goal-setting strategies, and positive psychology techniques. Help them reconnect with their purpose and strengths. Be energetic but genuine.`,

  sleep_therapy: `You are MindCare AI in Sleep Therapy Mode. You help users improve sleep quality through sleep hygiene tips, relaxation techniques, bedtime routines, and addressing sleep anxiety. Be calm and soothing in tone.`,

  panic_attack: `You are MindCare AI in Panic Attack Support Mode. PRIORITY: Help the user feel safe RIGHT NOW. Guide them through immediate grounding and breathing. Use short, clear sentences. Be calm and reassuring. Say things like "You are safe. This will pass. I am here with you."`,

  meditation: `You are MindCare AI in Meditation Companion Mode. You guide users through mindfulness practices, meditation sessions, body scans, and present-moment awareness exercises. Use peaceful, flowing language. Be gentle and present.`
};

const BASE_GUIDELINES = `
IMPORTANT GUIDELINES:
- Never diagnose medical conditions or prescribe medication
- Always recommend professional help for serious mental health issues
- Be warm, empathetic, and human-like — avoid robotic responses
- Ask one thoughtful follow-up question per response
- Validate emotions before offering solutions
- Keep responses to 2-4 paragraphs maximum
- Reference previous conversation context when relevant
- Never provide harmful advice of any kind`;

// ─── Crisis Detection ─────────────────────────────────────────────────────────
const detectCrisis = (message) => {
  const lower = message.toLowerCase();
  const triggered = CRISIS_KEYWORDS.filter(kw => lower.includes(kw));
  if (triggered.length === 0) return { isCrisis: false, severity: 'none', triggers: [] };
  // critical = 2+ triggers, high = 1 trigger with strong keywords, medium = 1 trigger
  const strongKeywords = ['suicide', 'suicidal', 'kill myself', 'end my life', 'want to die'];
  const hasStrong = triggered.some(kw => strongKeywords.includes(kw));
  let severity;
  if (triggered.length >= 2 || (triggered.length >= 1 && hasStrong && lower.includes('and'))) {
    severity = 'critical';
  } else if (hasStrong) {
    severity = 'high';
  } else {
    severity = 'medium';
  }
  return { isCrisis: true, severity, triggers: triggered };
};

// ─── Local Emotion Analysis (no external API needed) ─────────────────────────
const analyzeEmotion = (text) => {
  const lower = text.toLowerCase();
  const scores = {};

  for (const [emotion, keywords] of Object.entries(EMOTION_PATTERNS)) {
    if (emotion === 'neutral') continue;
    const matches = keywords.filter(kw => lower.includes(kw));
    scores[emotion] = Math.min(matches.length * 20, 100);
  }

  const entries = Object.entries(scores).filter(([, v]) => v > 0);
  if (entries.length === 0) {
    return {
      detected: 'neutral', score: 0, intensity: 'low',
      breakdown: { sadness: 0, anxiety: 0, stress: 0, anger: 0, happiness: 0, neutral: 100 }
    };
  }

  const dominant = entries.reduce((a, b) => a[1] > b[1] ? a : b);
  const total = Object.values(scores).reduce((a, b) => a + b, 0);

  return {
    detected: dominant[0],
    score: dominant[1],
    intensity: dominant[1] > 60 ? 'high' : dominant[1] > 30 ? 'medium' : 'low',
    breakdown: {
      sadness:   scores.sadness   || 0,
      anxiety:   scores.anxiety   || 0,
      stress:    scores.stress    || 0,
      anger:     scores.anger     || 0,
      happiness: scores.happiness || 0,
      neutral:   Math.max(0, 100 - total)
    }
  };
};

// ─── HuggingFace Emotion (uses router endpoint — requires inference.serverless.write) ─
const analyzeEmotionHuggingFace = async (text) => {
  if (!process.env.HUGGINGFACE_API_KEY) return null;
  try {
    const res = await axios.post(
      'https://router.huggingface.co/hf-inference/models/j-hartmann/emotion-english-distilroberta-base',
      { inputs: text },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    // Response is [[{label, score}, ...]] — nested array
    const raw = res.data;
    const items = Array.isArray(raw[0]) ? raw[0] : Array.isArray(raw) ? raw : null;
    if (!items) return null;

    const sorted = [...items].sort((a, b) => b.score - a.score);
    const top = sorted[0];

    const labelMap = {
      joy: 'happiness', sadness: 'sadness', anger: 'anger',
      fear: 'anxiety', disgust: 'stress', surprise: 'neutral', neutral: 'neutral'
    };

    return {
      detected: labelMap[top.label] || top.label,
      score: Math.round(top.score * 100),
      intensity: top.score > 0.7 ? 'high' : top.score > 0.4 ? 'medium' : 'low',
      breakdown: Object.fromEntries(
        sorted.map(e => [labelMap[e.label] || e.label, Math.round(e.score * 100)])
      ),
      source: 'huggingface'
    };
  } catch (e) {
    console.error('HuggingFace error:', e.response?.status || e.message);
  }
  return null;
};

// ─── Smart Emotion Analysis: HuggingFace → Gemini → Local fallback ───────────
const analyzeEmotionSmart = async (text) => {
  // 1st choice: HuggingFace (dedicated emotion model, most accurate)
  const hfResult = await analyzeEmotionHuggingFace(text);
  if (hfResult) return hfResult;
  // 2nd choice: Gemini AI analysis
  const geminiResult = await analyzeEmotionWithGemini(text);
  if (geminiResult?.source === 'gemini') return geminiResult;
  // Final fallback: local keyword matching
  return { ...analyzeEmotion(text), source: 'local' };
};

// ─── Generate AI Response via Gemini ─────────────────────────────────────────
const generateAIResponse = async (messages, therapyMode = 'general', userMemory = {}) => {
  const systemPrompt = THERAPY_PROMPTS[therapyMode] || THERAPY_PROMPTS.general;

  let memoryContext = '';
  if (userMemory.stressTriggers?.length > 0)
    memoryContext += `\nUser's known stress triggers: ${userMemory.stressTriggers.join(', ')}.`;
  if (userMemory.calmingMethods?.length > 0)
    memoryContext += `\nUser's preferred calming methods: ${userMemory.calmingMethods.join(', ')}.`;
  if (userMemory.recurringPatterns?.length > 0)
    memoryContext += `\nRecurring emotional patterns noticed: ${userMemory.recurringPatterns.join(', ')}.`;

  const fullSystem = systemPrompt + memoryContext + BASE_GUIDELINES;

  // Try Gemini first
  try {
    const model = gemini.getGenerativeModel({
      model: GEMINI_MODEL,
      systemInstruction: fullSystem
    });

    // Build Gemini chat history (all except last user message)
    const history = [];
    const recentMessages = messages.slice(-10);

    for (let i = 0; i < recentMessages.length - 1; i++) {
      const m = recentMessages[i];
      if (m.role === 'user' || m.role === 'assistant') {
        history.push({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        });
      }
    }

    const lastMessage = recentMessages[recentMessages.length - 1];
    const chat = model.startChat({ history });
    const result = await geminiGenerateWithRetry(
      { generateContent: (msg) => chat.sendMessage(msg) },
      lastMessage?.content || ''
    );
    return result.response.text();

  } catch (geminiError) {
    console.error('Gemini error:', geminiError.message);

    // Fallback to OpenAI if Gemini fails
    try {
      const response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: fullSystem },
          ...messages.slice(-8).map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }))
        ],
        max_tokens: 500,
        temperature: 0.8
      });
      return response.choices[0].message.content;
    } catch (openaiError) {
      console.error('OpenAI fallback error:', openaiError.message);
      // Final local fallback
      return generateFallbackResponse(messages[messages.length - 1]?.content || '');
    }
  }
};

// ─── Local Fallback Responses ─────────────────────────────────────────────────
const generateFallbackResponse = (userMessage) => {
  const emotion = analyzeEmotion(userMessage);
  const responses = {
    sadness:   "I can hear that you're going through a really difficult time right now, and I want you to know that your feelings are completely valid. It takes real courage to express what you're feeling. Would you like to tell me more about what's been weighing on your heart? I'm here to listen without judgment.",
    anxiety:   "I can sense the anxiety in your words, and I want you to know you're not alone in this. Let's take this one breath at a time — try breathing in slowly for 4 counts, then out for 4 counts. Can you tell me more about what's been triggering these feelings? Understanding them is the first step.",
    stress:    "It sounds like you're carrying a really heavy load right now. Stress can feel completely overwhelming, but you don't have to face it alone. What's been the biggest source of pressure for you lately? Sometimes just naming it can help.",
    anger:     "I can feel the frustration in what you're sharing, and those feelings make complete sense. Anger is often a signal that something important to us has been affected. What's been going on? I'd like to understand better.",
    happiness: "It's genuinely wonderful to hear some positivity from you! Celebrating good moments is so important for our overall wellbeing. I'd love to hear more about what's bringing you joy right now.",
    loneliness:"Feeling lonely can be one of the most painful experiences, and I want you to know that right now, in this moment, you're not alone — I'm here with you. Would you like to talk about what's been making you feel this way?",
    fear:      "It sounds like you're feeling really scared right now, and that's completely understandable. Fear is our mind's way of trying to protect us. Can you tell me more about what's frightening you? You're safe here.",
    neutral:   "Thank you for reaching out — that itself takes courage. I'm here to listen and support you through whatever you're experiencing. How are you really feeling today? There's no right or wrong answer."
  };
  return responses[emotion.detected] || responses.neutral;
};

// ─── Crisis Response ──────────────────────────────────────────────────────────
const generateCrisisResponse = (severity) => {
  const responses = {
    critical: `I'm deeply concerned about what you've shared, and I need you to know — your life has immense value and you matter deeply. Please reach out to a crisis helpline right now:

🆘 **iCall (India):** 9152987821
🆘 **Vandrevala Foundation:** 1860-2662-345 (24/7)
🆘 **AASRA:** 9820466627 (24/7)
🆘 **International:** befrienders.org

You are not alone in this. Would you like me to guide you through a calming breathing exercise right now, together?`,

    high: `I hear you, and what you're feeling is real and valid — but I'm concerned about your safety. Please know that help is available right now.

💙 **iCall:** 9152987821
💙 **Vandrevala Foundation:** 1860-2662-345

I'm right here with you. Can we try a grounding exercise together? Take one slow, deep breath with me — in for 4 counts, out for 4 counts. I'm not going anywhere.`,

    medium: `I notice you're going through something really painful right now, and I want you to know that your feelings matter deeply.

If you're having thoughts of harming yourself, please reach out to **iCall at 9152987821** — they're available and ready to help.

I'm here to listen. Would you like to tell me more about what's been happening? You don't have to face this alone.`
  };
  return responses[severity] || responses.medium;
};

// ─── Motivational Quote ───────────────────────────────────────────────────────
const generateMotivationalQuote = async () => {
  const staticQuotes = [
    { text: "You don't have to be positive all the time. It's perfectly okay to feel sad, angry, annoyed, frustrated, scared, or anxious.", author: "Lori Deschene" },
    { text: "Mental health is not a destination, but a process. It's about how you drive, not where you're going.", author: "Noam Shpancer" },
    { text: "You are allowed to be both a masterpiece and a work in progress simultaneously.", author: "Sophia Bush" },
    { text: "Healing is not linear. Be patient with yourself.", author: "Unknown" },
    { text: "Your present circumstances don't determine where you can go; they merely determine where you start.", author: "Nido Qubein" },
    { text: "It's okay to not be okay, as long as you don't give up.", author: "Unknown" },
    { text: "The strongest people are not those who show strength in front of us, but those who win battles we know nothing about.", author: "Unknown" },
    { text: "You survived 100% of your worst days. You're doing better than you think.", author: "Unknown" },
    { text: "Self-care is not selfish. You cannot serve from an empty vessel.", author: "Eleanor Brown" },
    { text: "Be gentle with yourself. You are a child of the universe, no less than the trees and the stars.", author: "Max Ehrmann" },
    { text: "Recovery is not one and done. It is a lifelong journey that takes place one day, one step at a time.", author: "Unknown" },
    { text: "You don't have to control your thoughts. You just have to stop letting them control you.", author: "Dan Millman" }
  ];

  // Try to get a fresh quote from Gemini
  try {
    const model = gemini.getGenerativeModel({ model: GEMINI_MODEL });
    const result = await geminiGenerateWithRetry(model,
      'Generate one short, original, deeply comforting mental health quote (max 25 words). Reply in JSON format: {"text": "...", "author": "MindCare AI"}'
    );
    const raw = result.response.text().trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.text) return parsed;
    }
  } catch (e) {
    // Use static quotes as fallback
  }

  return staticQuotes[Math.floor(Math.random() * staticQuotes.length)];
};

// ─── Voice Transcription via Whisper ─────────────────────────────────────────
const transcribeVoice = async (audioBuffer, mimeType = 'audio/webm') => {
  try {
    const { Readable } = require('stream');
    const stream = Readable.from(audioBuffer);
    stream.path = `audio.${mimeType.split('/')[1] || 'webm'}`;

    const response = await openai.audio.transcriptions.create({
      file: stream,
      model: 'whisper-1',
      language: 'en'
    });
    return { success: true, text: response.text };
  } catch (error) {
    console.error('Whisper transcription error:', error.message);
    return { success: false, text: '', error: error.message };
  }
};

// ─── Gemini Emotion Analysis — tries HF first, then Gemini, then local ───────
const analyzeEmotionWithGemini = async (text) => {
  // Try HuggingFace first (dedicated emotion model)
  const hfResult = await analyzeEmotionHuggingFace(text);
  if (hfResult) return hfResult;

  // Try Gemini
  try {
    const model = gemini.getGenerativeModel({ model: GEMINI_MODEL });
    const prompt = `Analyze the emotion in this text and respond ONLY with valid JSON (no markdown):
Text: "${text.slice(0, 300)}"
JSON format: {"detected":"sadness|anxiety|stress|anger|happiness|loneliness|neutral","score":0-100,"intensity":"low|medium|high","breakdown":{"sadness":0-100,"anxiety":0-100,"stress":0-100,"anger":0-100,"happiness":0-100,"neutral":0-100}}`;

    const result = await geminiGenerateWithRetry(model, prompt);
    const raw = result.response.text().trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return { ...parsed, source: 'gemini' };
    }
  } catch (e) {
    // Fall back to local
  }
  return { ...analyzeEmotion(text), source: 'local' };
};

module.exports = {
  detectCrisis,
  analyzeEmotion,
  analyzeEmotionSmart,
  analyzeEmotionWithGemini,
  generateAIResponse,
  generateFallbackResponse,
  generateCrisisResponse,
  generateMotivationalQuote,
  transcribeVoice,
  CRISIS_KEYWORDS
};
