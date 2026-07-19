export function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="docs-code">
      <code>{code}</code>
    </pre>
  )
}
