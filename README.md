# CloudFormation Lab

Trang mô phỏng tương tác giúp hiểu sự khác biệt giữa dựng hạ tầng AWS **thủ công qua Console** và **Infrastructure as Code (IaC)** — không cần tài khoản AWS, không phát sinh chi phí.

Có 2 bản, cùng nội dung, khác mức độ thật:

## Bản nhẹ — [`aws-iac-lab.html`](aws-iac-lab.html)

Mở trực tiếp bằng trình duyệt (double-click), không cần cài gì. Mỗi tài nguyên chỉ có 1 nút "Thực hiện" mô phỏng nhanh, không có form nhập liệu thật.

## Bản đầy đủ — [`app/`](app/)

Xây bằng **React + AWS Cloudscape Design System** (đúng bộ component AWS dùng để xây Console thật), giống giao diện AWS thật hơn nhiều. Đặc biệt: Tab 1 bắt **nhập liệu thật** cho từng tài nguyên (CIDR block hợp lệ, subnet phải nằm trong dải VPC, security group phải tự thêm rule...) — kể cả để bạn tạo ra cấu hình "hợp lệ nhưng sẽ không chạy" y như AWS thật (vd: tạo ALB listener HTTPS trong khi security group chưa mở port 443).

Cần cài [Node.js](https://nodejs.org) trước. Sau đó:

```bash
cd app
npm install
npm run dev
```

Mở link mà terminal in ra (thường là `http://localhost:5173`).

## Nội dung (cả 2 bản)

- **Tab 1 — Console thủ công**: dựng 6 tài nguyên (VPC, Subnet, Security Group, EC2, RDS, Load Balancer) theo đúng thứ tự.
- **Tab 2 — Infrastructure as Code**: cùng 6 tài nguyên đó khai báo trong một template. Đổi qua lại giữa cú pháp **CloudFormation (YAML)**, **AWS CDK (Python)**, **AWS SAM (YAML)**; xem trước **Change Set**, **triển khai Stack**, cập nhật cấu hình, hoặc **xoá Stack** trong một thao tác.
- **Bảng so sánh** thời gian và số lỗi giữa hai cách sau khi chạy.
- **Mini-demo CodeDeploy**: minh hoạ vì sao CodeDeploy khác CloudFormation/SAM — nó chỉ đẩy phiên bản code mới lên hạ tầng ECS/Fargate đã tồn tại, không tự tạo hạ tầng.
- **Glossary**: Infrastructure as Code, Stack, Change Set, Nested Stack, Stack Set, AWS CDK, AWS SAM, ECS + Fargate, CodeDeploy.
- Bảng phân loại 8 dịch vụ deploy của AWS theo 2 nhóm: *tạo hạ tầng* và *đẩy code*.

## License

[MIT](LICENSE)
