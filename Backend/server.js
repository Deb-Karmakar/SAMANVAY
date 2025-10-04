import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js'; 
import agencyRoutes from './routes/agencyRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

// ✅ Load .env only in development
if (process.env.NODE_ENV !== 'production') {
  const dotenv = await import('dotenv');
  dotenv.config();
}

// 2. Connect to the database
connectDB();

const app = express();

// ... rest of your server code (cors, express.json, etc.)
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  })
);
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Mount routes (coming soon)
app.use('/api/users', userRoutes);
app.use('/api/agencies', agencyRoutes);
app.use('/api/dashboard', dashboardRoutes); 
app.use('/api/projects', projectRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/uploads', express.static('uploads'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});