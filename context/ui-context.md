# UI Context

Reference designs: `Maison243 Admin v2.dc.html`, `Maison243 Seller Portal.dc.html`, `Maison243 Agency Portal.dc.html`.

## Theme

Light only. A calm, modern SaaS dashboard: a soft grey page, white cards with hairline borders and generous rounded corners, one blue primary accent, red reserved for alerts and badges, and status shown with soft tinted pills. Dense data (tables, queues) sits inside white cards; navigation lives in a pale left sidebar with a sticky white top bar. Photography appears in listing cards and the listing drawer only. All three portals share the same theme — they differ in navigation and content, not in look.

## Colors

All components use these tokens — no hard-coded hex values.

| Role                     | CSS Variable           | Value     |
| ------------------------ | ---------------------- | --------- |
| Page background          | `--bg-base`            | `#f4f5f8` |
| Sidebar background       | `--bg-sidebar`         | `#f8f9fb` |
| Surface (cards, header)  | `--bg-surface`         | `#ffffff` |
| Table header / subtle    | `--bg-subtle`          | `#fafbfc` |
| Nav active / segment track | `--bg-muted`         | `#eceef3` |
| Primary text             | `--text-primary`       | `#14161b` |
| Secondary text           | `--text-secondary`     | `#5b6170` |
| Muted text               | `--text-muted`         | `#8a909c` |
| Primary accent           | `--accent-primary`     | `#4361ee` |
| Accent hover             | `--accent-hover`       | `#3550e0` |
| Accent tint (selected)   | `--accent-tint`        | `#eef1fe` |
| Accent ring (focus)      | `--accent-ring`        | `#e3e8fd` |
| Border (cards)           | `--border-default`     | `#e7e9ee` |
| Border (inputs, buttons) | `--border-input`       | `#e3e6ec` |
| Row divider              | `--border-subtle`      | `#f0f1f4` |
| Error / alert badge      | `--state-error`        | `#e5484d` |
| Error text on tint       | `--state-error-text`   | `#c22f34` |
| Error tint               | `--state-error-bg`     | `#fdecec` |
| Success text             | `--state-success`      | `#17803d` |
| Success tint             | `--state-success-bg`   | `#e8f6ee` |
| Warning text             | `--state-warning`      | `#9a5a00` |
| Warning tint             | `--state-warning-bg`   | `#fff4e0` |
| Info text                | `--state-info`         | `#3150d8` |
| Neutral tag text / tint  | `--state-neutral` / `--state-neutral-bg` | `#4b5160` / `#eff0f3` |
| Ink (toast, card mock)   | `--ink`                | `#14161b` |

**Status → tag tone** (always use this mapping):
- Success: `Live`, `Active`, `Verified`, `Paid`, `Complete`, `Contacted`, `Recommended`
- Warning: `Pending review`, `Pending`, `ID pending`, `FFC pending`, `Invite sent`, `Invited`, `Due`
- Error: `Suspended`, `Removed`, `Expired`, `Overdue`, `Not recommended`
- Info: `Under offer`, `New`, `In progress`
- Neutral: `Draft`, `Unpublished`, `Sold`, `Let`, `Withdrawn`, `Archived`, `Cancelled`, `Refunded`, `Deactivated`

## Typography

| Role      | Font               | Variable      |
| --------- | ------------------ | ------------- |
| UI text   | Plus Jakarta Sans (400, 500, 600, 700, 800) | `--font-sans` |
| Code/mono | ui-monospace, SFMono-Regular, Menlo | `--font-mono` |

Scale: page title 22px/700; section title 17px/700; stat value 28px/700; body 14px/400–600; labels and table headers 12–13px/600; meta 12px muted. Letter-spacing −0.02em on titles and large numbers.

## Border Radius

| Context                          | Value / Class |
| -------------------------------- | ------------- |
| Tags / pills, toggles, avatars   | `rounded-full` |
| Buttons, inputs, nav items, segments | `rounded-[9px]` |
| Inner tiles (photo slots, list items in drawers) | `rounded-[10px]`–`rounded-xl` |
| Cards / panels / tables          | `rounded-[14px]` |
| Modals, drawer (left edge), toast | `rounded-2xl` (16px); toast 12px |

Shadows are rare: card hover `0 6px 18px rgba(20,22,27,.06)`, popover/tooltip `0 8px 24px rgba(20,22,27,.14)`, dialog `0 24px 60px rgba(20,22,27,.22)`, drawer `-12px 0 40px rgba(20,22,27,.14)`.

## Component Library

Custom Blade components on Tailwind (no third-party kit), in `resources/views/components/`. Livewire 3 drives interactivity; Alpine.js for small client-only toggles (drawer open, FAQ accordion, sidebar collapse).

