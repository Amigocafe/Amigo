/**
 * Renders a JSON-LD structured-data block. Server component — the script is
 * emitted into the initial HTML so crawlers read it without running JS.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // Structured data is generated from our own DB content, not user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
