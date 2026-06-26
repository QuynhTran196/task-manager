# Test Cases — Epic 1: Auth API

**Module:** Authentication (Register / Login / Get current user)  
**Base URL:** `{{base_url}}` = `http://localhost:3000`  
**Tester:** Quynh Tran  
**Test Date:** 2026-06-21  

---

## Password Rules
- Minimum: 6 characters
- Maximum: 12 characters

---

| TC ID | Test Title | Precondition | Test Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|---|
| TC_01 | Verify server is running | | Send `GET /api/health` | `200 OK` | `200 OK` | Pass |
| TC_02 | Register successfully with valid data | No account with this email exists in DB | Send `POST /api/auth/register` with body: `email: test_<timestamp>@gmail.com`, `password: "Abc123"` (6 chars), `full_name: "Nguyen Van A"` | `201 Created`, response body has `user.email`, `user.id`, `token` | `201 Created`, response body has `user.email`, `user.id`, `token` | Pass |
| TC_03 | Fail to register with existing email | Account with `test@gmail.com` already exists in DB | Send `POST /api/auth/register` with `email: test@gmail.com`, `password: "Abc123"`, `full_name: "Nguyen Van B"` | `409 Conflict`, `error: "Email da duoc su dung"` | `409 Conflict`, `error: "Email da duoc su dung"` | Pass |
| TC_04 | Fail to register with password = 5 chars (below min) | | Send `POST /api/auth/register` with `email: test_<timestamp>@gmail.com`, `password: "Abc12"` (5 chars), `full_name: "Nguyen Van A"` | `400 Bad Request`, `error: "Password phai co it nhat 6 ky tu"` | `400 Bad Request`, `error: "Password phai co it nhat 6 ky tu"` | Pass |
| TC_05 | Register successfully with password = 6 chars (boundary min) | No account with this email exists in DB | Send `POST /api/auth/register` with `email: test_<timestamp>@gmail.com`, `password: "Abc123"` (6 chars), `full_name: "Nguyen Van A"` | `201 Created`, response body has `user.email`, `user.id`, `token` | `201 Created`, response body has `user.email`, `user.id`, `token` | Pass |
| TC_06 | Register successfully with password = 9 chars (mid-range) | No account with this email exists in DB | Send `POST /api/auth/register` with `email: test_<timestamp>@gmail.com`, `password: "Abc123456"` (9 chars), `full_name: "Nguyen Van A"` | `201 Created`, response body has `user.email`, `user.id`, `token` | `201 Created`, response body has `user.email`, `user.id`, `token` | Pass |
| TC_07 | Register successfully with password = 12 chars (boundary max) | No account with this email exists in DB | Send `POST /api/auth/register` with `email: test_<timestamp>@gmail.com`, `password: "Abc123456789"` (12 chars), `full_name: "Nguyen Van A"` | `201 Created`, response body has `user.email`, `user.id`, `token` | `201 Created`, response body has `user.email`, `user.id`, `token` | Pass |
| TC_08 | Fail to register with password = 13 chars (above max) | | Send `POST /api/auth/register` with `email: test_<timestamp>@gmail.com`, `password: "Abc1234567890"` (13 chars), `full_name: "Nguyen Van A"` | `400 Bad Request`, `error: "Password phai co toi da 12 ky tu"` | `400 Bad Request`, `error: "Password phai co toi da 12 ky tu"` | Pass |
| TC_09 | Fail to register with password < 6 chars | | Send `POST /api/auth/register` with `email: test_<timestamp>@gmail.com`, `password: "Abc"` (3 chars), `full_name: "Nguyen Van A"` | `400 Bad Request`, `error: "Password phai co it nhat 6 ky tu"` | `400 Bad Request`, `error: "Password phai co it nhat 6 ky tu"` | Pass |
| TC_10 | Fail to register with password > 12 chars | | Send `POST /api/auth/register` with `email: test_<timestamp>@gmail.com`, `password: "Abc1234567890abcdef"` (19 chars), `full_name: "Nguyen Van A"` | `400 Bad Request`, `error: "Password phai co toi da 12 ky tu"` | `400 Bad Request`, `error: "Password phai co toi da 12 ky tu"` | Pass |
| TC_11 | Fail to register with missing full_name field | | Send `POST /api/auth/register` with `email: test_<timestamp>@gmail.com`, `password: "Abc123456"` — no `full_name` field | `400 Bad Request`, `error: "Thieu email, password hoac full_name"` | `400 Bad Request`, `error: "Thieu email, password hoac full_name"` | Pass |
| TC_12 | Fail to register with invalid email format | | Send `POST /api/auth/register` with `email: "testwrongemail"`, `password: "Abc123456"` (9 chars), `full_name: "Nguyen Van A"` | `400 Bad Request`, `error: "Email khong dung dinh dang"` | `400 Bad Request`, `error: "Email khong dung dinh dang"` | Pass |
| TC_13 | Login successfully with valid credentials | Account `test@gmail.com` / `"Abc123"` exists in DB | Send `POST /api/auth/login` with `email: test@gmail.com`, `password: "Abc123"` | `200 OK`, response body has `token` | `200 OK` | Pass |
| TC_14 | Fail to login with wrong password | Account `test@gmail.com` / `"Abc123"` exists in DB | Send `POST /api/auth/login` with `email: test@gmail.com`, `password: "WrongPass1"` (valid format 6-12 chars but wrong value) | `401 Unauthorized`, `error: "Email hoac password khong dung"` | `401 Unauthorized`, `error: "Email hoac password khong dung"` | Pass |
| TC_15 | Get current user info successfully with valid token | Account `test@gmail.com` exists in DB. Valid token obtained from TC_13 | Send `GET /api/auth/me` with header `Authorization: Bearer <token from TC_13>` | `200 OK`, response body returns correct user info | `200 OK` | Pass |
| TC_16 | Fail to get user info without token | | Send `GET /api/auth/me` — no Authorization header | `401 Unauthorized`, `error: "Thieu token xac thuc"` | `401 Unauthorized`, `error: "Thieu token xac thuc"` | Pass |
| TC_17 | Fail to get user info with invalid token | Account `test@gmail.com` exists in DB | Send `GET /api/auth/me` with tampered token: take token from TC_13, remove last 2 characters | `401 Unauthorized`, `error: "Token khong hop le hoac da het han"` | `401 Unauthorized`, `error: "Token khong hop le hoac da het han"` | Pass |

---

## Summary

| | Count |
|---|---|
| Total test cases | 17 |
| Pass | 17 |
| Fail | 0 |

**Techniques applied:**
- Equivalence Partitioning: valid password range (6-12) vs invalid (< 6, > 12)
- Boundary Value Analysis: testing exact boundaries min=6, max=12 (TC_04, TC_05, TC_07, TC_08)
- Authentication testing: token present / missing / tampered (TC_15, TC_16, TC_17)

---

## Known Gaps — To be covered in v2

- Login with email that does not exist in the system
- Expired token (requires setting expiresIn to short value e.g. 10s)
- SQL Injection attempt in email/password fields
- Register with missing email or password field
- Register with full_name containing special characters or exceeding max length
