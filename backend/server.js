import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ollama configuration
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const MODEL_NAME = process.env.MODEL_NAME || 'mistral';

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Check Ollama connection
app.get('/api/ollama-status', async (req, res) => {
  try {
    const response = await axios.get(`${OLLAMA_URL}/api/tags`);
    const models = response.data.models || [];
    const hasModel = models.some(model => model.name.includes(MODEL_NAME));
    
    res.json({ 
      connected: true, 
      models: models.map(m => m.name),
      hasRequiredModel: hasModel,
      requiredModel: MODEL_NAME
    });
  } catch (error) {
    res.json({ 
      connected: false, 
      error: error.message,
      requiredModel: MODEL_NAME
    });
  }
});

// Summarize text using Ollama
app.post('/api/summarize', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text is required for summarization' });
    }

    const prompt = `Please provide a concise and professional summary of the following text. Focus on the key points and main ideas:\n\n${text}`;

    const ollamaResponse = await axios.post(`${OLLAMA_URL}/api/generate`, {
      model: MODEL_NAME,
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.7,
        max_tokens: 500
      }
    });

    const summary = ollamaResponse.data.response;
    
    res.json({ 
      success: true, 
      summary: summary.trim(),
      originalText: text
    });

  } catch (error) {
    console.error('Summarization error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ 
        error: 'Cannot connect to Ollama. Please ensure Ollama is running locally.',
        details: `Trying to connect to: ${OLLAMA_URL}`
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to generate summary',
      details: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Ollama URL: ${OLLAMA_URL}`);
  console.log(`Model: ${MODEL_NAME}`);
  console.log('\nMake sure Ollama is running with:');
  console.log(`ollama serve`);
  console.log(`ollama pull ${MODEL_NAME}`);
});

export default app;