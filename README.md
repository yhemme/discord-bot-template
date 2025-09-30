# Discord Bot Template

A comprehensive Discord bot template built with TypeScript, featuring slash commands, testing setup, deployment scripts, and command boilerplate generation.

## Features

- 🚀 **TypeScript** - Full TypeScript support with proper typing
- ⚡ **Slash Commands** - Modern Discord slash command implementation
- 🧪 **Testing** - Complete testing setup with Vitest
- 📦 **Command Generator** - Automated script to create new commands
- 📦 **Command Deployment** - Automated script to deploy commands
- 🔧 **Development Tools** - Hot reload and development scripts
- 🛡️ **Type Safety** - Zod validation and environment variable handling
- 📋 **ESLint** - Code linting and formatting

## Prerequisites

- Node.js >= 18.0.0
- npm >= 8.0.0 (or pnpm)
- A Discord Application with Bot Token

## Quick Start

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd discord-bot-template
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Environment Setup**

   - Copy `.env.example` to `.env.local`
   - Add your Discord bot token and other required environment variables

4. **Deploy commands to Discord**

   For testing (instant updates to your test server):

   ```bash
   npm run deploy:test
   ```

   For global deployment (takes up to 1 hour):

   ```bash
   npm run deploy:global
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## Available Scripts

| Script                   | Description                                        |
| ------------------------ | -------------------------------------------------- |
| `npm run dev`            | Start the bot in development mode with hot reload  |
| `npm run deploy`         | Show deployment help (requires --test or --global) |
| `npm run deploy:test`    | Deploy commands to test guild (instant updates)    |
| `npm run deploy:global`  | Deploy commands globally (takes up to 1 hour)      |
| `npm run create:command` | Generate a new command boilerplate                 |
| `npm run test`           | Run all tests                                      |
| `npm run test:watch`     | Run tests in watch mode                            |
| `npm run test:cov`       | Run tests with coverage report                     |

## Project Structure

```
├── commands/           # Slash commands
│   └── utility/       # Utility commands category
├── lib/               # Shared utilities and helpers
├── scripts/           # Development and deployment scripts
├── coverage/          # Test coverage reports
├── env.ts            # Environment variables configuration
├── index.ts          # Main bot entry point
└── package.json      # Project configuration
```

## Creating New Commands

Use the built-in command generator:

```bash
npm run create:command
```

This will guide you through creating a new slash command with proper TypeScript types and test files.

## Environment Variables

Create a `.env.local` file with the following variables:

```env
DISCORD_TOKEN=your_bot_token_here
DISCORD_CLIENT_ID=your_client_id_here
DISCORD_GUILD_ID=your_guild_id_here # Required for test deployments
```

**Note**: The `DISCORD_GUILD_ID` is required when using `npm run deploy:test` for instant command updates in your development server.

## Testing

The project includes comprehensive testing setup:

- **Unit Tests**: Test individual functions and utilities
- **Command Tests**: Test Discord command functionality
- **Coverage Reports**: Generate detailed coverage reports

```bash
# Run tests once
npm run test

# Watch mode for development
npm run test:watch

# Generate coverage report
npm run test:cov
```

## Deployment

1. **Deploy commands** to Discord:

   For development/testing (instant updates):

   ```bash
   npm run deploy:test
   ```

   For production (global commands, takes up to 1 hour):

   ```bash
   npm run deploy:global
   ```

   To see all deployment options:

   ```bash
   npm run deploy
   ```

2. **Start the bot**:
   ```bash
   npm start
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the ISC License.

## Author

**Yohann Hemme**

- Email: yohann.hemme@gmail.com

---

Built with ❤️ using Discord.js v14 and TypeScript
