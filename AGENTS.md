# Project rules

Consult these rules at the start of every task and review the relevant rules before handing off changes. They are persistent user preferences for this project; later user instructions take precedence.

## Design collaboration

- Feedback such as "I don't like it; make it better" is valid direction. The user is not a designer and may not know which visual changes would improve the result.
- Take responsibility for diagnosing the design problem and developing a stronger solution. Use judgment, concrete alternatives, and small mockups when helpful; do not require the user to prescribe CSS or design terminology.
- Preserve approved choices while improving the parts the user dislikes. Ask for clarification only when a meaningful decision cannot be reasonably inferred from the feedback and established design.

## Design consistency

- Keep the design consistent across every task. Use the approved top navigation and market UI as the visual references.
- Use dark, neutral charcoal surfaces with subtle gradients and inset depth. Keep amber/gold for accents; avoid brown surfaces and blue color casts.
- Reuse established typography, spacing, rounded edges, borders, hover effects, focus states, and popup treatments. Prefer existing components and styles when adding or changing UI.
- Keep controls compact and content readable. Buy/Sell actions belong beside their quantity controls; popup pointers must match their popup and align with their trigger.
- Preserve the existing generated logo. Follow the approved centered Market title with its location subtitle when maintaining the market header.
- For material departures from the approved visual direction, prepare a concrete proposal or mockup for review unless the user has already authorized that departure.

## Code quality and completion

Aim for the highest quality in every task, including every UI element and feature. Review each addition or change against these questions:

1. Does it follow Robert C. Martin's (Uncle Bob's) Clean Code principles? Use meaningful names, clear intent, cohesive functions and components, and appropriate separation of responsibilities.
2. Is it consistent with the existing code's naming, structure, conventions, and established patterns?
3. Does it belong in this file and layer? Keep presentation, state orchestration, domain logic, and data definitions in their appropriate places.
4. Does it duplicate existing behavior or structure? Look for existing implementations first and reuse or extract a cohesive shared implementation when appropriate. Avoid abstractions that merely hide repetition without improving clarity.

- Apply the established design rules to every new UI and to every UI change.
- Finish the requested work with careful self-review. Address awkward layouts, clipped content, unclear interactions, relevant edge states, and avoidable code duplication before handing it off.
- Verify in proportion to the change and respect the user's current verification preference below. Be candid about anything that remains unverified.

## Verification preference

- The user has requested skipping test writing and test execution for now. Use formatting, linting, type/build checks, and browser inspection as appropriate.
