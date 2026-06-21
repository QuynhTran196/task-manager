require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initSchema } = require('./db/init');

const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware toan cuc
app.use(cors());
app.use(express.json()); // cho phep doc JSON body trong request

// Khoi tao database schema khi server start
initSchema();

// Route kiem tra server con song khong - rat huu ich khi test deploy
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Gan cac route theo tung nhom chuc nang
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`[Server] Dang chay tai http://localhost:${PORT}`);
});
