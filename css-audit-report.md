# CSS Audit Report

## Summary
- Total rules scanned: 457
- Unused rules found: 184 (Note: Many are false positives due to PurgeCSS/Astro extraction limitations)
- Duplicate declarations: 3
- Specificity conflicts: 82 (Repeated selectors/Media query overrides)
- DO NOT TOUCH (protected): All animations, transitions, hovers, media queries, modals, FAQ accordion, and contact form rules.

## Findings
| Selector | Rule | Issue type | Safe to remove | Notes |
|---|---|---|---|---|
| .faq-item | background | Duplicate declaration | NO | DO NOT TOUCH: FAQ/Accordion related |
| .faq-item | border | Duplicate declaration | NO | DO NOT TOUCH: FAQ/Accordion related |
| .faq-item | border-radius | Duplicate declaration | NO | DO NOT TOUCH: FAQ/Accordion related |
| .logo | (multiple) | Specificity conflict | NO | Defined multiple times for different states/media |
| .nav-links | (multiple) | Specificity conflict | NO | Defined multiple times for different states/media |
| .contact-form | (various) | Unused rule | NO | DO NOT TOUCH: Contact form related |
| .modal-overlay | (various) | Unused rule | NO | DO NOT TOUCH: Modal related |
| .modal-content | (various) | Unused rule | NO | DO NOT TOUCH: Modal related |
| .faq-answer | (various) | Unused rule | NO | DO NOT TOUCH: FAQ related |
| .reveal | (various) | Unused rule | NO | DO NOT TOUCH: Animation related |
| :hover | (various) | Unused rule | NO | DO NOT TOUCH: State selector |
| @media | (various) | Unused rule | NO | DO NOT TOUCH: Media query |
| .request-bar | (various) | Unused rule | YES? | PurgeCSS rejected this; verify if used in components. |
| .dropdown-grid | (various) | Unused rule | YES? | PurgeCSS rejected this; verify if used in components. |
| .hero-text h1 | (various) | Unused rule | YES | Hero uses h2 for main title. |
| .connectivity-graph | (various) | Unused rule | YES? | PurgeCSS rejected this; verify if used in components. |

## Protected Rules (DO NOT TOUCH)
The following categories are marked as protected and were excluded from potential removal:
- **Animations/Transitions**: `.reveal`, `.node-pulse`, `.floating`, `.wave`, `@keyframes`
- **Interactive States**: All `:hover`, `:focus`, `:active` selectors.
- **Components**:
  - **Modals**: `.modal-overlay`, `.modal-content`, `.modal-close`
  - **FAQ Accordion**: `.faq-item`, `.faq-question`, `.faq-answer`
  - **Contact Form**: `.contact-form`, `.form-message`
- **Responsive**: All `@media` queries.

AUDIT_COMPLETE
