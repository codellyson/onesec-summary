# 🧠 OneSec Summary

A Chrome Extension that gives you a 1-sentence summary of any web page using AI.

## ✨ Features

- **One-Click Summarization**: Get instant summaries with a single button click
- **Smart Text Extraction**: Automatically extracts and cleans page content
- **AI-Powered**: Uses advanced AI models for accurate, concise summaries
- **Beautiful UI**: Modern, responsive design with smooth animations
- **Cross-Platform**: Works on any website
- **Side Panel Support**: Open the extension in a side panel for persistent access

## 🚀 Quick Start

### Development

1. **Install dependencies**:

   ```bash
   pnpm install
   ```

2. **Start development server**:

   ```bash
   pnpm dev
   ```

3. **Load the extension**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `.output/chrome-mv3` folder

### Using the Extension

1. **Popup Mode**: Click the extension icon in the toolbar to open the popup
2. **Side Panel Mode**: Click the "📱 Open in Side Panel" button in the popup to open the extension in a persistent side panel
3. **Summarize**: Click "📄 Summarize This Page" to get an AI-generated summary of the current webpage

### Building for Production

```bash
pnpm build
```

The built extension will be in the `dist` folder.

## 🔧 Configuration

### AI Integration

The extension currently uses mock AI responses for development. To integrate with real AI services:

1. **OpenAI Integration**:

   - Set your OpenAI API key in the environment variables
   - Uncomment the OpenAI API call in `entrypoints/lib/ai-service.ts`

2. **Hugging Face Integration**:
   - Set your Hugging Face token in the environment variables
   - Use the `summarizeWithHuggingFace` method in the AI service

### Environment Variables

Create a `.env` file in the root directory:

```env
OPENAI_API_KEY=your_openai_api_key_here
HF_TOKEN=your_huggingface_token_here
```

## 📁 Project Structure

```
onesec-summary/
├── entrypoints/
│   ├── popup/           # Extension popup UI
│   │   ├── App.tsx      # Main React component
│   │   ├── App.css      # Styles for the popup
│   │   └── main.tsx     # Popup entry point
│   ├── side-panel/      # Side panel UI
│   │   ├── App.tsx      # Side panel React component
│   │   ├── App.css      # Styles for the side panel
│   │   ├── main.tsx     # Side panel entry point
│   │   ├── index.html   # Side panel HTML
│   │   └── style.css    # Global styles for side panel
│   └── lib/
│       └── ai-service.ts # AI integration service
├── public/              # Static assets
├── wxt.config.ts        # WXT configuration
└── package.json         # Dependencies and scripts
```

## 🎨 UI Components

- **Header**: App title and subtitle with gradient background
- **Welcome Section**: Initial state with instructions
- **Loading Section**: Animated spinner during processing
- **Summary Section**: Displays the generated summary
- **Error Section**: Shows error messages when something goes wrong
- **Action Buttons**: Primary summarize button and secondary actions
- **Side Panel Button**: Button to open the extension in a side panel for persistent access

## 🔒 Permissions

The extension requires the following permissions:

- `activeTab`: To access the current tab's content
- `scripting`: To execute content scripts for text extraction
- `storage`: For potential future features (settings, history)
- `sidePanel`: To open the extension in a side panel
- `<all_urls>`: To work on any website

## 🛠️ Development

### Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: WXT (Web Extension Toolkit)
- **Styling**: CSS with modern features (gradients, animations)
- **AI Integration**: Configurable service layer

### Available Scripts

- `pnpm dev`: Start development server
- `pnpm build`: Build for production
- `pnpm zip`: Create a zip file for distribution
- `pnpm compile`: Type-check the codebase

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details

## 🆘 Support

If you encounter any issues or have questions:

1. Check the browser console for error messages
2. Ensure you have the necessary permissions enabled
3. Verify your AI API keys are correctly configured
4. Open an issue on GitHub with detailed information

## 🔮 Future Enhancements

- [ ] Save summary history
- [ ] Custom summary length options
- [ ] Multiple AI model support
- [ ] Keyboard shortcuts
- [ ] Summary sharing features
- [ ] Dark/light theme toggle
- [ ] Offline mode with cached summaries
