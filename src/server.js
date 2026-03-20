const express = require('express');
const path = require('path');
const config = require('./config');
const { ingestFAQs } = require('./ingest');
const { initRAG, query } = require('./rag');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const result = await query(message);
    res.json({ response: result.response, sources: result.sources });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

async function start() {
  console.log('Starting RAG Chatbot...');

  if (!config.openaiApiKey) {
    console.error('ERROR: OPENAI_API_KEY environment variable is required');
    process.exit(1);
  }

  // Ingest FAQs and build vector store
  await ingestFAQs();

  // Initialize RAG pipeline
  await initRAG();

  app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
  });
}

start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