| Component | Spec |
| --------- | ---- |
| `<x-button variant="primary|secondary|ghost">` | 38px high (32px in tables, 40–42px in forms), 13px/600; primary blue fill, secondary white with input border; hover darken / `#f5f6f9` |
| `<x-tag tone="…">` | 12px/600 pill, tinted background + dark text from the tone table |
| `<x-card>` | white, 1px `--border-default`, 14px radius, 18–24px padding |
| `<x-stat-card>` | label 13px/600, value 28px/700, optional sparkline (area + line), sub-line muted |
| `<x-table>` | inside a card; header row `--bg-subtle`, 12px/600 muted headers, 14px rows, `--border-subtle` dividers, row hover `#fafbfd`, sortable header buttons with ↑/↓ |
| `<x-seg>` | segmented control: `--bg-muted` track, 4px padding, active option white with small shadow; optional count after label |
| `<x-input>`, `<x-select>`, `<x-textarea>` | 40px, input border, 9px radius, focus border blue + 3px `--accent-ring` |
| `<x-toggle>` | 42×24 switch, blue when on |
| `<x-drawer>` | right side, max 520px, sticky header (kicker, title, status tag, close), scroll body, sticky action footer |
| `<x-dialog>` | centred, max 460–520px, title 19px/700, body, actions right-aligned (Cancel secondary, confirm primary) |
| `<x-toast>` | bottom-centre, ink background, white 14px/600 text, green check, auto-dismiss 2.6s |
| `<x-bulk-bar>` | appears above a table when rows are selected: accent tint background, "N selected", action buttons, Clear |
| `<x-plan-option>` | selectable card/row with radio ring (5px blue ring when selected), name, price, meta line |
| `<x-image-slot>` | 10px radius placeholder for photos; first slot is the cover |
| `<x-photo-uploader>` | drop zone + grid of tiles (`auto-fill, minmax(170px,1fr)`, 130px high, 10px radius). Tile states: **Processing** — `--bg-subtle` fill, spinner + "Optimising…" 12px muted; **Ready** — the `thumb` variant, "Cover" tag on first tile, hover shows reorder handle and delete icon button; **Failed** — `--state-error-bg` fill, error text, Retry/Remove. Counter "N of max photos" from the listing plan. |

## Layout Patterns

- **App shell**: CSS grid `248px | 1fr` (76px when the sidebar is collapsed). Under 960px the sidebar becomes a horizontal scrolling top strip and the header stops being sticky.
- **Sidebar**: `--bg-sidebar`, right border, brand mark (32px ink square with "M") + name, grouped nav sections with 12px muted group labels ("Menu"/"Settings" in admin; "My properties"/"Account"/"Support" for sellers; "Work"/"Agency"/"Support" for agencies). Active item `--bg-muted`; red count badges for pending work. Seller/agency portals have a "Collapse menu" control.
- **Top bar**: white, bottom border, 72px min, sticky; breadcrumb (12px muted) over page title (22px/700) on the left; right side shows help contact (seller), agency chip (agency), settings/notification buttons (admin) and the user avatar + name + role.
- **Content**: 24px × 28px padding (16px on mobile), 20px vertical gap between blocks; two-column splits `1.8fr / 1fr` collapse to one column under 1180px.
- **List pages**: toolbar row (segmented status filter left, search + primary action right) → table card → footer with range label, rows-per-page and pagination.
- **Overview (admin)**: 4 stat cards in an auto-fit grid → chart card + gauge card → review queue (listing photo cards with approve/reject) + verification queue.
- **Detail**: clicking a row opens the right drawer (admin) or the edit form (portals); related records are clickable rows that open their own detail.
- **Forms**: sections separated by a subtle top rule; responsive grid of fields (`auto-fit, minmax(220px,1fr)`); errors collected in a red tint box above the action row; actions row: Cancel left, secondary + primary right.
- **Seller Add new**: step 1 plan picker (three plan options); the property form renders only after a plan is selected and is constrained by that plan.
- **Modals**: centred over a 36% ink backdrop; Escape and backdrop click close them.

## Images

- Always render listing photos with `$media->url('medium')` + `srcset` and `sizes`; use `thumb` in tables/cards and `large` only in the drawer/gallery.
- Set `width`/`height` (or `aspect-ratio: 3/2`) on every `<img>` to avoid layout shift; `loading="lazy"` below the fold; `object-fit: cover`.
- Never show the raw upload preview after save — show the Processing tile until the processed variant is ready.
- Do not apply CSS filters to photos; lighting is corrected server-side.

## Icons

Lucide (stroke icons), rendered inline as SVG via a `<x-icon name="…">` Blade component (blade-lucide-icons). Stroke width 1.8 in navigation and chips, 2–2.4 in buttons. Sizes: 14px in chips and meta, 15–16px in buttons and inline, 17–18px in navigation and header buttons, 20px in feature tiles. Icons inherit `currentColor`; never use emoji.
