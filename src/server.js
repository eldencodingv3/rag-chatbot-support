const express = require('express');
const path = require('path');
const config = require('./config');
const { ingestFAQs } = require('./ingest');
const { initRAG, query } = require('./rag');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

let ragReady = false;
let ragError = null;

app.get('/health', (req, res) => {
  res.json({ status: 'ok', ragReady, timestamp: new Date().toISOString() });
});

app.post('/api/chat', async (req, res) => {
  try {
    if (!ragReady) {
      return res.status(503).json({
        response: 'The chatbot is still initializing. Please check that OPENAI_API_KEY is configured correctly and try again in a moment.',
        error: ragError ? ragError.message : 'Initializing...'
      });
    }
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

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);

  if (!config.openaiApiKey) {
    ragError = new Error('OPENAI_API_KEY not set');
    console.error('WARNING: OPENAI_API_KEY not set. Chat will not work.');
    return;
  }

  (async () => {
    try {
      await ingestFAQs();
      await initRAG();
      ragReady = true;
      console.log('RAG pipeline ready');
    } catch (err) {
      ragError = err;
      console.error('Failed to initialize RAG pipeline:', err.message);
    }
  })();
});
