---
name: SignalScope theme tokens (HSL triples + @theme inline)
description: Why color utilities can render transparent, and the hsl() wrapping rule for the Tailwind v4 theme block
---

# Theme color tokens must be hsl()-wrapped in `@theme inline`

`artifacts/signalscope/src/index.css` defines colors in `:root` as **bare HSL
triples** (e.g. `--popover: 224 71% 6%`), NOT hex and NOT `hsl(...)`. They are
only valid when consumed as `hsl(var(--token))` (as body/scrollbar/charts do).

The Tailwind v4 `@theme inline` block maps `--color-*` to these tokens. Each
mapping MUST wrap in `hsl(...)`:

    --color-popover: hsl(var(--popover));   /* correct */
    --color-popover: var(--popover);        /* BROKEN → invalid color → transparent */

**Why:** with `@theme inline`, Tailwind inlines the value, so `bg-popover`
compiles to `background-color: var(--popover)` = `224 71% 6%`, which is an
invalid CSS color → the element renders transparent (and `text-*` inherit).
This affects EVERY color utility (bg-*, text-*, border-*), not just popover; the
symptom that surfaced it was a see-through header export dropdown.

**How to apply:** any new color token added to `:root` as an HSL triple must get
a matching `--color-X: hsl(var(--X))` entry in the `@theme inline` block. Never
add a bare `var(--X)` color mapping there.
