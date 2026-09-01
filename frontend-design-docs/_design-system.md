# design-system

**File:** `web/src/styles.css`  
**Status:** implemented

## Purpose

Define Tailwind v4 tokens and global behavior for a dense, calm task surface.

## Props

Not applicable.

## State ownership

CSS owns visual tokens only; system color preference selects light/dark in this phase.

## Data dependencies

None.

## Interactions

Native horizontal/vertical scrolling and visible focus rings; no animation required for read-only rendering.

## Keyboard & accessibility

Minimum contrast targets WCAG AA; focus-visible rings use sky; scroll regions are labelled in components.

## Visual states

Slate/stone neutrals, sky accent, amber warning, red danger, 4/8px spacing rhythm, 12/16px radii, system sans type. Loading uses subtle pulse; dragging is not applicable.

## Composition

Imported once by `main.tsx`; component utilities consume the tokens.

## Edge cases

Long text wraps, narrow screens retain horizontal access, and dark mode avoids pure black.

## Open questions

Manual theme persistence is intentionally deferred to Phase 8.
