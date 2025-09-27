require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('./config');

// Initialize Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(config.gemini.apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

// Function to detect if text contains non-English characters OR Romanized languages
function containsNonEnglish(text) {
  // English characters, numbers, common punctuation
  const englishRegex = /^[a-zA-Z0-9\s.,!?;:'"()-]+$/;
  const isOnlyEnglishChars = englishRegex.test(text.trim());
  
  // If it's only English characters, check for Romanized Indian languages
  if (isOnlyEnglishChars) {
    return isRomanizedIndian(text);
  }
  
  return !isOnlyEnglishChars;
}

// Function to detect Romanized Indian languages (Hindi/Urdu written in English letters)
function isRomanizedIndian(text) {
  const words = text.toLowerCase().split(/\s+/);
  
  // Common Hindi/Urdu words in Roman script
  const hindiUrduWords = [
    // Common words
    'ko', 'ke', 'ka', 'ki', 'se', 'mein', 'par', 'aur', 'ya', 'toh',
    'hai', 'hain', 'tha', 'thi', 'the', 'raha', 'rahi', 'rahe',
    'kya', 'kyun', 'kab', 'kaise', 'kahan', 'kitna', 'kitni',
    'main', 'tum', 'aap', 'woh', 'yeh', 'uska', 'uski', 'unka',
    'mere', 'tere', 'hamare', 'aapke', 'unke', 'uske',
    'bilkul', 'zaroor', 'shayad', 'phir', 'fir', 'tab', 'ab',
    
    // Common nouns/verbs
    'khana', 'peena', 'sona', 'chalna', 'aana', 'jana', 'karna',
    'dekha', 'sunna', 'bola', 'liya', 'diya', 'kya', 'gaya',
    'ghar', 'kamra', 'kitab', 'paani', 'roti', 'daal', 'sabzi',
    'billi', 'kutta', 'gaay', 'murga', 'machli', 'phool', 'ped',
    
    // Numbers in Hindi
    'ek', 'do', 'teen', 'char', 'paanch', 'chhe', 'saat', 'aath', 'nau', 'dus'
  ];
  
  // Check if any words match Hindi/Urdu patterns
  const matches = words.filter(word => hindiUrduWords.includes(word));
  
  // If more than 30% of words are Hindi/Urdu, consider it Romanized Indian
  return matches.length > 0 && (matches.length / words.length) > 0.3;
}

// Function to detect specific language based on character sets
function detectLanguage(text) {
  if (!containsNonEnglish(text)) return null;

  // Check for Romanized Indian languages first
  if (isRomanizedIndian(text)) {
    return 'Romanized Hindi/Urdu';
  }

  // Arabic script (Arabic, Urdu, Persian, etc.)
  const arabicScriptRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  if (arabicScriptRegex.test(text)) {
    // Urdu-specific letters
    const urduSpecificRegex = /[\u06D2\u06C1\u06BE\u06AF\u0686\u0679\u0688\u0691\u06BA\u06CC]/;
    return urduSpecificRegex.test(text) ? 'Urdu' : 'Arabic';
  }

  // Devanagari script (Hindi, Sanskrit, etc.)
  const devanagariRegex = /[\u0900-\u097F]/;
  if (devanagariRegex.test(text)) {
    return 'Hindi';
  }

  // Cyrillic script (Russian, Bulgarian, etc.)
  const cyrillicRegex = /[\u0400-\u04FF]/;
  if (cyrillicRegex.test(text)) {
    return 'Russian';
  }

  // Chinese characters (Simplified/Traditional)
  const chineseRegex = /[\u4E00-\u9FFF]/;
  if (chineseRegex.test(text)) {
    return 'Chinese';
  }

  // Japanese characters
  const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF]/;
  if (japaneseRegex.test(text)) {
    return 'Japanese';
  }

  // Korean characters
  const koreanRegex = /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/;
  if (koreanRegex.test(text)) {
    return 'Korean';
  }

  // Thai script
  const thaiRegex = /[\u0E00-\u0E7F]/;
  if (thaiRegex.test(text)) {
    return 'Thai';
  }

  // Hebrew script
  const hebrewRegex = /[\u0590-\u05FF]/;
  if (hebrewRegex.test(text)) {
    return 'Hebrew';
  }

  // If we detect non-English but can't identify specific language
  return 'Unknown Language';
}

// Function to translate any language to English using Gemini with context (except Arabic)
async function translateToEnglish(text, detectedLanguage) {
  try {
    let prompt;
    
    // For Arabic, just provide simple translation without context
    if (detectedLanguage === 'Arabic') {
      prompt = `Translate the following Arabic text to English. Only provide the translation, no explanations or additional text: "${text}"`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const translation = response.text().trim();
      
      return { translation, context: null };
    } else {
      // For other languages, provide translation with context
      prompt = `Translate the following ${detectedLanguage} text to English and provide a brief context explanation.

Text: "${text}"

Please respond in this exact format:
TRANSLATION: [English translation here]
CONTEXT: [Brief explanation of what it means in context]

Only provide the translation and context, nothing else.`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const fullResponse = response.text().trim();
      
      // Parse the response to extract translation and context
      const translationMatch = fullResponse.match(/TRANSLATION:\s*(.+?)(?:\n|CONTEXT:)/s);
      const contextMatch = fullResponse.match(/CONTEXT:\s*(.+)/s);
      
      const translation = translationMatch ? translationMatch[1].trim() : fullResponse;
      const context = contextMatch ? contextMatch[1].trim() : null;
      
      return { translation, context };
    }
  } catch (error) {
    console.error('Translation error:', error);
    return null;
  }
}

// Event: Bot is ready
client.once('ready', () => {
  console.log(`🤖 ${client.user.tag} is online and ready to translate any language to English!`);
  console.log(`📡 Monitoring channel: ${config.targetChannelId}`);
});

// Event: Message received
client.on('messageCreate', async (message) => {
  // Ignore bot messages
  if (message.author.bot) return;
  
  // Check if message is in the target channel
  if (message.channel.id !== config.targetChannelId) return;
  
  // Check if message contains non-English text
  if (!containsNonEnglish(message.content)) return;
  
  const detectedLanguage = detectLanguage(message.content);
  if (!detectedLanguage) return;
  
  try {
    console.log(`🔍 ${detectedLanguage} text detected from ${message.author.tag}: ${message.content}`);
    
    // Translate the text
    const result = await translateToEnglish(message.content, detectedLanguage);
    
    if (result && result.translation) {
      // Create embed for the translation
      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('🌍 Translation')
        .addFields(
          { name: `Original (${detectedLanguage})`, value: message.content, inline: false },
          { name: 'Translation (English)', value: result.translation, inline: false }
        )
        .setFooter({ text: `Translated by ${client.user.username}` })
        .setTimestamp();
      
      // Add context field if available
      if (result.context) {
        embed.addFields({ name: '💭 Context', value: result.context, inline: false });
      }
      
      // Reply with the translation
      await message.reply({ embeds: [embed] });
      console.log(`✅ Translation sent for message from ${message.author.tag}`);
    } else {
      await message.reply('❌ Sorry, I couldn\'t translate that text. Please try again.');
    }
  } catch (error) {
    console.error('Error processing message:', error);
    await message.reply('❌ An error occurred while translating. Please try again later.');
  }
});

// Error handling
client.on('error', (error) => {
  console.error('Discord client error:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
});

// Login to Discord
client.login(config.discord.token);