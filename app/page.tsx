/**
 * Temporary root placeholder. FE-003 introduces the `(public)` route group and
 * FE-005 replaces this with the composed home page.
 */
export default function RootPlaceholderPage() {
  return (
    <main className="container-editorial flex flex-1 items-center py-(--spacing-section)">
      <div className="grid-editorial w-full">
        <div className="col-span-12 desktop:col-span-8">
          <p className="type-meta text-foreground-subtle">Interior Design Portfolio</p>
          <h1 className="type-statement mt-6">Foundations in place.</h1>
        </div>
      </div>
    </main>
  );
}
