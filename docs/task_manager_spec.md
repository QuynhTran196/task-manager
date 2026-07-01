# Task Manager App — Spec v1 (chốt bởi user, qua quá trình Q&A với "thầy")

## 1. Mục tiêu sản phẩm
Giúp cá nhân và nhóm quản lý công việc, thời gian hiệu quả: tránh quên task, hoàn thành đúng hạn,
theo dõi tiến độ rõ ràng cho cả cá nhân lẫn quản lý nhóm.

## 2. Vai trò người dùng
| Vai trò | Quyền hạn |
|---|---|
| Trưởng nhóm (Manager) | Tạo nhóm, thêm/xóa thành viên, tạo & gán task cho thành viên, xem tiến độ tất cả thành viên, duyệt cờ phát sinh |
| Thành viên (Member) | Có workspace cá nhân riêng tư (CRUD tự do), xem & cập nhật tiến độ task được gán trong nhóm, không xem được task của thành viên khác |

Một thành viên **có thể thuộc nhiều nhóm cùng lúc**.

> Quyết định bởi Claude (giữ đơn giản cho phạm vi portfolio):
> - Không có vai trò "phó nhóm". Nếu trưởng nhóm rời nhóm, nhóm cần một trưởng nhóm mới được chỉ định thủ công trước khi trưởng nhóm cũ có thể rời — tránh nhóm "mồ côi" không ai quản lý.
> - Một nhóm chỉ có đúng 1 trưởng nhóm tại một thời điểm.

## 3. Workspace
Mỗi thành viên có **2 khu vực** tách biệt:
1. **Workspace nhóm**: nơi trưởng nhóm tạo, gán task. Thành viên xem & cập nhật tiến độ task của mình, không thấy task của người khác trong cùng nhóm.
2. **Workspace cá nhân**: riêng tư hoàn toàn, CRUD tự do, không ai khác xem được (kể cả trưởng nhóm).

Trang cá nhân hiển thị 2 bảng:
- Bảng tổng: tất cả nhóm đang tham gia + task được gán + tiến độ
- Bảng task cá nhân tự tạo

Trưởng nhóm xem được: thành viên đang giữ bao nhiêu task, thuộc những nhóm nào (trong phạm vi nhóm mình quản lý).

## 4. Task & Subtask
- Task có: tiêu đề, deadline, độ ưu tiên, trạng thái, người được gán, có thể đính kèm link/file.
- Task có thể được **tách thành subtask** (qua AI phân tích hoặc tự tay) — **chỉ 1 cấp**, không cho lồng subtask trong subtask.
- Subtask có deadline & priority riêng, nhưng **phải nằm trong phạm vi deadline của task tổng**.
- Subtask hoàn thành bằng **tick thủ công** — sửa nội dung subtask (vd đổi tiêu đề) **không** tự động reset trạng thái tick.
- Không phải task nào cũng cần subtask.

## 5. Deadline & cảnh báo
- Cảnh báo trước hạn 1–3 ngày.
- Có cột đếm ngược thời gian còn lại.
- Hết hạn mà chưa tick hoàn thành → hiển thị **báo đỏ** (không tự động chặn hay tự dời ngày).

## 6. Xử lý phát sinh / vấn đề
- Khi gặp vấn đề, thành viên có thể **gắn cờ + ghi chú lý do** trên task/subtask.
- Cờ được gửi tới trưởng nhóm để xem & quyết định hướng xử lý (vd dời deadline).

> Quyết định bởi Claude (cần làm rõ thêm khi build, vì đây vẫn là phần "mở" nhất của spec):
> - Khi 1 task đang có cờ chờ duyệt, deadline **vẫn tiếp tục đếm ngược bình thường** — không tự tạm dừng. Lý do: tạm dừng đếm ngược cần thêm trạng thái mới ("đang chờ duyệt") kéo theo nhiều luồng xử lý phụ, không cần thiết cho bản v1. Trưởng nhóm cần chủ động xử lý cờ trước hạn.

## 7. Báo cáo tiến độ
Kết hợp 2 dạng:
1. **Số liệu tự động**: % hoàn thành, số task trễ hạn, số task đang chờ xử lý — hệ thống tự tính theo nhóm/theo thành viên.
2. **Báo cáo ngắn dạng standup**: thành viên tự viết cập nhật ngắn mỗi ngày (vd "hôm nay đã làm gì, vướng gì").

## 8. Vòng đời thành viên trong nhóm
Khi thành viên bị xóa hoặc rời nhóm:
- Task đang gán cho họ **tự động unassign** (chuyển về trạng thái "chưa giao").
- Các task này được **gom vào một mục riêng** trong bảng hiển thị của nhóm (vd "Task chưa có người nhận"), không biến mất, chờ trưởng nhóm gán cho người khác.

## 9. Concurrency (sửa đồng thời)
> Quyết định bởi Claude (giữ đơn giản cho phạm vi portfolio):
> - Áp dụng nguyên tắc "ai lưu sau, thắng" (last write wins) — không xây dựng cơ chế khóa (locking) hay merge phức tạp.
> - Đây là một giới hạn **có chủ đích** của bản v1, và là một test case tốt để khai thác trong báo cáo bug ("hệ thống không cảnh báo khi 2 người sửa cùng lúc, dữ liệu của người sửa trước bị ghi đè âm thầm") — đáng để bạn liệt kê như một **known limitation** trong tài liệu test, thể hiện bạn hiểu rõ giới hạn hệ thống, không phải bỏ sót.

## 10. Phạm vi KHÔNG làm trong v1 (out of scope)
- Task lồng nhiều cấp (sub-subtask)
- Cơ chế khóa khi sửa đồng thời (concurrency locking)
- Vai trò "phó nhóm" / phân quyền chi tiết hơn 2 cấp
- Tự động dời deadline khi có cờ phát sinh
