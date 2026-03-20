const fs = require('fs');
const path = require('path');
const lancedb = require('@lancedb/lancedb');
const OpenAI = require('openai');
const config = require('./config');

const openai = new OpenAI({ apiKey: config.openaiApiKey });

async function getEmbedding(text) {
  const response = await openai.embeddings.create({
    model: config.embeddingModel,
    input: text,
    encoding_format: 'float'
  });
  return response.data[0].embedding;
}

async function ingestFAQs() {
  const faqPath = path.join(__dirname, '..', 'data', 'faqs.json');
  const faqs = JSON.parse(fs.readFileSync(faqPath, 'utf-8'));

  const db = await lancedb.connect(config.dbPath);

  console.log(`Ingesting ${faqs.length} FAQs...`);

  const records = [];
  for (const faq of faqs) {
    const text = `Question: ${faq.question}\nAnswer: ${faq.answer}`;
    const vector = await getEmbedding(text);
    records.push({
      id: faq.id,
      text: text,
      question: faq.question,
      answer: faq.answer,
      vector: vector
    });
    console.log(`  Embedded FAQ #${faq.id}`);
  }

  // Drop existing table if it exists, then create new
  try {
    await db.dropTable('faqs');
  } catch (e) {
    // Table doesn't exist yet, that's fine
  }

  const table = await db.createTable('faqs', records);
  console.log(`Created LanceDB table with ${records.length} records`);

  return table;
}

module.exports = { ingestFAQs, getEmbedding };
