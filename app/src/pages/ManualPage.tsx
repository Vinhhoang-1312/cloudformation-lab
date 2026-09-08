import { useEffect, useState } from 'react'
import Container from '@cloudscape-design/components/container'
import Header from '@cloudscape-design/components/header'
import SpaceBetween from '@cloudscape-design/components/space-between'
import Button from '@cloudscape-design/components/button'
import FormField from '@cloudscape-design/components/form-field'
import Input from '@cloudscape-design/components/input'
import Select from '@cloudscape-design/components/select'
import Toggle from '@cloudscape-design/components/toggle'
import ColumnLayout from '@cloudscape-design/components/column-layout'
import Alert from '@cloudscape-design/components/alert'
import Box from '@cloudscape-design/components/box'
import StatusIndicator from '@cloudscape-design/components/status-indicator'

import { isValidCidr, isCidrWithin } from '../utils/cidr'
import {
  AZ_OPTIONS,
  AMI_OPTIONS,
  INSTANCE_TYPE_GROUPS,
  RDS_ENGINE_OPTIONS,
  RDS_INSTANCE_CLASS_OPTIONS,
  SG_RULE_TYPE_OPTIONS,
  ALB_SCHEME_OPTIONS,
  ALB_LISTENER_OPTIONS,
} from '../data/formOptions'
import type { RunResult } from '../App'

interface VpcData {
  name: string
  cidr: string
  tenancy: string
}
interface SubnetData {
  name: string
  cidr: string
  az: string
}
interface SgRule {
  id: string
  type: string
  port: string
  source: string
}
interface SgData {
  name: string
  description: string
  rules: SgRule[]
}
interface Ec2Data {
  name: string
  ami: string
  instanceType: string
  keyName: string
  publicIp: boolean
}
interface RdsData {
  identifier: string
  engine: string
  instanceClass: string
  storage: string
  multiAz: boolean
  username: string
  password: string
}
interface AlbData {
  name: string
  scheme: string
  listener: string
}

interface AllData {
  vpc?: VpcData
  subnet?: SubnetData
  sg?: SgData
  ec2?: Ec2Data
  rds?: RdsData
  alb?: AlbData
}

const STEP_META = [
  { id: 'vpc', title: 'Tạo VPC', crumb: 'VPC console › Your VPCs › Create VPC' },
  { id: 'subnet', title: 'Tạo Subnet', crumb: 'VPC console › Subnets › Create subnet' },
  { id: 'sg', title: 'Tạo Security Group', crumb: 'EC2 console › Security Groups › Create security group' },
  { id: 'ec2', title: 'Launch EC2 instance', crumb: 'EC2 console › Instances › Launch instances' },
  { id: 'rds', title: 'Tạo RDS Database', crumb: 'RDS console › Databases › Create database' },
  { id: 'alb', title: 'Tạo Application Load Balancer', crumb: 'EC2 console › Load Balancers › Create load balancer' },
] as const

function KeyValue({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Box variant="awsui-key-label">{label}</Box>
      <div>{value}</div>
    </div>
  )
}

function VpcForm({ initial, onSubmit }: { initial?: VpcData; onSubmit: (d: VpcData) => void }) {
  const [name, setName] = useState(initial?.name ?? 'shoply-vpc')
  const [cidr, setCidr] = useState(initial?.cidr ?? '10.0.0.0/16')
  const [tenancy, setTenancy] = useState(initial?.tenancy ?? 'default')
  const [touched, setTouched] = useState(false)

  const nameError = touched && !name.trim() ? 'Bắt buộc nhập tên' : undefined
  const cidrError = touched && !isValidCidr(cidr) ? 'CIDR không hợp lệ, ví dụ: 10.0.0.0/16' : undefined

  return (
    <SpaceBetween size="l">
      <FormField label="Name tag" errorText={nameError}>
        <Input value={name} onChange={(e) => setName(e.detail.value)} placeholder="vd: shoply-vpc" />
      </FormField>
      <FormField label="IPv4 CIDR block" errorText={cidrError} description="Dải IP nội bộ của VPC, dạng CIDR.">
        <Input value={cidr} onChange={(e) => setCidr(e.detail.value)} placeholder="10.0.0.0/16" />
      </FormField>
      <FormField label="Tenancy">
        <Select
          selectedOption={{ label: tenancy === 'default' ? 'Default' : 'Dedicated', value: tenancy }}
          onChange={(e) => setTenancy(e.detail.selectedOption.value!)}
          options={[
            { label: 'Default', value: 'default' },
            { label: 'Dedicated', value: 'dedicated' },
          ]}
        />
      </FormField>
      <Button
        variant="primary"
        onClick={() => {
          setTouched(true)
          if (!name.trim() || !isValidCidr(cidr)) return
          onSubmit({ name, cidr, tenancy })
        }}
      >
        Create VPC
      </Button>
    </SpaceBetween>
  )
}

