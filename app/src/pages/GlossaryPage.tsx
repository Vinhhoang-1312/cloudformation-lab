import Header from '@cloudscape-design/components/header'
import SpaceBetween from '@cloudscape-design/components/space-between'
import ExpandableSection from '@cloudscape-design/components/expandable-section'

import { GLOSSARY } from '../data/lab'

export default function GlossaryPage() {
  return (
    <SpaceBetween size="l">
      <Header variant="h1">Thuật ngữ cần nhớ</Header>
      <SpaceBetween size="xs">
        {GLOSSARY.map((g) => (
          <ExpandableSection key={g.term} headerText={g.term} defaultExpanded={g.term === 'Infrastructure as Code (IaC)'}>
            {g.body}
          </ExpandableSection>
        ))}
      </SpaceBetween>
    </SpaceBetween>
  )
}
