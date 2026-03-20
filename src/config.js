const config = {
  port: process.env.PORT || 3000,
  openaiApiKey: process.env.OPENAI_API_KEY,
  dbPath: process.env.LANCEDB_PATH || './data/lancedb',
  embeddingModel: 'text-embedding-3-small',
  chatModel: 'gpt-3.5-turbo',
  topK: 3
};

module.exports = config;
