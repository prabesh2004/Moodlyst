import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * AI Service Layer - Abstracted for easy provider switching
 * Currently uses: Google Gemini (Free API)
 * Can be swapped to: AWS Bedrock, SageMaker, OpenAI, etc.
 */

// Configuration - Change this to switch providers
const AI_PROVIDER = 'gemini'; // 'gemini' | 'bedrock' | 'openai' | 'sagemaker'

// ============================================
// PROVIDER: GOOGLE GEMINI (Current)
// ============================================

let geminiModel = null;

const initializeGemini = () => {
  if (geminiModel) return geminiModel; // Already initialized
  
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('VITE_GEMINI_API_KEY not found in .env file');
    }
    
    const genAI = new GoogleGenerativeAI(apiKey);
    geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    console.log('✅ Gemini AI initialized');
    return geminiModel;
  } catch (error) {
    console.error('❌ Failed to initialize Gemini:', error);
    throw error;
  }
};

/**
 * Generate mood insights using Gemini AI
 * @param {Array} moodLogs - Last 5 mood logs with score, checkInType, timestamp, note
 * @returns {Promise<Object>} - Insights object with summary, bestTime, suggestions
 */
const generateInsightsGemini = async (moodLogs) => {
  const model = initializeGemini();
  
  try {
    // Format mood data for AI
    const formattedData = moodLogs.map(log => ({
      score: log.moodScore,
      time: log.checkInType, // 'morning', 'evening', 'anytime'
      date: new Date(log.timestamp?.toDate?.() || log.timestamp).toLocaleDateString(),
      note: log.note || 'No note'
    }));

    const prompt = `
You are a compassionate mood analyst. Analyze this user's last 5 mood logs and provide insights.

Mood Data:
${JSON.stringify(formattedData, null, 2)}

Provide insights in VALID JSON format (no markdown, no code blocks, just pure JSON):
{
  "summary": "A brief 2-3 sentence summary of their recent mood patterns",
  "bestTime": "morning|evening|afternoon|consistent",
  "bestTimeExplanation": "Short explanation of when they feel best",
  "suggestions": [
    "Actionable suggestion 1",
    "Actionable suggestion 2",
    "Actionable suggestion 3"
  ],
  "emoji": "Choose one emoji that represents their overall mood trend"
}

Rules:
- Be warm, supportive, and human
- Make suggestions specific and actionable
- Keep summary under 50 words
- Analyze checkInType to determine bestTime
- Return ONLY the JSON object, no other text
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('🤖 Gemini response:', text);
    
    // Clean response (remove markdown if present)
    const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Parse JSON response
    const parsed = JSON.parse(cleanText);
    return parsed;
  } catch (error) {
    console.error('❌ Error generating insights with Gemini:', error);
    throw new Error('Failed to generate insights. Please try again.');
  }
};

// ============================================
// PROVIDER: AWS BEDROCK (Future)
// ============================================

const generateInsightsBedrock = async (moodLogs) => {
  // TODO: Implement when switching to Bedrock
  throw new Error('Bedrock provider not yet implemented');
};

// ============================================
// PROVIDER: OPENAI (Alternative)
// ============================================

const generateInsightsOpenAI = async (moodLogs) => {
  // TODO: Implement when switching to OpenAI
  throw new Error('OpenAI provider not yet implemented');
};

// ============================================
// MAIN EXPORT - Provider Agnostic Interface
// ============================================

/**
 * Generate AI-powered insights from mood logs
 * @param {Array} moodLogs - User's recent mood logs
 * @returns {Promise<Object>} - Insights object
 */
export const generateInsights = async (moodLogs) => {
  if (!moodLogs || moodLogs.length === 0) {
    throw new Error('No mood logs provided');
  }

  // Route to appropriate provider
  switch (AI_PROVIDER) {
    case 'gemini':
      return generateInsightsGemini(moodLogs);
    case 'bedrock':
      return generateInsightsBedrock(moodLogs);
    case 'openai':
      return generateInsightsOpenAI(moodLogs);
    default:
      throw new Error(`Unknown AI provider: ${AI_PROVIDER}`);
  }
};

/**
 * Check if AI service is properly configured
 * @returns {Object} - Status and provider info
 */
export const checkAIHealth = () => {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      return { 
        status: 'error', 
        provider: AI_PROVIDER,
        message: 'API key not found in .env file'
      };
    }
    
    return { 
      status: 'healthy', 
      provider: AI_PROVIDER,
      message: 'AI service ready'
    };
  } catch (error) {
    return { 
      status: 'error', 
      provider: AI_PROVIDER,
      message: error.message
    };
  }
};

export { AI_PROVIDER };
