# Refactor review

## Scope and behavior

Reviewed the maintained source, styles, project configuration, editor files,
package metadata and asset references. Installed dependencies, build output,
Quasar-generated files and `DustWars.zip` are not refactoring targets.

The refactor preserves the current pricing algorithm, catalog order, trade
rules, FIFO costing, day advancement, log messages and version 3 save format.
No dependency upgrades or new runtime dependencies were introduced. The
existing `860px` log-dialog correction and ZIP archive were preserved.

## Structural changes

| Area                  | Result                                                                                                                                                                                                   |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Game store            | Coordinates state updates and persistence. Initial state, trade calculation, price history and epoch message construction live in pure domain functions.                                                 |
| Trading               | `domain/trading.ts` produces a validated update and log message. The store applies it, refreshes the market and saves. Buy and sell share this path.                                                     |
| Cargo                 | Shared `CargoLots`/`CargoGroup` types and a cached store getter supply both the hold and dialog. FIFO helpers continue to return new records.                                                            |
| Market controls       | One `TradeControls.vue` handles both directions, preserving the existing quantity and reset semantics. View data types no longer live inside the row component.                                          |
| Dialogs and logs      | `BaseDialog.vue` owns the common dialog header, body and close control. `LogEntries.vue` renders both log presentations. Cargo focusing uses the dialog's completed transition event instead of a timer. |
| Placeholder screens   | Map and Bank use one shared placeholder component.                                                                                                                                                       |
| Naming and formatting | `basePrice` and `volatility` describe catalog values. Type-only imports and project formatting are consistent. Unused random helper exports and template configuration clutter were removed.             |
| Persistence           | Browser storage moved from supposedly pure utilities into `services/gameStorage.ts`. The save key and version remain unchanged.                                                                          |
| Routing               | The existing manual nested route table is the single source of truth. Unused file-routing generation and its unused catch-all page were removed; unknown paths still redirect to Market.                 |
| Tooling               | Linting and formatting have distinct read-only checks and explicit fix commands. ESLint covers root configuration and tests as well as source, and enforces pure-layer import/browser boundaries.        |
| Documentation         | README reflects actual routes, persistence, scripts and directory responsibilities. Package-lock project naming matches package.json.                                                                    |

Accessible quantity labels, dialog names and a heat-meter label were added.
The visual redesign is separately proposed in [ui-review.md](ui-review.md).

## Verification

- TypeScript and ESLint passed on the original project before extraction.
- Regression tests first established the existing cargo, pricing and store
  behavior. A fixed-seed price fixture checks the unchanged pricing results.
- Tests cover FIFO batches, immutable supply changes, rejected trades,
  complete cargo removal, epoch transitions, bounded price history, saving,
  restoring and resetting a run.
- Vue interaction tests cover both trade directions, presets, totals,
  changing limits, submission, reset signals and numeric input bounds.
- All 14 automated tests pass. A separate comparison against the original
  implementation matched 1,425 state/action-result/save snapshots across
  five fixed-seed runs, including trades, day advancement, restoration
  and reset.
- `npm run check` runs formatting, linting, type checking and tests.
- `npm run build` validates the production SPA and its styles.

The component tests use Vue with a small in-memory renderer; they do not
verify browser layout, actual focus, Quasar dialogs or touch behavior. A
browser smoke check remains appropriate before accepting a visual redesign.

## Findings queued for the logic/features audit

These are observations, not rule changes in this refactor:

1. **Supply resets:** `isSupplyResetDay` is true for every day in a reset
   epoch. Days 10, 11 and 12 therefore each reset supply and add a log entry.
   Confirm whether resets should happen only on the epoch boundary.
2. **Trade inputs:** the public trade API accepts fractional values and does
   not reject `NaN`. Agree on quantity granularity and validate finite values
   at the domain boundary.
3. **Save validation:** storage checks JSON syntax and version but trusts the
   state shape. A malformed version 3 save can fail during restoration.
   Add a runtime schema and decide recovery/migration behavior.
4. **Run completion:** day advancement is not limited by `MAX_DAYS`; debt
   repayment, interest, victory/loss and progression need a feature review.
5. **Quantity limits:** the displayed input can retain a higher quantity
   after cash or cargo changes, while submission uses a lower effective
   quantity. The proposed UI pass should make these agree.
6. **Price history:** points record price changes, including trades within
   one day, rather than one point per epoch. Confirm the intended meaning
   before adding a chart or presenting history as daily data.
7. **Feature availability:** travel, banking and profile are placeholders;
   health, heat, phase and unlock flags need their intended transitions
   specified. Debug tools remain visible as before.
8. **Shared hosting:** history-mode routing requires an index.html fallback.
   Verify the deployment configuration when hosting is selected.

The next audit should reproduce each relevant case and agree on expected
behavior before changing balance or introducing new gameplay rules.
