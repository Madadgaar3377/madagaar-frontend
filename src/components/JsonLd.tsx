type JsonLdProps = {
  data: Record<string, unknown> | Record<string, unknown>[] | null | undefined;
};

/** Server-safe JSON-LD script  use instead of react-helmet for structured data. */
export default function JsonLd({ data }: JsonLdProps) {
  if (!data) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
