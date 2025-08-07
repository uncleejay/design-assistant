# 🎨 Design Critique Assistant

> Get AI-powered design feedback directly in Figma. Improve your designs with intelligent critiques from OpenAI's GPT-3.5-turbo.

[![Figma Plugin](https://img.shields.io/badge/Figma-Plugin-00D2FF?logo=figma&logoColor=white)](https://figma.com)
[![OpenAI](https://img.shields.io/badge/Powered%20by-OpenAI-412991?logo=openai)](https://openai.com)

## ✨ Features

- 🤖 **AI-Powered Analysis** - Get intelligent design feedback using OpenAI's GPT-3.5-turbo
- 🎯 **Context-Aware** - Provide additional context for targeted critiques
- 🔒 **Secure** - Your API keys are stored locally and never sent to our servers
- ⚡ **Real-time** - Instant analysis of your selected design elements
- 📱 **Modern UI** - Clean, intuitive interface that matches Figma's design language
- 🎨 **Element Analysis** - Analyzes colors, typography, layout, and visual hierarchy

## 🚀 Getting Started

### Prerequisites

- Figma account (free or paid)
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### Installation

1. **From Figma Community** (Coming Soon)
   - Search for "Design Critique Assistant" in Figma's plugin directory
   - Click "Install" to add it to your workspace

2. **Manual Installation** (Development)
   - Clone this repository
   - Open Figma → Plugins → Development → Import plugin from manifest
   - Select the `manifest.json` file

### Setup

1. **Get your OpenAI API Key**
   - Visit [OpenAI API Keys](https://platform.openai.com/api-keys)
   - Create a new API key
   - Copy the key (you'll need it in the next step)

2. **Configure the Plugin**
   - Open the plugin in Figma
   - Enter your OpenAI API key in the configuration field
   - Your key is stored locally and securely

## 🎯 How to Use

1. **Select Design Elements**
   - Choose the design elements you want feedback on
   - The plugin analyzes colors, fonts, layout, and more

2. **Add Context** (Optional)
   - Describe your project, target audience, or specific concerns
   - More context = better, more targeted feedback

3. **Get Your Critique**
   - Click "Get Design Critique"
   - Receive detailed AI analysis and recommendations
   - Review suggestions for improvements

4. **Iterate and Improve**
   - Apply suggested changes to your design
   - Run additional critiques as you iterate

## 🛡️ Privacy & Security

- **Local Storage**: API keys are stored locally in your browser
- **No Data Collection**: We don't collect or store your designs
- **Direct API Calls**: Your designs are sent directly to OpenAI's API
- **Secure Communication**: All API calls use HTTPS encryption

## 📋 What Gets Analyzed

The AI provides feedback on:

- **Visual Hierarchy** - Layout structure and information flow
- **Typography** - Font choices, sizing, and readability
- **Color Theory** - Color harmony, contrast, and accessibility
- **Spacing & Layout** - Margins, padding, and alignment
- **User Experience** - Usability and interaction patterns
- **Brand Consistency** - Alignment with design systems

## 🔧 Technical Details

### Configuration

- **Model**: GPT-3.5-turbo
- **Max Tokens**: 1000
- **Temperature**: 0.7
- **UI Dimensions**: 400x600px
- **Max Elements**: 1000 per analysis

### Security

- API keys stored in `sessionStorage` (cleared when browser closes)
- No data stored permanently
- All API communication encrypted via HTTPS
- Comprehensive input validation and error handling

### Project Structure

```
├── manifest.json    # Figma plugin manifest
├── code.js         # Plugin backend logic
├── ui.html         # Plugin UI interface
├── icon.svg        # Plugin icon
├── README.md       # Documentation
└── LICENSE         # MIT License
```

## 🛠️ Development

### Local Setup

1. Clone the repository
   ```bash
   git clone https://github.com/uncleejay/design-assistant.git
   cd design-assistant
   ```

2. Import into Figma
   - Open Figma Desktop app
   - Go to Plugins → Development → Import plugin from manifest
   - Select `manifest.json`

3. Start developing
   - Make changes to `code.js` or `ui.html`
   - Reload the plugin in Figma to see changes

### Built With

- **Figma Plugin API** - Core plugin functionality
- **OpenAI GPT-3.5-turbo** - AI-powered design analysis
- **Vanilla JavaScript** - Lightweight, fast performance
- **Modern CSS** - Responsive, accessible UI

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 💬 Support

If you have any questions or need help:

- 📧 Create an issue on GitHub
- 💬 Reach out via Figma Community (once published)

## 🙏 Acknowledgments

- OpenAI for providing the GPT-3.5-turbo API
- The design community for inspiration and feedback

## 📄 License

MIT License - see LICENSE file for details.

---

**Version**: 1.0.0  
**Last Updated**: August 2024  
**Made with ❤️ for the design community**
