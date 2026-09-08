export const AZ_OPTIONS = [
  { label: 'us-east-1a', value: 'us-east-1a' },
  { label: 'us-east-1b', value: 'us-east-1b' },
  { label: 'us-east-1c', value: 'us-east-1c' },
]

export const AMI_OPTIONS = [
  { label: 'Amazon Linux 2023 AMI (64-bit x86)', value: 'al2023', description: 'Free tier eligible' },
  { label: 'Ubuntu Server 22.04 LTS (64-bit x86)', value: 'ubuntu-22.04', description: 'Canonical, Inc.' },
  { label: 'Windows Server 2022 Base', value: 'win2022', description: 'Microsoft Windows' },
]

export const INSTANCE_TYPE_GROUPS = [
  {
    label: 'General purpose',
    options: [
      { label: 't3.micro — 2 vCPU, 1 GiB RAM', value: 't3.micro' },
      { label: 't3.small — 2 vCPU, 2 GiB RAM', value: 't3.small' },
      { label: 'm5.large — 2 vCPU, 8 GiB RAM', value: 'm5.large' },
    ],
  },
  {
    label: 'Compute optimized',
    options: [{ label: 'c5.large — 2 vCPU, 4 GiB RAM', value: 'c5.large' }],
  },
  {
    label: 'Memory optimized',
    options: [{ label: 'r5.large — 2 vCPU, 16 GiB RAM', value: 'r5.large' }],
  },
  {
    label: 'Accelerated computing (GPU)',
    options: [{ label: 'g5.xlarge — 4 vCPU, 16 GiB RAM, 1 GPU', value: 'g5.xlarge' }],
  },
]

export const RDS_ENGINE_OPTIONS = [
  { label: 'PostgreSQL', value: 'postgres' },
  { label: 'MySQL', value: 'mysql' },
  { label: 'MariaDB', value: 'mariadb' },
]

export const RDS_INSTANCE_CLASS_OPTIONS = [
  { label: 'db.t3.micro — 2 vCPU, 1 GiB RAM', value: 'db.t3.micro' },
  { label: 'db.t3.small — 2 vCPU, 2 GiB RAM', value: 'db.t3.small' },
  { label: 'db.r5.large — 2 vCPU, 16 GiB RAM', value: 'db.r5.large' },
]

export const SG_RULE_TYPE_OPTIONS = [
  { label: 'HTTP', value: 'HTTP', port: '80' },
  { label: 'HTTPS', value: 'HTTPS', port: '443' },
  { label: 'SSH', value: 'SSH', port: '22' },
  { label: 'Custom TCP', value: 'Custom TCP', port: '' },
]

export const ALB_SCHEME_OPTIONS = [
  { label: 'internet-facing', value: 'internet-facing' },
  { label: 'internal', value: 'internal' },
]

export const ALB_LISTENER_OPTIONS = [
  { label: 'HTTP : 80', value: '80' },
  { label: 'HTTPS : 443', value: '443' },
]
