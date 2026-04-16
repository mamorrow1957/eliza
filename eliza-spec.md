# ELIZA Web Implementation — Specification

## Overview

A browser-based implementation of the ELIZA natural language processing program, originally created by Joseph Weizenbaum at MIT in 1966. This implementation uses the DOCTOR script, which simulates a Rogerian psychotherapist, and runs entirely in the client with no server-side dependencies.

---

## Functional Requirements

### Conversation Engine

1. The program shall accept free-text input from the user and produce a plausible response in the style of the DOCTOR script.
2. The program shall match user input against an ordered set of pattern rules, selecting the highest-weight matching rule.
3. Each rule shall contain one or more response templates that are cycled through in order, so the same response is not repeated on consecutive matches of the same rule.
4. If no rule matches, the program shall select a fallback response from a dedicated fallback list, also cycled in order.
5. The program shall pre-process input by normalising common synonyms and contractions to canonical forms before pattern matching (e.g. `"cant"` → `"can't"`, `"dreamt"` → `"dreamed"`).
6. Captured substrings from pattern matches shall undergo pronoun reflection before being substituted into response templates (e.g. `"I"` → `"you"`, `"my"` → `"your"`).
7. The program shall produce an opening greeting from ELIZA on page load without any user input.

### Pattern Rules

Each rule has three attributes:

| Attribute   | Type             | Description                                              |
|-------------|------------------|----------------------------------------------------------|
| `weight`    | integer          | Priority; higher values are matched first                |
| `pattern`   | regular expression | Matched (case-insensitively) against the processed input |
| `responses` | string array     | One or more response templates, cycled in order          |

Response templates may contain `$1`, `$2`, etc. as placeholders for reflected captured groups from the pattern match.

#### Required Keyword Categories

The rule set shall include patterns covering at minimum the following topics:

- Greetings (`hello`, `hi`, `hey`)
- Expressions of need (`I need …`)
- Expressions of inability (`I can't …`, `why can't I …`)
- Self-description (`I am …`, `I'm …`)
- Feelings (`I feel …`, `I felt …`)
- Thought (`I think …`)
- Desire (`I want …`, `I wish …`)
- Family members (`mother`, `father`, `sister`, `brother`, `family`, `child`)
- Dreams (`dream`, `dreamed`)
- Memory (`remember`, `recall`, `forget`)
- Computers and machines (`computer`, `machine`, `robot`, `ai`, `bot`)
- Conditional statements (`if …`, `because …`, `perhaps …`)
- Possessives (`my …`)
- Affirmations and negations (`yes`, `no`)
- Absolute quantifiers (`always`, `everybody`, `never`, `nobody`, `all`)
- Similarity (`alike`)
- Direct questions addressed to ELIZA (`are you …?`, `why don't you …?`)
- General questions (`what …?`, `how …?`)
- Apologies (`sorry`)
- User statements about ELIZA (`you …`)
- Questions (any input ending with `?`)

### Synonym Normalisation

The following substitutions shall be applied as whole-word replacements before pattern matching:

| Input word    | Normalised form |
|---------------|-----------------|
| `dont`        | `don't`         |
| `cant`        | `can't`         |
| `wont`        | `won't`         |
| `recollect`   | `remember`      |
| `recall`      | `remember`      |
| `dreamt`      | `dreamed`       |
| `dreams`      | `dream`         |
| `maybe`       | `perhaps`       |
| `certainly`   | `yes`           |
| `machine`     | `computer`      |
| `machines`    | `computer`      |
| `computers`   | `computer`      |
| `were`        | `was`           |
| `you're`      | `you are`       |
| `i'm`         | `i am`          |
| `same`        | `alike`         |
| `identical`   | `alike`         |
| `equivalent`  | `alike`         |

### Pronoun Reflection

The following substitutions shall be applied word-by-word to captured groups before insertion into response templates:

| Captured word | Reflected word |
|---------------|----------------|
| `am`          | `are`          |
| `was`         | `were`         |
| `i`           | `you`          |
| `i'd`         | `you would`    |
| `i've`        | `you have`     |
| `i'll`        | `you will`     |
| `my`          | `your`         |
| `me`          | `you`          |
| `myself`      | `yourself`     |
| `you`         | `I`            |
| `your`        | `my`           |
| `yours`       | `mine`         |
| `you've`      | `I have`       |
| `you'll`      | `I will`       |
| `you'd`       | `I would`      |
| `you're`      | `I am`         |
| `are`         | `am`           |
| `were`        | `was`          |

---

## User Interface Requirements

### Layout

- Single-page application with no navigation.
- A fixed header displaying the program name ("ELIZA") and subtitle ("DOCTOR Script — MIT Artificial Intelligence Laboratory, 1966").
- A scrollable chat window occupying the remaining vertical space.
- A fixed input area at the bottom containing a text field and a send button.

