export function HistoryPage() {
  return (
    <main className="page">
      <section className="empty-state">
        <p className="empty-state__eyebrow">Archive Locked</p>
        <h1>Watch History</h1>
        <p>
          History is temporarily disabled while guest mode is active. It will
          return once authentication comes back.
        </p>
      </section>
    </main>
  );
}
