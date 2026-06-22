# Test Cases — Epic 1: Auth API

**Module:** Authentication (Register / Login / Get current user)  
**Base URL:** `{{base_url}}` = `http://localhost:3000`  
**Tester:** Quynh Tran  
**Ngày test:** 2026-06-21  

---

| TC ID | Test Title | Precondition | Test Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|---|
| TC_01 | Kiểm tra server hoạt động | | Gửi `GET /api/health` | `200 OK` | `200 OK` | Pass |
| TC_02 | Đăng ký thành công với thông tin hợp lệ | Không có tài khoản nào trong DB với email này | Gửi `POST /api/auth/register` với body: `email: test_<timestamp>@gmail.com`, `password: "Abc123"` (6 ký tự), `full_name: "Nguyen Van A"` | `201 Created`, response body có `user.email`, `user.id`, `token` | `201 Created`, response body có `user.email`, `user.id`, `token` | Pass |
| TC_03 | Đăng ký thất bại khi email đã tồn tại | Đã có tài khoản với email `test@gmail.com` trong DB | Gửi `POST /api/auth/register` với `email: test@gmail.com`, `password: "Abc123"`, `full_name: "Nguyen Van B"` | `409 Conflict`, `error: "Email da duoc su dung"` | `409 Conflict`, `error: "Email da duoc su dung"` | Pass |
| TC_04 | Đăng ký thất bại với mật khẩu = 5 ký tự | | Gửi `POST /api/auth/register` với body: `email: test_<timestamp>@gmail.com`, `password: "Abc12"` (5 ký tự), `full_name: "Nguyen Van A"` | `400 Bad Request`, `error: "Password phai co it nhat 6 ky tu"` | `400 Bad Request`, `error: "Password phai co it nhat 6 ky tu"` | Pass |
| TC_05 | Đăng ký thành công với mật khẩu = 6 ký tự (boundary min) | Không có tài khoản nào trong DB với email này | Gửi `POST /api/auth/register` với body: `email: test_<timestamp>@gmail.com`, `password: "Abc123"` (6 ký tự), `full_name: "Nguyen Van A"` | `201 Created`, response body có `user.email`, `user.id`, `token` | `201 Created`, response body có `user.email`, `user.id`, `token` | Pass |
| TC_06 | Đăng ký thành công với mật khẩu = 9 ký tự (giữa khoảng) | Không có tài khoản nào trong DB với email này | Gửi `POST /api/auth/register` với body: `email: test_<timestamp>@gmail.com`, `password: "Abc123456"` (9 ký tự), `full_name: "Nguyen Van A"` | `201 Created`, response body có `user.email`, `user.id`, `token` | `201 Created`, response body có `user.email`, `user.id`, `token` | Pass |
| TC_07 | Đăng ký thành công với mật khẩu = 12 ký tự (boundary max) | Không có tài khoản nào trong DB với email này | Gửi `POST /api/auth/register` với body: `email: test_<timestamp>@gmail.com`, `password: "Abc123456789"` (12 ký tự), `full_name: "Nguyen Van A"` | `201 Created`, response body có `user.email`, `user.id`, `token` | `201 Created`, response body có `user.email`, `user.id`, `token` | Pass |
| TC_08 | Đăng ký thất bại với mật khẩu = 13 ký tự | | Gửi `POST /api/auth/register` với body: `email: test_<timestamp>@gmail.com`, `password: "Abc1234567890"` (13 ký tự), `full_name: "Nguyen Van A"` | `400 Bad Request`, `error: "Password phai co toi da 12 ky tu"` | `400 Bad Request`, `error: "Password phai co toi da 12 ky tu"` | Pass |
| TC_09 | Đăng ký thất bại với mật khẩu < 6 ký tự | | Gửi `POST /api/auth/register` với body: `email: test_<timestamp>@gmail.com`, `password: "Abc"` (3 ký tự), `full_name: "Nguyen Van A"` | `400 Bad Request`, `error: "Password phai co it nhat 6 ky tu"` | `400 Bad Request`, `error: "Password phai co it nhat 6 ky tu"` | Pass |
| TC_10 | Đăng ký thất bại với mật khẩu > 12 ký tự | | Gửi `POST /api/auth/register` với body: `email: test_<timestamp>@gmail.com`, `password: "Abc1234567890abcdef"` (19 ký tự), `full_name: "Nguyen Van A"` | `400 Bad Request`, `error: "Password phai co toi da 12 ky tu"` | `400 Bad Request`, `error: "Password phai co toi da 12 ky tu"` | Pass |
| TC_11 | Đăng ký thất bại khi bỏ trống field full_name | | Gửi `POST /api/auth/register` với body: `email: test_<timestamp>@gmail.com`, `password: "Abc123456"` (không có `full_name`) | `400 Bad Request`, `error: "Thieu email, password hoac full_name"` | `400 Bad Request`, `error: "Thieu email, password hoac full_name"` | Pass |
| TC_12 | Đăng ký thất bại với email sai định dạng | | Gửi `POST /api/auth/register` với body: `email: "testwrongemail"`, `password: "Abc123456"` (9 ký tự), `full_name: "Nguyen Van A"` | `400 Bad Request`, `error: "Email khong dung dinh dang"` | `400 Bad Request`, `error: "Email khong dung dinh dang"` | Pass |
| TC_13 | Đăng nhập thành công với thông tin hợp lệ | Đã có tài khoản `test@gmail.com` / `"Abc123"` trong DB | Gửi `POST /api/auth/login` với `email: test@gmail.com`, `password: "Abc123"` | `200 OK`, response body có `token` | `200 OK` | Pass |
| TC_14 | Đăng nhập thất bại khi password sai | Đã có tài khoản `test@gmail.com` / `"Abc123"` trong DB | Gửi `POST /api/auth/login` với `email: test@gmail.com`, `password: "WrongPass1"` (đúng định dạng 6–12 ký tự nhưng sai giá trị) | `401 Unauthorized`, `error: "Email hoac password khong dung"` | `401 Unauthorized`, `error: "Email hoac password khong dung"` | Pass |
| TC_15 | Xác thực tài khoản thành công với token hợp lệ | Đã có tài khoản `test@gmail.com` / `"Abc123"` trong DB và đã có token hợp lệ từ TC_13 | Gửi `GET /api/auth/me` kèm header `Authorization: Bearer <token từ TC_13>` | `200 OK`, response body trả đúng thông tin user | `200 OK` | Pass |
| TC_16 | Xác thực tài khoản thất bại khi không gửi token | | Gửi `GET /api/auth/me` không kèm header `Authorization` | `401 Unauthorized`, `error: "Thieu token xac thuc"` | `401 Unauthorized`, `error: "Thieu token xac thuc"` | Pass |
| TC_17 | Xác thực tài khoản thất bại với token không hợp lệ | Đã có tài khoản `test@gmail.com` / `"Abc123"` trong DB | Gửi `GET /api/auth/me` với token không hợp lệ: lấy token từ TC_13, xóa 2 ký tự cuối rồi gửi | `401 Unauthorized`, `error: "Token khong hop le hoac da het han"` | `401 Unauthorized`, `error: "Token khong hop le hoac da het han"` | Pass |

---

## Tổng kết

| | Số lượng |
|---|---|
| Tổng test case | 17 |
| Pass | 17 |
| Fail | 0 |

