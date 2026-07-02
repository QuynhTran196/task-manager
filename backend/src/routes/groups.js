const express = require('express');
const { db } = require('../db/init');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Tat ca route trong file nay deu yeu cau dang nhap, bat buoc co token 
router.use(authMiddleware);

// ============ POST /api/groups ============
// Tao nhom moi — chi can dang nhap, bat ky ai cung co the tao nhom
router.post('/', (req, res) => {
  const { name } = req.body;
  const manager_id = req.user.id; // lay tu token, khong can gui len

  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Ten nhom khong duoc de trong' });
  }

  try {
    const result = db.prepare(
      'INSERT INTO groups (name, manager_id) VALUES (?, ?)'
    ).run(name.trim(), manager_id);

    // Tu dong them nguoi tao vao group luon (manager cung la member)
    db.prepare(
      'INSERT INTO group_members (group_id, user_id) VALUES (?, ?)'
    ).run(result.lastInsertRowid, manager_id);

    const group = db.prepare('SELECT * FROM groups WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({ group });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Loi server' });
  }
});

// ============ GET /api/groups ============
// Xem danh sach nhom minh dang tham gia (ca manager lan member)
router.get('/', (req, res) => {
  const user_id = req.user.id;

  try {
    // Lay tat ca nhom ma user nay la thanh vien (bao gom nhom minh tao)
    const groups = db.prepare(`
      SELECT g.id, g.name, g.manager_id, g.created_at,
             u.full_name AS manager_name,
             CASE WHEN g.manager_id = ? THEN 1 ELSE 0 END AS is_manager
      FROM groups g
      JOIN group_members gm ON g.id = gm.group_id
      JOIN users u ON g.manager_id = u.id
      WHERE gm.user_id = ?
      ORDER BY g.created_at DESC
    `).all(user_id, user_id);

    res.json({ groups });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Loi server' });
  }
});

// ============ POST /api/groups/:groupId/members ============
// Moi thanh vien vao nhom — chi manager moi duoc lam
router.post('/:groupId/members', (req, res) => {
  const { groupId } = req.params;
  const { email } = req.body; // moi bang email, khong phai userId
  const requester_id = req.user.id;

  if (!email) {
    return res.status(400).json({ error: 'Thieu email thanh vien can moi' });
  }

  try {
    // Kiem tra nhom co ton tai khong
    const group = db.prepare('SELECT * FROM groups WHERE id = ?').get(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Nhom khong ton tai' });
    }

    // Chi manager moi duoc moi thanh vien
    if (group.manager_id !== requester_id) {
      return res.status(403).json({ error: 'Chi truong nhom moi co quyen moi thanh vien' });
    }

    // Tim user can moi theo email
    const userToInvite = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!userToInvite) {
      return res.status(404).json({ error: 'Khong tim thay nguoi dung voi email nay' });
    }

    // Kiem tra da la thanh vien chua (UNIQUE constraint se bat loi nay, nhung nen bao truoc)
    const existing = db.prepare(
      'SELECT id FROM group_members WHERE group_id = ? AND user_id = ?'
    ).get(groupId, userToInvite.id);

    if (existing) {
      return res.status(409).json({ error: 'Nguoi dung nay da la thanh vien cua nhom' });
    }

    db.prepare(
      'INSERT INTO group_members (group_id, user_id) VALUES (?, ?)'
    ).run(groupId, userToInvite.id);

    res.status(201).json({
      message: 'Moi thanh vien thanh cong',
      member: { id: userToInvite.id, email: userToInvite.email, full_name: userToInvite.full_name }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Loi server' });
  }
});

// ============ GET /api/groups/:groupId/members ============
// Xem danh sach thanh vien trong nhom — chi thanh vien cua nhom moi xem duoc
router.get('/:groupId/members', (req, res) => {
  const { groupId } = req.params;
  const requester_id = req.user.id;

  try {
    const group = db.prepare('SELECT * FROM groups WHERE id = ?').get(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Nhom khong ton tai' });
    }

    // Kiem tra nguoi goi co phai thanh vien nhom nay khong
    const isMember = db.prepare(
      'SELECT id FROM group_members WHERE group_id = ? AND user_id = ?'
    ).get(groupId, requester_id);

    if (!isMember) {
      return res.status(403).json({ error: 'Ban khong phai thanh vien cua nhom nay' });
    }

    const members = db.prepare(`
      SELECT u.id, u.email, u.full_name, gm.joined_at,
             CASE WHEN g.manager_id = u.id THEN 1 ELSE 0 END AS is_manager
      FROM group_members gm
      JOIN users u ON gm.user_id = u.id
      JOIN groups g ON gm.group_id = g.id
      WHERE gm.group_id = ?
      ORDER BY is_manager DESC, gm.joined_at ASC
    `).all(groupId);

    res.json({ group_id: groupId, group_name: group.name, members });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Loi server' });
  }
});

// ============ DELETE /api/groups/:groupId/members/:userId ============
// Xoa thanh vien khoi nhom — chi manager duoc lam, va khong the tu xoa chinh minh
router.delete('/:groupId/members/:userId', (req, res) => {
  const { groupId, userId } = req.params;
  const requester_id = req.user.id;

  try {
    const group = db.prepare('SELECT * FROM groups WHERE id = ?').get(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Nhom khong ton tai' });
    }

    // Chi manager duoc xoa thanh vien
    if (group.manager_id !== requester_id) {
      return res.status(403).json({ error: 'Chi truong nhom moi co quyen xoa thanh vien' });
    }

    // Manager khong the tu xoa chinh minh (theo spec: phai chi dinh truong nhom moi truoc)
    if (parseInt(userId) === requester_id) {
      return res.status(400).json({ error: 'Truong nhom khong the tu roi nhom, hay chuyen quyen truong nhom truoc' });
    }

    // Kiem tra user can xoa co trong nhom khong
    const member = db.prepare(
      'SELECT id FROM group_members WHERE group_id = ? AND user_id = ?'
    ).get(groupId, userId);

    if (!member) {
      return res.status(404).json({ error: 'Nguoi dung nay khong phai thanh vien cua nhom' });
    }

    db.prepare(
      'DELETE FROM group_members WHERE group_id = ? AND user_id = ?'
    ).run(groupId, userId);

    // Note: task da gan cho user nay se tu dong unassign (xu ly o Epic 3)
    res.json({ message: 'Da xoa thanh vien khoi nhom' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Loi server' });
  }
});

module.exports = router;
