import Header from '@cloudscape-design/components/header'
import SpaceBetween from '@cloudscape-design/components/space-between'
import Table from '@cloudscape-design/components/table'
import Alert from '@cloudscape-design/components/alert'

import { KNOWN_NAME_ONLY } from '../data/lab'

const GROUPS = [
  { group: 'Tạo hạ tầng', services: 'CloudFormation, CDK, SAM, Elastic Beanstalk', role: 'Dựng VPC, EC2, RDS, ECS cluster… từ con số 0' },
  { group: 'Đẩy code', services: 'CodeDeploy', role: 'Hạ tầng đã có sẵn, chỉ thay phiên bản ứng dụng' },
]

export default function ClassifyPage() {
  return (
    <SpaceBetween size="l">
      <Header
        variant="h1"
        description="Nhiều tài liệu liệt kê các dịch vụ deploy của AWS như thể chúng ngang hàng nhau. Thực ra chúng chia làm hai việc rất khác nhau."
      >
        Điểm dễ nhầm nhất: 8 dịch vụ, chỉ 2 nhóm
      </Header>

      <Table
        columnDefinitions={[
          { id: 'group', header: 'Nhóm', cell: (item) => item.group },
          { id: 'services', header: 'Dịch vụ', cell: (item) => item.services },
          { id: 'role', header: 'Làm gì', cell: (item) => item.role },
        ]}
        items={GROUPS}
        variant="embedded"
      />

      <Alert type="info">
        ECS và EKS không thuộc nhóm nào ở trên — chúng là <b>nơi container chạy</b>, không phải công cụ deploy. Gộp
        chung 8 cái vào một danh sách phẳng là lý do khái niệm này hay gây rối.
      </Alert>

      <Header variant="h2">Biết tên là đủ, chưa cần đào sâu</Header>
      <Table
        columnDefinitions={[
          { id: 'name', header: 'Dịch vụ', cell: (item) => item.name },
          { id: 'note', header: 'Một câu để nhớ', cell: (item) => item.note },
        ]}
        items={KNOWN_NAME_ONLY}
        variant="embedded"
      />
    </SpaceBetween>
  )
}