function SubnetForm({
  vpcCidr,
  initial,
  onSubmit,
}: {
  vpcCidr: string
  initial?: SubnetData
  onSubmit: (d: SubnetData) => void
}) {
  const [name, setName] = useState(initial?.name ?? 'shoply-public-subnet')
  const [cidr, setCidr] = useState(initial?.cidr ?? '10.0.1.0/24')
  const [az, setAz] = useState(initial?.az ?? AZ_OPTIONS[0].value)
  const [touched, setTouched] = useState(false)

  const nameError = touched && !name.trim() ? 'Bắt buộc nhập tên' : undefined
  const withinVpc = isCidrWithin(vpcCidr, cidr)
  const cidrError = touched && !isValidCidr(cidr) ? 'CIDR không hợp lệ' : touched && !withinVpc ? `CIDR phải nằm trong dải VPC (${vpcCidr})` : undefined

  return (
    <SpaceBetween size="l">
      <Alert type="info">VPC đã tạo có CIDR {vpcCidr} — subnet phải nằm trong dải này.</Alert>
      <FormField label="Name tag" errorText={nameError}>
        <Input value={name} onChange={(e) => setName(e.detail.value)} />
      </FormField>
      <FormField label="IPv4 CIDR block" errorText={cidrError}>
        <Input value={cidr} onChange={(e) => setCidr(e.detail.value)} placeholder="10.0.1.0/24" />
      </FormField>
      <FormField label="Availability Zone">
        <Select
          selectedOption={{ label: az, value: az }}
          onChange={(e) => setAz(e.detail.selectedOption.value!)}
          options={AZ_OPTIONS}
        />
      </FormField>
      <Button
        variant="primary"
        onClick={() => {
          setTouched(true)
          if (!name.trim() || !isValidCidr(cidr) || !isCidrWithin(vpcCidr, cidr)) return
          onSubmit({ name, cidr, az })
        }}
      >
        Create subnet
      </Button>
    </SpaceBetween>
  )
}

