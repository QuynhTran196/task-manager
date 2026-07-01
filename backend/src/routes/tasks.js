const express = require('express');
const { db } = require('../db/init');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// ===== HELPER =====
// Kiem tra user co phai thanh vien cua nhom chua task khong
function getMemberRole(groupId, userId) {
  const group = db.prepare('SELECT * FROM groups WHERE id = ?').get(groupId);
  if (!group) return { group: null, isManager: false, isMember: false };
  const member = db.prepare(
    'SELECT id FROM group_members WHERE group_id = ? AND user_id = ?'
  ).get(groupId, userId);
  return {
    group,
    isMember: !!member,
    isManager: group.manager_id === userId
  };
}

// ============ POST /api/groups/:groupId/tasks ============
// Tao task moi trong nhom — chi manager moi duoc lam
router.post('/:groupId/tasks', (req, res) => {
  const { groupId } = req.params;
  const { title, description, deadline, priority, assigned_to, attachment } = req.body;
  const requester_id = req.user.id;

  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Tieu de task khong duoc de trong' });
  }

  const { group, isMember, isManager } = getMemberRole(parseInt(groupId), requester_id);
  if (!group) return res.status(404).json({ error: 'Nhom khong ton tai' });
  if (!isManager) return res.status(403).json({ error: 'Chi truong nhom moi co quyen tao task' });

  // Neu co assigned_to, kiem tra nguoi duoc gan co phai thanh vien nhom khong
  if (assigned_to) {
    const assignee = db.prepare(
      'SELECT id FROM group_members WHERE group_id = ? AND user_id = ?'
    ).get(groupId, assigned_to);
    if (!assignee) {
      return res.status(400).json({ error: 'Nguoi duoc gan task phai la thanh vien cua nhom' });
    }
  }

  // Validate priority neu co truyen len
  const validPriorities = ['low', 'medium', 'high'];
  if (priority && !validPriorities.includes(priority)) {
    return res.status(400).json({ error: 'Priority chi duoc la low, medium hoac high' });
  }

  try {
    const result = db.prepare(`
      INSERT INTO tasks (title, description, deadline, priority, assigned_to, group_id, attachment, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      title.trim(),
      description || null,
      deadline || null,
      priority || 'medium',
      assigned_to || null,
      groupId,
      attachment || null,
      requester_id
    );

    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Loi server' });
  }
});

// ============ GET /api/groups/:groupId/tasks ============
// Xem tat ca task trong nhom — chi thanh vien nhom moi xem duoc
router.get('/:groupId/tasks', (req, res) => {
  const { groupId } = req.params;
  const requester_id = req.user.id;

  const { group, isMember } = getMemberRole(parseInt(groupId), requester_id);
  if (!group) return res.status(404).json({ error: 'Nhom khong ton tai' });
  if (!isMember) return res.status(403).json({ error: 'Ban khong phai thanh vien cua nhom nay' });

  try {
    const tasks = db.prepare(`
      SELECT t.*,
             u.full_name AS assigned_to_name,
             c.full_name AS created_by_name,
             -- Tinh so ngay con lai den deadline
             CASE
               WHEN t.deadline IS NULL THEN NULL
               ELSE CAST((julianday(t.deadline) - julianday('now')) AS INTEGER)
             END AS days_remaining,
             -- Danh dau qua han: deadline da qua va chua hoan thanh
             CASE
               WHEN t.deadline IS NOT NULL
                AND t.status != 'completed'
                AND julianday(t.deadline) < julianday('now')
               THEN 1 ELSE 0
             END AS is_overdue
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      LEFT JOIN users c ON t.created_by = c.id
      WHERE t.group_id = ?
      ORDER BY
        CASE t.priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END,
        t.deadline ASC
    `).all(groupId);

    res.json({ group_id: groupId, tasks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Loi server' });
  }
});

// ============ GET /api/tasks/my ============
// Xem tat ca task duoc giao cho minh (tu tat ca nhom)
// QUAN TRONG: route nay phai dat TRUOC /api/tasks/:taskId de tranh "my" bi hieu la taskId
router.get('/my', (req, res) => {
  const user_id = req.user.id;

  try {
    const tasks = db.prepare(`
      SELECT t.*,
             g.name AS group_name,
             c.full_name AS created_by_name,
             CASE
               WHEN t.deadline IS NULL THEN NULL
               ELSE CAST((julianday(t.deadline) - julianday('now')) AS INTEGER)
             END AS days_remaining,
             CASE
               WHEN t.deadline IS NOT NULL
                AND t.status != 'completed'
                AND julianday(t.deadline) < julianday('now')
               THEN 1 ELSE 0
             END AS is_overdue
      FROM tasks t
      LEFT JOIN groups g ON t.group_id = g.id
      LEFT JOIN users c ON t.created_by = c.id
      WHERE t.assigned_to = ?
      ORDER BY is_overdue DESC, days_remaining ASC
    `).all(user_id);

    res.json({ tasks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Loi server' });
  }
});

// ============ PATCH /api/tasks/:taskId ============
// Sua task: manager sua duoc tat ca, member chi sua duoc status cua task duoc giao cho minh
router.patch('/:taskId', (req, res) => {
  const { taskId } = req.params;
  const requester_id = req.user.id;
  const { title, description, deadline, priority, status, assigned_to, attachment } = req.body;

  try {
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);
    if (!task) return res.status(404).json({ error: 'Task khong ton tai' });

    const { isMember, isManager } = getMemberRole(task.group_id, requester_id);
    if (!isMember) return res.status(403).json({ error: 'Ban khong phai thanh vien cua nhom nay' });

    // Member chi duoc cap nhat status cua task duoc giao cho minh
    if (!isManager) {
      if (task.assigned_to !== requester_id) {
        return res.status(403).json({ error: 'Ban chi co the cap nhat task duoc giao cho minh' });
      }
      // Member chi duoc doi status, khong duoc doi cac truong khac
      if (title || description || deadline || priority || assigned_to || attachment) {
        return res.status(403).json({ error: 'Member chi duoc cap nhat trang thai (status) cua task' });
      }
    }

    const validStatuses = ['pending', 'in_progress', 'completed'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Status khong hop le' });
    }

    const validPriorities = ['low', 'medium', 'high'];
    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({ error: 'Priority chi duoc la low, medium hoac high' });
    }

    // Chi cap nhat nhung truong duoc gui len, giu nguyen truong khong gui
    const updated = db.prepare(`
      UPDATE tasks SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        deadline = COALESCE(?, deadline),
        priority = COALESCE(?, priority),
        status = COALESCE(?, status),
        assigned_to = COALESCE(?, assigned_to),
        attachment = COALESCE(?, attachment)
      WHERE id = ?
    `).run(
      title || null,
      description || null,
      deadline || null,
      priority || null,
      status || null,
      assigned_to || null,
      attachment || null,
      taskId
    );

    const updatedTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);
    res.json({ task: updatedTask });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Loi server' });
  }
});

// ============ DELETE /api/tasks/:taskId ============
// Xoa task — chi manager moi duoc xoa
router.delete('/:taskId', (req, res) => {
  const { taskId } = req.params;
  const requester_id = req.user.id;

  try {
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);
    if (!task) return res.status(404).json({ error: 'Task khong ton tai' });

    const { isManager } = getMemberRole(task.group_id, requester_id);
    if (!isManager) return res.status(403).json({ error: 'Chi truong nhom moi co quyen xoa task' });

    db.prepare('DELETE FROM tasks WHERE id = ?').run(taskId);
    // Subtasks tu dong xoa theo (ON DELETE CASCADE trong schema)

    res.json({ message: 'Da xoa task thanh cong' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Loi server' });
  }
});

// ============ POST /api/tasks/:taskId/subtasks ============
// Tao subtask — manager hoac chinh member duoc giao task do moi tao duoc
router.post('/:taskId/subtasks', (req, res) => {
  const { taskId } = req.params;
  const { title, deadline, priority, attachment } = req.body;
  const requester_id = req.user.id;

  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Tieu de subtask khong duoc de trong' });
  }

  try {
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);
    if (!task) return res.status(404).json({ error: 'Task khong ton tai' });

    const { isMember, isManager } = getMemberRole(task.group_id, requester_id);
    if (!isMember) return res.status(403).json({ error: 'Ban khong phai thanh vien cua nhom nay' });

    // Chi manager hoac nguoi duoc giao task moi tao duoc subtask
    if (!isManager && task.assigned_to !== requester_id) {
      return res.status(403).json({ error: 'Chi truong nhom hoac nguoi duoc giao task moi co the tao subtask' });
    }

    // Validate deadline subtask phai nam trong deadline task tong (neu ca 2 deu co deadline)
    if (deadline && task.deadline) {
      if (deadline > task.deadline) {
        return res.status(400).json({
          error: `Deadline subtask (${deadline}) khong duoc vuot qua deadline task tong (${task.deadline})`
        });
      }
    }

    const result = db.prepare(`
      INSERT INTO subtasks (task_id, title, deadline, priority, attachment)
      VALUES (?, ?, ?, ?, ?)
    `).run(taskId, title.trim(), deadline || null, priority || 'medium', attachment || null);

    const subtask = db.prepare('SELECT * FROM subtasks WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ subtask });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Loi server' });
  }
});

// ============ GET /api/tasks/:taskId/subtasks ============
// Xem tat ca subtask cua 1 task — thanh vien nhom duoc xem
router.get('/:taskId/subtasks', (req, res) => {
  const { taskId } = req.params;
  const requester_id = req.user.id;

  try {
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);
    if (!task) return res.status(404).json({ error: 'Task khong ton tai' });

    const { isMember } = getMemberRole(task.group_id, requester_id);
    if (!isMember) return res.status(403).json({ error: 'Ban khong phai thanh vien cua nhom nay' });

    const subtasks = db.prepare(`
      SELECT *,
             CASE
               WHEN deadline IS NOT NULL AND is_completed = 0
                AND julianday(deadline) < julianday('now')
               THEN 1 ELSE 0
             END AS is_overdue,
             CASE
               WHEN deadline IS NULL THEN NULL
               ELSE CAST((julianday(deadline) - julianday('now')) AS INTEGER)
             END AS days_remaining
      FROM subtasks
      WHERE task_id = ?
      ORDER BY is_completed ASC, deadline ASC
    `).all(taskId);

    res.json({ task_id: taskId, subtasks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Loi server' });
  }
});

// ============ PATCH /api/tasks/:taskId/subtasks/:subtaskId ============
// Sua subtask: doi tieu de, deadline, priority, hoac tick hoan thanh
// Luu y: sua noi dung KHONG tu dong reset is_completed (theo spec da chot)
router.patch('/:taskId/subtasks/:subtaskId', (req, res) => {
  const { taskId, subtaskId } = req.params;
  const { title, deadline, priority, attachment, is_completed } = req.body;
  const requester_id = req.user.id;

  try {
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);
    if (!task) return res.status(404).json({ error: 'Task khong ton tai' });

    const subtask = db.prepare('SELECT * FROM subtasks WHERE id = ? AND task_id = ?').get(subtaskId, taskId);
    if (!subtask) return res.status(404).json({ error: 'Subtask khong ton tai' });

    const { isMember, isManager } = getMemberRole(task.group_id, requester_id);
    if (!isMember) return res.status(403).json({ error: 'Ban khong phai thanh vien cua nhom nay' });

    if (!isManager && task.assigned_to !== requester_id) {
      return res.status(403).json({ error: 'Chi truong nhom hoac nguoi duoc giao task moi co the sua subtask' });
    }

    // Validate deadline subtask khong duoc vuot deadline task tong
    const newDeadline = deadline || subtask.deadline;
    if (newDeadline && task.deadline && newDeadline > task.deadline) {
      return res.status(400).json({
        error: `Deadline subtask (${newDeadline}) khong duoc vuot qua deadline task tong (${task.deadline})`
      });
    }

    db.prepare(`
      UPDATE subtasks SET
        title = COALESCE(?, title),
        deadline = COALESCE(?, deadline),
        priority = COALESCE(?, priority),
        attachment = COALESCE(?, attachment),
        is_completed = COALESCE(?, is_completed)
      WHERE id = ?
    `).run(
      title || null,
      deadline || null,
      priority || null,
      attachment || null,
      is_completed !== undefined ? is_completed : null,
      subtaskId
    );

    const updated = db.prepare('SELECT * FROM subtasks WHERE id = ?').get(subtaskId);
    res.json({ subtask: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Loi server' });
  }
});

module.exports = router;
