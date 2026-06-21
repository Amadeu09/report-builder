type Props = { entityName: string };

export function Cover({ entityName }: Props) {
  return (
    <div className="break-after-page flex min-h-[60vh] flex-col justify-between bg-white p-12">
      {/* Logo placeholder — replace with vector asset when available */}
      <svg width="140" height="36" role="img" aria-label="Relats logo">
        <text x="0" y="26" fontSize="26" fontWeight="700" fill="var(--color-ink)">
          RELATS
        </text>
        <rect x="0" y="31" width="140" height="3" fill="var(--color-relats-orange)" />
      </svg>

      <div className="space-y-4">
        <div className="h-1 w-16 bg-relats-orange" />
        <h1 className="text-display font-semibold leading-tight text-ink">
          Organisational Carbon Footprint
        </h1>
        <p className="text-h1 text-slate">
          {entityName}
        </p>
        <p className="text-body text-slate">
          GHG Protocol Corporate Standard / ISO 14064-1 · Scopes 1, 2 & 3
        </p>
      </div>

      <p className="text-caption text-slate">Prepared by Footprint Mappa</p>
    </div>
  );
}
