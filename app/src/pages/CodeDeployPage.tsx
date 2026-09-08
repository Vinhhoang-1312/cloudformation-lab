import { useState } from 'react'
import Header from '@cloudscape-design/components/header'
import SpaceBetween from '@cloudscape-design/components/space-between'
import Container from '@cloudscape-design/components/container'
import Button from '@cloudscape-design/components/button'
import Box from '@cloudscape-design/components/box'
import Alert from '@cloudscape-design/components/alert'
import ProgressBar from '@cloudscape-design/components/progress-bar'
import ColumnLayout from '@cloudscape-design/components/column-layout'
import StatusIndicator from '@cloudscape-design/components/status-indicator'

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

export default function CodeDeployPage({ stackDeployed }: { stackDeployed: boolean }) {
  const [version, setVersion] = useState('v1.2')
  const [deploying, setDeploying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [blocked, setBlocked] = useState(false)

  async function deploy() {
    if (!stackDeployed) {
      setBlocked(true)
      return
    }
    setBlocked(false)
    setDeploying(true)
    setProgress(0)
    for (let p = 0; p <= 100; p += 20) {
      setProgress(p)
      await wait(220)
    }
    setVersion('v1.3')
    setDeploying(false)
  }

  return (
    <SpaceBetween size="l">
      <Header
        variant="h1"
        description="Điểm hay bị nhầm nhất: CodeDeploy không tạo VPC/cluster/service mới — chỉ thay phiên bản ứng dụng trên hạ tầng ECS/Fargate đã có sẵn từ Tab 2."
      >
        ECS + Fargate + CodeDeploy
      </Header>

      <Container header={<Header variant="h2">Cluster: shoply-cluster (Fargate) · Service: shoply-web</Header>}>
        <SpaceBetween size="m">
          <ColumnLayout columns={2}>
            <div>
              <Box variant="awsui-key-label">Đang chạy</Box>
              <StatusIndicator type="success">{version}</StatusIndicator>
            </div>
            {deploying && (
              <div>
                <Box variant="awsui-key-label">Triển khai dần</Box>
                <ProgressBar value={progress} additionalInfo="v1.3" />
              </div>
            )}
          </ColumnLayout>

          <Button variant="primary" onClick={deploy} loading={deploying} disabled={deploying}>
            Triển khai code mới bằng CodeDeploy → v1.3
          </Button>

          {blocked && (
            <Alert type="warning">Cần triển khai Stack ở Tab 2 trước — CodeDeploy không tự tạo hạ tầng.</Alert>
          )}

          <Box color="text-body-secondary" fontSize="body-s">
            Lưu ý: bấm nút này không đụng đến bảng tài nguyên ở Tab 2 — VPC, RDS, ALB… giữ nguyên. Chỉ task
            definition của service đổi phiên bản.
          </Box>
        </SpaceBetween>
      </Container>
    </SpaceBetween>
  )
}