function SgForm({ initial, onSubmit }: { initial?: SgData; onSubmit: (d: SgData) => void }) {
  const [name, setName] = useState(initial?.name ?? 'shoply-web-sg')
  const [description, setDescription] = useState(initial?.description ?? 'Security group cho web server')
  const [rules, setRules] = useState<SgRule[]>(initial?.rules ?? [{ id: 'r1', type: 'HTTP', port: '80', source: '0.0.0.0/0' }])
  const [touched, setTouched] = useState(false)

  const nameError = touched && !name.trim() ? 'Bắt buộc nhập tên' : undefined

  function updateRule(id: string, patch: Partial<SgRule>) {
    setRules((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }
  function addRule() {
    setRules((rs) => [...rs, { id: 'r' + (rs.length + 1) + '-' + Date.now(), type: 'HTTPS', port: '443', source: '0.0.0.0/0' }])
  }
  function removeRule(id: string) {
    setRules((rs) => rs.filter((r) => r.id !== id))
  }

  return (
    <SpaceBetween size="l">
      <FormField label="Security group name" errorText={nameError}>
        <Input value={name} onChange={(e) => setName(e.detail.value)} />
      </FormField>
      <FormField label="Description">
        <Input value={description} onChange={(e) => setDescription(e.detail.value)} />
      </FormField>
      <FormField label="Inbound rules" description="AWS không bắt buộc bạn mở port nào cả — tự chịu trách nhiệm mở đúng port app cần.">
        <SpaceBetween size="s">
          {rules.map((rule) => (
            <ColumnLayout key={rule.id} columns={4}>
              <Select
                selectedOption={{ label: rule.type, value: rule.type }}
                onChange={(e) => {
                  const t = SG_RULE_TYPE_OPTIONS.find((o) => o.value === e.detail.selectedOption.value)
                  updateRule(rule.id, { type: e.detail.selectedOption.value!, port: t?.port ?? rule.port })
                }}
                options={SG_RULE_TYPE_OPTIONS}
              />
              <Input
                value={rule.port}
                onChange={(e) => updateRule(rule.id, { port: e.detail.value })}
                placeholder="Port"
                disabled={rule.type !== 'Custom TCP'}
              />
              <Input value={rule.source} onChange={(e) => updateRule(rule.id, { source: e.detail.value })} placeholder="Source CIDR" />
              <Button iconName="remove" variant="normal" onClick={() => removeRule(rule.id)} ariaLabel="Xoá rule" />
            </ColumnLayout>
          ))}
          <Button iconName="add-plus" onClick={addRule}>
            Thêm rule
          </Button>
        </SpaceBetween>
      </FormField>
      <Button
        variant="primary"
        onClick={() => {
          setTouched(true)
          if (!name.trim()) return
          onSubmit({ name, description, rules })
        }}
      >
        Create security group
      </Button>
    </SpaceBetween>
  )
}

function Ec2Form({
  subnetName,
  sgName,
  initial,
  onSubmit,
}: {
  subnetName: string
  sgName: string
  initial?: Ec2Data
  onSubmit: (d: Ec2Data) => void
}) {
  const [name, setName] = useState(initial?.name ?? 'shoply-web-server')
  const [ami, setAmi] = useState(initial?.ami ?? AMI_OPTIONS[0].value)
  const [instanceType, setInstanceType] = useState(initial?.instanceType ?? 't3.micro')
  const [keyName, setKeyName] = useState(initial?.keyName ?? '')
  const [publicIp, setPublicIp] = useState(initial?.publicIp ?? true)
  const [touched, setTouched] = useState(false)

  const nameError = touched && !name.trim() ? 'Bắt buộc nhập tên' : undefined
  const keyError = touched && !keyName.trim() ? 'Bắt buộc chọn hoặc đặt tên key pair' : undefined
  const amiOpt = AMI_OPTIONS.find((o) => o.value === ami)!
  const instanceOpt = INSTANCE_TYPE_GROUPS.flatMap((g) => g.options).find((o) => o.value === instanceType)!

  return (
    <SpaceBetween size="l">
      <FormField label="Name tag" errorText={nameError}>
        <Input value={name} onChange={(e) => setName(e.detail.value)} />
      </FormField>
      <FormField label="Amazon Machine Image (AMI)">
        <Select
          selectedOption={{ label: amiOpt.label, value: amiOpt.value, description: amiOpt.description }}
          onChange={(e) => setAmi(e.detail.selectedOption.value!)}
          options={AMI_OPTIONS}
        />
      </FormField>
      <FormField label="Instance type">
        <Select
          selectedOption={{ label: instanceOpt.label, value: instanceOpt.value }}
          onChange={(e) => setInstanceType(e.detail.selectedOption.value!)}
          options={INSTANCE_TYPE_GROUPS.map((g) => ({ label: g.label, options: g.options }))}
        />
      </FormField>
      <FormField label="Key pair name" errorText={keyError} description="Dùng để SSH vào instance sau này.">
        <Input value={keyName} onChange={(e) => setKeyName(e.detail.value)} placeholder="vd: shoply-key" />
      </FormField>
      <FormField label="Network">
        <ColumnLayout columns={2}>
          <KeyValue label="Subnet" value={subnetName} />
          <KeyValue label="Security group" value={sgName} />
        </ColumnLayout>
      </FormField>
      <FormField label="Auto-assign public IP">
        <Toggle checked={publicIp} onChange={(e) => setPublicIp(e.detail.checked)}>
          {publicIp ? 'Enable' : 'Disable'}
        </Toggle>
      </FormField>
      <Button
        variant="primary"
        onClick={() => {
          setTouched(true)
          if (!name.trim() || !keyName.trim()) return
          onSubmit({ name, ami, instanceType, keyName, publicIp })
        }}
      >
        Launch instance
      </Button>
    </SpaceBetween>
  )
}

function RdsForm({ initial, onSubmit }: { initial?: RdsData; onSubmit: (d: RdsData) => void }) {
  const [identifier, setIdentifier] = useState(initial?.identifier ?? 'shoply-orders-db')
  const [engine, setEngine] = useState(initial?.engine ?? 'postgres')
  const [instanceClass, setInstanceClass] = useState(initial?.instanceClass ?? 'db.t3.micro')
  const [storage, setStorage] = useState(initial?.storage ?? '20')
  const [multiAz, setMultiAz] = useState(initial?.multiAz ?? false)
  const [username, setUsername] = useState(initial?.username ?? 'admin')
  const [password, setPassword] = useState(initial?.password ?? '')
  const [touched, setTouched] = useState(false)

  const idError = touched && !identifier.trim() ? 'Bắt buộc nhập DB identifier' : undefined
  const storageNum = parseInt(storage, 10)
  const storageError = touched && (Number.isNaN(storageNum) || storageNum < 20) ? 'Tối thiểu 20 GB' : undefined
  const passError = touched && password.length < 8 ? 'Mật khẩu tối thiểu 8 ký tự' : undefined
  const engineOpt = RDS_ENGINE_OPTIONS.find((o) => o.value === engine)!
  const classOpt = RDS_INSTANCE_CLASS_OPTIONS.find((o) => o.value === instanceClass)!

  return (
    <SpaceBetween size="l">
      <FormField label="DB instance identifier" errorText={idError}>
        <Input value={identifier} onChange={(e) => setIdentifier(e.detail.value)} />
      </FormField>
      <ColumnLayout columns={2}>
        <FormField label="Engine">
          <Select
            selectedOption={engineOpt}
            onChange={(e) => setEngine(e.detail.selectedOption.value!)}
            options={RDS_ENGINE_OPTIONS}
          />
        </FormField>
        <FormField label="DB instance class">
          <Select
            selectedOption={classOpt}
            onChange={(e) => setInstanceClass(e.detail.selectedOption.value!)}
            options={RDS_INSTANCE_CLASS_OPTIONS}
          />
        </FormField>
      </ColumnLayout>
      <FormField label="Allocated storage (GB)" errorText={storageError}>
        <Input value={storage} onChange={(e) => setStorage(e.detail.value)} type="number" />
      </FormField>
      <FormField label="Multi-AZ deployment">
        <Toggle checked={multiAz} onChange={(e) => setMultiAz(e.detail.checked)}>
          {multiAz ? 'Enable' : 'Disable'}
        </Toggle>
      </FormField>
      <ColumnLayout columns={2}>
        <FormField label="Master username">
          <Input value={username} onChange={(e) => setUsername(e.detail.value)} />
        </FormField>
        <FormField label="Master password" errorText={passError}>
          <Input value={password} onChange={(e) => setPassword(e.detail.value)} type="password" />
        </FormField>
      </ColumnLayout>
      <Button
        variant="primary"
        onClick={() => {
          setTouched(true)
          if (!identifier.trim() || Number.isNaN(storageNum) || storageNum < 20 || password.length < 8) return
          onSubmit({ identifier, engine, instanceClass, storage, multiAz, username, password })
        }}
      >
        Create database
      </Button>
    </SpaceBetween>
  )
}

function AlbForm({
  subnetName,
  sgName,
  sgHasHttps,
  initial,
  onSubmit,
}: {
  subnetName: string
  sgName: string
  sgHasHttps: boolean
  initial?: AlbData
  onSubmit: (d: AlbData) => void
}) {
  const [name, setName] = useState(initial?.name ?? 'shoply-alb')
  const [scheme, setScheme] = useState(initial?.scheme ?? 'internet-facing')
  const [listener, setListener] = useState(initial?.listener ?? '443')
  const [touched, setTouched] = useState(false)

  const nameError = touched && !name.trim() ? 'Bắt buộc nhập tên' : undefined
  const showHttpsWarning = listener === '443' && !sgHasHttps

  return (
    <SpaceBetween size="l">
      <FormField label="Load balancer name" errorText={nameError}>
        <Input value={name} onChange={(e) => setName(e.detail.value)} />
      </FormField>
      <FormField label="Scheme">
        <Select
          selectedOption={{ label: scheme, value: scheme }}
          onChange={(e) => setScheme(e.detail.selectedOption.value!)}
          options={ALB_SCHEME_OPTIONS}
        />
      </FormField>
      <FormField label="Listener">
        <Select
          selectedOption={ALB_LISTENER_OPTIONS.find((o) => o.value === listener)!}
          onChange={(e) => setListener(e.detail.selectedOption.value!)}
          options={ALB_LISTENER_OPTIONS}
        />
      </FormField>
      {showHttpsWarning && (
        <Alert type="warning" header="Có thể không truy cập được">
          Security group <b>{sgName}</b> chưa có inbound rule mở port 443. AWS vẫn cho phép bạn tạo listener HTTPS ở
          đây — nó chỉ đơn giản là sẽ không hoạt động cho tới khi bạn quay lại sửa security group.
        </Alert>
      )}
      <FormField label="Network">
        <ColumnLayout columns={2}>
          <KeyValue label="Subnet" value={subnetName} />
          <KeyValue label="Security group" value={sgName} />
        </ColumnLayout>
      </FormField>
      <Button
        variant="primary"
        onClick={() => {
          setTouched(true)
          if (!name.trim()) return
          onSubmit({ name, scheme, listener })
        }}
      >
        Create load balancer
      </Button>
    </SpaceBetween>
  )
}

export default function ManualPage({
  onComplete,
  result,
}: {
  onComplete: (r: RunResult) => void
  result: RunResult | null
}) {
  const [stepIndex, setStepIndex] = useState(0)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [data, setData] = useState<AllData>({})
  const [creating, setCreating] = useState(false)
  const [startTs, setStartTs] = useState<number | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (startTs === null || done) return
    const id = setInterval(() => setElapsed(Date.now() - startTs), 100)
    return () => clearInterval(id)
  }, [startTs, done])

  function handleSubmit<K extends keyof AllData>(key: K, value: NonNullable<AllData[K]>, isEdit: boolean) {
    if (startTs === null) setStartTs(Date.now())
    setCreating(true)
    setTimeout(() => {
      setCreating(false)
      setData((d) => ({ ...d, [key]: value }))
      if (isEdit) {
        setEditingIndex(null)
      } else {
        const next = stepIndex + 1
        setStepIndex(next)
        if (next >= STEP_META.length) {
          const finalElapsed = Date.now() - (startTs ?? Date.now())
          setElapsed(finalElapsed)
          setDone(true)
          const issues = key === 'alb' && (value as AlbData).listener === '443' && !hasHttpsRule(data.sg) ? 1 : 0
          onComplete({ timeMs: finalElapsed, errors: issues })
        }
      }
    }, 1300)
  }

  function hasHttpsRule(sg?: SgData) {
    return !!sg && sg.rules.some((r) => r.port === '443')
  }

  function reset() {
    setStepIndex(0)
    setEditingIndex(null)
    setData({})
    setCreating(false)
    setStartTs(null)
    setElapsed(0)
    setDone(false)
  }

  const sgHasHttps = hasHttpsRule(data.sg)

  return (
    <SpaceBetween size="l">
      <Header
        variant="h1"
        description='Điền form thật cho từng tài nguyên, giống console AWS thật — kể cả có thể tạo cấu hình "hợp lệ nhưng sẽ không hoạt động" như đời thực.'
        counter={`(${stepIndex}/${STEP_META.length})`}
      >
        Console thủ công
      </Header>

      <ColumnLayout columns={3}>
        <KeyValue label="Đồng hồ" value={(elapsed / 1000).toFixed(1) + 's'} />
        <KeyValue label="Tài nguyên đã tạo" value={`${stepIndex} / ${STEP_META.length}`} />
        <KeyValue label="Vấn đề cấu hình" value={String(result?.errors ?? 0)} />
      </ColumnLayout>

      {done && result && (
        <Alert type="success" header="Hoàn tất 6/6 tài nguyên">
          {(result.timeMs / 1000).toFixed(1)}s mô phỏng, {result.errors} vấn đề cấu hình phát hiện được. (Thực tế: quy
          trình này thường mất 20–40 phút.)
        </Alert>
      )}

      {STEP_META.map((meta, i) => {
        const isDone = i < stepIndex
        const isActive = i === stepIndex
        const isEditing = editingIndex === i
        const isLocked = i > stepIndex

        if (isLocked) {
          return (
            <Container key={meta.id} disableContentPaddings>
              <Box padding="l" color="text-status-inactive" textAlign="center">
                {meta.title} — hoàn tất bước trước để mở khoá
              </Box>
            </Container>
          )
        }

        if (isDone && !isEditing) {
          return (
            <Container
              key={meta.id}
              header={
                <Header
                  variant="h2"
                  actions={<Button onClick={() => setEditingIndex(i)}>Sửa</Button>}
                >
                  <StatusIndicator type="success">{meta.title}</StatusIndicator>
                </Header>
              }
            >
              <StepSummary id={meta.id} data={data} />
            </Container>
          )
        }

        // active (creating) or being edited
        return (
          <Container key={meta.id} header={<Header variant="h2" description={meta.crumb}>{meta.title}</Header>}>
            {creating && isActive ? (
              <Box textAlign="center" padding="l">
                <StatusIndicator type="loading">Đang tạo {meta.title.toLowerCase()}…</StatusIndicator>
              </Box>
            ) : (
              <StepForm
                id={meta.id}
                data={data}
                isEdit={isEditing}
                onSubmit={(key, value) => handleSubmit(key, value, isEditing)}
              />
            )}
          </Container>
        )
      })}

      <Button onClick={reset}>Làm lại từ đầu</Button>
    </SpaceBetween>
  )
}

