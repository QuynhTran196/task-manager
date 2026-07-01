# Test Cases — Epic 3: Tasks & Subtasks API

**Module:** Task Management (Create / View / Update / Delete) + Subtask Management  
**Base URL:** `{{base_url}}` = `http://localhost:3000`  
**Tester:** Quynh Tran  
**Test Date:** 2026-06-30  

---

## Test Accounts

| Role | Email | Password |
|---|---|---|
| Manager | testmanager@gmail.com | Abc123456 |
| Member | testmember1@gmail.com | Abc123456 |

## Environment Variables Required

| Variable | Description |
|---|---|
| `{{manager_token}}` | Token from Login as Manager |
| `{{member_token}}` | Token from Login as Member |
| `{{auth_token}}` | Token of a user NOT in the group |
| `{{group_id}}` | ID of shared group |
| `{{task_id}}` | ID of task created in TC_02 |
| `{{subtask_id}}` | ID of subtask created in TC_20 |
| `{{member_id}}` | User ID of testmember1 |

---

## Task API

| TC ID | Test Title | Precondition | Test Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|---|
| TC_01 | Verify server is running | | Send `GET /api/health` | `200 OK` | `200 OK` | Pass |
| TC_02 | Create task successfully using Manager account | `testmanager@gmail.com` and `testmember1@gmail.com` exist in DB. Both logged in with valid tokens and share the same group | Send `POST {{base_url}}/api/groups/{{group_id}}/tasks` with `{{manager_token}}`. Body: `{"title": "Fix login bug", "deadline": "2026-07-30", "priority": "high", "assigned_to": {{member_id}}}` | `201 Created`, response body has `task.id`, `task.title`, `task.deadline`, `task.priority`, `task.status`, `task.assigned_to`, `task.group_id`, `task.created_by` | `201 Created` | Pass |
| TC_03 | Fail to create task with empty title | `testmanager@gmail.com` logged in with valid `{{manager_token}}`. Group exists | Send `POST {{base_url}}/api/groups/{{group_id}}/tasks` with `{{manager_token}}`. Body: `{"deadline": "2026-07-30", "priority": "high", "assigned_to": {{member_id}}}` | `400 Bad Request`, `error: "Tieu de task khong duoc de trong"` | `400 Bad Request`, `error: "Tieu de task khong duoc de trong"` | Pass |
| TC_04 | Fail to create task using Member account | `testmember1@gmail.com` logged in with valid `{{member_token}}` | Send `POST {{base_url}}/api/groups/{{group_id}}/tasks` with `{{member_token}}`. Body: `{"title": "Fix login bug", "deadline": "2026-07-30", "priority": "high", "assigned_to": {{member_id}}}` | `403 Forbidden`, `error: "Chi truong nhom moi co quyen tao task"` | `403 Forbidden`, `error: "Chi truong nhom moi co quyen tao task"` | Pass |
| TC_05 | Fail to create task when group does not exist | `testmanager@gmail.com` logged in with valid `{{manager_token}}`. Group ID 10 does not exist | Send `POST {{base_url}}/api/groups/10/tasks` with `{{manager_token}}`. Body: `{"title": "Fix login bug", "deadline": "2026-07-30", "priority": "high", "assigned_to": {{member_id}}}` | `404 Not Found`, `error: "Nhom khong ton tai"` | `404 Not Found`, `error: "Nhom khong ton tai"` | Pass |
| TC_06 | Fail to create task when assigned user is not a group member | `testmanager@gmail.com` logged in with valid `{{manager_token}}`. Group exists. User ID 10 is not a group member | Send `POST {{base_url}}/api/groups/{{group_id}}/tasks` with `{{manager_token}}`. Body: `{"title": "Fix login bug", "deadline": "2026-07-30", "priority": "high", "assigned_to": 10}` | `400 Bad Request`, `error: "Nguoi duoc gan task phai la thanh vien cua nhom"` | `400 Bad Request`, `error: "Nguoi duoc gan task phai la thanh vien cua nhom"` | Pass |
| TC_07 | View all tasks in group successfully using Manager account | Both accounts logged in with valid tokens and share the same group | Send `GET {{base_url}}/api/groups/{{group_id}}/tasks` with `{{manager_token}}` | `200 OK`, response body has array `tasks`, each task has `id`, `title`, `deadline`, `priority`, `status`, `assigned_to_name`, `days_remaining`, `is_overdue` | `200 OK` | Pass |
| TC_08 | View all tasks in group successfully using Member account | Both accounts logged in with valid tokens and share the same group | Send `GET {{base_url}}/api/groups/{{group_id}}/tasks` with `{{member_token}}` | `200 OK`, response body has array `tasks` | `200 OK` | Pass |
| TC_09 | Fail to view tasks when group does not exist | `testmanager@gmail.com` logged in with valid `{{manager_token}}`. Group ID 10 does not exist | Send `GET {{base_url}}/api/groups/10/tasks` with `{{manager_token}}` | `404 Not Found`, `error: "Nhom khong ton tai"` | `404 Not Found`, `error: "Nhom khong ton tai"` | Pass |
| TC_10 | Fail to view tasks when user is not a group member | User logged in with valid `{{auth_token}}` but is NOT a member of the group | Send `GET {{base_url}}/api/groups/{{group_id}}/tasks` with `{{auth_token}}` | `403 Forbidden`, `error: "Ban khong phai thanh vien cua nhom nay"` | `403 Forbidden`, `error: "Ban khong phai thanh vien cua nhom nay"` | Pass |
| TC_11 | View personal tasks successfully using Member account | `testmember1@gmail.com` logged in with valid `{{member_token}}`. Is a member of at least 1 group and has at least 1 task assigned (`assigned_to = member_id`) | Send `GET {{base_url}}/api/tasks/my` with `{{member_token}}` | `200 OK`, response body has array `tasks`, each task has `id`, `title`, `deadline`, `priority`, `status`, `assigned_to`, `group_id`, `group_name`, `created_by_name`, `days_remaining`, `is_overdue` | `200 OK`, all fields present | Pass |
| TC_12 | Update task successfully using Manager account | `testmanager@gmail.com` logged in with valid `{{manager_token}}`. Task `{{task_id}}` exists | Send `PATCH {{base_url}}/api/tasks/{{task_id}}` with `{{manager_token}}`. Body: `{"title": "Fix input field bug"}` | `200 OK`, response body has `id`, `title: "Fix input field bug"`, `description`, `deadline`, `priority`, `status`, `assigned_to`, `group_id`, `attachment`, `created_by`, `created_at` | `200 OK` | Pass |
| TC_13 | Fail to update task when task does not exist | `testmanager@gmail.com` logged in with valid `{{manager_token}}`. Task ID 10 does not exist | Send `PATCH {{base_url}}/api/tasks/10` with `{{manager_token}}`. Body: `{"title": "Fix input field bug"}` | `404 Not Found`, `error: "Task khong ton tai"` | `404 Not Found`, `error: "Task khong ton tai"` | Pass |
| TC_14 | Fail to update task title using Member account | `testmember1@gmail.com` logged in with valid `{{member_token}}`. Task `{{task_id}}` exists | Send `PATCH {{base_url}}/api/tasks/{{task_id}}` with `{{member_token}}`. Body: `{"title": "Fix input field bug"}` | `403 Forbidden`, `error: "Member chi duoc cap nhat trang thai (status) cua task"` | `403 Forbidden`, `error: "Member chi duoc cap nhat trang thai (status) cua task"` | Pass |
| TC_15 | Update task status successfully using Member account | `testmember1@gmail.com` logged in with valid `{{member_token}}`. Task `{{task_id}}` exists and is assigned to member | Send `PATCH {{base_url}}/api/tasks/{{task_id}}` with `{{member_token}}`. Body: `{"status": "in_progress"}` | `200 OK`, `status` changed to `"in_progress"`, response body has `id`, `title`, `description`, `deadline`, `priority`, `status`, `assigned_to`, `group_id`, `attachment`, `created_by`, `created_at` | `200 OK`, status updated | Pass |
| TC_16 | Fail to update task status when user is not a group member | User logged in with valid `{{auth_token}}` but is NOT a member of the group | Send `PATCH {{base_url}}/api/tasks/{{task_id}}` with `{{auth_token}}`. Body: `{"status": "in_progress"}` | `403 Forbidden`, `error: "Ban khong phai thanh vien cua nhom nay"` | `403 Forbidden`, `error: "Ban khong phai thanh vien cua nhom nay"` | Pass |
| TC_17 | Fail to update task when task is not assigned to member | `testmember1@gmail.com` logged in with valid `{{member_token}}`. Task `{{task_id}}` exists but `assigned_to` ≠ `member_id` | Send `PATCH {{base_url}}/api/tasks/{{task_id}}` with `{{member_token}}`. Body: `{"title": "Fix input field bug"}` | `403 Forbidden`, `error: "Ban chi co the cap nhat task duoc giao cho minh"` | `403 Forbidden`, `error: "Ban chi co the cap nhat task duoc giao cho minh"` | Pass |
| TC_18 | Fail to update task with invalid status value | `testmember1@gmail.com` logged in with valid `{{member_token}}`. Task `{{task_id}}` exists and is assigned to member. Valid statuses: `pending`, `in_progress`, `completed` | Send `PATCH {{base_url}}/api/tasks/{{task_id}}` with `{{member_token}}`. Body: `{"status": "TestAPI"}` | `400 Bad Request`, `error: "Status khong hop le"` | `400 Bad Request`, `error: "Status khong hop le"` | Pass |
| TC_19 | Fail to update task with invalid priority value | `testmanager@gmail.com` logged in with valid `{{manager_token}}`. Task `{{task_id}}` exists. Valid priorities: `low`, `medium`, `high` | Send `PATCH {{base_url}}/api/tasks/{{task_id}}` with `{{manager_token}}`. Body: `{"priority": "TestAPI"}` | `400 Bad Request`, `error: "Priority chi duoc la low, medium hoac high"` | `400 Bad Request`, `error: "Priority chi duoc la low, medium hoac high"` | Pass |
| TC_40 | Delete task successfully using Manager account | `testmanager@gmail.com` logged in with valid `{{manager_token}}`. Task exists | Send `DELETE {{base_url}}/api/tasks/{{task_id}}` with `{{manager_token}}` | `200 OK`, `message: "Da xoa task thanh cong"` | | |
| TC_41 | Fail to delete task using Member account | `testmember1@gmail.com` logged in with valid `{{member_token}}`. Task exists | Send `DELETE {{base_url}}/api/tasks/{{task_id}}` with `{{member_token}}` | `403 Forbidden`, `error: "Chi truong nhom moi co quyen xoa task"` | | |
| TC_42 | Fail to delete task when task does not exist | `testmanager@gmail.com` logged in with valid `{{manager_token}}`. Task ID 99 does not exist | Send `DELETE {{base_url}}/api/tasks/99` with `{{manager_token}}` | `404 Not Found`, `error: "Task khong ton tai"` | | |

