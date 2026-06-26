# Test Cases — Epic 2: Groups API

**Module:** Group Management (Create / Invite / Remove / View)  
**Base URL:** `{{base_url}}` = `http://localhost:3000`  
**Tester:** Quynh Tran  
**Test Date:** 2026-06-21  

---

## Test Accounts

| Role | Email | Password |
|---|---|---|
| Manager | testmanager@gmail.com | Abc123456 |
| Member | testmember1@gmail.com | Abc123456 |

---

| TC ID | Test Title | Precondition | Test Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|---|
| TC_01 | Verify server is running | | Send `GET /api/health` | `200 OK` | `200 OK` | Pass |
| TC_02 | Create group successfully with valid data | Account `testmanager@gmail.com` exists in DB. Logged in with valid `{{manager_token}}` | Send `POST /api/groups` with body: `{"name": "Group1"}` | `201 Created`, response body has `group.id`, `group.name`, `group.manager_id` | `201 Created`, response body has `group.id`, `group.name`, `group.manager_id` | Pass |
| TC_03 | Fail to create group with empty name | Logged in with valid `{{manager_token}}` | Send `POST /api/groups` with body: `{"name": ""}` | `400 Bad Request`, `error: "Ten nhom khong duoc de trong"` | `400 Bad Request`, `error: "Ten nhom khong duoc de trong"` | Pass |
| TC_04 | Fail to create group without token | | Send `POST /api/groups` with body: `{"name": "Group1"}` — no Authorization header | `401 Unauthorized`, `error: "Thieu token xac thuc"` | `401 Unauthorized`, `error: "Thieu token xac thuc"` | Pass |
| TC_05 | Invite member successfully with valid email | `testmanager@gmail.com` and `testmember1@gmail.com` exist in DB. Logged in with valid `{{manager_token}}`. Group exists and was created by testmanager. `testmember1` is not yet a member of the group | Send `POST /api/groups/{{group_id}}/members` with body: `{"email": "testmember1@gmail.com"}` | `201 Created`, `message: "Moi thanh vien thanh cong"`, `member.email: "testmember1@gmail.com"`, `member.full_name` has value | `201 Created`, `message: "Moi thanh vien thanh cong"`, `member.email: "testmember1@gmail.com"`, `member.full_name` has value | Pass |
| TC_06 | Fail to invite member with email not found in system | `testmanager@gmail.com` exists in DB. Logged in with valid `{{manager_token}}`. Group `{{group_id}}` exists | Send `POST /api/groups/{{group_id}}/members` with body: `{"email": "testmember10@gmail.com"}` | `404 Not Found`, `error: "Khong tim thay nguoi dung voi email nay"` | `404 Not Found`, `error: "Khong tim thay nguoi dung voi email nay"` | Pass |
| TC_07 | Fail to invite member when group does not exist | Logged in with valid `{{manager_token}}`. No group with groupId = 20 exists in DB | Send `POST /api/groups/20/members` with body: `{"email": "testmember1@gmail.com"}` | `404 Not Found`, `error: "Nhom khong ton tai"` | `404 Not Found`, `error: "Nhom khong ton tai"` | Pass |
| TC_08 | Fail to invite member using member account | `testmember1@gmail.com` exists in DB and is a member of group `{{group_id}}`. Logged in with valid `{{member_token}}` | Send `POST /api/groups/{{group_id}}/members` with body: `{"email": "testmember2@gmail.com"}` | `403 Forbidden`, `error: "Chi truong nhom moi co quyen moi thanh vien"` | `403 Forbidden`, `error: "Chi truong nhom moi co quyen moi thanh vien"` | Pass |
| TC_09 | Fail to invite member using id instead of email | `testmanager@gmail.com` exists in DB. Logged in with valid `{{manager_token}}`. Group `{{group_id}}` exists | Send `POST /api/groups/{{group_id}}/members` with body: `{"id": 1}` | `400 Bad Request`, `error: "Thieu email thanh vien can moi"` | `400 Bad Request`, `error: "Thieu email thanh vien can moi"` | Pass |
| TC_10 | Fail to invite member using full_name instead of email | `testmanager@gmail.com` exists in DB. Logged in with valid `{{manager_token}}`. Group `{{group_id}}` exists | Send `POST /api/groups/{{group_id}}/members` with body: `{"fullname": "Abc123456"}` | `400 Bad Request`, `error: "Thieu email thanh vien can moi"` | `400 Bad Request`, `error: "Thieu email thanh vien can moi"` | Pass |
| TC_11 | Fail to invite member who is already in the group | `testmanager@gmail.com` and `testmember1@gmail.com` exist in DB. Logged in with valid `{{manager_token}}`. `testmember1` is already a member of group `{{group_id}}` | Send `POST /api/groups/{{group_id}}/members` with body: `{"email": "testmember1@gmail.com"}` | `409 Conflict`, `error: "Nguoi dung nay da la thanh vien cua nhom"` | `409 Conflict`, `error: "Nguoi dung nay da la thanh vien cua nhom"` | Pass |
| TC_12 | View all groups current user belongs to | Logged in with valid token. User is a member of at least 1 group | Send `GET /api/groups` with valid token | `200 OK`, response body has array `groups`, each item has `group.id`, `group.name`, `group.manager_id`, `is_manager` | `200 OK`, response body has array `groups`, each item has `group.id`, `group.name`, `group.manager_id`, `is_manager` | Pass |
| TC_13 | View group members successfully | `testmember1@gmail.com` exists in DB and is a member of group (groupId = 3). Logged in with valid `{{member_token}}` | Send `GET /api/groups/3/members` | `200 OK`, response body has `group_id`, `group_name`, array `members`, each member has `id`, `email`, `full_name`, `is_manager` | `200 OK`, response body has `group_id`, `group_name`, array `members`, each member has `id`, `email`, `full_name`, `is_manager` | Pass |
| TC_14 | Fail to view group members when user is not in the group | `testmember2@gmail.com` exists in DB but is NOT a member of group `{{group_id}}`. Logged in with valid `{{member_token}}` | Send `GET /api/groups/{{group_id}}/members` | `403 Forbidden`, `error: "Ban khong phai thanh vien cua nhom nay"` | `403 Forbidden`, `error: "Ban khong phai thanh vien cua nhom nay"` | Pass |
| TC_15 | Remove member from group successfully | `testmanager@gmail.com` and `testmember1@gmail.com` exist in DB. Logged in with valid `{{manager_token}}`. `testmember1` (userId = 10) is a member of group (groupId = 3) | Send `DELETE /api/groups/3/members/10` with `{{manager_token}}` | `200 OK`, `message: "Da xoa thanh vien khoi nhom"` | `200 OK`, `message: "Da xoa thanh vien khoi nhom"` | Pass |
| TC_16 | Fail to remove member when group does not exist | `testmanager@gmail.com` exists in DB. Logged in with valid `{{manager_token}}`. No group with groupId = 20 in DB | Send `DELETE /api/groups/20/members/10` with `{{manager_token}}` | `404 Not Found`, `error: "Nhom khong ton tai"` | `404 Not Found`, `error: "Nhom khong ton tai"` | Pass |
| TC_17 | Fail to remove member when userId does not belong to group | `testmanager@gmail.com` exists in DB. Logged in with valid `{{manager_token}}`. userId = 2 is NOT a member of group (groupId = 3) | Send `DELETE /api/groups/3/members/2` with `{{manager_token}}` | `404 Not Found`, `error: "Nguoi dung nay khong phai thanh vien cua nhom"` | `404 Not Found`, `error: "Nguoi dung nay khong phai thanh vien cua nhom"` | Pass |
| TC_18 | Fail to remove member using member account | `testmember2@gmail.com` exists in DB and is a member of group (groupId = 3). Logged in with valid `{{member_token}}` | Send `DELETE /api/groups/3/members/9` with `{{member_token}}` | `403 Forbidden`, `error: "Chi truong nhom moi co quyen xoa thanh vien"` | `403 Forbidden`, `error: "Chi truong nhom moi co quyen xoa thanh vien"` | Pass |
| TC_19 | Fail when manager tries to remove themselves from group | Logged in with valid `{{manager_token}}`. Group (groupId = 1) exists and manager_id = 1 | Send `DELETE /api/groups/1/members/1` with `{{manager_token}}` | `400 Bad Request`, `error: "Truong nhom khong the tu roi nhom, hay chuyen quyen truong nhom truoc"` | `400 Bad Request`, `error: "Truong nhom khong the tu roi nhom, hay chuyen quyen truong nhom truoc"` | Pass |
| TC_20 | Fail to view members when group does not exist | Logged in with valid token | Send `GET /api/groups/999/members` with valid token | `404 Not Found`, `error: "Nhom khong ton tai"` | `404 Not Found`, `error: "Nhom khong ton tai"` | Pass |

---

## Summary

| | Count |
|---|---|
| Total test cases | 20 |
| Pass | 20 |
| Fail | 0 |

**Techniques applied:**
- Happy path testing (TC_02, TC_05, TC_12, TC_13, TC_15)
- Authorization testing — 401 vs 403 (TC_04, TC_08, TC_14, TC_18)
- Not found testing — 404 (TC_06, TC_07, TC_16, TC_17, TC_20)
- Invalid input testing (TC_03, TC_09, TC_10)
- Business rule testing (TC_11, TC_19)

---

## Known Gaps — To be covered in v2

- Rename group (manager changes group name)
- Transfer manager role to another member before leaving
- User views groups across multiple teams simultaneously
- Manager invites themselves (already a member via auto-add on creation)
- Create group with name containing special characters or exceeding max length
