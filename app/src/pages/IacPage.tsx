import { useEffect, useState } from 'react'
import Container from '@cloudscape-design/components/container'
import Header from '@cloudscape-design/components/header'
import SpaceBetween from '@cloudscape-design/components/space-between'
import Button from '@cloudscape-design/components/button'
import Tabs from '@cloudscape-design/components/tabs'
import Table from '@cloudscape-design/components/table'
import StatusIndicator from '@cloudscape-design/components/status-indicator'
import Box from '@cloudscape-design/components/box'
import Alert from '@cloudscape-design/components/alert'
import ColumnLayout from '@cloudscape-design/components/column-layout'
import Toggle from '@cloudscape-design/components/toggle'
import SegmentedControl from '@cloudscape-design/components/segmented-control'

import { RESOURCES, CODE_SNIPPETS } from '../data/lab'
import type { RunResult } from '../App'

export interface IacState {
  deployed: boolean
}

type Status = 'idle' | 'progress' | 'complete' | 'deleting'
type Phase = 'idle' | 'deploying' | 'deployed' | 'updating' | 'deleting'
type Lang = 'cfn' | 'cdk' | 'sam'

interface ResourceRow {
  id: string
  logicalId: string
  type: string
  duration: number
  status: Status
}

interface EventRow {
  time: string
  logicalId: string
  status: string
}

