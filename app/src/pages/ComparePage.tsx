import Header from '@cloudscape-design/components/header'
import SpaceBetween from '@cloudscape-design/components/space-between'
import Table from '@cloudscape-design/components/table'
import Box from '@cloudscape-design/components/box'
import StatusIndicator from '@cloudscape-design/components/status-indicator'
import type { RunResult } from '../App'

interface Row {
  metric: string
  manual: string
  iac: string
  manualOk?: boolean
  iacOk?: boolean
}

export default function ComparePage({ manual, iac }: { manual: RunResult | null; iac: RunResult | null }) {
  const rows: Row[] = [
    {
      metric: 'Thời gian hoàn tất (mô phỏng)',
      manual: manual ? (manual.timeMs / 1000).toFixed(1) + 's' : '--',
      iac: iac ? (iac.timeMs / 1000).toFixed(1) + 's' : '--',
    },
    {
      metric: 'Vấn đề cấu hình phát hiện được',
      manual: manual ? String(manual.errors) : '--',
      iac: iac ? String(iac.errors) : '--',
    },
    { metric: 'Xem trước thay đổi trước khi áp dụng', manual: 'Không có', iac: 'Change set', manualOk: false, iacOk: true },
    { metric: 'Xoá sạch bằng một thao tác', manual: 'Phải xoá từng tài nguyên', iac: 'Xoá cả stack', manualOk: false, iacOk: true },
    { metric: 'Dựng lại y hệt cho môi trường khác', manual: 'Dễ lệch cấu hình', iac: 'Chạy lại cùng template', manualOk: false, iacOk: true },
  ]

  return (
    <SpaceBetween size="l">
      <Header variant="h1" description="Bốn dòng đầu tự cập nhật theo lần bạn chạy Tab 1 / Tab 2.">
        So sánh kết quả
      </Header>
      <Table
        columnDefinitions={[
          { id: 'metric', header: 'Tiêu chí', cell: (item) => item.metric },
          {
            id: 'manual',
            header: 'Console thủ công',
            cell: (item) =>
              item.manualOk === undefined ? item.manual : <StatusIndicator type={item.manualOk ? 'success' : 'error'}>{item.manual}</StatusIndicator>,
          },
          {
            id: 'iac',
            header: 'Infrastructure as Code',
            cell: (item) =>
              item.iacOk === undefined ? item.iac : <StatusIndicator type={item.iacOk ? 'success' : 'error'}>{item.iac}</StatusIndicator>,
          },
        ]}
        items={rows}
        variant="embedded"
      />
      {(!manual || !iac) && (
        <Box color="text-body-secondary" fontSize="body-s">
          {!manual && !iac && 'Chưa chạy Tab 1 và Tab 2. '}
          {manual && !iac && 'Chưa chạy Tab 2 (Infrastructure as Code). '}
          {!manual && iac && 'Chưa chạy Tab 1 (Console thủ công). '}
          Chạy xong để thấy số liệu thật thay vì "--".
        </Box>
      )}
    </SpaceBetween>
  )
}
