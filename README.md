# Tally MCP Server

A comprehensive Model Context Protocol (MCP) server for [Tally](https://lttlmg.ht/tally) form management. This server provides 16 powerful tools to manage forms, submissions, questions, and webhooks directly through Claude Desktop.

> **Built by [@cathrynlavery](https://twitter.com/cathrynlavery)** | **Try [Claude Desktop](https://claude.ai/download)** | **Get [Tally Forms](https://lttlmg.ht/tally)**

## ✨ Features

- **16 comprehensive tools** for complete Tally form management
- **Full API coverage** including advanced form editing capabilities
- **Seamless Claude Desktop integration** via MCP protocol
- **Type-safe** with proper JSON schema validation
- **Production-ready** with error handling and logging

## 🚀 Quick Start

### Prerequisites

1. **Node.js** (v16 or higher)
2. **[Claude Desktop](https://claude.ai/download)** application
3. **[Tally](https://lttlmg.ht/tally)** account with API access

### 1. Installation

```bash
git clone https://github.com/cathrynlavery/tally-mcp-server.git
cd tally-mcp-server
npm install
npm run build
```

### 2. Get Your Tally API Key

1. Sign up for [Tally](https://lttlmg.ht/tally) (free account works!)
2. Go to [https://tally.so/settings/api](https://tally.so/settings/api)
3. Create a new API key
4. Copy the API key (starts with `tally_`)

### 3. Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your API key
TALLY_API_KEY=tally_your_actual_api_key_here
```

### 4. Configure Claude Desktop

#### macOS Setup

1. Open your Claude Desktop configuration file:
   ```bash
   # Create the directory if it doesn't exist
   mkdir -p ~/Library/Application\ Support/Claude
   
   # Open the config file (create if it doesn't exist)
   open ~/Library/Application\ Support/Claude/claude_desktop_config.json
   ```

2. Add the Tally MCP server configuration:
   ```json
   {
     "mcpServers": {
       "tally": {
         "command": "node",
         "args": ["/path/to/your/tally-mcp-server/start-server.js"],
         "env": {
           "TALLY_API_KEY": "tally_your_actual_api_key_here"
         }
       }
     }
   }
   ```

   **Important:** Replace `/path/to/your/tally-mcp-server/` with your actual project path!

#### Windows Setup

1. Open: `%APPDATA%\Claude\claude_desktop_config.json`
2. Use the same JSON structure with Windows paths:
   ```json
   {
     "mcpServers": {
       "tally": {
         "command": "node",
         "args": ["C:\\path\\to\\your\\tally-mcp-server\\start-server.js"],
         "env": {
           "TALLY_API_KEY": "tally_your_actual_api_key_here"
         }
       }
     }
   }
   ```

#### Linux Setup

1. Open: `~/.config/Claude/claude_desktop_config.json`
2. Use the same JSON structure with Linux paths

### 5. Test the Setup

1. **Restart Claude Desktop** completely (quit and reopen)
2. Start a new conversation
3. Try: **"Can you list my Tally forms?"**

## 🛠️ Available Tools (16 Total)

### Forms Management (5 tools)
- `get_tally_forms` - List all your forms
- `create_tally_form` - Create new forms
- `get_tally_form` - Get specific form details
- `update_tally_form` - Update forms with full API support
- `delete_tally_form` - Delete forms

### Submissions Management (3 tools)
- `get_form_submissions` - List form submissions with pagination
- `get_form_submission` - Get specific submission details
- `delete_form_submission` - Delete submissions

### Questions Management (1 tool)
- `get_form_questions` - List all questions in a form

### Webhooks Management (4 tools)
- `get_tally_webhooks` - List webhooks for a form
- `create_tally_webhook` - Create new webhooks
- `update_tally_webhook` - Update existing webhooks
- `delete_tally_webhook` - Delete webhooks

### Form Editing Helpers (3 tools)
- `update_form_status` - Quick status changes (BLANK, PUBLISHED, DRAFT)
- `update_form_settings` - Update common form settings
- `configure_form_notifications` - Set up email notifications

## 💬 Example Usage in Claude

Once configured, you can interact naturally with your Tally forms:

- **"Show me all my forms"**
- **"Create a new customer feedback form"**
- **"Update my contact form to published status"**
- **"Get the latest 10 submissions for form xyz"**
- **"Set up email notifications for my survey"**
- **"Add a webhook to my form that sends to my API"**
- **"Delete submissions older than 30 days"**
- **"Change my form password to 'newpassword123'"**

## 🔧 Advanced Configuration

### Custom Form Updates

The `update_tally_form` tool supports comprehensive form editing including:

- **Basic Properties**: name, status
- **Form Structure**: complete blocks/questions array
- **Advanced Settings**: 20+ options including notifications, styling, behavior
- **Security**: password protection, submission limits
- **Integrations**: redirects, custom CSS, data retention

### Environment Variables

```bash
# Required
TALLY_API_KEY=tally_your_api_key_here

# Optional (for development)
NODE_ENV=development
DEBUG=true
```

### Alternative Configuration Methods

You can also set the API key directly in the Claude Desktop config:

```json
{
  "mcpServers": {
    "tally": {
      "command": "node",
      "args": ["/path/to/your/tally-mcp-server/start-server.js"],
      "env": {
        "TALLY_API_KEY": "tally_your_actual_api_key_here"
      }
    }
  }
}
```

## 🐛 Troubleshooting

### Common Issues

1. **"Command not found" error**
   - Verify Node.js installation: `node --version`
   - Check the absolute path in your Claude config
   - Ensure the `start-server.js` file exists and is executable

2. **"Authentication failed" error**
   - Double-check your API key in `.env` or Claude config
   - Ensure API key starts with `tally_`
   - Verify your [Tally](https://lttlmg.ht/tally) account has API access

3. **Tools not appearing in Claude**
   - Restart Claude Desktop completely (quit and reopen)
   - Check JSON syntax in config file (use a JSON validator)
   - Verify file paths are absolute, not relative
   - Check Claude Desktop logs for errors

4. **"Module not found" errors**
   - Run `npm install` in the project directory
   - Ensure `npm run build` completed successfully
   - Check that the `build/` directory exists

### Testing Locally

```bash
# Test the server starts without errors
npm start

# Or use the start script directly
node start-server.js

# Test with a simple API call (requires API key in .env)
curl -H "Authorization: Bearer $TALLY_API_KEY" https://api.tally.so/forms
```

### Debug Mode

Enable debug logging by setting environment variables:

```bash
DEBUG=true NODE_ENV=development node start-server.js
```

### Getting Help

If you're still having issues:

1. Check the [GitHub Issues](https://github.com/cathrynlavery/tally-mcp-server/issues)
2. Create a new issue with:
   - Your operating system
   - Node.js version (`node --version`)
   - Error messages
   - Your configuration (without API keys)

## 📚 API Reference

This MCP server implements the full [Tally API](https://developers.tally.so/api-reference) including:

- **Forms API** - Complete CRUD operations
- **Submissions API** - Retrieve and manage form responses
- **Questions API** - Access form structure
- **Webhooks API** - Real-time integrations

### Supported Tally API Endpoints

- `GET /forms` - List forms
- `POST /forms` - Create form
- `GET /forms/{id}` - Get form
- `PATCH /forms/{id}` - Update form
- `DELETE /forms/{id}` - Delete form
- `GET /forms/{id}/submissions` - List submissions
- `GET /forms/{id}/submissions/{id}` - Get submission
- `DELETE /forms/{id}/submissions/{id}` - Delete submission
- `GET /forms/{id}/questions` - List questions
- `GET /forms/{id}/webhooks` - List webhooks
- `POST /forms/{id}/webhooks` - Create webhook
- `PATCH /forms/{id}/webhooks/{id}` - Update webhook
- `DELETE /forms/{id}/webhooks/{id}` - Delete webhook

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup

```bash
# Clone and install
git clone https://github.com/cathrynlavery/tally-mcp-server.git
cd tally-mcp-server
npm install

# Set up environment
cp .env.example .env
# Add your API key to .env

# Development with auto-rebuild
npm run dev

# Build for production
npm run build

# Run tests (if available)
npm test
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **[Tally](https://lttlmg.ht/tally)** - The amazing form builder that makes this possible
- **[Claude Desktop](https://claude.ai/download)** - AI assistant with MCP protocol support
- **Anthropic** - For the Model Context Protocol specification

---

**Built with ❤️ by [@cathrynlavery](https://twitter.com/cathrynlavery)**

*Try [Tally](https://lttlmg.ht/tally) for free - unlimited forms and submissions!* 