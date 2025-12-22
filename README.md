# Skinally Chatbot API

Backend API for managing chatbot conversations and user sessions.

## Features

- RESTful API for conversations management
- User authentication by name
- SQLite database with automatic migrations
- TypeScript support
- Express.js server

## Tech Stack

- **Node.js** - Runtime environment
- **Express** - Web framework
- **TypeScript** - Type safety
- **SQLite** (better-sqlite3) - Database
- **tsx** - TypeScript execution

## Installation

```bash
npm install
```

## Development

```bash
# Run in development mode with hot reload
npm run dev

# Build TypeScript
npm run build

# Run production build
npm start
```

## API Endpoints

### Conversations

- `GET /api/conversations/:userName` - Get all conversations for a user
- `GET /api/conversations/:userName/:analysisId` - Get specific conversation
- `POST /api/conversations` - Create new conversation
- `PUT /api/conversations/:userName/:analysisId` - Update conversation
- `DELETE /api/conversations/:userName/:analysisId` - Delete conversation

### Users

- `POST /api/users/login` - Login/Create user by name
- `GET /api/users/:userName/sessions` - Get user sessions

### Health

- `GET /health` - Health check endpoint

## Database

SQLite database is automatically created in `./data/conversations.db` on first run.

### Tables

- **conversations** - Stores chat conversations
- **users** - Stores user information

## Environment Variables

Create a `.env` file:

```env
PORT=3001
NODE_ENV=development
```

## Project Structure

```
skinally-chatbot-api/
├── src/
│   ├── routes/
│   │   ├── conversations.ts
│   │   └── users.ts
│   ├── db/
│   │   ├── database.ts
│   │   └── migrations.ts
│   ├── middleware/
│   │   └── errorHandler.ts
│   └── server.ts
├── data/
│   └── conversations.db (auto-created)
├── .env
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## License

ISC

