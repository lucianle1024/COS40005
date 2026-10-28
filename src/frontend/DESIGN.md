---
name: COS40005 Investigation Workbench
description: Evidence inspection and analyst findings for a synthetic SOC research demo.
colors:
  action-green: "#047857"
  action-green-hover: "#065f46"
  focus-green: "#059669"
  mint-on-dark: "#6ee7b7"
  ink-slate: "#0f172a"
  deep-log: "#020617"
  control-slate: "#1e293b"
  control-slate-hover: "#334155"
  paper: "#ffffff"
  workspace: "#f1f5f9"
  inset-paper: "#f8fafc"
  divider: "#d8e1ea"
  control-border: "#cbd5e1"
  muted-text: "#526277"
  light-text: "#e2e8f0"
  warning-fill: "#fffbeb"
  warning-text: "#854d0e"
  suspicious-fill: "#fef3c7"
  suspicious-text: "#92400e"
  reject-red: "#be123c"
  revise-blue: "#1d4ed8"
typography:
  title:
    fontFamily: "'Segoe UI', 'Helvetica Neue', system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 650
    lineHeight: 1.4
    letterSpacing: "-0.015em"
  subtitle:
    fontFamily: "'Segoe UI', 'Helvetica Neue', system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 650
    lineHeight: 1.4
    letterSpacing: "-0.015em"
  body:
    fontFamily: "'Segoe UI', 'Helvetica Neue', system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.8
  label:
    fontFamily: "'Segoe UI', 'Helvetica Neue', system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.4
  log:
    fontFamily: "'Cascadia Code', 'SFMono-Regular', Consolas, monospace"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.9
rounded:
  tag: "4px"
  compact-control: "5px"
  control: "6px"
  record: "7px"
  panel: "10px"
  dialog: "12px"
spacing:
  compact: "6px"
  small: "8px"
  control: "12px"
  panel: "16px"
  dialog: "24px"
components:
  button-primary:
    backgroundColor: "{colors.action-green}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "8px 12px"
  button-primary-hover:
    backgroundColor: "{colors.action-green-hover}"
  button-secondary:
    backgroundColor: "{colors.workspace}"
    textColor: "{colors.control-slate}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "8px 12px"
  button-command:
    backgroundColor: "{colors.control-slate}"
    textColor: "{colors.light-text}"
    rounded: "{rounded.compact-control}"
    padding: "5px 9px"
  input-findings:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink-slate}"
    rounded: "{rounded.control}"
    padding: "10px"
  record-active:
    backgroundColor: "{colors.ink-slate}"
    textColor: "{colors.mint-on-dark}"
    rounded: "{rounded.record}"
  decision-panel:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.panel}"
---

# Design System: COS40005 Investigation Workbench

## Overview

**Creative North Star: "Forensic Workbench"**

Assistant-authored implementation documentation for the supplied replacement direction, captured from the frontend CSS and components. The system gives source inspection the largest working surface and keeps advice visually distinct from the analyst's own findings. Compact controls and stable panels support repeated reading, citing, and editing.

Dark slate anchors the command bar and raw record inspector. White decision panels sit on a pale workspace; green identifies actionable and selected states. This document describes implemented values and interaction rules, without asserting client approval or user understanding.

**Key Characteristics:**
- Dense, legible source inspection.
- Tonal separation with restrained borders.
- Explicit action and selection states.
- Natural document flow on smaller or shorter viewports.
- Compact evidence navigation on short desktop viewports preserves raw-record reading space.

## Colors

The palette pairs dark slate with paper surfaces and a restrained green action accent. Frontmatter values are normative.

### Primary
- **Action Green / Action Green Hover:** primary actions, cited states, and the selected workflow mode.
- **Focus Green:** visible keyboard outlines and focused field borders.
- **Mint on Dark:** record identity and selected evidence accents on slate.

### Secondary
- **Revise Blue / Reject Red:** selected review decisions only; preserve the visible decision text.
- **Suspicious Fill / Suspicious Text:** the supplied classification badge, not an inferred severity meter.
- **Warning Fill / Warning Text:** local/demo limitations and filter notices.

### Neutral
- **Ink Slate / Deep Log:** command structure and raw-record canvas.
- **Control Slate / Control Slate Hover:** controls on dark surfaces.
- **Paper / Workspace / Inset Paper:** panels, decision-pane surround, evidence controls.
- **Divider / Control Border:** structural divisions and form boundaries.
- **Muted Text / Light Text:** secondary text on light surfaces and readable text on slate.

**The State Meaning Rule.** Green selected states describe an action or stored selection, never verification or model confidence.

## Typography

Use the existing system sans stack for interface text and the existing monospace stack for raw records, IDs, timestamps, and indicators. No remote font is required. The root uses a compact base (14px), line height (1.55), and tabular numerals.

Panel titles use the title role; advice titles use subtitle. Reading copy uses body, with advice rationale limited to a readable measure (75ch). Buttons use label. Metadata generally uses compact text (10–11px). The raw record uses log with a spacious reading rhythm; mobile reduces it (11px). Do not turn metadata into prominent display typography.

## Layout

The desktop workbench uses `minmax(0, 7fr) minmax(0, 5fr)`: approximately 58% evidence and 42% decisions. Evidence holds search/type controls, four equal chronological record tiles, then a deep inspector. Advice precedes findings in one decision scroll area. Findings actions sit outside that scroller at its bottom.

