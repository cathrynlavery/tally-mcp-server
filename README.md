# Tally MCP Server

A Model Context Protocol (MCP) server for integrating with Tally forms.

## Prerequisites

- Node.js 18 or higher
- A Tally API key

## Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment example file:
   ```bash
   cp .env.example .env
   ```

4. Edit `.env` and add your Tally API key:
   ```
   TALLY_API_KEY=your_actual_tally_api_key_here
   ```

## Development

Build the project:
```bash
npm run build
```

Run in development mode (with auto-rebuild):
```bash
npm run dev
```

Start the server:
```bash
npm start
```

## Usage

This MCP server provides tools for interacting with Tally forms. Once running, it can be used by MCP clients to:

- Get list of Tally forms
- Additional functionality will be added as needed

## Configuration

The server uses the following environment variables:

- `TALLY_API_KEY`: Your Tally API key (required)

## Building for Distribution

```bash
npm run build
```

The built files will be in the `build/` directory. 