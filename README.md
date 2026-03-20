# RAG Chatbot Support

A Node.js customer support chatbot that uses Retrieval-Augmented Generation (RAG) to answer questions based on a FAQ knowledge base. Built with LanceDB for vector storage, OpenAI for embeddings and chat completion, and Express for the web server.

## Features

- **RAG Pipeline** — Retrieves relevant FAQ entries using vector similarity search before generating answers
- **Vector Store** — Uses LanceDB to store and query FAQ embeddings locally
- **OpenAI Integration** — Generates embeddings with `text-embedding-3-small` and answers with `gpt-3.5-turbo`
- **Chat UI** — Clean, responsive web interface with real-time messaging
- **Health Check** — `/health` endpoint for monitoring
- **Easy FAQ Updates** — Edit a JSON file to update the knowledge base

## Prerequisites

- Node.js 20+
- OpenAI API key

## Quick Start

```bash
# Clone the repository
git clone https://github.com/eldencodingv3/rag-chatbot-support.git
cd rag-chatbot-support

# Install dependencies
npm install

# Set your OpenAI API key
export OPENAI_API_KEY=your-api-key-here

# Start the server
npm start
```

The server will ingest FAQs, build the vector store, and start listening on `http://localhost:3000`.

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `OPENAI_API_KEY` | Yes | — | Your OpenAI API key |
| `PORT` | No | `3000` | Server port |
| `LANCEDB_PATH` | No | `./data/lancedb` | Path to LanceDB storage |

## Updating the FAQ Dataset

1. Edit `data/faqs.json` — add, remove, or modify FAQ entries
2. Each entry needs an `id`, `question`, and `answer` field
3. Restart the server — FAQs are re-ingested on every startup

## Project Structure

```
├── data/
│   └── faqs.json           # FAQ knowledge base
├── public/
│   ├── index.html          # Chat interface
│   ├── style.css           # Styles
│   └── app.js              # Frontend logic
├── src/
│   ├── config.js           # Configuration
│   ├── ingest.js           # FAQ embedding and LanceDB ingestion
│   ├── rag.js              # RAG query pipeline
│   └── server.js           # Express server and API routes
├── .github/workflows/
│   └── ci.yml              # CI pipeline
├── package.json
└── README.md
```

## API

### `GET /health`

Returns server status.

### `POST /api/chat`

Send a message and get a RAG-powered response.

**Request body:**
```json
{ "message": "What is your return policy?" }
```

**Response:**
```json
{
  "response": "We offer a 30-day return policy...",
  "sources": [
    { "question": "What is your return policy?", "score": 0.123 }
  ]
}
```

## Deployment to Railway

1. Create a new project on [Railway](https://railway.app)
2. Connect your GitHub repository
3. Add the `OPENAI_API_KEY` environment variable in the Railway dashboard
4. Railway will auto-detect the Node.js project and run `npm start`

## Tech Stack

- **Runtime** — Node.js
- **Web Framework** — Express
- **Vector Database** — LanceDB
- **AI/ML** — OpenAI (embeddings + chat completion)
- **Frontend** — Vanilla HTML/CSS/JavaScript
