import { SectionHeader } from './shared/SectionHeader';

export function Methodology() {
  return (
    <section className="space-y-4 py-8">
      <SectionHeader>Methodological Approach</SectionHeader>
      <p className="text-body leading-relaxed text-ink">
        The organisational boundary is defined using the{' '}
        <strong>operational control</strong> approach: Relats reports 100% of emissions
        from operations over which it has operational control.
      </p>
      <h3 className="text-h2 font-semibold text-ink">Scope definitions</h3>
      <ul className="space-y-2 text-body text-ink">
        <li>
          <strong className="text-relats-orange">Scope 1</strong> — Direct emissions
          from sources owned or controlled by the organisation: stationary combustion,
          mobile combustion, process emissions, and fugitive releases.
        </li>
        <li>
          <strong className="text-relats-orange">Scope 2</strong> — Indirect emissions
          from the consumption of purchased electricity and heat or steam.
        </li>
        <li>
          <strong className="text-relats-orange">Scope 3</strong> — All other indirect
          emissions across the value chain, including raw materials, transport, waste,
          business travel, and end-of-life treatment of sold products.
        </li>
      </ul>
    </section>
  );
}
