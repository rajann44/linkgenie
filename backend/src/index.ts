import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import generateRouter from './routes/generate';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all requests (crucial for Chrome extensions running on chrome-extension:// schemes)
app.use(cors());

// Parse incoming JSON body payloads
app.use(express.json({ limit: '1mb' }));

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', provider: process.env.LLM_PROVIDER || 'gemini' });
});

// Register prompt routes
app.use('/api', generateRouter);

// Start server listening
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`  LinkedIn AI Reply Backend running on port ${PORT}`);
  console.log(`  LLM Provider: ${process.env.LLM_PROVIDER || 'gemini'}`);
  console.log(`  Health check: http://localhost:${PORT}/health`);
  console.log(`==================================================`);
});
