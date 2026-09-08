export interface ResourceDef {
  id: string
  logicalId: string
  type: string
  deployDuration: number
}

export const RESOURCES: ResourceDef[] = [
  { id: 'vpc', logicalId: 'AppVPC', type: 'AWS::EC2::VPC', deployDuration: 700 },
  { id: 'subnet', logicalId: 'PublicSubnet', type: 'AWS::EC2::Subnet', deployDuration: 500 },
  { id: 'sg', logicalId: 'WebSecurityGroup', type: 'AWS::EC2::SecurityGroup', deployDuration: 600 },
  { id: 'ec2', logicalId: 'WebServer', type: 'AWS::EC2::Instance', deployDuration: 900 },
  { id: 'rds', logicalId: 'OrdersDB', type: 'AWS::RDS::DBInstance', deployDuration: 1000 },
  { id: 'alb', logicalId: 'AppLoadBalancer', type: 'AWS::ElasticLoadBalancingV2::LoadBalancer', deployDuration: 700 },
]

export interface ManualStepDef {
  id: string
  title: string
  crumb: string
  duration: number
  hasError?: boolean
  errorMsg?: string
  fixDuration?: number
  fixLabel?: string
}

export const MANUAL_STEPS: ManualStepDef[] = [
  { id: 'vpc', title: 'Tạo VPC', crumb: 'VPC › Your VPCs › Create VPC', duration: 1400 },
  { id: 'subnet', title: 'Tạo Subnet công khai', crumb: 'VPC › Subnets › Create subnet', duration: 1200 },
  {
    id: 'sg',
    title: 'Tạo Security Group',
    crumb: 'EC2 › Security Groups › Create security group',
    duration: 1600,
    hasError: true,
    errorMsg: 'Thiếu rule Inbound mở cổng 443 (HTTPS) — người dùng sẽ không truy cập được',
    fixDuration: 1800,
    fixLabel: 'Sửa lại Inbound rules',
  },
  { id: 'ec2', title: 'Launch EC2 (máy chủ web)', crumb: 'EC2 › Instances › Launch instances', duration: 2000 },
  { id: 'rds', title: 'Tạo RDS Database', crumb: 'RDS › Databases › Create database', duration: 2400 },
  { id: 'alb', title: 'Tạo Application Load Balancer', crumb: 'EC2 › Load Balancers › Create load balancer', duration: 1800 },
]

export const CODE_SNIPPETS: Record<'cfn' | 'cdk' | 'sam', { label: string; caption: string; code: string }> = {
  cfn: {
    label: 'CloudFormation (YAML)',
    caption: 'CloudFormation — mô tả hạ tầng bằng YAML thuần, chạy trực tiếp bởi CloudFormation.',
    code: `Resources:
  AppVPC:
    Type: AWS::EC2::VPC
    Properties: { CidrBlock: 10.0.0.0/16 }
  WebSecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      SecurityGroupIngress:
        - { IpProtocol: tcp, FromPort: 443, ToPort: 443, CidrIp: 0.0.0.0/0 }
  WebServer:
    Type: AWS::EC2::Instance
    Properties: { InstanceType: t3.micro }
  OrdersDB:
    Type: AWS::RDS::DBInstance
    Properties: { Engine: postgres, MultiAZ: false }
  AppLoadBalancer:
    Type: AWS::ElasticLoadBalancingV2::LoadBalancer`,
  },
  cdk: {
    label: 'AWS CDK (Python)',
    caption: 'AWS CDK — cùng hạ tầng, viết bằng Python. "cdk deploy" sẽ tự sinh ra CloudFormation rồi mới chạy.',
    code: `vpc = ec2.Vpc(self, "AppVPC", cidr="10.0.0.0/16")

sg = ec2.SecurityGroup(self, "WebSecurityGroup", vpc=vpc)
sg.add_ingress_rule(ec2.Peer.any_ipv4(), ec2.Port.tcp(443))

web = ec2.Instance(self, "WebServer",
    instance_type=ec2.InstanceType("t3.micro"),
    vpc=vpc, security_group=sg)

db = rds.DatabaseInstance(self, "OrdersDB",
    engine=rds.DatabaseInstanceEngine.postgres(...),
    multi_az=False)

alb = elbv2.ApplicationLoadBalancer(self, "AppLoadBalancer",
    vpc=vpc, internet_facing=True)

# cdk deploy  ->  sinh template CloudFormation  ->  CloudFormation chay no`,
  },
  sam: {
    label: 'AWS SAM (YAML)',
    caption:
      'AWS SAM — rút gọn cho Lambda + API Gateway + DynamoDB, không phải cho VPC/EC2/RDS như hai cột kia. Ví dụ dưới là một app serverless khác để so cú pháp.',
    code: `Transform: AWS::Serverless-2016-10-31
Resources:
  OrdersFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: app.handler
      Runtime: python3.12
      Events:
        Api:
          Type: Api
          Properties: { Path: /orders, Method: get }
  OrdersTable:
    Type: AWS::Serverless::SimpleTable`,
  },
}

