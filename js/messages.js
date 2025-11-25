const MSG_KEY = "schoolcms-messages";

function getMessages() {
  try {
    const raw = localStorage.getItem(MSG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveMessages(list) {
  localStorage.setItem(MSG_KEY, JSON.stringify(list));
}

// Seed demo messages once
(function seedMessages() {
  const existing = getMessages();
  if (existing.length) return;

  const now = new Date();
  const iso = (offsetMin) =>
    new Date(now.getTime() - offsetMin * 60000).toISOString();

  const demo = [
    {
      id: crypto.randomUUID(),
      type: "announcement",
      audience: "All",
      title: "PTM Reminder",
      body:
        "Parent–Teacher Meeting scheduled for Saturday at 9:00 AM. Kindly be on time.",
      createdAt: iso(30),
      read: false,
    },
    {
      id: crypto.randomUUID(),
      type: "announcement",
      audience: "Students",
      title: "Unit Test Schedule",
      body:
        "Unit tests will start from next Monday. Timetable will be shared via class teachers.",
      createdAt: iso(240),
      read: true,
    },
    {
      id: crypto.randomUUID(),
      type: "system",
      audience: "Admin",
      title: "Backup completed",
      body: "Last night's data backup was successful.",
      createdAt: iso(1440),
      read: true,
    },
  ];

  saveMessages(demo);
})();

// Elements
const messagesListEl = document.getElementById("messagesList");
const filterTypeEl = document.getElementById("filterType");
const filterAudienceEl = document.getElementById("filterAudience");
const searchMessagesEl = document.getElementById("searchMessages");
const detailEl = document.getElementById("messageDetail");

const composeForm = document.getElementById("composeForm");
const composeAudienceEl = document.getElementById("composeAudience");
const composeTypeEl = document.getElementById("composeType");
const composeTitleEl = document.getElementById("composeTitle");
const composeBodyEl = document.getElementById("composeBody");

let selectedMessageId = null;

// Render inbox
function renderMessages() {
  if (!messagesListEl) return;
  const all = getMessages();

  const typeFilter = filterTypeEl.value;
  const audFilter = filterAudienceEl.value;
  const q = (searchMessagesEl.value || "").toLowerCase();

  const filtered = all
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .filter((m) => {
      if (typeFilter && m.type !== typeFilter) return false;
      if (audFilter && m.audience !== audFilter) return false;
      if (q) {
        const text = (m.title + " " + m.body).toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });

  if (!filtered.length) {
    messagesListEl.innerHTML =
      '<p class="text-muted" style="padding:8px;">No messages found.</p>';
    if (detailEl) {
      detailEl.innerHTML =
        '<div class="message-detail-placeholder"><p class="text-muted">No messages match your filters.</p></div>';
    }
    return;
  }

  messagesListEl.innerHTML = filtered
    .map((m) => {
      const isUnread = !m.read;
      const date = new Date(m.createdAt);
      const dateStr = date.toLocaleString(undefined, {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });

      return `
        <div class="message-item ${
          isUnread ? "message-item--unread" : ""
        }" data-id="${m.id}">
          <div class="message-item__title">
            ${m.title}
            <span class="message-badge">${m.type}</span>
          </div>
          <div class="message-item__meta">
            ${m.audience} · ${dateStr} ${isUnread ? "· Unread" : ""}
          </div>
          <div class="message-item__preview">
            ${m.body}
          </div>
        </div>
      `;
    })
    .join("");

  // If there is a selected ID, and it's still in the list, re-render its detail
  if (selectedMessageId) {
    const stillExists = filtered.some((m) => m.id === selectedMessageId);
    if (stillExists) {
      showMessageDetail(filtered.find((m) => m.id === selectedMessageId));
    } else {
      selectedMessageId = null;
      if (detailEl) {
        detailEl.innerHTML =
          '<div class="message-detail-placeholder"><p class="text-muted">Select a message on the left to view details.</p></div>';
      }
    }
  }
}

// Detail view
function showMessageDetail(msg) {
  if (!detailEl || !msg) return;

  selectedMessageId = msg.id;

  const date = new Date(msg.createdAt);
  const dateStr = date.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  detailEl.innerHTML = `
    <div>
      <h2 class="message-detail-title">${msg.title}</h2>
      <div class="message-detail-meta">
        Type: ${msg.type} · Audience: ${msg.audience} · ${dateStr}
      </div>
      <div class="message-detail-body">${msg.body}</div>
    </div>
  `;
}

// Click handler for list
if (messagesListEl) {
  messagesListEl.addEventListener("click", (e) => {
    const item = e.target.closest(".message-item");
    if (!item) return;
    const id = item.getAttribute("data-id");
    let all = getMessages();
    const msg = all.find((m) => m.id === id);
    if (!msg) return;

    // Mark as read
    msg.read = true;
    saveMessages(all);

    showMessageDetail(msg);
    renderMessages();
  });
}

// Filters + search
[filterTypeEl, filterAudienceEl, searchMessagesEl].forEach((el) => {
  if (!el) return;
  el.addEventListener("input", renderMessages);
  el.addEventListener("change", renderMessages);
});

// Compose
if (composeForm) {
  composeForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const type = composeTypeEl.value;
    const audience = composeAudienceEl.value;
    const title = composeTitleEl.value.trim();
    const body = composeBodyEl.value.trim();

    if (!title || !body) return;

    const newMsg = {
      id: crypto.randomUUID(),
      type,
      audience,
      title,
      body,
      createdAt: new Date().toISOString(),
      read: false,
    };

    const all = getMessages();
    all.push(newMsg);
    saveMessages(all);

    // Clear form
    composeForm.reset();
    composeAudienceEl.value = "All";
    composeTypeEl.value = "announcement";

    renderMessages();
    showMessageDetail(newMsg);
  });
}

// Initial render
renderMessages();
