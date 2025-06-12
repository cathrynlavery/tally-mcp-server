# Tally MCP Server Setup Guide

## Prerequisites

1. **Node.js** (v16 or higher)
2. **Claude Desktop** application installed
3. **Tally API Key** from your Tally account

## 1. Get Your Tally API Key

1. Go to [https://tally.so/settings/api](https://tally.so/settings/api)
2. Create a new API key
3. Copy the API key (starts with `tally_`)

## 2. Configure Environment Variables

1. Open the `.env` file in this directory
2. Replace `your_api_key_here` with your actual Tally API key:

```
TALLY_API_KEY=tally_your_actual_api_key_here
```

## 3. Build the Project

```bash
npm install
npm run build
```

## 4. Configure Claude Desktop

### macOS Configuration

1. Open your Claude Desktop configuration file:
   - Location: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Create the file if it doesn't exist

2. Add the Tally MCP server configuration:

```json
{
  "mcpServers": {
    "tally": {
      "command": "node",
      "args": ["/Users/cathrynlavery/Coding/tally-mcp-server/start-server.js"],
      "env": {
        "TALLY_API_KEY": "tally_your_actual_api_key_here"
      }
    }
  }
}
```

### Windows Configuration

1. Open: `%APPDATA%\Claude\claude_desktop_config.json`
2. Use the same JSON structure but with Windows paths

### Linux Configuration

1. Open: `~/.config/Claude/claude_desktop_config.json`
2. Use the same JSON structure with appropriate Linux paths

## 5. Test the Setup

1. **Restart Claude Desktop** completely (quit and reopen)
2. Start a new conversation in Claude
3. Try using one of the Tally tools:

```
Can you list my Tally forms?
```

## Available Tools (16 total)

### Forms Management
- `get_tally_forms` - List all forms
- `create_tally_form` - Create a new form
- `get_tally_form` - Get specific form details
- `update_tally_form` - Update form with full API support
- `delete_tally_form` - Delete a form

### Submissions Management
- `get_form_submissions` - List form submissions
- `get_form_submission` - Get specific submission
- `delete_form_submission` - Delete a submission

### Questions Management
- `get_form_questions` - List form questions

### Webhooks Management
- `get_tally_webhooks` - List webhooks
- `create_tally_webhook` - Create webhook
- `update_tally_webhook` - Update webhook
- `delete_tally_webhook` - Delete webhook

### Form Editing Helpers
- `update_form_status` - Quick status changes
- `update_form_settings` - Common settings
- `configure_form_notifications` - Email notifications

## Troubleshooting

### Common Issues

1. **"Command not found" error**
   - Check that Node.js is installed: `node --version`
   - Verify the path to your project in the config

2. **"Authentication failed" error**
   - Double-check your API key in the `.env` file
   - Ensure the API key starts with `tally_`

3. **Tools not appearing in Claude**
   - Restart Claude Desktop completely
   - Check the console logs for errors
   - Verify the JSON configuration syntax

### Testing Locally

You can test the server directly from command line:

```bash
# Test that the server starts
npm start

# Or use the start script
node start-server.js
```

## Example Usage in Claude

Once configured, you can interact with your Tally forms directly in Claude:

- "Show me all my forms"
- "Create a new form called 'Customer Feedback'"
- "Update the form status to published"
- "Get submissions for form ID xyz"
- "Set up email notifications for my form" 