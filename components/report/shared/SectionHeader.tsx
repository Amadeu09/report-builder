export function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="break-after-avoid text-h1 font-semibold text-ink border-l-4 border-relats-orange pl-3">
      {children}
    </h2>
  );
}
