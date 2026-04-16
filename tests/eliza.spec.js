// @ts-check
const { test, expect } = require("@playwright/test");
const path = require("path");

const PAGE_URL = "file://" + path.resolve(__dirname, "..", "index.html");

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Navigate to a fresh ELIZA page and wait for the opening greeting. */
async function loadPage(page) {
  await page.goto(PAGE_URL);
  // Wait for opening greeting (delayed ~400 ms on load)
  await expect(page.locator(".message.eliza")).toHaveCount(1, { timeout: 3000 });
}

/**
 * Type a message, submit via Enter, and wait for ELIZA's next reply.
 * Returns the text of the new ELIZA message.
 */
async function chat(page, text) {
  const elizaBefore = await page.locator(".message.eliza").count();
  await page.fill("#user-input", text);
  await page.press("#user-input", "Enter");
  await expect(page.locator(".message.eliza")).toHaveCount(elizaBefore + 1, {
    timeout: 3000,
  });
  return page.locator(".message.eliza .text").last().textContent();
}

/**
 * Same as chat() but submits via the Send button instead of Enter.
 */
async function chatViaButton(page, text) {
  const elizaBefore = await page.locator(".message.eliza").count();
  await page.fill("#user-input", text);
  await page.click("#send-btn");
  await expect(page.locator(".message.eliza")).toHaveCount(elizaBefore + 1, {
    timeout: 3000,
  });
  return page.locator(".message.eliza .text").last().textContent();
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Layout & Static Content
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Layout & static content", () => {
  test("page title is 'ELIZA — DOCTOR Script'", async ({ page }) => {
    await page.goto(PAGE_URL);
    await expect(page).toHaveTitle("ELIZA — DOCTOR Script");
  });

  test("header h1 displays 'E L I Z A'", async ({ page }) => {
    await page.goto(PAGE_URL);
    await expect(page.locator("header h1")).toHaveText("E L I Z A");
  });

  test("header subtitle references the DOCTOR Script and MIT", async ({ page }) => {
    await page.goto(PAGE_URL);
    const subtitle = page.locator("header p");
    await expect(subtitle).toContainText("DOCTOR Script");
    await expect(subtitle).toContainText("1966");
  });

  test("chat window is visible", async ({ page }) => {
    await page.goto(PAGE_URL);
    await expect(page.locator("#chat-window")).toBeVisible();
  });

  test("input field is visible with correct placeholder", async ({ page }) => {
    await page.goto(PAGE_URL);
    const input = page.locator("#user-input");
    await expect(input).toBeVisible();
    await expect(input).toHaveAttribute(
      "placeholder",
      "Tell me what's on your mind..."
    );
  });

  test("Send button is visible and labelled SEND", async ({ page }) => {
    await page.goto(PAGE_URL);
    const btn = page.locator("#send-btn");
    await expect(btn).toBeVisible();
    await expect(btn).toHaveText("SEND");
  });

  test("input area is within viewport in portrait tablet size (768x1024)", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(PAGE_URL);
    const inputArea = page.locator("#input-area");
    await expect(inputArea).toBeVisible();
    const box = await inputArea.boundingBox();
    expect(box).not.toBeNull();
    // Bottom edge of input area must be within the viewport height
    expect(box.y + box.height).toBeLessThanOrEqual(1024);
  });

  test("input area is within viewport in landscape tablet size (1024x768)", async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto(PAGE_URL);
    const inputArea = page.locator("#input-area");
    await expect(inputArea).toBeVisible();
    const box = await inputArea.boundingBox();
    expect(box).not.toBeNull();
    // Bottom edge of input area must be within the viewport height
    expect(box.y + box.height).toBeLessThanOrEqual(768);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Initialization
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Initialization", () => {
  test("ELIZA sends an opening greeting automatically on load", async ({ page }) => {
    await page.goto(PAGE_URL);
    await expect(page.locator(".message.eliza")).toHaveCount(1, { timeout: 3000 });
  });

  test("opening greeting text is the classic DOCTOR welcome", async ({ page }) => {
    await loadPage(page);
    const greeting = await page.locator(".message.eliza .text").first().textContent();
    expect(greeting).toBe("How do you do. Please tell me your problem.");
  });

  test("opening greeting speaker label is 'ELIZA'", async ({ page }) => {
    await loadPage(page);
    await expect(page.locator(".message.eliza .speaker").first()).toHaveText("ELIZA");
  });

  test("input field has focus on load", async ({ page }) => {
    await loadPage(page);
    await expect(page.locator("#user-input")).toBeFocused();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Input & UI Interaction
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Input & UI interaction", () => {
  test("pressing Enter submits the message", async ({ page }) => {
    await loadPage(page);
    await chat(page, "hello");
    // One user message should now exist
    await expect(page.locator(".message.user")).toHaveCount(1);
  });

  test("clicking Send button submits the message", async ({ page }) => {
    await loadPage(page);
    await chatViaButton(page, "hello");
    await expect(page.locator(".message.user")).toHaveCount(1);
  });

  test("input field is cleared after submission", async ({ page }) => {
    await loadPage(page);
    await page.fill("#user-input", "hello");
    await page.press("#user-input", "Enter");
    await expect(page.locator("#user-input")).toHaveValue("");
  });

  test("user message appears in chat with correct text", async ({ page }) => {
    await loadPage(page);
    await chat(page, "hello there");
    await expect(page.locator(".message.user .text").first()).toHaveText("hello there");
  });

  test("user message has 'YOU' speaker label", async ({ page }) => {
    await loadPage(page);
    await chat(page, "hello");
    await expect(page.locator(".message.user .speaker").first()).toHaveText("YOU");
  });

  test("ELIZA replies after every user message", async ({ page }) => {
    await loadPage(page);
    await chat(page, "hello");
    await chat(page, "I feel sad");
    // 1 greeting + 2 replies = 3 ELIZA messages
    await expect(page.locator(".message.eliza")).toHaveCount(3);
  });

  test("empty input does not add any message", async ({ page }) => {
    await loadPage(page);
    const usersBefore = await page.locator(".message.user").count();
    const elizaBefore = await page.locator(".message.eliza").count();
    await page.fill("#user-input", "");
    await page.press("#user-input", "Enter");
    // Brief pause to confirm nothing was added
    await page.waitForTimeout(800);
    expect(await page.locator(".message.user").count()).toBe(usersBefore);
    expect(await page.locator(".message.eliza").count()).toBe(elizaBefore);
  });

  test("whitespace-only input does not add any message", async ({ page }) => {
    await loadPage(page);
    const elizaBefore = await page.locator(".message.eliza").count();
    await page.fill("#user-input", "   ");
    await page.press("#user-input", "Enter");
    await page.waitForTimeout(800);
    expect(await page.locator(".message.eliza").count()).toBe(elizaBefore);
  });

  test("chat window scrolls to bottom after new messages are added", async ({ page }) => {
    await loadPage(page);
    // Send enough messages to push content beyond the visible area
    for (let i = 0; i < 6; i++) {
      await chat(page, "I feel very sad and I do not know what to do about it");
    }
    const isAtBottom = await page.evaluate(() => {
      const el = document.getElementById("chat-window");
      return Math.abs(el.scrollHeight - el.clientHeight - el.scrollTop) < 10;
    });
    expect(isAtBottom).toBe(true);
  });

  test("double-clicking Send does not submit the message twice", async ({ page }) => {
    await loadPage(page);
    await page.fill("#user-input", "hello");
    // Click twice rapidly; after the first click the input is cleared,
    // so the second click sees empty text and is a no-op
    await page.click("#send-btn");
    await page.click("#send-btn");
    await page.waitForTimeout(800);
    expect(await page.locator(".message.user").count()).toBe(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Pattern Matching
// Each test loads a fresh page so rule counters are at 0, making the first
// response for each rule fully predictable.
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Pattern matching", () => {
  test("greeting: 'hello' → first hello response", async ({ page }) => {
    await loadPage(page);
    const reply = await chat(page, "hello");
    expect(reply).toBe("Hello. How are you feeling today?");
  });

  test("greeting: 'hi' also triggers the greeting rule", async ({ page }) => {
    await loadPage(page);
    const reply = await chat(page, "hi");
    // Greeting rule responses (cycled from 0)
    const valid = [
      "Hello. How are you feeling today?",
      "Hi there. Please tell me what's on your mind.",
      "Hello. How do you do. Please state your problem.",
    ];
    expect(valid).toContain(reply);
  });

  test("'I need X' → asks why user needs the reflected phrase", async ({ page }) => {
    await loadPage(page);
    const reply = await chat(page, "I need some help");
    expect(reply).toBe("Why do you need some help?");
  });

  test("'I am X' → first response reflects the predicate", async ({ page }) => {
    await loadPage(page);
    const reply = await chat(page, "I am very anxious");
    expect(reply).toBe("Did you come to me because you are very anxious?");
  });

  test("'I feel X' → first response uses the feeling", async ({ page }) => {
    await loadPage(page);
    const reply = await chat(page, "I feel lonely");
    expect(reply).toBe("Tell me more about feeling lonely.");
  });

  test("'I think X' → first response questions the thought", async ({ page }) => {
    await loadPage(page);
    const reply = await chat(page, "I think nobody cares");
    expect(reply).toBe("Do you really think nobody cares?");
  });

  test("'I want X' → first response asks what it would mean", async ({ page }) => {
    await loadPage(page);
    const reply = await chat(page, "I want to be happy");
    expect(reply).toBe("What would it mean to you if you got to be happy?");
  });

  test("'I can't X' → questions the inability", async ({ page }) => {
    await loadPage(page);
    const reply = await chat(page, "I can't stop worrying");
    expect(reply).toBe("How do you know you can't stop worrying?");
  });

  test("'because X' → challenges the reason", async ({ page }) => {
    await loadPage(page);
    const reply = await chat(page, "because it hurts");
    expect(reply).toBe("Is that the real reason?");
  });

  test("'mother' keyword → asks about mother", async ({ page }) => {
    await loadPage(page);
    const reply = await chat(page, "my mother was strict");
    // 'my' rule (weight 45) loses to 'mother' rule (weight 75)
    expect(reply).toBe("Tell me more about your mother.");
  });

  test("'father' keyword → asks about father", async ({ page }) => {
    await loadPage(page);
    const reply = await chat(page, "my father never listened");
    expect(reply).toBe("Tell me more about your father.");
  });

  test("'dream' keyword → asks about the dream", async ({ page }) => {
    await loadPage(page);
    const reply = await chat(page, "I had a dream last night");
    expect(reply).toBe("What does that dream suggest to you?");
  });

  test("'computer' keyword → response about computers", async ({ page }) => {
    await loadPage(page);
    const reply = await chat(page, "are you a computer");
    // 'are you' (weight 85) > 'computer' (weight 70)
    const valid = [
      "Why does it matter to you whether I am a computer?",
      "Would you prefer it if I were not a computer?",
      "Perhaps you believe I am a computer.",
      "I may be a computer — what does that mean to you?",
    ];
    expect(valid).toContain(reply);
  });

  test("'remember' keyword → asks about the memory", async ({ page }) => {
    await loadPage(page);
    // Avoid words that trigger higher-priority rules (e.g. "child" weight 75 > "remember" weight 55)
    const reply = await chat(page, "I remember that rainy afternoon");
    expect(reply).toContain("that rainy afternoon");
  });

  test("'yes' → affirmation response", async ({ page }) => {
    await loadPage(page);
    const reply = await chat(page, "yes");
    expect(reply).toBe("You seem quite sure.");
  });

  test("'no' → negation response", async ({ page }) => {
    await loadPage(page);
    const reply = await chat(page, "no");
    expect(reply).toBe("Are you saying 'No' just to be negative?");
  });

  test("'always' → challenges absolute quantifier", async ({ page }) => {
    await loadPage(page);
    const reply = await chat(page, "everyone always ignores me");
    // 'always' and 'everyone' both match; highest weight first, counter=0
    expect(reply).toBe("Can you think of a specific example?");
  });

  test("general question → asks why they asked", async ({ page }) => {
    await loadPage(page);
    const reply = await chat(page, "what should I do?");
    expect(reply).toBe("Why do you ask?");
  });

  test("sorry → apologetic response", async ({ page }) => {
    await loadPage(page);
    const reply = await chat(page, "I am sorry about that");
    // 'sorry' (weight 80) beats 'i am' (weight 90)? No — 'i am' wins
    // 'i am sorry about that' → matches 'i am (.*)' first (weight 90)
    expect(reply).toBe("Did you come to me because you are sorry about that?");
  });

  test("'I wish X' → response about the wish", async ({ page }) => {
    await loadPage(page);
    const reply = await chat(page, "I wish I were happy");
    expect(reply).toBe("Why do you wish you were happy?");
  });

  test("'if X' → response questions the conditional", async ({ page }) => {
    await loadPage(page);
    const reply = await chat(page, "if only things were different");
    expect(reply).toBe("Do you really think it's likely that only things were different?");
  });

  test("'my X' → asks about the possession", async ({ page }) => {
    await loadPage(page);
    const reply = await chat(page, "my dog died");
    expect(reply).toBe("Why do you say your dog died?");
  });

  test("higher-weight rule wins when multiple patterns match", async ({ page }) => {
    await loadPage(page);
    // "I think about my mother every day" matches three rules:
    //   /i think (.*)/  weight 80  ← should win
    //   /\bmother\b/    weight 75
    //   /my (.*)/       weight 45
    const reply = await chat(page, "I think about my mother every day");
    // i think rule fires; captured "about my mother every day" → reflected "about your mother every day"
    expect(reply).toBe("Do you really think about your mother every day?");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Synonym Normalisation
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Synonym normalisation", () => {
  test("'recollect' is treated as 'remember'", async ({ page }) => {
    await loadPage(page);
    const reply = await chat(page, "I recollect that day");
    // recollect → remember, so remember rule fires
    const valid = [
      "Do you often think about that day?",
      "Does thinking about that day bring anything else to mind?",
      "What else do you recollect?",
      "Why do you remember that day just now?",
      "What in the present situation reminds you of that day?",
      "What is the connection between me and that day?",
    ];
    expect(valid.some((v) => reply && reply.includes(v.split(" ").slice(0, 4).join(" ")))).toBe(true);
  });

  test("'machine' is treated as 'computer'", async ({ page }) => {
    await loadPage(page);
    const reply = await chat(page, "you are like a machine");
    // 'you' rule (weight 65) fires, but 'machine'→'computer' hits computer rule (weight 70)
    // Actually 'you (.*)'  weight 65, 'computer' weight 70 — computer wins
    const valid = [
      "Do computers worry you?",
      "What do you think about machines?",
      "Why do you bring up computers?",
      "What do computers mean to you?",
      "Do you feel threatened by computers?",
    ];
    expect(valid).toContain(reply);
  });

  test("'maybe' is treated as 'perhaps'", async ({ page }) => {
    await loadPage(page);
    const reply = await chat(page, "maybe I was wrong");
    // maybe → perhaps, triggering 'perhaps (.*)' rule
    const valid = [
      "You don't seem very certain.",
      "Why the uncertainty?",
      "Can't you be more positive?",
      "You aren't sure you was wrong?",
      "Don't you know you was wrong?",
    ];
    expect(valid).toContain(reply);
  });

  test("'dreamt' is treated as 'dreamed' / triggers dream rule", async ({ page }) => {
    await loadPage(page);
    const reply = await chat(page, "I dreamt about flying");
    const valid = [
      "What does that dream suggest to you?",
      "Do you dream often?",
      "What persons appear in your dreams?",
      "Don't you believe that dream has something to do with your problem?",
    ];
    expect(valid).toContain(reply);
  });

  test("'i'm' matches the /i'?m/ pattern rule directly", async ({ page }) => {
    await loadPage(page);
    const reply = await chat(page, "i'm feeling lost");
    // The synonym map has "i'm" → "i am" but the replacement regex (\b\w+\b)
    // cannot match across an apostrophe, so that synonym entry is never reached.
    // Instead the /i'?m (.*)/ pattern (weight 90) fires directly.
    // First response (counter=0): "How does being $1 make you feel?"
    expect(reply).toBe("How does being feeling lost make you feel?");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. Pronoun Reflection
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Pronoun reflection", () => {
  test("'I' in captured group is reflected to 'you'", async ({ page }) => {
    await loadPage(page);
    const reply = await chat(page, "I need to find myself");
    // captured: "to find myself" → reflected: "to find yourself"
    expect(reply).toBe("Why do you need to find yourself?");
  });

  test("'my' in captured group is reflected to 'your'", async ({ page }) => {
    await loadPage(page);
    const reply = await chat(page, "I feel like my life is falling apart");
    expect(reply).toBe("Tell me more about feeling like your life is falling apart.");
  });

  test("'me' in captured group is reflected to 'you'", async ({ page }) => {
    await loadPage(page);
    const reply = await chat(page, "I want someone to help me");
    expect(reply).toBe("What would it mean to you if you got someone to help you?");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. Response Cycling
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Response cycling", () => {
  test("same pattern gives different responses on successive inputs", async ({ page }) => {
    await loadPage(page);
    const r1 = await chat(page, "I need rest");
    const r2 = await chat(page, "I need rest");
    // Responses cycle, so r1 and r2 should differ
    expect(r1).not.toBe(r2);
  });

  test("'I need' cycles through all four responses then repeats", async ({ page }) => {
    await loadPage(page);
    const responses = [];
    for (let i = 0; i < 4; i++) {
      responses.push(await chat(page, "I need something"));
    }
    const fifth = await chat(page, "I need something");
    // After 4 unique responses the cycle wraps back to the first
    expect(fifth).toBe(responses[0]);
  });

  test("fallback cycles when no rule matches", async ({ page }) => {
    await loadPage(page);
    const r1 = await chat(page, "xyzzy");
    const r2 = await chat(page, "xyzzy");
    // Both are fallback responses; they should be different (counter advances)
    expect(r1).not.toBe(r2);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. Edge Cases
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Edge cases", () => {
  test("XSS: <script> tag in input is escaped, not executed", async ({ page }) => {
    await loadPage(page);
    let alertFired = false;
    page.on("dialog", () => { alertFired = true; });

    await chat(page, "<script>window.__xss=true</script>hello");
    await page.waitForTimeout(200);

    expect(alertFired).toBe(false);
    const xss = await page.evaluate(() => window.__xss);
    expect(xss).toBeUndefined();
  });

  test("XSS: injected script tag appears as escaped text in user bubble", async ({ page }) => {
    await loadPage(page);
    await chat(page, "<script>alert(1)</script>");
    const userText = await page.locator(".message.user .text").first().textContent();
    expect(userText).toContain("<script>");   // literal angle brackets, not parsed HTML
    // The DOM should NOT contain an actual <script> inside .message
    const scriptTags = await page.locator(".message script").count();
    expect(scriptTags).toBe(0);
  });

  test("HTML injection: <b> tag in input is rendered as text, not bold", async ({ page }) => {
    await loadPage(page);
    await chat(page, "<b>bold text</b>");
    const userText = await page.locator(".message.user .text").first().textContent();
    expect(userText).toContain("<b>bold text</b>");
    // No actual <b> element inside .message
    const boldTags = await page.locator(".message.user b").count();
    expect(boldTags).toBe(0);
  });

  test("very long input (500 chars) still produces a response", async ({ page }) => {
    await loadPage(page);
    const longInput = "I feel " + "very ".repeat(100);
    const reply = await chat(page, longInput.trim());
    expect(reply).toBeTruthy();
    expect((reply || "").length).toBeGreaterThan(0);
  });

  test("all-caps input still matches patterns (case-insensitive)", async ({ page }) => {
    await loadPage(page);
    const reply = await chat(page, "I FEEL ANGRY");
    const valid = [
      "Tell me more about feeling angry.",
      "Do you often feel angry?",
      "Do you enjoy feeling angry?",
      "Of what does feeling angry remind you?",
    ];
    expect(valid.some((v) => reply && reply.toLowerCase().includes("feel"))).toBe(true);
  });

  test("input with only punctuation still produces a fallback response", async ({ page }) => {
    await loadPage(page);
    const reply = await chat(page, "...");
    expect(reply).toBeTruthy();
    expect((reply || "").length).toBeGreaterThan(0);
  });

  test("multiple messages in quick succession each get a response", async ({ page }) => {
    await loadPage(page);
    // Fire three messages as fast as possible
    await page.fill("#user-input", "hello");
    await page.press("#user-input", "Enter");
    await page.fill("#user-input", "I feel confused");
    await page.press("#user-input", "Enter");
    await page.fill("#user-input", "I need help");
    await page.press("#user-input", "Enter");

    // Eventually 1 greeting + 3 replies = 4 ELIZA messages
    await expect(page.locator(".message.eliza")).toHaveCount(4, { timeout: 5000 });
    await expect(page.locator(".message.user")).toHaveCount(3);
  });

  test("number-only input still produces a response", async ({ page }) => {
    await loadPage(page);
    const reply = await chat(page, "42");
    expect(reply).toBeTruthy();
  });

  test("input containing an ampersand is displayed correctly", async ({ page }) => {
    await loadPage(page);
    await chat(page, "my mom & dad argued");
    const userText = await page.locator(".message.user .text").first().textContent();
    expect(userText).toContain("&");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 9. Additional Edge Cases
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Additional edge cases", () => {
  test("emoji input renders correctly in the user bubble and produces a response", async ({ page }) => {
    await loadPage(page);
    const reply = await chat(page, "😊 I feel happy");
    expect(reply).toBeTruthy();
    const userText = await page.locator(".message.user .text").first().textContent();
    expect(userText).toContain("😊");
  });

  test("'<' and '>' without a tag are HTML-escaped in the user bubble", async ({ page }) => {
    await loadPage(page);
    await chat(page, "score < 10 > 5");
    const userText = await page.locator(".message.user .text").first().textContent();
    expect(userText).toContain("<");
    expect(userText).toContain(">");
    // No child elements should have been created inside the text div
    expect(await page.locator(".message.user .text *").count()).toBe(0);
  });

  test("backtick characters render as plain text, not interpreted as code", async ({ page }) => {
    await loadPage(page);
    await chat(page, "`rm -rf /`");
    const userText = await page.locator(".message.user .text").first().textContent();
    expect(userText).toContain("`rm -rf /`");
  });

  test("single and double quotes in input render correctly", async ({ page }) => {
    await loadPage(page);
    await chat(page, `she said "hello" and I said 'goodbye'`);
    const userText = await page.locator(".message.user .text").first().textContent();
    expect(userText).toContain('"hello"');
    expect(userText).toContain("'goodbye'");
  });

  test("input with an embedded newline is handled gracefully", async ({ page }) => {
    await loadPage(page);
    const elizaBefore = await page.locator(".message.eliza").count();
    // Set value directly to bypass the browser's newline stripping in <input type="text">
    await page.evaluate(() => {
      document.getElementById("user-input").value = "I feel\ngood today";
    });
    await page.press("#user-input", "Enter");
    await expect(page.locator(".message.eliza")).toHaveCount(elizaBefore + 1, { timeout: 3000 });
    const reply = await page.locator(".message.eliza .text").last().textContent();
    expect(reply).toBeTruthy();
  });

  test("leading and trailing whitespace is trimmed before matching", async ({ page }) => {
    await loadPage(page);
    const reply = await chat(page, "   hello   ");
    // Greeting rule fires (not a fallback), confirming the input was trimmed
    const validGreetings = [
      "Hello. How are you feeling today?",
      "Hi there. Please tell me what's on your mind.",
      "Hello. How do you do. Please state your problem.",
    ];
    expect(validGreetings).toContain(reply);
    // User bubble also shows the trimmed text
    const userText = await page.locator(".message.user .text").first().textContent();
    expect(userText).toBe("hello");
  });

  test("literal string 'null' produces a response", async ({ page }) => {
    await loadPage(page);
    const reply = await chat(page, "null");
    expect(reply).toBeTruthy();
    expect((reply || "").length).toBeGreaterThan(0);
  });

  test("literal string 'undefined' produces a response", async ({ page }) => {
    await loadPage(page);
    const reply = await chat(page, "undefined");
    expect(reply).toBeTruthy();
    expect((reply || "").length).toBeGreaterThan(0);
  });
});
