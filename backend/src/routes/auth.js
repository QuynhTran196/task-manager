const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../db/init');
const { authMiddleware, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// ============ POST /api/auth/register ============
// Dang ky tai khoan moi
router.post('/register', async (req, res) => {
  const { email, password, full_name } = req.body;

  // Validation co ban - day la noi nhieu bug "thieu kiem tra dau vao" hay xay ra
  if (!email || !password || !full_name) {
    return res.status(400).json({ error: 'Thieu email, password hoac full_name' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password phai co it nhat 6 ky tu' });
  }

  // Kiem tra dinh dang email co ban
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Email khong dung dinh dang' });
  }

  try {
    // Kiem tra email da ton tai chua
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ error: 'Email da duoc su dung' });
    }

    // Ma hoa password truoc khi luu - KHONG BAO GIO luu password goc
    const password_hash = await bcrypt.hash(password, 10);

    const result = db.prepare(
      'INSERT INTO users (email, password_hash, full_name) VALUES (?, ?, ?)'
    ).run(email, password_hash, full_name);

    const newUser = { id: result.lastInsertRowid, email, full_name };

    // Tao token de user dang nhap luon sau khi dang ky, khong can login lai
    const token = jwt.sign(newUser, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ user: newUser, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Loi server, vui long thu lai' });
  }
});

// ============ POST /api/auth/login ============
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Thieu email hoac password' });
  }

  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    // Co tinh khong noi ro "sai email" hay "sai password" - tranh lo thong tin
    // cho ke tan cong biet email nao da ton tai trong he thong (security best practice)
    if (!user) {
      return res.status(401).json({ error: 'Email hoac password khong dung' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Email hoac password khong dung' });
    }

    const payload = { id: user.id, email: user.email, full_name: user.full_name };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    res.json({ user: payload, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Loi server, vui long thu lai' });
  }
});

// ============ GET /api/auth/me ============
// Lay thong tin user dang dang nhap - dung de test token con hop le khong
router.get('/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
