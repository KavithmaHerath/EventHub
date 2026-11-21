
/* =========================================================
   EVENTHUB - NOTIFICATIONS & EVENT REMINDERS
   Demo storage: localStorage
   ========================================================= */

(() => {
    "use strict";

    const REMINDERS_STORAGE_KEY = "eventhub_demo_reminders";

    function getSession() {
        try {
            return JSON.parse(
                sessionStorage.getItem("eventhub_demo_session")
            );
        } catch {
            return null;
        }
    }

    function getReminders() {
        try {
            const reminders = JSON.parse(
                localStorage.getItem(REMINDERS_STORAGE_KEY)
            );

            return Array.isArray(reminders) ? reminders : [];
        } catch {
            return [];
        }
    }

    function saveReminders(reminders) {
        localStorage.setItem(
            REMINDERS_STORAGE_KEY,
            JSON.stringify(reminders)
        );
    }

    function getCurrentUserEmail() {
        const session = getSession();
        return session?.email?.toLowerCase() || null;
    }

    function getEventById(eventId) {
        const events = window.EVENTHUB_EVENTS || [];

        return events.find(
            event => String(event.id) === String(eventId)
        );
    }

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, character => {
            const entities = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            };

            return entities[character];
        });
    }

    function parseEventDate(event) {
        if (!event?.date) return null;

        const date = new Date(event.date);

        if (Number.isNaN(date.getTime())) {
            return null;
        }

        const timeText = String(event.time || "").trim();

        const timeMatch = timeText.match(
            /^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i
        );

        if (timeMatch) {
            let hours = Number(timeMatch[1]);
            const minutes = Number(timeMatch[2]);
            const period = timeMatch[3]?.toUpperCase();

            if (period === "PM" && hours < 12) hours += 12;
            if (period === "AM" && hours === 12) hours = 0;

            date.setHours(hours, minutes, 0, 0);
        }

        return date;
    }

    function formatDate(date) {
        return new Intl.DateTimeFormat("en", {
            dateStyle: "medium",
            timeStyle: "short"
        }).format(date);
    }

    function getUserReminders() {
        const email = getCurrentUserEmail();

        if (!email) return [];

        return getReminders()
            .filter(reminder =>
                reminder.userEmail?.toLowerCase() === email
            )
            .sort((a, b) => a.remindAt - b.remindAt);
    }

    function getReminderForEvent(eventId) {
        const email = getCurrentUserEmail();

        if (!email) return null;

        return getReminders().find(reminder =>
            reminder.userEmail?.toLowerCase() === email &&
            String(reminder.eventId) === String(eventId)
        ) || null;
    }

    function showToast(message) {
        let toast = document.getElementById("eventhubReminderToast");

        if (!toast) {
            toast = document.createElement("div");
            toast.id = "eventhubReminderToast";
            toast.className = "eventhub-reminder-toast";
            toast.setAttribute("role", "status");
            toast.setAttribute("aria-live", "polite");
            document.body.appendChild(toast);
        }

        toast.textContent = message;
        toast.classList.add("is-visible");

        window.clearTimeout(toast.hideTimer);

        toast.hideTimer = window.setTimeout(() => {
            toast.classList.remove("is-visible");
        }, 4500);
    }

    async function requestNotificationPermission() {
        if (!("Notification" in window)) {
            return "unsupported";
        }

        if (Notification.permission === "default") {
            try {
                return await Notification.requestPermission();
            } catch {
                return "denied";
            }
        }

        return Notification.permission;
    }

    async function addReminder(eventId, leadMinutes) {
        const email = getCurrentUserEmail();

        if (!email) {
            window.location.href = "auth.html";
            return false;
        }

        const event = getEventById(eventId);

        if (!event) {
            showToast("We couldn't find this event.");
            return false;
        }

        const eventStart = parseEventDate(event);

        if (!eventStart || eventStart.getTime() <= Date.now()) {
            showToast("Reminders are available for upcoming events.");
            return false;
        }

        const remindAt = eventStart.getTime() -
            (Number(leadMinutes) * 60 * 1000);

        if (remindAt <= Date.now()) {
            showToast("That reminder time has already passed. Choose a later reminder.");
            return false;
        }

        const permission = await requestNotificationPermission();

        const reminders = getReminders();

        const existingIndex = reminders.findIndex(reminder =>
            reminder.userEmail?.toLowerCase() === email &&
            String(reminder.eventId) === String(eventId)
        );

        const reminder = {
            id: existingIndex >= 0
                ? reminders[existingIndex].id
                : `reminder-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            userEmail: email,
            eventId: String(eventId),
            leadMinutes: Number(leadMinutes),
            eventStart: eventStart.getTime(),
            remindAt,
            createdAt: new Date().toISOString(),
            notifiedAt: null
        };

        if (existingIndex >= 0) {
            reminders[existingIndex] = reminder;
        } else {
            reminders.push(reminder);
        }

        saveReminders(reminders);

        if (permission === "granted") {
            showToast("Reminder saved. Browser notifications are enabled.");
        } else if (permission === "unsupported") {
            showToast("Reminder saved. Browser notifications aren't supported here.");
        } else {
            showToast("Reminder saved. You can view it on your Reminders page.");
        }

        renderEventReminderControl(eventId);
        renderRemindersPage();

        return true;
    }

    function removeReminder(reminderId) {
        const email = getCurrentUserEmail();

        if (!email) return;

        const updated = getReminders().filter(reminder =>
            !(
                reminder.id === reminderId &&
                reminder.userEmail?.toLowerCase() === email
            )
        );

        saveReminders(updated);

        showToast("Reminder removed.");
        renderRemindersPage();

        const eventId = new URLSearchParams(
            window.location.search
        ).get("id");

        if (eventId) {
            renderEventReminderControl(eventId);
        }
    }

    function renderEventReminderControl(eventId) {
        const actions = document.querySelector(".event-details-actions");

        if (!actions) return;

        let container = document.getElementById("eventReminderControls");

        if (!container) {
            container = document.createElement("div");
            container.id = "eventReminderControls";
            container.className = "event-reminder-controls";
            actions.appendChild(container);
        }

        const email = getCurrentUserEmail();

        if (!email) {
            container.innerHTML = `
                <div class="event-reminder-panel">
                    <div>
                        <h3>Get an event reminder</h3>
                        <p>Sign in to save a reminder for this event.</p>
                    </div>
                    <a class="event-reminder-link" href="auth.html">
                        Sign in
                    </a>
                </div>
            `;
            return;
        }

        const event = getEventById(eventId);
        const eventStart = parseEventDate(event);

        if (!event || !eventStart || eventStart.getTime() <= Date.now()) {
            container.innerHTML = `
                <div class="event-reminder-panel">
                    <div>
                        <h3>Event reminders</h3>
                        <p>This event is no longer available for reminders.</p>
                    </div>
                </div>
            `;
            return;
        }

        const existing = getReminderForEvent(eventId);

        if (existing) {
            const leadLabel = existing.leadMinutes === 1440
                ? "1 day before"
                : existing.leadMinutes === 60
                    ? "1 hour before"
                    : "15 minutes before";

            container.innerHTML = `
                <div class="event-reminder-panel">
                    <div>
                        <span class="event-reminder-eyebrow">REMINDER SET</span>
                        <h3>We'll remind you</h3>
                        <p>${escapeHTML(leadLabel)} this event starts.</p>
                    </div>
                    <button
                        type="button"
                        class="event-reminder-secondary"
                        id="removeEventReminderButton"
                    >
                        Remove reminder
                    </button>
                </div>
                <p class="event-reminder-note">
                    Reminder time: ${escapeHTML(formatDate(new Date(existing.remindAt)))}
                </p>
            `;

            document.getElementById("removeEventReminderButton")
                ?.addEventListener("click", () => {
                    removeReminder(existing.id);
                });

            return;
        }

        container.innerHTML = `
            <div class="event-reminder-panel">
                <div>
                    <span class="event-reminder-eyebrow">DON'T MISS OUT</span>
                    <h3>Set an event reminder</h3>
                    <p>Choose when you'd like us to remind you.</p>
                </div>

                <div class="event-reminder-form">
                    <label for="reminderLeadTime">Remind me</label>
                    <select id="reminderLeadTime">
                        <option value="1440">1 day before</option>
                        <option value="60" selected>1 hour before</option>
                        <option value="15">15 minutes before</option>
                    </select>

                    <button
                        type="button"
                        class="event-reminder-primary"
                        id="setEventReminderButton"
                    >
                        Set reminder
                    </button>
                </div>
            </div>
            <p class="event-reminder-note">
                Browser permission may be requested to show notifications.
            </p>
        `;

        document.getElementById("setEventReminderButton")
            ?.addEventListener("click", () => {
                const leadMinutes = document.getElementById("reminderLeadTime").value;
                addReminder(eventId, leadMinutes);
            });
    }

    function renderRemindersPage() {
        const container = document.getElementById("remindersPageContent");

        if (!container) return;

        const email = getCurrentUserEmail();

        if (!email) {
            container.innerHTML = `
                <div class="reminders-empty-state">
                    <h2>Sign in to view your reminders</h2>
                    <p>Your saved event reminders are linked to your account on this browser.</p>
                    <a href="auth.html" class="event-reminder-primary">
                        Sign in
                    </a>
                </div>
            `;
            return;
        }

        const reminders = getUserReminders();

        const upcomingReminders = reminders.filter(reminder =>
            reminder.eventStart > Date.now()
        );

        if (upcomingReminders.length === 0) {
            container.innerHTML = `
                <div class="reminders-empty-state">
                    <span class="reminders-empty-icon" aria-hidden="true">◷</span>
                    <h2>No upcoming reminders</h2>
                    <p>Open an event you're interested in and set a reminder so you don't miss it.</p>
                    <a href="index.html#discover" class="event-reminder-primary">
                        Discover events
                    </a>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="reminders-list">
                ${upcomingReminders.map(reminder => {
                    const event = getEventById(reminder.eventId);

                    if (!event) return "";

                    const leadLabel = reminder.leadMinutes === 1440
                        ? "1 day before"
                        : reminder.leadMinutes === 60
                            ? "1 hour before"
                            : "15 minutes before";

                    return `
                        <article class="reminder-card">
                            <div class="reminder-card-content">
                                <span class="event-reminder-eyebrow">UPCOMING EVENT</span>
                                <h2>${escapeHTML(event.title)}</h2>
                                <p class="reminder-event-location">
                                    ${escapeHTML(event.venue || "")}
                                    ${event.city ? ` · ${escapeHTML(event.city)}` : ""}
                                </p>
                                <div class="reminder-card-meta">
                                    <span>
                                        <strong>Event:</strong>
                                        ${escapeHTML(formatDate(new Date(reminder.eventStart)))}
                                    </span>
                                    <span>
                                        <strong>Reminder:</strong>
                                        ${escapeHTML(leadLabel)}
                                    </span>
                                </div>
                            </div>

                            <div class="reminder-card-actions">
                                <a href="event-details.html?id=${encodeURIComponent(event.id)}">
                                    View event
                                </a>
                                <button
                                    type="button"
                                    class="event-reminder-secondary"
                                    data-remove-reminder="${escapeHTML(reminder.id)}"
                                >
                                    Remove
                                </button>
                            </div>
                        </article>
                    `;
                }).join("")}
            </div>
        `;

        container.querySelectorAll("[data-remove-reminder]")
            .forEach(button => {
                button.addEventListener("click", () => {
                    removeReminder(button.dataset.removeReminder);
                });
            });
    }

    function checkDueReminders() {
        const reminders = getReminders();
        const now = Date.now();
        let changed = false;

        reminders.forEach(reminder => {
            if (
                reminder.notifiedAt ||
                reminder.remindAt > now ||
                reminder.eventStart <= now
            ) {
                return;
            }

            const email = getCurrentUserEmail();

            if (
                !email ||
                reminder.userEmail?.toLowerCase() !== email
            ) {
                return;
            }

            const event = getEventById(reminder.eventId);

            if (!event) return;

            const message = `${event.title} starts soon.`;

            showToast(message);

            if (
                "Notification" in window &&
                Notification.permission === "granted"
            ) {
                try {
                    new Notification("EventHub reminder", {
                        body: message,
                        tag: `eventhub-${reminder.id}`
                    });
                } catch {
                    // In-app reminder remains available if browser notification fails.
                }
            }

            reminder.notifiedAt = new Date().toISOString();
            changed = true;
        });

        if (changed) {
            saveReminders(reminders);
            renderRemindersPage();
        }
    }

    function initialize() {
        const eventId = new URLSearchParams(
            window.location.search
        ).get("id");

        if (eventId && document.querySelector(".event-details-actions")) {
            renderEventReminderControl(eventId);
        }

        renderRemindersPage();
        checkDueReminders();

        window.setInterval(checkDueReminders, 30000);

        window.addEventListener("storage", event => {
            if (event.key === REMINDERS_STORAGE_KEY) {
                renderRemindersPage();

                if (eventId) {
                    renderEventReminderControl(eventId);
                }
            }
        });
    }

    window.EventHubNotifications = {
        getUserReminders,
        getReminderForEvent,
        addReminder,
        removeReminder,
        renderRemindersPage
    };

    document.addEventListener("DOMContentLoaded", initialize);
})();