### Chat Window

- Messages from ELIZA and messages from the user shall be visually distinguished by colour and label.
- Each message shall display a speaker label (`ELIZA` or `YOU`) above the message text.
- New messages shall cause the chat window to scroll to the bottom automatically.
- All user-supplied text shall be HTML-escaped before rendering to prevent injection.

### Input Area

- The text field shall accept free-form text.
- Pressing **Enter** or clicking the **Send** button shall submit the current input.
- The input field shall be cleared after submission.
- The input field shall receive focus on page load.

### Response Timing

- ELIZA's responses shall be delayed by a randomised interval in the range **350–650 ms** after the user submits input, to simulate natural thinking time.

### Visual Design

- Retro terminal aesthetic: dark background (`#0a0a0a`), phosphor-green foreground (`#33ff33`), monospace font.
- ELIZA messages: bright green (`#33ff33`).
- User messages: lighter green (`#aaffaa`).
- The Send button shall invert colours on hover.

### Mobile & Tablet Viewport

- The input area shall remain visible within the viewport on tablet-sized screens in both portrait (768×1024) and landscape (1024×768) orientations.
- The layout shall use a dynamic viewport height (`100dvh`) so that the browser chrome (address bar, navigation bar) on iOS Safari is accounted for and the input area is never pushed below the fold.
- The `html` element shall use `-webkit-fill-available` height so that older versions of iOS Safari also constrain the layout correctly.
- The chat window shall have `min-height: 0` so it can shrink within the flex column without forcing the input area off-screen.
- The chat window shall use `-webkit-overflow-scrolling: touch` for smooth momentum scrolling on iOS.

---

## Technical Requirements

- Implemented as a single self-contained HTML file (`index.html`) with no external dependencies.
- All logic (pattern matching, synonym normalisation, pronoun reflection, UI) shall be implemented in vanilla JavaScript within the file.
- No server-side code, build tools, or package manager required.
- Compatible with all modern browsers (Chrome, Firefox, Safari, Edge).

---

## Testing

### Framework

Tests are written with [Playwright](https://playwright.dev/) and run against the `index.html` file directly via a `file://` URL — no dev server required. The test runner is Chromium headless.

### Running Tests

```bash
npm install
npm test
```

### Test Suite Overview

59 tests are organised into 7 groups:

| Group | Tests | Description |
|---|---|---|
| Layout & static content | 8 | Page title, header text and subtitle, chat window, input field, Send button, input area within viewport in portrait and landscape tablet sizes |
| Initialization | 4 | Opening greeting fires on load, correct text, ELIZA speaker label, input focused |
| Input & UI interaction | 8 | Enter key, Send button, input cleared after submit, user message text/label, multi-turn replies, empty and whitespace-only input rejected |
| Pattern matching | 21 | Every keyword category: greetings, `I need/am/feel/think/want/can't/wish`, `because`, `sorry`, `mother`, `father`, `dream`, `computer`, `remember`, `yes`, `no`, `always`, `?`, `if`, `my` |
| Synonym normalisation | 4 | `recollect→remember`, `machine→computer`, `maybe→perhaps`, `dreamt→dream` |
| Pronoun reflection | 3 | `I→you`, `my→your`, `me→you` in captured phrases |
| Response cycling | 3 | Different reply on repeated input, full 4-response cycle wrap, fallback list cycling |
| Edge cases | 10 | `<script>` XSS, HTML `<b>` injection, 500-character input, all-caps input, punctuation-only input, rapid-fire messages, numeric input, ampersand escaping |

### Edge Case Coverage

- **XSS prevention** — `<script>` tags in user input are HTML-escaped; no script executes and no global is set.
- **HTML injection** — `<b>` tags appear as literal text; no DOM elements are created inside message bubbles.
- **Long input** — inputs exceeding 500 characters are handled gracefully and produce a response.
- **Case insensitivity** — all-caps input matches the same rules as lowercase.
- **Empty / whitespace input** — submitting blank input adds no messages to the chat.
- **Rapid-fire messages** — three messages sent in immediate succession each receive a response.
- **Response cycling** — repeated identical input cycles through the rule's response list and wraps back to the first after exhaustion.
- **Fallback cycling** — unrecognised input advances through the fallback list rather than repeating.

---

## File Structure

```
eliza/
├── index.html          # Complete application (HTML + CSS + JS)
├── eliza-spec.md       # This document
├── playwright.config.js
├── package.json
└── tests/
    └── eliza.spec.js   # Playwright test suite (59 tests)
```

---

## References

- Weizenbaum, J. (1966). ELIZA — A computer program for the study of natural language communication between man and machine. *Communications of the ACM*, 9(1), 36–45.
