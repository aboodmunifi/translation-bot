# Arabic Translation Discord Bot

A Discord bot that automatically detects Arabic text in a selected channel and translates it to English using Google's Gemini AI.

## Features

- 🔍 **Arabic Text Detection**: Automatically detects Arabic characters in messages
- 🌍 **Real-time Translation**: Uses Gemini AI to translate Arabic to English
- 📱 **Discord Integration**: Seamlessly works within Discord servers
- 🎨 **Beautiful Embeds**: Shows translations in nicely formatted embed messages
- ⚙️ **Channel-specific**: Only monitors one designated channel

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Create Configuration File

Copy the example configuration file and fill in your details:

```bash
cp config.example.js config.js
```

Edit `config.js` with your actual values:

```javascript
module.exports = {
  discord: {
    token: 'YOUR_DISCORD_BOT_TOKEN',
    clientId: 'YOUR_DISCORD_CLIENT_ID'
  },
  gemini: {
    apiKey: 'YOUR_GEMINI_API_KEY'
  },
  targetChannelId: 'CHANNEL_ID_TO_MONITOR'
};
```

### 3. Get Discord Bot Token

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to "Bot" section
4. Click "Add Bot"
5. Copy the token and paste it in `config.js`

### 4. Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key and paste it in `config.js`

### 5. Get Channel ID

1. Enable Developer Mode in Discord (User Settings > Advanced > Developer Mode)
2. Right-click on the channel where you want Arabic detection
3. Select "Copy ID"
4. Paste the ID in `config.js`

### 6. Invite Bot to Server

1. In Discord Developer Portal, go to "OAuth2" > "URL Generator"
2. Select scopes: `bot`
3. Select permissions: `Send Messages`, `Read Message History`, `Use Slash Commands`
4. Copy the generated URL and open it to invite your bot

### 7. Run the Bot

```bash
npm start
```

## How It Works

1. The bot monitors the specified channel for new messages
2. When a message contains Arabic characters, it detects them automatically
3. The text is sent to Gemini AI for translation
4. The bot replies with both the original Arabic text and English translation in a formatted embed

## Supported Arabic Scripts

The bot detects various Arabic script ranges:
- Standard Arabic: U+0600-U+06FF
- Arabic Supplement: U+0750-U+077F
- Arabic Extended-A: U+08A0-U+08FF
- Arabic Presentation Forms-A: U+FB50-U+FDFF
- Arabic Presentation Forms-B: U+FE70-U+FEFF

## Troubleshooting

### Bot not responding
- Check if the bot token is correct
- Ensure the bot has proper permissions in the channel
- Verify the channel ID is correct

### Translation not working
- Check if your Gemini API key is valid
- Ensure you have API quota remaining
- Check console logs for error messages

### Bot not detecting Arabic
- Make sure the message actually contains Arabic characters
- Check if the message is in the correct channel
- Verify the bot is online and running

## File Structure

```
translation-bot/
├── index.js              # Main bot file
├── config.example.js     # Configuration template
├── config.js            # Your configuration (create this)
├── package.json         # Dependencies
└── README.md           # This file
```

## License

MIT License - feel free to modify and use as needed!