export interface GlossaryTerm {
  term: string
  body: string
}

export const GLOSSARY: GlossaryTerm[] = [
  {
    term: 'Infrastructure as Code (IaC)',
    body: 'Hạ tầng (server, DB, mạng) được viết ra bằng file text. Chạy file đó thì AWS tự dựng — không bấm tay trên console.',
  },
  {
    term: 'Stack',
    body: 'Một nhóm tài nguyên được dựng cùng nhau từ một file template. Xoá stack = xoá sạch mọi thứ trong đó.',
  },
  {
    term: 'Change Set',
    body: 'Chế độ xem trước. Cho biết khi sửa template thì tài nguyên nào bị tạo mới, sửa, hay xoá — trước khi thực sự chạy.',
  },
  {
    term: 'Nested Stack',
    body: 'Tách một template lớn thành nhiều template nhỏ theo tầng (compute, database, network). Vẫn nằm trong một tài khoản AWS.',
  },
  {
    term: 'Stack Set',
    body: 'Mở rộng của Stack: tạo/cập nhật/xoá cùng một stack trên nhiều tài khoản và nhiều region cùng lúc, quản lý từ một tài khoản Administrator trong AWS Organizations.',
  },
  {
    term: 'AWS CDK',
    body: 'Viết hạ tầng bằng Python/TypeScript thay vì YAML. Cuối cùng vẫn sinh ra CloudFormation phía sau.',
  },
  {
    term: 'AWS SAM',
    body: 'Bản rút gọn của CloudFormation, chuyên cho Lambda + API Gateway + DynamoDB.',
  },
  {
    term: 'ECS + Fargate',
    body: 'Nơi container thực sự chạy. ECS quản lý container; Fargate là chế độ không cần quản server, chỉ khai báo CPU/RAM.',
  },
  {
    term: 'CodeDeploy',
    body: 'Chỉ đẩy phiên bản code mới lên hạ tầng đã tồn tại (EC2, ECS, Lambda, hoặc on-premises). Không tạo hạ tầng.',
  },
]

export const KNOWN_NAME_ONLY = [
  {
    name: 'Elastic Beanstalk',
    note: 'Upload code (Java/.NET/PHP/Node.js/Python/Ruby/Go/Docker) → tự dựng hạ tầng. Web server environment (HTTP) hoặc Worker environment (job dài, tích hợp SQS).',
  },
  { name: 'Amazon ECS Anywhere', note: 'Chạy cluster ECS ngay tại server on-premises thay vì trên AWS.' },
  { name: 'Amazon EKS (+ Outposts / Anywhere / Distro)', note: 'Bản Kubernetes quản lý của AWS — 4 cách triển khai từ trên AWS đến tự quản lý hoàn toàn on-premises.' },
  { name: 'AWS OpsWorks', note: 'Quản lý server bằng Chef/Puppet — công nghệ IaC đời trước CloudFormation.' },
  { name: 'AWS Proton', note: 'Platform team phát template chuẩn cho hàng trăm dev dùng lại qua cổng self-service.' },
  { name: 'Serverless Application Repository', note: 'Kho chia sẻ app serverless (đi kèm SAM) công khai hoặc nội bộ.' },
]
