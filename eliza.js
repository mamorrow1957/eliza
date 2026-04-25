const SYNONYMS = {
  "dont":       "don't",
  "cant":       "can't",
  "wont":       "won't",
  "recollect":  "remember",
  "recall":     "remember",
  "dreamt":     "dreamed",
  "dreams":     "dream",
  "maybe":      "perhaps",
  "certainly":  "yes",
  "machine":    "computer",
  "machines":   "computer",
  "computers":  "computer",
  "were":       "was",
  "you're":     "you are",
  "i'm":        "i am",
  "same":       "alike",
  "identical":  "alike",
  "equivalent": "alike",
};

const REFLECTIONS = {
  "am":     "are",
  "was":    "were",
  "i":      "you",
  "i'd":    "you would",
  "i've":   "you have",
  "i'll":   "you will",
  "my":     "your",
  "me":     "you",
  "myself": "yourself",
  "you":    "I",
  "your":   "my",
  "yours":  "mine",
  "you've": "I have",
  "you'll": "I will",
  "you'd":  "I would",
  "you're": "I am",
  "are":    "am",
  "were":   "was",
};

function reflect(phrase) {
  return phrase.split(/\s+/).map(w => {
    const lw = w.toLowerCase();
    return REFLECTIONS[lw] !== undefined ? REFLECTIONS[lw] : w;
  }).join(" ");
}

