// Copy this file to config.js and fill in your actual values
module.exports = {
  // Discord Bot Configuration
  discord: {
    token: process.env.DISCORD_TOKEN || '',
    clientId: process.env.DISCORD_CLIENT_ID || ''
  },

  // Gemini API Configuration
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || ''
  },

  // Channel Configuration
  targetChannelId: process.env.TARGET_CHANNEL_ID || ''
};
