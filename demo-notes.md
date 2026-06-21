# Notas para la demo — Report Builder (Mappa × Relats)

> **Documento vivo.** Apunta aquí cada decisión y su porqué según avances.
> En la demo **no leas esto**: habla en tus palabras y defiende cada punto.
> El README (en inglés) se deriva de estas notas.

---

## Pitch de 60 segundos

- **Qué es:** una web app que convierte datos CSV de huella de carbono en un
  **informe PDF con la marca de Relats**.
- **Dominio:** OCF — huella de organización (Scope 1/2/3, ISO 14064 / GHG Protocol).
- **Apuesta:** Path A sólido (datos → informe → PDF) **+** capa Path C
  (lenguaje natural → `reportSpec` validado → re-render).
- **Principio rector:** pequeño y entendido > grande y sin dominar.

---

## Decisiones clave y por qué (esto es lo que defiendes)

1. **OCF en vez de PCF.** Jerarquía de 3 niveles (mejor ingeniería), visual icónico
   (donut de scopes + ranking de Scope 3), encaja directo con el informe de muestra,
   ideal para los prompts de Path C, y más creíble (los productos del CSV de PCF no
   son de Relats).
2. **Path C acotado (NL → spec → render).** El LLM **solo rellena un `reportSpec`
   validado**; nunca emite HTML, layout ni datos. Defendible (contrato pequeño y
   nuestro), seguro (sin vía de inyección) y barato (el grueso es el renderer).
3. **TypeScript pese a que el brief pedía JS/JSX.** Desviación consciente: type-safety
   en el modelado de datos y en el `reportSpec`. Lo digo y lo justifico, no lo escondo.
4. **Sin Xano.** No hay base de datos ni persistencia que lo justifique; las API
   routes de Next cubren el back. Decisión build-vs-buy.
5. **Server Components por defecto; endpoints solo en fronteras reales** (export PDF,
   llamada a Claude). No envuelvo el acceso a datos en REST innecesario.
6. **Dos marcas, dos sitios.** Relats en el informe; Mappa (opcional) en la UI de la
   app. Nunca mezclar; nunca colores de Office en el informe.
7. **Branding de Relats reconstruido de relats.com** (naranja `#FF5710`, confirmado
   en los metadatos de su web). El informe de muestra **no** está branded (Word por
   defecto, Calibri + paleta Office) → eso confirma que reconstruir la marca es parte
   de la prueba.
8. **Librería PDF:** _[pendiente — decisión build-vs-buy tras la research del
   `pdf-researcher`]_.

---

## Arquitectura (talking points)

- **Flujo:** CSV → capa de datos → modelo tipado → (data + `reportSpec`) → renderer
  determinista → preview en pantalla **+** export PDF.
- **Un solo árbol de componentes** sirve para el preview y para el PDF (no duplico).
- **Seguridad:** API key de Claude solo en servidor (sin `NEXT_PUBLIC_`); salida del
  LLM validada con zod antes de renderizar; el LLM no emite markup → sin XSS.
  Hardening de producción (rate-limit/auth del endpoint de Claude, validar subida de
  CSV) anotado como futuro, no implementado en una semana.

---

## Capa de datos (estación 1) — detalles defendibles

- **Registro de categorías** como fuente única de verdad; el **schema zod se genera
  desde el registro** → schema y modelo no pueden desincronizarse.
- `OcfRow` como **tipo explícito** + **aserción en tiempo de compilación** sobre los
  campos nombrados; el único cast restante está blindado por derivación compartida
  desde `CATEGORIES`.
- **Comprobación de consistencia en runtime** (categorías = total de scope; scopes =
  total) como **warnings, no errores fatales** — un dato algo descuadrado igual
  renderiza. Con guard de división por cero.
- **"Total empresa"** tratado como roll-up agregado, separado de las plantas; fallback
  que lo deriva sumando plantas si faltara.
- **Bug de unidades cazado: 1000×.** kg → kt es ÷1.000.000, no ÷1.000. El código
  compilaba, pasaba el reviewer y no daba warnings — solo se vio con un **sanity-check
  de magnitud** contra la realidad (3 plantas no pueden dar 5046 kt). → historia de
  "entiendo mi output", no solo "compila".

---

## Workflow de Claude Code / uso de IA (evaluado)

- **`CLAUDE.md`** como contexto único del proyecto; se carga también dentro de los
  subagentes.
- **Dos subagentes específicos** (commiteados en `.claude/agents/`):
  `report-reviewer` (read-only, hace cumplir el `CLAUDE.md`) y `pdf-researcher`
  (aísla la investigación y produce el `docs/pdf-research.md`).
- **Plan mode** antes de cada fase: investigar → plan → aprobar → ejecutar.
- **Deliberadamente NO usados:** agent teams, background agents, nested subagents,
  worktrees — sobredimensionado para un proyecto solo de una semana. Saber qué *no*
  usar es criterio.
- **El reviewer marcó 6 cosas; arreglé las 2 que importaban y descarté el resto con
  motivo.** Mando al subagente, no le obedezco ciegamente.

---

## Con más tiempo (para el README y la demo)

- Comparación interanual 2023 vs 2024 (el CSV es de un solo año).
- Pulir Path C: más tipos de edición, historial de specs, deshacer.
- Rate-limit / auth en el endpoint de Claude; validación de CSV subido por el usuario.
- Tematizar la UI de la app con la marca Mappa.
- Confirmar la tipografía real y el logo vectorial de Relats.
- Test específico para `deriveAggregate` (el smoke test no lo ejercita).

---

## Registro de tiempo

| Fecha | Tarea | Horas |
|-------|-------|-------|
|       |       |       |

---

## Uso de IA (resumen para el README)

- **Delegué a Claude / Claude Code:** _[...]_
- **Decidí / diseñé yo:** _[...]_
- **Verifiqué / corregí:** _[...]_ (p. ej. el bug de unidades, el triage del reviewer)

---

## Estado / TODO

- [x] **Estación 1 — capa de datos** (parseo, validación zod, consistencia). Cerrada.
- [ ] **Estación 2 — informe en pantalla** (componentes + donut + barras, branding Relats).
- [ ] **Estación 3 — export PDF** (tras decidir librería).
- [ ] **Estación 4 — Path C** (`reportSpec` + endpoint + chat UI).
- [ ] **docs / deploy** — README, pdf-research, ai-usage-log; deploy a Vercel.
