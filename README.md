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

## 🔧 Development

### Project Structure

```
├── manifest.json          # Figma plugin manifest
├── code.js               # Plugin backend logic
├── ui.html               # Plugin UI interface
├── README.md             # Documentation
└── LICENSE               # MIT License
```

### Built With

- **Figma Plugin API** - Core plugin functionality
- **OpenAI GPT-3.5-turbo** - AI-powered design analysis
- **Vanilla JavaScript** - Lightweight, fast performance
- **Modern CSS** - Responsive, accessible UI

### Local Development

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

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License


## 💬 Support

If you have any questions or need help:

- 📧 Create an issue on GitHub
- 💬 Reach out via Figma Community (once published)

## 🙏 Acknowledgments

- OpenAI for providing the GPT-3.5-turbo API
- Figma team for the excellent Plugin API
- The design community for inspiration and feedback

---

**Made with ❤️ for the design community**

# Design Critique Assistant - Figma Plugin

A professional Figma plugin that provides AI-powered design critiques using OpenAI's GPT-3.5-turbo model.

## 🚀 Features

- **AI-Powered Design Analysis**: Get detailed critiques of your Figma designs
- **Real-time Selection Analysis**: Automatically analyzes selected design elements
- **Comprehensive Feedback**: Covers visual hierarchy, colors, typography, spacing, and accessibility
- **Secure API Key Storage**: Stores your OpenAI API key securely in session storage
- **Context-Aware Critiques**: Add custom context for more targeted feedback
- **Professional UI**: Clean, modern interface with loading states and error handling

## 📁 File Structure

```
figma-design-critique-plugin/
├── code.js              # Main plugin logic (bundled)
├── ui.html              # Plugin UI (bundled)
├── manifest.json        # Plugin configuration
├── README.md           # This file
└── IMPROVEMENTS_SUMMARY.md  # Development improvements log
```

## 🛠️ Installation

1. **Get OpenAI API Key**:
   - Visit [OpenAI API](https://platform.openai.com/api-keys)
   - Create a new API key
   - Copy the key (starts with `sk-`)

2. **Install Plugin in Figma**:
   - Open Figma
   - Go to **Plugins** → **Development** → **Import plugin from manifest**
   - Select the `manifest.json` file from this folder

3. **Use the Plugin**:
   - Select design elements in Figma
   - Run the plugin from **Plugins** → **Design Critique Assistant**
   - Enter your OpenAI API key
   - Click "Get Design Critique"

## 🎯 How It Works

1. **Selection Analysis**: The plugin analyzes your selected Figma elements
2. **Data Extraction**: Extracts colors, fonts, dimensions, and element types
3. **AI Processing**: Sends structured data to OpenAI GPT-3.5-turbo
4. **Professional Critique**: Returns formatted, actionable design feedback

## 🔧 Configuration

The plugin uses these default settings:

- **Model**: GPT-3.5-turbo
- **Max Tokens**: 1000
- **Temperature**: 0.7
- **UI Dimensions**: 400x600px
- **Max Elements**: 1000 per analysis

## 🛡️ Security

- API keys are stored in `sessionStorage` (cleared when browser closes)
- No data is stored permanently
- All API communication is encrypted via HTTPS

## 📝 Error Handling

The plugin includes comprehensive error handling for:
- Invalid API keys
- Network connectivity issues
- Empty selections
- API rate limits
- Malformed responses

## 🎨 UI Features

- **Real-time Selection Updates**: Shows element count, types, colors, and fonts
- **Loading States**: Visual feedback during API requests
- **Error Messages**: Clear, actionable error messages
- **Navigation**: Easy switching between main and critique views
- **Responsive Design**: Optimized for Figma's plugin window

## 🔄 Development

This plugin was refactored from a monolithic structure to a modern, modular architecture with:

- **ES5 Compatibility**: Works with Figma's plugin system
- **Error Handling**: Comprehensive error management
- **Performance**: Optimized data extraction and caching
- **Security**: Secure API key storage
- **Code Quality**: Clean, maintainable code structure

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly in Figma
5. Submit a pull request

## 📞 Support

For issues or questions:
1. Check the error messages in the plugin
2. Verify your API key is correct
3. Ensure you have selected design elements
4. Check your internet connection

---

**Version**: 2.0.0  
**Last Updated**: August 2024 