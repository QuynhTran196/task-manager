# Task Manager — QA Portfolio Project

A personal project built to practice and demonstrate QA/Tester skills:
**Manual Testing**, **API Testing**, and **Automation Testing**.

The app is a task management system with team collaboration features,
built with Node.js + Express + SQLite.

---

## Project Structure

```
task-manager/
├── backend/          — Node.js + Express REST API
├── docs/             — Test cases (Manual & API testing)
├── postman/          — Postman Collections (API testing)
└── automation/       — Automation test scripts (coming soon)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express |
| Database | SQLite (via better-sqlite3) |
| Authentication | JWT (jsonwebtoken) + bcryptjs |
| API Testing | Postman |
| Automation | Playwright / Selenium (planned) |

---

## Test Accounts (for local testing)

| Role | Email | Password |
|---|---|---|
| Manager | testmanager@gmail.com | Abc123456 |
| Member | testmember1@gmail.com | Abc123456 |

---

## How to Run Locally

```bash
# 1. Clone the repo
git clone https://github.com/QuynhTran196/task-manager.git
cd task-manager/backend

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env

# 4. Start the server
npm start
# Server runs at http://localhost:3000

# 5. Verify server is running
GET http://localhost:3000/api/health
```

---

## API Overview

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/health` | Check server status | No |
| POST | `/api/auth/register` | Register new account | No |
| POST | `/api/auth/login` | Login | No |
| GET | `/api/auth/me` | Get current user info | Required |
| POST | `/api/groups` | Create a group | Required |
| GET | `/api/groups` | Get all groups for current user | Required |
| POST | `/api/groups/:id/members` | Invite member to group | Manager only |
| GET | `/api/groups/:id/members` | View group members | Member only |
| DELETE | `/api/groups/:id/members/:userId` | Remove member from group | Manager only |
| POST | `/api/groups/:id/tasks` | Create task in group | Manager only |
| GET | `/api/groups/:id/tasks` | View all tasks in group | Member only |
| GET | `/api/tasks/my` | View tasks assigned to me | Required |
| PATCH | `/api/tasks/:id` | Update task | Manager / Assigned member |
| DELETE | `/api/tasks/:id` | Delete task | Manager only |
| POST | `/api/tasks/:id/subtasks` | Create subtask | Manager / Assigned member |
| GET | `/api/tasks/:id/subtasks` | View subtasks | Member only |
| PATCH | `/api/tasks/:id/subtasks/:subId` | Update subtask | Manager / Assigned member |

---

## Progress

- [x] Epic 1: Auth API — Register, Login, Token validation (17 TCs)
- [x] Epic 2: Groups API — Create, Invite, Remove, View (20 TCs)
- [x] Epic 3: Tasks & Subtasks API — CRUD, role-based access, boundary value (42 TCs)
- [ ] Epic 4: Flag & Approval
- [ ] Epic 5: Reports
- [ ] Epic 6: AI task splitting

---

## Testing Approach

### Manual & API Testing
Each epic has a dedicated test case document in `/docs/` covering:
- Happy path
- Error path (validation, authorization, not found)
- Boundary value analysis (where applicable)
- State verification (e.g. is_completed not reset after content edit)

### Postman Collections
Ready-to-import collections in `/postman/` with:
- Environment variables (`{{base_url}}`, `{{manager_token}}`, `{{member_token}}`, `{{auth_token}}`, `{{group_id}}`, `{{task_id}}`, `{{subtask_id}}`)
- Auto-save token and ID scripts after key requests

### Automation Testing
Planned using Playwright — to be added after all epics are complete.

---

## Key Testing Concepts Applied

- **Equivalence Partitioning** — grouping valid/invalid inputs
- **Boundary Value Analysis** — testing min/max boundaries (password length, subtask deadline vs task deadline)
- **Authorization Testing** — distinguishing 401 (unauthenticated) vs 403 (unauthorized)
- **Role-based Access Testing** — Manager vs Member permissions per endpoint
- **State Verification** — confirming one action does not unintentionally affect another state
- **Test Isolation** — using dynamic data (`{{$timestamp}}`) to avoid test data conflicts
- **Known Gaps Documentation** — explicitly noting what is not yet tested

---

*Built as a learning project. All test cases written by Quynh Tran.*