const RULES = [
  {
    weight: 100,
    pattern: /\b(hello|hi|hey|greetings)\b/i,
    responses: [
      "Hello. How are you feeling today?",
      "Hi there. Please tell me what's on your mind.",
      "Hello. How do you do. Please state your problem.",
    ]
  },
  {
    weight: 95,
    pattern: /i need (.*)/i,
    responses: [
      "Why do you need $1?",
      "Would it really help you if you got $1?",
      "Are you sure you need $1?",
      "What would it mean to you if you got $1?",
    ]
  },
  {
    weight: 95,
    pattern: /why don'?t you ([^?]*)\??/i,
    responses: [
      "Do you really think I don't $1?",
      "Perhaps eventually I will $1.",
      "Do you really want me to $1?",
    ]
  },
  {
    weight: 95,
    pattern: /why can'?t i ([^?]*)\??/i,
    responses: [
      "Do you think you should be able to $1?",
      "If you could $1, what would you do?",
      "I don't know — why can't you $1?",
      "Have you really tried?",
    ]
  },
  {
    weight: 90,
    pattern: /i can'?t (.*)/i,
    responses: [
      "How do you know you can't $1?",
      "Have you tried?",
      "Perhaps you could $1 if you tried.",
      "What would it take for you to $1?",
    ]
  },
  {
    weight: 90,
    pattern: /i am (.*)/i,
    responses: [
      "Did you come to me because you are $1?",
      "How long have you been $1?",
      "How do you feel about being $1?",
      "Do you believe it is normal to be $1?",
    ]
  },
  {
    weight: 90,
    pattern: /i'?m (.*)/i,
    responses: [
      "How does being $1 make you feel?",
      "Do you enjoy being $1?",
      "Why do you tell me you're $1?",
      "Why do you think you're $1?",
    ]
  },
  {
    weight: 85,
    pattern: /are you ([^?]*)\??/i,
    responses: [
      "Why does it matter to you whether I am $1?",
      "Would you prefer it if I were not $1?",
      "Perhaps you believe I am $1.",
      "I may be $1 — what does that mean to you?",
    ]
  },
  {
    weight: 85,
    pattern: /what ([^?]*)\??/i,
    responses: [
      "Why do you ask?",
      "How would an answer to that help you?",
      "What do you think?",
      "What is it you really want to know?",
    ]
  },
  {
    weight: 80,
    pattern: /how ([^?]*)\??/i,
    responses: [
      "How do you suppose?",
      "Perhaps you can answer your own question.",
      "What is it you're really asking?",
    ]
  },
  {
    weight: 80,
    pattern: /because (.*)/i,
    responses: [
      "Is that the real reason?",
      "Don't any other reasons come to mind?",
      "Does that reason seem to explain anything else?",
      "What other reasons might there be?",
    ]
  },
  {
    weight: 80,
    pattern: /(.*) sorry (.*)/i,
    responses: [
      "Please don't apologize.",
      "Apologies are not necessary.",
      "What feelings do you have when you apologize?",
    ]
  },
  {
    weight: 80,
    pattern: /i think (.*)/i,
    responses: [
      "Do you really think $1?",
      "But you're not sure $1?",
      "Do you doubt $1?",
      "What makes you think $1?",
    ]
  },
  {
    weight: 80,
    pattern: /i feel (.*)/i,
    responses: [
      "Tell me more about feeling $1.",
      "Do you often feel $1?",
      "Do you enjoy feeling $1?",
      "Of what does feeling $1 remind you?",
    ]
  },
  {
    weight: 80,
    pattern: /i felt (.*)/i,
    responses: [
      "Tell me more about feeling $1.",
      "What other feelings did you have?",
    ]
  },
  {
    weight: 75,
    pattern: /\b(mother|mom|mum)\b/i,
    responses: [
      "Tell me more about your mother.",
      "What was your relationship with your mother like?",
      "How do you feel about your mother?",
      "How does this relate to your feelings today?",
      "Good family relations are important.",
    ]
  },
  {
    weight: 75,
    pattern: /\b(father|dad)\b/i,
    responses: [
      "Tell me more about your father.",
      "How did your father make you feel?",
      "How do you feel about your father?",
      "Does your relationship with your father relate to your feelings today?",
      "You seem to dwell on your family.",
    ]
  },
  {
    weight: 75,
    pattern: /\b(sister|brother|sibling|family)\b/i,
    responses: [
      "Tell me more about your family.",
      "Are you close with your family?",
      "How does your family relate to what you feel?",
    ]
  },
  {
    weight: 75,
    pattern: /\b(child|children|son|daughter|baby)\b/i,
    responses: [
      "Did you have a happy childhood?",
      "What is your earliest childhood memory?",
      "Do you remember being very young?",
      "What do children mean to you?",
    ]
  },
  {
    weight: 70,
    pattern: /i want (.*)/i,
    responses: [
      "What would it mean to you if you got $1?",
      "Why do you want $1?",
      "Suppose you got $1 — then what?",
      "What if you never got $1?",
      "What would getting $1 mean to you?",
    ]
  },
  {
    weight: 70,
    pattern: /i wish (.*)/i,
    responses: [
      "Why do you wish $1?",
      "What would it mean if $1?",
      "Suppose $1 — then what would happen?",
    ]
  },
  {
    weight: 70,
    pattern: /\b(dream|dreamed|dreamt|dreaming)\b(.*)/i,
    responses: [
      "What does that dream suggest to you?",
      "Do you dream often?",
      "What persons appear in your dreams?",
      "Don't you believe that dream has something to do with your problem?",
    ]
  },
  {
    weight: 70,
    pattern: /\b(computer|machine|robot|ai|bot)\b/i,
    responses: [
      "Do computers worry you?",
      "What do you think about machines?",
      "Why do you bring up computers?",
      "What do computers mean to you?",
      "Do you feel threatened by computers?",
    ]
  },
  {
    weight: 65,
    pattern: /it is (.*)/i,
    responses: [
      "You seem quite certain.",
      "If I told you that it probably isn't $1, what would you feel?",
      "What makes you think it is $1?",
    ]
  },
  {
    weight: 65,
    pattern: /is it (.*)/i,
    responses: [
      "Do you think it is $1?",
      "It is possible that it $1.",
      "If it were $1, what would you do?",
      "What do you think?",
    ]
  },
  {
    weight: 65,
    pattern: /you (.*)/i,
    responses: [
      "We were talking about you — not me.",
      "Ah — me.",
      "Why do you think I $1?",
      "You're not really talking about me, are you?",
    ]
  },
  {
    weight: 60,
    pattern: /yes\b/i,
    responses: [
      "You seem quite sure.",
      "OK, but can you elaborate a bit?",
      "I see.",
      "I understand.",
    ]
  },
  {
    weight: 60,
    pattern: /no\b/i,
    responses: [
      "Are you saying 'No' just to be negative?",
      "You are being a bit negative.",
      "Why not?",
      "Why 'No'?",
    ]
  },
  {
    weight: 55,
    pattern: /\b(always|everybody|everyone|nobody|never|all)\b/i,
    responses: [
      "Can you think of a specific example?",
      "Surely not always.",
      "Really — in all cases?",
      "Can you be more specific?",
    ]
  },
  {
    weight: 55,
    pattern: /alike\b(.*)/i,
    responses: [
      "In what way?",
      "What resemblance do you see?",
      "What does the similarity suggest to you?",
      "What other connections do you see?",
      "Could there really be a connection?",
    ]
  },
  {
    weight: 55,
    pattern: /\b(remember|recall|recollect)\b(.*)/i,
    responses: [
      "Do you often think about$2?",
      "Does thinking about$2 bring anything else to mind?",
      "What else do you recollect?",
      "Why do you remember$2 just now?",
      "What in the present situation reminds you of$2?",
      "What is the connection between me and$2?",
    ]
  },
  {
    weight: 55,
    pattern: /\b(forget|forgot|forgotten)\b(.*)/i,
    responses: [
      "Can you think of why you might want to forget$2?",
      "Why can't you remember$2?",
      "How long have you been unable to remember$2?",
      "What does forgetting$2 mean to you?",
    ]
  },
  {
    weight: 50,
    pattern: /if (.*)/i,
    responses: [
      "Do you really think it's likely that $1?",
      "Do you wish that $1?",
      "What do you think about $1?",
      "Really — if $1?",
    ]
  },
  {
    weight: 50,
    pattern: /perhaps (.*)/i,
    responses: [
      "You don't seem very certain.",
      "Why the uncertainty?",
      "Can't you be more positive?",
      "You aren't sure $1?",
      "Don't you know $1?",
    ]
  },
  {
    weight: 45,
    pattern: /my (.*)/i,
    responses: [
      "Why do you say your $1?",
      "When your $1, how do you feel?",
      "Tell me more about your $1.",
      "Does your $1 have anything to do with why you are here?",
    ]
  },
  {
    weight: 40,
    pattern: /(.*)\?$/i,
    responses: [
      "Why do you ask that?",
      "Please consider whether you can answer your own question.",
      "Perhaps the answer lies within yourself?",
      "Why don't you tell me?",
    ]
  },
];