---

## Subtask API

| TC ID | Test Title | Precondition | Test Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|---|
| TC_20 | Create subtask successfully when deadline is within task deadline | `testmanager@gmail.com` logged in with valid `{{manager_token}}`. Group exists. Task `{{task_id}}` exists with `deadline: "2026-07-30"` | Send `POST {{base_url}}/api/tasks/{{task_id}}/subtasks` with `{{manager_token}}`. Body: `{"title": "Thu thap so lieu", "deadline": "2026-07-15", "priority": "medium"}` | `201 Created`, response body has `id`, `task_id`, `title`, `deadline`, `priority`, `is_completed`, `attachment`, `created_at` | `201 Created` | Pass |
| TC_21 | Create subtask successfully using Member account | `testmember1@gmail.com` logged in with valid `{{member_token}}`. Group exists. Task `{{task_id}}` is assigned to member | Send `POST {{base_url}}/api/tasks/{{task_id}}/subtasks` with `{{member_token}}`. Body: `{"title": "Phan tich so lieu", "deadline": "2026-07-15", "priority": "medium"}` | `201 Created`, response body has `id`, `task_id`, `title`, `deadline`, `priority`, `is_completed`, `attachment`, `created_at` | `201 Created` | Pass |
| TC_22 | Fail to create subtask with empty title | `testmember1@gmail.com` logged in with valid `{{member_token}}`. Task `{{task_id}}` exists and is assigned to member | Send `POST {{base_url}}/api/tasks/{{task_id}}/subtasks` with `{{member_token}}`. Body: `{"deadline": "2026-07-15", "priority": "medium"}` | `400 Bad Request`, `error: "Tieu de subtask khong duoc de trong"` | `400 Bad Request`, `error: "Tieu de subtask khong duoc de trong"` | Pass |
| TC_23 | Fail to create subtask when task does not exist | `testmember1@gmail.com` logged in with valid `{{member_token}}`. Task ID 10 does not exist | Send `POST {{base_url}}/api/tasks/10/subtasks` with `{{member_token}}`. Body: `{"title": "Phan tich so lieu", "deadline": "2026-07-15", "priority": "medium"}` | `404 Not Found`, `error: "Task khong ton tai"` | `404 Not Found`, `error: "Task khong ton tai"` | Pass |
| TC_24 | Fail to create subtask when user is not a group member | User logged in with valid `{{auth_token}}` but is NOT a member of the group | Send `POST {{base_url}}/api/tasks/{{task_id}}/subtasks` with `{{auth_token}}`. Body: `{"title": "Phan tich so lieu", "deadline": "2026-07-15", "priority": "medium"}` | `403 Forbidden`, `error: "Ban khong phai thanh vien cua nhom nay"` | `403 Forbidden`, `error: "Ban khong phai thanh vien cua nhom nay"` | Pass |
| TC_25 | Fail to create subtask when task is not assigned to member | `testmember1@gmail.com` logged in with valid `{{member_token}}`. Task ID 2 exists but is NOT assigned to this member | Send `POST {{base_url}}/api/tasks/2/subtasks` with `{{member_token}}`. Body: `{"title": "Kiem ke so du", "deadline": "2026-07-15", "priority": "medium"}` | `403 Forbidden`, `error: "Chi truong nhom hoac nguoi duoc giao task moi co the tao subtask"` | `403 Forbidden`, `error: "Chi truong nhom hoac nguoi duoc giao task moi co the tao subtask"` | Pass |
| TC_27 | Fail to create subtask when deadline exceeds task deadline | `testmember1@gmail.com` logged in with valid `{{member_token}}`. Task `{{task_id}}` has `deadline: "2026-07-30"` | Send `POST {{base_url}}/api/tasks/{{task_id}}/subtasks` with `{{member_token}}`. Body: `{"title": "Kiem ke so lieu", "deadline": "2026-08-05", "priority": "medium"}` | `400 Bad Request`, `error: "Deadline subtask (2026-08-05) khong duoc vuot qua deadline task tong (2026-07-30)"` | `400 Bad Request`, correct error message | Pass |
| TC_28 | Create subtask successfully when deadline equals task deadline (Boundary Value) | `testmember1@gmail.com` logged in with valid `{{member_token}}`. Task `{{task_id}}` has `deadline: "2026-07-30"` | Send `POST {{base_url}}/api/tasks/{{task_id}}/subtasks` with `{{member_token}}`. Body: `{"title": "Review cuoi cung", "deadline": "2026-07-30", "priority": "medium"}` | `201 Created`, response body has all subtask fields | `201 Created` | Pass |
| TC_29 | View subtasks successfully using Manager account | `testmanager@gmail.com` logged in with valid `{{manager_token}}`. Task `{{task_id}}` exists with subtasks | Send `GET {{base_url}}/api/tasks/{{task_id}}/subtasks` with `{{manager_token}}` | `200 OK`, response body has `task_id`, array `subtasks`, each subtask has `id`, `title`, `deadline`, `priority`, `is_completed`, `is_overdue`, `days_remaining` | `200 OK`, all fields present | Pass |
| TC_30 | View subtasks successfully using Member account | `testmember1@gmail.com` logged in with valid `{{member_token}}`. Task `{{task_id}}` exists with subtasks | Send `GET {{base_url}}/api/tasks/{{task_id}}/subtasks` with `{{member_token}}` | `200 OK`, response body has `task_id`, array `subtasks`, each subtask has `id`, `title`, `deadline`, `priority`, `is_completed`, `is_overdue`, `days_remaining` | `200 OK`, all fields present | Pass |
| TC_31 | Fail to view subtasks when task does not exist | `testmember1@gmail.com` logged in with valid `{{member_token}}`. Task ID 10 does not exist | Send `GET {{base_url}}/api/tasks/10/subtasks` with `{{member_token}}` | `404 Not Found`, `error: "Task khong ton tai"` | `404 Not Found`, `error: "Task khong ton tai"` | Pass |
| TC_32 | Fail to view subtasks when user is not a group member | User logged in with valid `{{auth_token}}` but is NOT a member of the group | Send `GET {{base_url}}/api/tasks/{{task_id}}/subtasks` with `{{auth_token}}` | `403 Forbidden`, `error: "Ban khong phai thanh vien cua nhom nay"` | `403 Forbidden`, `error: "Ban khong phai thanh vien cua nhom nay"` | Pass |
| TC_33 | Update subtask successfully using Member account | `testmember1@gmail.com` logged in with valid `{{member_token}}`. Task `{{task_id}}` assigned to member. Subtask `{{subtask_id}}` exists | Send `PATCH {{base_url}}/api/tasks/{{task_id}}/subtasks/{{subtask_id}}` with `{{member_token}}`. Body: `{"title": "Chinh sua so lieu"}` | `200 OK`, `subtask.title` changed to `"Chinh sua so lieu"`, `subtask.is_completed` unchanged | `200 OK` | Pass |
| TC_34 | Update subtask successfully using Manager account | `testmanager@gmail.com` logged in with valid `{{manager_token}}`. Task `{{task_id}}` exists. Subtask `{{subtask_id}}` exists | Send `PATCH {{base_url}}/api/tasks/{{task_id}}/subtasks/{{subtask_id}}` with `{{manager_token}}`. Body: `{"title": "Chinh sua so lieu"}` | `200 OK`, `subtask.title` changed to `"Chinh sua so lieu"`, `subtask.is_completed` unchanged | `200 OK` | Pass |
| TC_35 | Fail to update subtask when task does not exist | `testmember1@gmail.com` logged in with valid `{{member_token}}`. Task ID 10 does not exist | Send `PATCH {{base_url}}/api/tasks/10/subtasks/{{subtask_id}}` with `{{member_token}}`. Body: `{"title": "Chinh sua so lieu"}` | `404 Not Found`, `error: "Task khong ton tai"` | `404 Not Found`, `error: "Task khong ton tai"` | Pass |
| TC_36 | Fail to update subtask when subtask does not exist | `testmember1@gmail.com` logged in with valid `{{member_token}}`. Task exists. Subtask ID 10 does not exist | Send `PATCH {{base_url}}/api/tasks/{{task_id}}/subtasks/10` with `{{member_token}}`. Body: `{"title": "Chinh sua so lieu"}` | `404 Not Found`, `error: "Subtask khong ton tai"` | `404 Not Found`, `error: "Subtask khong ton tai"` | Pass |
| TC_37 | Fail to update subtask when user is not a group member | User logged in with valid `{{auth_token}}` but is NOT a member of the group | Send `PATCH {{base_url}}/api/tasks/{{task_id}}/subtasks/{{subtask_id}}` with `{{auth_token}}`. Body: `{"title": "test"}` | `403 Forbidden`, `error: "Ban khong phai thanh vien cua nhom nay"` | `403 Forbidden`, `error: "Ban khong phai thanh vien cua nhom nay"` | Pass |
| TC_38 | Fail to update subtask when task is not assigned to member | `testmember1@gmail.com` logged in with valid `{{member_token}}`. Is a group member. Task exists but NOT assigned to this member. Subtask exists | Send `PATCH {{base_url}}/api/tasks/{{task_id}}/subtasks/{{subtask_id}}` with `{{member_token}}`. Body: `{"title": "so lieu"}` | `403 Forbidden`, `error: "Chi truong nhom hoac nguoi duoc giao task moi co the sua subtask"` | `403 Forbidden`, `error: "Chi truong nhom hoac nguoi duoc giao task moi co the sua subtask"` | Pass |
| TC_39 | Editing subtask content does not reset completion status | Subtask `{{subtask_id}}` exists. Step 1 (setup): Send `PATCH` with `{"is_completed": 1}` → confirm response shows `is_completed: 1` | Send `PATCH {{base_url}}/api/tasks/{{task_id}}/subtasks/{{subtask_id}}` with `{{member_token}}`. Body: `{"title": "Da doi ten"}` — no `is_completed` field | `200 OK`, `is_completed` remains `1` (not reset to `0`) | `200 OK`, `is_completed: 1` | Pass |

---

## Summary

| | Count |
|---|---|
| Total test cases | 42 |
| Pass | 39 |
| Pending (DELETE task — TC_40, TC_41, TC_42) | 3 |
| Fail | 0 |

**Techniques applied:**
- Happy path testing
- Authorization testing: 401 / 403 distinction
- Role-based access: Manager vs Member permissions
- Boundary Value Analysis: subtask deadline vs task deadline (TC_27, TC_28)
- State verification: is_completed not reset after content edit (TC_39)
- Regression check: verifying one action does not break another state

---

## Known Gaps — To be covered in v2

- DELETE subtask (currently no endpoint — subtasks are cascade-deleted when parent task is deleted)
- Create task without `assigned_to` (unassigned task)
- Create task with invalid `priority` value
- Update task `assigned_to` to a user not in the group
- Subtask deadline validation when task deadline is null
- Concurrent edit: manager and member updating same task simultaneously
