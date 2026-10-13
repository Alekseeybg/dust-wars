# UI proposals for approval

These proposals come from the component and stylesheet review. They have
not been implemented or evaluated through a browser screenshot. Keep the
current dark surfaces, antique gold, muted green/red accents and monospace
numbers as the visual direction.

| Priority | Current experience                                                                                                                                        | Proposed change                                                                                                                                                                                                                                     |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1        | Many labels use 9–11px type and very dark muted text.                                                                                                     | Raise supporting labels to 12–13px, market prices and key stats to 20px, and increase text contrast. Keep uppercase tracking for short section titles only.                                                                                         |
| 1        | Every drug becomes a card with separately stacked buy/sell controls at a viewport width of 1500px or below. Ten drugs then require substantial scrolling. | Choose the layout from the market panel's available width using a container query. Use compact rows when space permits, two trade groups beside each other at intermediate widths, and stacked controls on narrow phones.                           |
| 1        | Disabled Buy/Sell controls have no explanation. Stored quantities can exceed a newly lowered limit while the total and submitted quantity are clamped.    | Show “Hold full,” “Not enough cash,” or “Nothing owned.” Keep the displayed quantity synchronized with the effective quantity and show available cash/space near the controls.                                                                      |
| 2        | Price direction and supply pressure use tiny colored marks; history is hidden in a hover tooltip.                                                         | Add a small trend legend and a focusable/tappable history control. Explain scarcity and surplus in text. Show the price refresh countdown next to the city name.                                                                                    |
| 2        | Cargo shows amounts and purchase batches, but the player must calculate whether a sale is profitable.                                                     | Add total purchase cost, current local value and unrealized gain/loss to cargo details, plus a FIFO profit/loss preview beside the Sell total. Use explicit labels and signs alongside color.                                                       |
| 2        | Travel/Profile announce “coming soon”; Map and Bank are placeholders; Debug is always visible.                                                            | Add explicit navigation with clear availability labels when screens become usable. Distinguish unfinished features from gameplay locks. Put debug tools behind a development setting and add a separate normal New Game action before hiding Reset. |
| 2        | Clickable cargo list items are not keyboard controls, and several custom controls rely on hover feedback.                                                 | Make each cargo item a real button, provide visible focus states, support history/details with keyboard and touch, respect reduced motion, and increase small touch targets.                                                                        |
| 3        | The full log can grow indefinitely and the header actions use absolute positioning.                                                                       | Add log filters by trade/event and day, progressively render long logs, and allow panel headers to wrap without title/action collisions.                                                                                                            |

## Concrete visual direction

- Keep existing surface colors. Increase the secondary text token from
  `#4a443d` to a lighter warm gray and review every context that uses it.
  Against `#0a0a0c`, the current secondary token has approximately 2.06:1
  contrast; the current muted token `#7a7068` has approximately 4.09:1.
  Proposed target: at least 4.5:1 for ordinary text.
- Use 16px body text, 20px market prices and primary stats, 15px log text,
  and 12–13px secondary labels. These sizes should come from design tokens.
- Remove redundant quantity presets where they cause crowding. The current
  340px trade column must accommodate a stepper, three preset chips and a
  primary button; verify its minimum width in the browser before choosing
  replacement dimensions.
- Keep quantities, prices and trade totals in fixed visual columns with
  tabular numbers. Preserve the current buy/sell colors initially; add clear
  positive/negative profit labels rather than relying on those colors alone.

## Recommended first UI pass

Approve priorities 1 together: readable text, a compact responsive market,
and clear trade limits. This is a focused change to the main trading screen
that can be reviewed before adding navigation or feature previews.

Cargo valuation, refresh timing and navigation availability need the logic
audit to confirm their meaning before implementation. Suggested validation:
desktop, a narrow laptop, a phone, keyboard navigation, empty/full cargo,
insufficient cash, and a quantity limit changing after a trade.