const FALLBACKS = [
  "I'm not sure I understand you fully.",
  "Please go on.",
  "What does that suggest to you?",
  "Do you feel strongly about discussing such things?",
  "That is interesting. Please continue.",
  "Tell me more about that.",
  "Can you elaborate on that?",
  "I see.",
  "Very interesting.",
  "I'm not sure I follow. Could you say more?",
  "What does that mean to you?",
];

const ruleCounters = new Map();

function elizaRespond(input) {
  let text = input.trim().toLowerCase();
  text = text.replace(/\b\w+(?:'\w+)?\b/g, w => SYNONYMS[w] || w);

  const sorted = [...RULES].sort((a, b) => b.weight - a.weight);

  for (const rule of sorted) {
    const match = rule.pattern.exec(text);
    if (match) {
      const idx = ruleCounters.get(rule) || 0;
      ruleCounters.set(rule, (idx + 1) % rule.responses.length);
      let response = rule.responses[idx];

      response = response.replace(/\$(\d+)/g, (_, n) => {
        const cap = match[parseInt(n)];
        return cap ? reflect(cap.trim()) : "";
      });

      response = response.replace(/\s{2,}/g, " ").trim();
      response = response.charAt(0).toUpperCase() + response.slice(1);

      return response;
    }
  }

  const fi = ruleCounters.get("fallback") || 0;
  ruleCounters.set("fallback", (fi + 1) % FALLBACKS.length);
  return FALLBACKS[fi];
}

const chatWindow = document.getElementById("chat-window");
const userInput  = document.getElementById("user-input");
const sendBtn    = document.getElementById("send-btn");

function addMessage(speaker, text, cls) {
  const div = document.createElement("div");
  div.className = `message ${cls}`;
  div.innerHTML = `<span class="speaker">${speaker}</span><div class="text">${escapeHtml(text)}</div>`;
  chatWindow.appendChild(div);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function escapeHtml(s) {
  return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

function handleSend() {
  const text = userInput.value.trim();
  if (!text) return;

  addMessage("YOU", text, "user");
  userInput.value = "";

  setTimeout(() => {
    const reply = elizaRespond(text);
    addMessage("ELIZA", reply, "eliza");
  }, 350 + Math.random() * 300);
}

sendBtn.addEventListener("click", handleSend);
userInput.addEventListener("keydown", e => {
  if (e.key === "Enter") handleSend();
});

window.addEventListener("load", () => {
  setTimeout(() => {
    addMessage("ELIZA",
      "How do you do. Please tell me your problem.",
      "eliza");
    userInput.focus();
  }, 400);
});
