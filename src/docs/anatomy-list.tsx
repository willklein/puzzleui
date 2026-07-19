export interface AnatomyPart {
  name: string
  description: string
}

export function AnatomyList({ parts }: { parts: AnatomyPart[] }) {
  return (
    <dl className="docs-anatomy">
      {parts.map((part) => (
        <div key={part.name} className="docs-anatomy-row">
          <dt>
            <code>{part.name}</code>
          </dt>
          <dd>{part.description}</dd>
        </div>
      ))}
    </dl>
  )
}
