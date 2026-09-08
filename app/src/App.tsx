import { useState } from 'react'
import AppLayout from '@cloudscape-design/components/app-layout'
import TopNavigation from '@cloudscape-design/components/top-navigation'
import SideNavigation from '@cloudscape-design/components/side-navigation'
import BreadcrumbGroup from '@cloudscape-design/components/breadcrumb-group'
import ContentLayout from '@cloudscape-design/components/content-layout'
import { Mode } from '@cloudscape-design/global-styles'
import { getStoredMode, setStoredMode } from './theme'
import ManualPage from './pages/ManualPage'
import IacPage from './pages/IacPage'
import ComparePage from './pages/ComparePage'
import CodeDeployPage from './pages/CodeDeployPage'
import ClassifyPage from './pages/ClassifyPage'
import GlossaryPage from './pages/GlossaryPage'
import type { IacState } from './pages/IacPage'

export type PageId = 'manual' | 'iac' | 'compare' | 'codedeploy' | 'classify' | 'glossary'

const NAV_ITEMS: { id: PageId; text: string }[] = [
  { id: 'manual', text: 'Tab 1 · Console thủ công' },
  { id: 'iac', text: 'Tab 2 · Infrastructure as Code' },
  { id: 'compare', text: 'So sánh kết quả' },
  { id: 'codedeploy', text: 'ECS + Fargate + CodeDeploy' },
  { id: 'classify', text: 'Phân loại dịch vụ' },
  { id: 'glossary', text: 'Thuật ngữ' },
]

const PAGE_TITLE: Record<PageId, string> = {
  manual: 'Console thủ công',
  iac: 'Infrastructure as Code',
  compare: 'So sánh kết quả',
  codedeploy: 'CodeDeploy',
  classify: 'Phân loại dịch vụ',
  glossary: 'Thuật ngữ',
}

export interface RunResult {
  timeMs: number
  errors: number
}

export default function App() {
  const [page, setPage] = useState<PageId>('manual')
  const [navOpen, setNavOpen] = useState(true)
  const [mode, setMode] = useState<Mode>(getStoredMode())
  const [manualResult, setManualResult] = useState<RunResult | null>(null)
  const [iacResult, setIacResult] = useState<RunResult | null>(null)
  const [iacState, setIacState] = useState<IacState>({ deployed: false })

  function toggleMode() {
    const next = mode === Mode.Dark ? Mode.Light : Mode.Dark
    setStoredMode(next)
    setMode(next)
  }

  return (
    <>
      <div id="top-nav" style={{ position: 'sticky', top: 0, zIndex: 1002 }}>
        <TopNavigation
          identity={{ href: '#', title: 'CloudFormation Lab' }}
          utilities={[
            {
              type: 'button',
              text: 'Mô phỏng — không phải tài khoản thật',
              iconName: 'status-info',
              disableTextCollapse: true,
            },
            {
              type: 'button',
              text: mode === Mode.Dark ? 'Light mode' : 'Dark mode',
              iconName: mode === Mode.Dark ? 'settings' : 'settings',
              onClick: toggleMode,
            },
          ]}
        />
      </div>
      <AppLayout
        headerSelector="#top-nav"
        navigationOpen={navOpen}
        onNavigationChange={({ detail }) => setNavOpen(detail.open)}
        toolsHide
        navigation={
          <SideNavigation
            header={{ text: 'Bài học', href: '#' }}
            activeHref={`#${page}`}
            items={NAV_ITEMS.map((item) => ({ type: 'link', text: item.text, href: `#${item.id}` }))}
            onFollow={(e) => {
              e.preventDefault()
              setPage(e.detail.href.replace('#', '') as PageId)
            }}
          />
        }
        breadcrumbs={
          <BreadcrumbGroup
            items={[
              { text: 'CloudFormation Lab', href: '#' },
              { text: PAGE_TITLE[page], href: `#${page}` },
            ]}
          />
        }
        content={
          <ContentLayout>
            {page === 'manual' && (
              <ManualPage onComplete={(r) => setManualResult(r)} result={manualResult} />
            )}
            {page === 'iac' && (
              <IacPage
                onComplete={(r) => setIacResult(r)}
                result={iacResult}
                state={iacState}
                setState={setIacState}
              />
            )}
            {page === 'compare' && <ComparePage manual={manualResult} iac={iacResult} />}
            {page === 'codedeploy' && <CodeDeployPage stackDeployed={iacState.deployed} />}
            {page === 'classify' && <ClassifyPage />}
            {page === 'glossary' && <GlossaryPage />}
          </ContentLayout>
        }
      />
    </>
  )
}