At width at least (1024px) and height at least (600px), the root fills the viewport (100dvh). Use `min-height: 0` through the flex/grid containment chain. The inspector's raw text scrolls independently; the decision area shares a single scroll region. Keep toolbar, record strip, inspector metadata, and actions outside their respective scrollers. Notices may scroll within a bounded height (84px).

Within this desktop layout, heights from (600px) through (700px) use a compact evidence arrangement. Keep search and filters inline even below the usual compact-command width, and prevent filter wrapping. Record tiles remain four columns; each tile puts its open control and Cite action side by side. The open control has a compact minimum height (46px), and the citation action keeps a visible text label while hiding its icon. Trim heading, tool, strip, hint, inspector metadata, and indicator padding. Preserve the raw record's font size and line height; reclaim reading space from navigation and chrome instead.

Below width (1024px), or below height (600px), switch to one column and normal page scrolling. The raw record expands naturally; actions follow content in document flow. At width up to (1279px), move evidence filters below search and suppress secondary command-bar context. At width up to (640px), use two evidence-tile columns, a full-width mode row, a separate command-actions row, wrapped inspector identity, and full-width inspector actions. The layout supports the body minimum width (320px).

Use the spacing scale for repeated control gaps, panel insets, and dialogs. Preserve `min-width: 0`, wrap raw strings anywhere, and allow button groups to wrap rather than hiding content.

## Elevation & Depth

The interface uses tonal layering and thin borders rather than shadows. Dark source surfaces establish depth; decision cards remain flat. Dialogs use a fixed slate overlay (`rgb(15 23 42 / 0.6)`) beneath a paper panel. Overlay and dialog stacking levels are (100) and (101).

## Shapes

Use modest rounded corners: tags and identity labels are compact; controls and record tiles are gently rounded; enclosing panels and dialogs use the largest radii. Borders are thin (1px). Keep raw-log areas rectangular and structurally attached to their metadata, without decorative frames.

## Components

### Buttons

Primary and secondary buttons use the documented variants, minimum height (38px), and compact icon gaps (7px). Primary hover deepens green; secondary hover uses light text-neutral fill. Both move down slightly when active (1px). Command controls have minimum height (32px). At the narrow breakpoint, primary/secondary height increases (42px); command controls increase (36px).

Buttons transition background, text, and border colors (0.15s). Focus-visible uses a green outline (2px) offset (3px). Disabled controls use the native disabled state, not just color; button opacity is (0.5). Respect reduced motion by removing transitions, animation, and smooth scrolling.

### Inputs / Fields

Findings fields use paper, control borders, documented corner radius, and internal padding. Textareas resize vertically, with reasoning initially (146px) high and minimum (130px). Search is a bordered compound field with focus-within outline; its internal input does not add a second outline. Labels remain visible or have an accessible name. Disabled findings fields keep readable neutral text and background.

### Navigation

The command bar groups case identity, three native mode buttons, and brief/about actions. Selected modes expose `aria-pressed`; mode labels remain visible. Mode changes preserve the existing unsaved-changes dialog and separate drafts. The command bar wraps according to Layout instead of truncating mode actions.

### Chips / Source Controls

Classification badges pair text with a semantic fill. Source buttons open the inspector; citation buttons independently add or remove a supporting ID. Cited controls use green and a visible label. Opening a record must not silently mark it cited or verified. Preserve missing-reference text when an ID cannot be resolved.

### Cards / Containers

Decision panels use paper, divider borders, panel corners, and inset content. Advice records are separated by rules. Review buttons use native controls with `aria-pressed`, visible accept/revise/reject text, and the existing conditional revision field. Adding advice remains a separate action from reviewing it.

### Evidence Record / Inspector

Each tile shows record ID, title, type/time, and an independent citation control. Active tiles use slate with mint identity and light title text. Order tiles chronologically. The inspector shows source and UTC time above inert raw text. Each raw line has a separate, assistive-technology-hidden line number; wrap content safely and preserve whitespace. Raw record text, claims, and references stay React text, never interpreted HTML.

In the short-desktop arrangement, keep the open action and citation action separate within the horizontal tile. Ellipsize constrained metadata rather than widening the grid. Compact inspector-header, source-line, and indicator-list insets preserve the deeper log reader without reducing raw-text typography.

### Dialogs / Pinned Actions

Use the existing Radix dialog primitive and title/description. Default width is capped (540px); expanded-record width is capped (960px), both with viewport gutters (16px) and a viewport-height limit. Keep keyboard focus contained and restore it to the opener, with the existing workspace fallback when that opener is unavailable. Preserve finalisation/new-draft confirmation and existing save/error status text. The action row states browser-only persistence.

## Do's and Don'ts

### Do:
- **Do** preserve separate source-opening, citation, review, and findings actions.
- **Do** keep fixed-advice, synthetic-record, and browser-only status text visible.
- **Do** preserve visible keyboard focus, native disabled semantics, and natural stacked scrolling.
- **Do** display case version from the fixture rather than illustration text.

### Don't:
- **Don't** introduce confidence scores, fake timers, or opened-source counters.
- **Don't** present opening, citing, or accepting as verification.
- **Don't** add attack conclusions beyond the supplied evidence.
- **Don't** imply live models, backend persistence, telemetry, or submission.
- **Don't** add paid services or new product features to reproduce the visual direction.
