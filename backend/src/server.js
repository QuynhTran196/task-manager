require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initSchema } = require('./db/init');

const authRoutes = require('./routes/auth');
const groupRoutes = require('./routes/groups');
const taskRoutes = require('./routes/tasks');

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
app.use('/api/groups', groupRoutes);
app.use('/api/tasks', taskRoutes);   // /api/tasks/:taskId, /api/tasks/my
app.use('/api/groups', taskRoutes);  // /api/groups/:groupId/tasks

app.listen(PORT, () => {
  console.log(`[Server] Dang chay tai http://localhost:${PORT}`);
});