function StepSummary({ id, data }: { id: string; data: AllData }) {
  if (id === 'vpc' && data.vpc)
    return (
      <ColumnLayout columns={3}>
        <KeyValue label="Name" value={data.vpc.name} />
        <KeyValue label="CIDR" value={data.vpc.cidr} />
        <KeyValue label="Tenancy" value={data.vpc.tenancy} />
      </ColumnLayout>
    )
  if (id === 'subnet' && data.subnet)
    return (
      <ColumnLayout columns={3}>
        <KeyValue label="Name" value={data.subnet.name} />
        <KeyValue label="CIDR" value={data.subnet.cidr} />
        <KeyValue label="AZ" value={data.subnet.az} />
      </ColumnLayout>
    )
  if (id === 'sg' && data.sg)
    return (
      <ColumnLayout columns={2}>
        <KeyValue label="Name" value={data.sg.name} />
        <KeyValue label="Inbound rules" value={data.sg.rules.map((r) => `${r.type}:${r.port}`).join(', ') || 'Không có'} />
      </ColumnLayout>
    )
  if (id === 'ec2' && data.ec2)
    return (
      <ColumnLayout columns={3}>
        <KeyValue label="Name" value={data.ec2.name} />
        <KeyValue label="AMI" value={data.ec2.ami} />
        <KeyValue label="Instance type" value={data.ec2.instanceType} />
      </ColumnLayout>
    )
  if (id === 'rds' && data.rds)
    return (
      <ColumnLayout columns={3}>
        <KeyValue label="Identifier" value={data.rds.identifier} />
        <KeyValue label="Engine" value={data.rds.engine} />
        <KeyValue label="Multi-AZ" value={data.rds.multiAz ? 'Yes' : 'No'} />
      </ColumnLayout>
    )
  if (id === 'alb' && data.alb)
    return (
      <ColumnLayout columns={3}>
        <KeyValue label="Name" value={data.alb.name} />
        <KeyValue label="Scheme" value={data.alb.scheme} />
        <KeyValue label="Listener" value={data.alb.listener} />
      </ColumnLayout>
    )
  return null
}