interface ChangeSetRow {
  logicalId: string
  action: 'Add' | 'Modify' | 'None'
  detail?: string
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

export default function IacPage({
  onComplete,
  result,
  state,
  setState,
}: {
  onComplete: (r: RunResult) => void
  result: RunResult | null
  state: IacState
  setState: (s: IacState) => void
}) {
  const [resources, setResources] = useState<ResourceRow[]>(
    RESOURCES.map((r) => ({ id: r.id, logicalId: r.logicalId, type: r.type, duration: r.deployDuration, status: 'idle' })),
  )
  const [applied, setApplied] = useState({ ec2Type: 't3.micro', rdsMultiAz: false })
  const [changeSet, setChangeSet] = useState<ChangeSetRow[] | null>(null)
  const [phase, setPhase] = useState<Phase>('idle')
  const [events, setEvents] = useState<EventRow[]>([])
  const [startTs, setStartTs] = useState<number | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [lang, setLang] = useState<Lang>('cfn')
  const [activeTab, setActiveTab] = useState('resources')
  const [ec2Upgrade, setEc2Upgrade] = useState(false)
  const [rdsMultiAzToggle, setRdsMultiAzToggle] = useState(false)

  useEffect(() => {
    if (startTs === null || (phase !== 'deploying' && phase !== 'deleting')) return
    const id = setInterval(() => setElapsed(Date.now() - startTs), 100)
    return () => clearInterval(id)
  }, [startTs, phase])

  function logEvent(logicalId: string, status: string, ts: number) {
    setEvents((ev) => [...ev, { time: ((Date.now() - ts) / 1000).toFixed(1) + 's', logicalId, status }])
  }

  function previewChangeSet() {
    if (phase === 'idle') {
      setChangeSet(resources.map((r) => ({ logicalId: r.logicalId, action: 'Add' })))
    } else if (phase === 'deployed') {
      const rows: ChangeSetRow[] = resources.map((r) => {
        if (r.id === 'ec2' && ec2Upgrade && applied.ec2Type !== 't3.large') {
          return { logicalId: r.logicalId, action: 'Modify', detail: 'InstanceType: t3.micro → t3.large' }
        }
        if (r.id === 'rds' && rdsMultiAzToggle && !applied.rdsMultiAz) {
          return { logicalId: r.logicalId, action: 'Modify', detail: 'MultiAZ: false → true' }
        }
        return { logicalId: r.logicalId, action: 'None' }
      })
      setChangeSet(rows)
    }
  }

  async function deployStack() {
    const ts = Date.now()
    setStartTs(ts)
    setPhase('deploying')
    setEvents([])
    for (const r of resources) {
      setResources((rs) => rs.map((x) => (x.id === r.id ? { ...x, status: 'progress' } : x)))
      logEvent(r.logicalId, 'CREATE_IN_PROGRESS', ts)
      await wait(r.duration)
      setResources((rs) => rs.map((x) => (x.id === r.id ? { ...x, status: 'complete' } : x)))
      logEvent(r.logicalId, 'CREATE_COMPLETE', ts)
    }
    const finalElapsed = Date.now() - ts
    setElapsed(finalElapsed)
    setPhase('deployed')
    setChangeSet(null)
    setState({ deployed: true })
    onComplete({ timeMs: finalElapsed, errors: 0 })
  }

  async function applyUpdate() {
    if (!changeSet) return
    const modified = changeSet.filter((c) => c.action === 'Modify')
    if (modified.length === 0) return
    setPhase('updating')
    const ts = startTs ?? Date.now()
    for (const c of modified) {
      const r = resources.find((x) => x.logicalId === c.logicalId)!
      setResources((rs) => rs.map((x) => (x.id === r.id ? { ...x, status: 'progress' } : x)))
      logEvent(r.logicalId, 'UPDATE_IN_PROGRESS', ts)
      await wait(900)
      if (r.id === 'ec2') setApplied((a) => ({ ...a, ec2Type: 't3.large' }))
      if (r.id === 'rds') setApplied((a) => ({ ...a, rdsMultiAz: true }))
      setResources((rs) => rs.map((x) => (x.id === r.id ? { ...x, status: 'complete' } : x)))
      logEvent(r.logicalId, 'UPDATE_COMPLETE', ts)
    }
    setPhase('deployed')
    setChangeSet(null)
  }

  async function deleteStack() {
    const ts = Date.now()
    setStartTs(ts)
    setPhase('deleting')
    for (const r of [...resources].reverse()) {
      setResources((rs) => rs.map((x) => (x.id === r.id ? { ...x, status: 'deleting' } : x)))
      logEvent(r.logicalId, 'DELETE_IN_PROGRESS', ts)
      await wait(400)
    }
    setResources(RESOURCES.map((r) => ({ id: r.id, logicalId: r.logicalId, type: r.type, duration: r.deployDuration, status: 'idle' })))
    setApplied({ ec2Type: 't3.micro', rdsMultiAz: false })
    setEc2Upgrade(false)
    setRdsMultiAzToggle(false)
    setPhase('idle')
    setChangeSet(null)
    setState({ deployed: false })
  }

  const statusBadge: Record<Phase, { type: 'pending' | 'in-progress' | 'success' | 'error'; text: string }> = {
    idle: { type: 'pending', text: 'Chưa triển khai' },
    deploying: { type: 'in-progress', text: 'CREATE_IN_PROGRESS' },
    deployed: { type: 'success', text: 'CREATE_COMPLETE' },
    updating: { type: 'in-progress', text: 'UPDATE_IN_PROGRESS' },
    deleting: { type: 'error', text: 'DELETE_IN_PROGRESS' },
  }

  return (
    <SpaceBetween size="l">
      <Header
        variant="h1"
        description="Cùng 6 tài nguyên đó, khai báo trong một template thay vì bấm tay từng bước."
        actions={
          <SpaceBetween direction="horizontal" size="xs">
            <Button onClick={previewChangeSet} disabled={phase === 'deploying' || phase === 'deleting' || phase === 'updating'}>
              {phase === 'idle' ? 'Create change set' : 'Xem change set cập nhật'}
            </Button>
            {phase === 'idle' && (
              <Button variant="primary" onClick={deployStack} disabled={!changeSet}>
                Deploy stack
              </Button>
            )}
            {phase === 'deployed' && changeSet && changeSet.some((c) => c.action === 'Modify') && (
              <Button variant="primary" onClick={applyUpdate}>
                Update stack
              </Button>
            )}
            {(phase === 'deployed' || phase === 'updating') && (
              <Button onClick={deleteStack} disabled={phase === 'updating'}>
                Delete stack
              </Button>
            )}
          </SpaceBetween>
        }
      >
        Stack: shoply-app
      </Header>

      <ColumnLayout columns={3}>
        <div>
          <Box variant="awsui-key-label">Trạng thái</Box>
          <StatusIndicator type={statusBadge[phase].type}>{statusBadge[phase].text}</StatusIndicator>
        </div>
        <div>
          <Box variant="awsui-key-label">Đồng hồ</Box>
          <div>{(elapsed / 1000).toFixed(1)}s</div>
        </div>
        <div>
          <Box variant="awsui-key-label">Vấn đề cấu hình</Box>
          <div>{result?.errors ?? 0}</div>
        </div>
      </ColumnLayout>

      {phase === 'deployed' && result && (
        <Alert type="success" header="Stack CREATE_COMPLETE">
          {(result.timeMs / 1000).toFixed(1)}s để dựng cả 6 tài nguyên — không cần bấm tay từng bước, CloudFormation
          tự lo thứ tự phụ thuộc.
        </Alert>
      )}

      {changeSet && (
        <Container header={<Header variant="h3">Change set preview</Header>}>
          <Table
            columnDefinitions={[
              { id: 'logicalId', header: 'Logical ID', cell: (item) => item.logicalId },
              {
                id: 'action',
                header: 'Action',
                cell: (item) => (
                  <StatusIndicator type={item.action === 'Add' ? 'success' : item.action === 'Modify' ? 'warning' : 'stopped'}>
                    {item.action === 'Add' ? '+ Add' : item.action === 'Modify' ? '✎ Modify' : '— No change'}
                  </StatusIndicator>
                ),
              },
              { id: 'detail', header: 'Chi tiết', cell: (item) => item.detail ?? '—' },
            ]}
            items={changeSet}
            variant="embedded"
          />
        </Container>
      )}

      {phase === 'deployed' && (
        <Container header={<Header variant="h3">Cập nhật cấu hình</Header>}>
          <SpaceBetween size="s">
            <Toggle checked={ec2Upgrade} onChange={(e) => setEc2Upgrade(e.detail.checked)} disabled={applied.ec2Type === 't3.large'}>
              Nâng cấp WebServer lên t3.large {applied.ec2Type === 't3.large' && '(đã áp dụng)'}
            </Toggle>
            <Toggle checked={rdsMultiAzToggle} onChange={(e) => setRdsMultiAzToggle(e.detail.checked)} disabled={applied.rdsMultiAz}>
              Bật Multi-AZ cho OrdersDB {applied.rdsMultiAz && '(đã áp dụng)'}
            </Toggle>
          </SpaceBetween>
        </Container>
      )}

      <Tabs
        activeTabId={activeTab}
        onChange={(e) => setActiveTab(e.detail.activeTabId)}
        tabs={[
          {
            id: 'resources',
            label: 'Resources',
            content: (
              <Table
                columnDefinitions={[
                  { id: 'logicalId', header: 'Logical ID', cell: (item) => item.logicalId },
                  { id: 'type', header: 'Type', cell: (item) => item.type },
                  {
                    id: 'status',
                    header: 'Status',
                    cell: (item) => (
                      <StatusIndicator
                        type={item.status === 'complete' ? 'success' : item.status === 'progress' ? 'in-progress' : item.status === 'deleting' ? 'error' : 'pending'}
                      >
                        {item.status === 'idle' ? 'Chưa tạo' : item.status.toUpperCase()}
                      </StatusIndicator>
                    ),
                  },
                ]}
                items={resources}
                variant="embedded"
              />
            ),
          },
          {
            id: 'events',
            label: 'Events',
            content: (
              <Table
                columnDefinitions={[
                  { id: 'time', header: 'Timestamp', cell: (item) => item.time },
                  { id: 'logicalId', header: 'Logical ID', cell: (item) => item.logicalId },
                  { id: 'status', header: 'Status', cell: (item) => item.status },
                ]}
                items={events}
                variant="embedded"
                empty={<Box textAlign="center" color="text-body-secondary">Chưa có sự kiện — deploy stack để xem log.</Box>}
              />
            ),
          },
          {
            id: 'template',
            label: 'Template',
            content: (
              <SpaceBetween size="m">
                <SegmentedControl
                  selectedId={lang}
                  onChange={(e) => setLang(e.detail.selectedId as Lang)}
                  options={[
                    { id: 'cfn', text: 'CloudFormation' },
                    { id: 'cdk', text: 'CDK (Python)' },
                    { id: 'sam', text: 'SAM' },
                  ]}
                />
                <Box color="text-body-secondary" fontSize="body-s">
                  {CODE_SNIPPETS[lang].caption}
                </Box>
                <Box variant="code">
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{CODE_SNIPPETS[lang].code}</pre>
                </Box>
              </SpaceBetween>
            ),
          },
        ]}
      />
    </SpaceBetween>
  )
}
