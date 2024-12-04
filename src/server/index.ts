import express from 'express';
import cors from 'cors';
import { serverConfig } from './config';
import { websiteAnalysisService, socialMediaService, newsService } from '../services/api';
import { authMiddleware } from './middleware/auth';
import { createValidationMiddleware } from './middleware/validation';
import { 
  websiteAnalysisSchema, 
  socialMediaAnalysisSchema, 
  newsAnalysisSchema 
} from './schemas/analysis';
import { webhookRouter } from './webhooks';

const app = express();
const port = serverConfig.PORT;

app.use(cors());
app.use(express.json());

// Webhooks
app.use('/webhooks', webhookRouter);

// Website Analysis Endpoint
app.post(
  '/api/analyze/website',
  authMiddleware,
  createValidationMiddleware(websiteAnalysisSchema),
  async (req, res) => {
    try {
      const { url, userId } = req.body;
      const result = await websiteAnalysisService.analyze(url, userId);
      res.json(result);
    } catch (error) {
      console.error('Website analysis error:', error);
      res.status(500).json({ error: 'Failed to analyze website' });
    }
  }
);

// Social Media Analysis Endpoint
app.post(
  '/api/analyze/social',
  authMiddleware,
  createValidationMiddleware(socialMediaAnalysisSchema),
  async (req, res) => {
    try {
      const { brand, userId } = req.body;
      const result = await socialMediaService.analyze(brand, userId);
      res.json(result);
    } catch (error) {
      console.error('Social media analysis error:', error);
      res.status(500).json({ error: 'Failed to analyze social media' });
    }
  }
);

// News Analysis Endpoint
app.post(
  '/api/analyze/news',
  authMiddleware,
  createValidationMiddleware(newsAnalysisSchema),
  async (req, res) => {
    try {
      const { query, userId } = req.body;
      const result = await newsService.analyze(query, userId);
      res.json(result);
    } catch (error) {
      console.error('News analysis error:', error);
      res.status(500).json({ error: 'Failed to analyze news' });
    }
  }
);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});