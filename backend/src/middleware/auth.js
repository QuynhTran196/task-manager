// Middleware nghia la "lop trung gian" - chay TRUOC khi vao route chinh
// Dung de kiem tra: nguoi goi API nay da dang nhap chua?

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-doi-trong-production';

function authMiddleware(req, res, next) {
  // Token duoc gui qua header: Authorization: Bearer <token>
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Thieu token xac thuc' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Gan thong tin user vao request, cac route sau co the dung req.user
    req.user = decoded;
    next(); // cho phep di tiep den route chinh
  } catch (err) {
    return res.status(401).json({ error: 'Token khong hop le hoac da het han' });
  }
}

module.exports = { authMiddleware, JWT_SECRET };
