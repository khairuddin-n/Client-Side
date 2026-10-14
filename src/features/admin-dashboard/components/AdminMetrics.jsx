export default function AdminMetrics({ items }) {
  return (
    <section className="admin-metrics" aria-label="Ringkasan data">
      {items.map(([label, value]) => (
        <article key={label}>
          <h2>{label}</h2>
          <strong>{value ?? '—'}</strong>
        </article>
      ))}
    </section>
  );
}
