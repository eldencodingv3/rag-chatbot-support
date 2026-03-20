const lancedb = require('@lancedb/lancedb');
const OpenAI = require('openai');
const config = require('./config');
const { getEmbedding } = require('./ingest');

const openai = new OpenAI.default({ apiKey: config.openaiApiKey });

let db = null;
let table = null;

async function initRAG() {
  db = await lancedb.connect(config.dbPath);
  table = await db.openTable('faqs');
  console.log('RAG pipeline initialized');
}

async function query(userMessage) {
  if (!table) {
    throw new Error('RAG pipeline not initialized. Call initRAG() first.');
  }

  // Generate embedding for the user's query
  const queryVector = await getEmbedding(userMessage);

  // Search for similar FAQs
  const results = await table.vectorSearch(queryVector)
    .limit(config.topK)
    .toArray();

  // Build context from search results
  const context = results
    .map(r => `Q: ${r.question}\nA: ${r.answer}`)
    .join('\n\n');

  // Generate response using GPT-3.5-turbo with context
  const completion = await openai.chat.completions.create({
    model: config.chatModel,
    messages: [
      {
        role: 'system',
        content: `You are a helpful customer support assistant. Answer the user's question based on the following FAQ context. If the context doesn't contain relevant information, say you don't have that information and suggest contacting support directly.\n\nContext:\n${context}`
      },
      {
        role: 'user',
        content: userMessage
      }
    ],
    temperature: 0.7,
    max_tokens: 500
  });

  return {
    response: completion.choices[0].message.content,
    sources: results.map(r => ({ question: r.question, score: r._distance }))
  };
}

module.exports = { initRAG, query };
