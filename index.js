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
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Function to detect if text contains Arabic characters
function containsArabic(text) {
  // Arabic Unicode range: U+0600-U+06FF, U+0750-U+077F, U+08A0-U+08FF, U+FB50-U+FDFF, U+FE70-U+FEFF
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return arabicRegex.test(text);
}

// Function to translate Arabic text to English using Gemini
async function translateToEnglish(text) {
  try {
    const prompt = `Translate the following Arabic text to English. Only provide the translation, no explanations or additional text: "${text}"`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const translation = response.text().trim();
    
    return translation;
  } catch (error) {
    console.error('Translation error:', error);
    return null;
  }
}

// Event: Bot is ready
client.once('ready', () => {
  console.log(`🤖 ${client.user.tag} is online and ready to translate Arabic text!`);
  console.log(`📡 Monitoring channel: ${config.targetChannelId}`);
});

// Event: Message received
client.on('messageCreate', async (message) => {
  // Ignore bot messages
  if (message.author.bot) return;
  
  // Check if message is in the target channel
  if (message.channel.id !== config.targetChannelId) return;
  
  // Check if message contains Arabic text
  if (!containsArabic(message.content)) return;
  
  try {
    console.log(`🔍 Arabic text detected from ${message.author.tag}: ${message.content}`);
    
    // Translate the text
    const translation = await translateToEnglish(message.content);
    
    if (translation) {
      // Create embed for the translation
      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('🌍 Translation')
        .addFields(
          { name: 'Original (Arabic)', value: message.content, inline: false },
          { name: 'Translation (English)', value: translation, inline: false }
        )
        .setFooter({ text: `Translated by ${client.user.username}` })
        .setTimestamp();
      
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