function StepForm({
  id,
  data,
  isEdit,
  onSubmit,
}: {
  id: string
  data: AllData
  isEdit: boolean
  onSubmit: (key: keyof AllData, value: any) => void
}) {
  if (id === 'vpc') return <VpcForm initial={isEdit ? data.vpc : undefined} onSubmit={(d) => onSubmit('vpc', d)} />
  if (id === 'subnet')
    return (
      <SubnetForm
        vpcCidr={data.vpc?.cidr ?? '10.0.0.0/16'}
        initial={isEdit ? data.subnet : undefined}
        onSubmit={(d) => onSubmit('subnet', d)}
      />
    )
  if (id === 'sg') return <SgForm initial={isEdit ? data.sg : undefined} onSubmit={(d) => onSubmit('sg', d)} />
  if (id === 'ec2')
    return (
      <Ec2Form
        subnetName={data.subnet?.name ?? '—'}
        sgName={data.sg?.name ?? '—'}
        initial={isEdit ? data.ec2 : undefined}
        onSubmit={(d) => onSubmit('ec2', d)}
      />
    )
  if (id === 'rds') return <RdsForm initial={isEdit ? data.rds : undefined} onSubmit={(d) => onSubmit('rds', d)} />
  if (id === 'alb')
    return (
      <AlbForm
        subnetName={data.subnet?.name ?? '—'}
        sgName={data.sg?.name ?? '—'}
        sgHasHttps={!!data.sg && data.sg.rules.some((r) => r.port === '443')}
        initial={isEdit ? data.alb : undefined}
        onSubmit={(d) => onSubmit('alb', d)}
      />
    )
  return null
}
