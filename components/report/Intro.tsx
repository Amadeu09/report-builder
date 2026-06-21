import { SectionHeader } from './shared/SectionHeader';

export function Intro() {
  return (
    <section className="space-y-4 py-8">
      <SectionHeader>Introduction</SectionHeader>
      <p className="text-body leading-relaxed text-ink">
        This report presents the Organisational Carbon Footprint (OCF) of Relats, measured
        in accordance with the GHG Protocol Corporate Standard and ISO 14064-1. It covers
        direct and indirect greenhouse gas (GHG) emissions across Scopes 1, 2, and 3.
      </p>
      <p className="text-body leading-relaxed text-ink">
        The purpose of this report is to identify and quantify GHG emission sources,
        support internal decision-making, and establish a baseline for future reduction
        targets. All emission values are expressed in kilotonnes of CO₂ equivalent
        (kt CO₂e).
      </p>
    </section>
  );
}
