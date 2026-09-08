# CloudFormation Lab

Trang mô phỏng tương tác giúp hiểu sự khác biệt giữa dựng hạ tầng AWS **thủ công qua Console** và **Infrastructure as Code (IaC)** — không cần tài khoản AWS, không phát sinh chi phí.

## Cách chạy

Mở file [`aws-iac-lab.html`](aws-iac-lab.html) trực tiếp bằng trình duyệt (double-click hoặc kéo thả vào tab trình duyệt).

## Nội dung

- **Tab 1 — Console thủ công**: dựng 6 tài nguyên (VPC, Subnet, Security Group, EC2, RDS, Load Balancer) bằng cách bấm tay từng bước theo đúng thứ tự, có đồng hồ bấm giờ và một lỗi cấu hình mô phỏng phải tự phát hiện & sửa.
- **Tab 2 — Infrastructure as Code**: cùng 6 tài nguyên đó được khai báo trong một template. Có thể đổi qua lại giữa cú pháp **CloudFormation (YAML)**, **AWS CDK (Python)**, **AWS SAM (YAML)**; xem trước **Change Set**, **triển khai Stack**, cập nhật cấu hình, hoặc **xoá Stack** trong một thao tác.
- **Bảng so sánh** thời gian và số lỗi giữa hai cách sau khi chạy.
- **Mini-demo CodeDeploy**: minh hoạ vì sao CodeDeploy khác CloudFormation/SAM — nó chỉ đẩy phiên bản code mới lên hạ tầng ECS/Fargate đã tồn tại, không tự tạo hạ tầng.
- **Glossary**: Infrastructure as Code, Stack, Change Set, Nested Stack, Stack Set, AWS CDK, AWS SAM, ECS + Fargate, CodeDeploy.
- Bảng phân loại 8 dịch vụ deploy của AWS theo 2 nhóm: *tạo hạ tầng* và *đẩy code*.

## License

[MIT](LICENSE)
