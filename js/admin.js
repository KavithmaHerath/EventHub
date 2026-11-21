
/* =====================================================
   EVENTHUB - ADMIN DASHBOARD
   Manager approvals + complete event moderation

   Features:
   1. Admin-only dashboard access
   2. View manager applications
   3. Approve or reject managers
   4. View all events
   5. Approve or reject events
   6. Edit events
   7. Delete events

   IMPORTANT:
   This is a frontend-only demonstration.
   Data is stored in browser localStorage.
   It is NOT secure production authentication.
   ===================================================== */

(() => {
    "use strict";

    /* =================================================
       1. STORAGE KEYS
       ================================================= */

    const USERS_KEY = "eventhub_demo_users";
    const EVENTS_KEY = "eventhub_demo_events";
    const OVERRIDES_KEY = "eventhub_admin_event_overrides";
    const DELETED_KEY = "eventhub_admin_deleted_events";

    const $ = id => document.getElementById(id);


    /* =================================================
       2. ADMIN ACCESS CONTROL
       ================================================= */

    const auth = window.EventHubAuth;

    // Stop if the authentication system is unavailable.
    if (!auth) {
        console.error(
            "EventHubAuth is not available. Check that auth.js loads before admin.js."
        );
        return;
    }

    // Only approved administrators can access this page.
    if (!auth.requireRole("admin")) {
        return;
    }

    const session = auth.getSession();

    if (!session) {
        window.location.replace("auth.html");
        return;
    }

    // Display the administrator name.
    const welcomeElement = $("adminWelcome");

    if (welcomeElement) {
        welcomeElement.textContent = "Signed in as " + session.name;
    }


    /* =================================================
       3. GENERAL STORAGE HELPERS
       ================================================= */

    function readArray(key) {
        try {
            const storedValue = localStorage.getItem(key);
            const parsedValue = JSON.parse(storedValue || "[]");

            return Array.isArray(parsedValue) ? parsedValue : [];

        } catch (error) {
            console.error("Storage read error:", key, error);
            return [];
        }
    }


    function writeArray(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;

        } catch (error) {
            console.error("Storage write error:", key, error);
            window.alert(
                "Could not save the changes. Please check your browser storage."
            );
            return false;
        }
    }


    // Prevent HTML injection when displaying stored values.
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


    // Format an event date for display.
    function formatDate(value) {
        if (!value) {
            return "Date not provided";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "Date not provided";
        }

        return new Intl.DateTimeFormat("en", {
            day: "numeric",
            month: "short",
            year: "numeric"
        }).format(date);
    }


    /* =================================================
       4. MANAGER APPLICATION MANAGEMENT
       ================================================= */

    function getManagers() {
        return readArray(USERS_KEY).filter(user =>
            user.role === "manager"
        );
    }


    // Display manager statistics and filters.
    function renderManagers() {
        const root = $("managerDashboardContent");

        if (!root) {
            console.warn("managerDashboardContent was not found.");
            return;
        }

        const managers = getManagers();

        const pending = managers.filter(user =>
            user.status === "pending" || !user.status
        );

        const approved = managers.filter(user =>
            user.status === "approved"
        );

        const rejected = managers.filter(user =>
            user.status === "rejected"
        );

        root.innerHTML = `
            <div class="admin-overview-grid">

                <article class="admin-stat-card">
                    <span>Awaiting approval</span>
                    <strong>${pending.length}</strong>
                </article>

                <article class="admin-stat-card">
                    <span>Approved managers</span>
                    <strong>${approved.length}</strong>
                </article>

                <article class="admin-stat-card">
                    <span>Rejected applications</span>
                    <strong>${rejected.length}</strong>
                </article>

                <article class="admin-stat-card">
                    <span>Total applications</span>
                    <strong>${managers.length}</strong>
                </article>

            </div>

            <div
                class="admin-filter-bar"
                role="group"
                aria-label="Filter manager applications"
            >

                <button
                    type="button"
                    data-manager-filter="pending"
                    class="is-active"
                >
                    Pending (${pending.length})
                </button>

                <button
                    type="button"
                    data-manager-filter="approved"
                >
                    Approved (${approved.length})
                </button>

                <button
                    type="button"
                    data-manager-filter="rejected"
                >
                    Rejected (${rejected.length})
                </button>

                <button
                    type="button"
                    data-manager-filter="all"
                >
                    All (${managers.length})
                </button>

            </div>

            <div
                id="managerApplicationList"
                class="admin-event-list"
            ></div>
        `;

        renderManagerList("pending");

        // Manager filter buttons.
        root.querySelectorAll("[data-manager-filter]").forEach(button => {

            button.addEventListener("click", () => {

                root.querySelectorAll("[data-manager-filter]").forEach(item => {
                    item.classList.remove("is-active");
                });

                button.classList.add("is-active");

                renderManagerList(button.dataset.managerFilter);
            });

        });
    }


    // Display managers according to selected status.
    function renderManagerList(filter) {
        const list = $("managerApplicationList");

        if (!list) {
            return;
        }

        const managers = getManagers();

        const filtered = managers.filter(manager => {
            const status = manager.status || "pending";

            return filter === "all" || status === filter;
        });

        if (filtered.length === 0) {

            list.innerHTML = `
                <div class="admin-empty-state">
                    <h3>No ${escapeHTML(filter)} applications</h3>

                    <p>
                        There are no manager applications
                        in this section right now.
                    </p>
                </div>
            `;

            return;
        }

        list.innerHTML = filtered.map(manager => {

            const status = manager.status || "pending";

            const submittedDate = manager.createdAt
                ? formatDate(manager.createdAt)
                : "Not available";

            return `
                <article class="admin-event-card">

                    <div class="admin-event-card-top">

                        <span class="admin-status status-${escapeHTML(status)}">
                            ${escapeHTML(status)}
                        </span>

                        <span class="admin-event-id">
                            ${escapeHTML(manager.email)}
                        </span>

                    </div>

                    <div class="admin-event-card-content">

                        <h3>${escapeHTML(manager.name)}</h3>

                        <p>Manager account application</p>

                        <p>
                            Submitted: ${escapeHTML(submittedDate)}
                        </p>

                    </div>

                    <div class="admin-event-actions">

                        ${
                            status !== "approved"
                                ? `
                                    <button
                                        type="button"
                                        class="admin-approve-button"
                                        data-manager-action="approved"
                                        data-manager-id="${escapeHTML(manager.id)}"
                                    >
                                        Approve manager
                                    </button>
                                `
                                : ""
                        }

                        ${
                            status !== "rejected"
                                ? `
                                    <button
                                        type="button"
                                        class="admin-reject-button"
                                        data-manager-action="rejected"
                                        data-manager-id="${escapeHTML(manager.id)}"
                                    >
                                        Reject application
                                    </button>
                                `
                                : ""
                        }

                    </div>

                </article>
            `;

        }).join("");


        // Approve and reject buttons.
        list.querySelectorAll("[data-manager-action]").forEach(button => {

            button.addEventListener("click", () => {

                const managerId = button.dataset.managerId;
                const newStatus = button.dataset.managerAction;

                updateManagerStatus(managerId, newStatus);

                renderManagers();
            });

        });
    }


    // Update manager approval status in localStorage.
    function updateManagerStatus(managerId, status) {

        const users = readArray(USERS_KEY);

        const manager = users.find(user =>
            String(user.id) === String(managerId) &&
            user.role === "manager"
        );

        if (!manager) {
            window.alert("Manager account could not be found.");
            return;
        }

        manager.status = status;
        manager.reviewedAt = new Date().toISOString();
        manager.reviewedBy = session.email;

        const saved = writeArray(USERS_KEY, users);

        if (saved) {
            const message = status === "approved"
                ? "Manager application approved successfully."
                : "Manager application rejected.";

            window.alert(message);
        }
    }


    /* =================================================
       5. EVENT MANAGEMENT - GET ALL EVENTS
       ================================================= */

    function getAllEvents() {

        /*
           events.js should provide EVENTHUB_ALL_EVENTS.

           That array contains sample events and manager-created
           events when using the updated events.js.

           Fallback storage is used if that array is unavailable.
        */

        let allEvents = [];

        if (Array.isArray(window.EVENTHUB_ALL_EVENTS)) {

            allEvents = [...window.EVENTHUB_ALL_EVENTS];

        } else if (Array.isArray(window.EVENTHUB_EVENTS)) {

            allEvents = [...window.EVENTHUB_EVENTS];

            const customEvents = readArray(EVENTS_KEY);

            customEvents.forEach(customEvent => {

                const alreadyExists = allEvents.some(event =>
                    String(event.id) === String(customEvent.id)
                );

                if (!alreadyExists) {
                    allEvents.push(customEvent);
                }

            });

        } else {

            allEvents = readArray(EVENTS_KEY);

        }


        // Apply administrator edits.
        const overrides = readArray(OVERRIDES_KEY);

        allEvents = allEvents.map(event => {

            const override = overrides.find(item =>
                String(item.id) === String(event.id)
            );

            return override
                ? { ...event, ...override }
                : event;

        });


        // Remove events deleted by the administrator.
        const deletedIds = readArray(DELETED_KEY).map(String);

        allEvents = allEvents.filter(event =>
            !deletedIds.includes(String(event.id))
        );

        return allEvents;
    }


    /* =================================================
       6. SAVE ADMIN EVENT EDITS
       ================================================= */

    function saveEventOverride(updatedEvent) {

        const overrides = readArray(OVERRIDES_KEY);

        const index = overrides.findIndex(item =>
            String(item.id) === String(updatedEvent.id)
        );

        if (index >= 0) {

            overrides[index] = updatedEvent;

        } else {

            overrides.push(updatedEvent);

        }

        return writeArray(OVERRIDES_KEY, overrides);
    }


    /* =================================================
       7. APPROVE OR REJECT EVENTS
       ================================================= */

    function setEventStatus(eventId, status) {

        const customEvents = readArray(EVENTS_KEY);

        const customIndex = customEvents.findIndex(event =>
            String(event.id) === String(eventId)
        );

        // Manager-created event.
        if (customIndex >= 0) {

            customEvents[customIndex].status = status;

            customEvents[customIndex].moderatedAt =
                new Date().toISOString();

            customEvents[customIndex].moderatedBy =
                session.email;

            writeArray(EVENTS_KEY, customEvents);

        } else {

            // Built-in sample event.
            const event = getAllEvents().find(item =>
                String(item.id) === String(eventId)
            );

            if (!event) {
                window.alert("Event could not be found.");
                return;
            }

            saveEventOverride({
                ...event,
                status: status,
                moderatedAt: new Date().toISOString(),
                moderatedBy: session.email
            });

        }
    }


    /* =================================================
       8. DELETE EVENT
       ================================================= */

    function deleteEvent(eventId) {

        const confirmed = window.confirm(
            "Are you sure you want to delete this event?"
        );

        if (!confirmed) {
            return;
        }

        // Remove the event from manager-created event storage.
        const customEvents = readArray(EVENTS_KEY).filter(event =>
            String(event.id) !== String(eventId)
        );

        writeArray(EVENTS_KEY, customEvents);


        // Record the deleted event ID.
        const deletedIds = readArray(DELETED_KEY).map(String);

        if (!deletedIds.includes(String(eventId))) {

            deletedIds.push(String(eventId));

            writeArray(DELETED_KEY, deletedIds);
        }


        // Remove any administrator override.
        const overrides = readArray(OVERRIDES_KEY).filter(event =>
            String(event.id) !== String(eventId)
        );

        writeArray(OVERRIDES_KEY, overrides);


        // Refresh dashboard.
        renderEvents(activeEventFilter);
    }


    /* =================================================
       9. EDIT EVENT
       ================================================= */

    function editEvent(eventId) {

        const event = getAllEvents().find(item =>
            String(item.id) === String(eventId)
        );

        if (!event) {
            window.alert("Event could not be found.");
            return;
        }


        // Ask for updated event information.
        const title = window.prompt(
            "Event title:",
            event.title || ""
        );

        if (title === null) return;


        const description = window.prompt(
            "Event description:",
            event.description || ""
        );

        if (description === null) return;


        const date = window.prompt(
            "Event date (YYYY-MM-DD):",
            event.date || ""
        );

        if (date === null) return;


        const venue = window.prompt(
            "Venue:",
            event.venue || ""
        );

        if (venue === null) return;


        // Validate required fields.
        if (!title.trim()) {

            window.alert("Event title is required.");
            return;

        }

        if (!date.trim()) {

            window.alert("Event date is required.");
            return;

        }


        // Create updated event object.
        const updatedEvent = {
            ...event,

            title: title.trim(),
            description: description.trim(),
            date: date.trim(),
            venue: venue.trim(),

            updatedAt: new Date().toISOString()
        };


        // Save manager-created events in their original storage.
        const customEvents = readArray(EVENTS_KEY);

        const customIndex = customEvents.findIndex(item =>
            String(item.id) === String(eventId)
        );

        if (customIndex >= 0) {

            customEvents[customIndex] = updatedEvent;

            writeArray(EVENTS_KEY, customEvents);

        } else {

            // Save changes to built-in sample events as overrides.
            saveEventOverride(updatedEvent);

        }

        window.alert("Event updated successfully.");

        renderEvents(activeEventFilter);
    }


    /* =================================================
       10. EVENT DASHBOARD
       ================================================= */

    let activeEventFilter = "pending";


    function renderEvents(filter = "pending") {

        activeEventFilter = filter;

        const root = $("adminDashboardContent");

        if (!root) {
            console.warn("adminDashboardContent was not found.");
            return;
        }

        const events = getAllEvents();


        // Events without a status are built-in approved events.
        function getStatus(event) {
            return event.status || "approved";
        }


        const pending = events.filter(event =>
            getStatus(event) === "pending"
        );

        const approved = events.filter(event =>
            getStatus(event) === "approved"
        );

        const rejected = events.filter(event =>
            getStatus(event) === "rejected"
        );


        const filtered = filter === "all"
            ? events
            : events.filter(event =>
                getStatus(event) === filter
            );


        // Render event dashboard.
        root.innerHTML = `

            <div class="admin-overview-grid">

                <article class="admin-stat-card">
                    <span>Awaiting review</span>
                    <strong>${pending.length}</strong>
                </article>

                <article class="admin-stat-card">
                    <span>Approved</span>
                    <strong>${approved.length}</strong>
                </article>

                <article class="admin-stat-card">
                    <span>Rejected</span>
                    <strong>${rejected.length}</strong>
                </article>

                <article class="admin-stat-card">
                    <span>Total events</span>
                    <strong>${events.length}</strong>
                </article>

            </div>


            <div
                class="admin-filter-bar"
                role="group"
                aria-label="Filter events"
            >

                <button
                    type="button"
                    data-event-filter="pending"
                    class="${filter === "pending" ? "is-active" : ""}"
                >
                    Pending (${pending.length})
                </button>

                <button
                    type="button"
                    data-event-filter="approved"
                    class="${filter === "approved" ? "is-active" : ""}"
                >
                    Approved (${approved.length})
                </button>

                <button
                    type="button"
                    data-event-filter="rejected"
                    class="${filter === "rejected" ? "is-active" : ""}"
                >
                    Rejected (${rejected.length})
                </button>

                <button
                    type="button"
                    data-event-filter="all"
                    class="${filter === "all" ? "is-active" : ""}"
                >
                    All (${events.length})
                </button>

            </div>


            <div class="admin-event-list">

                ${
                    filtered.length > 0

                        ? filtered.map(event => {

                            const status = getStatus(event);

                            const location = [
                                event.venue,
                                event.city,
                                event.country
                            ]
                            .filter(Boolean)
                            .join(", ");


                            return `

                                <article class="admin-event-card">

                                    <div class="admin-event-card-top">

                                        <span class="admin-status status-${escapeHTML(status)}">
                                            ${escapeHTML(status)}
                                        </span>

                                        <span class="admin-event-id">
                                            Event #${escapeHTML(event.id)}
                                        </span>

                                    </div>


                                    <div class="admin-event-card-content">

                                        <h3>
                                            ${escapeHTML(event.title)}
                                        </h3>

                                        <p class="admin-event-description">
                                            ${escapeHTML(event.description)}
                                        </p>


                                        <dl class="admin-event-details">

                                            <div>
                                                <dt>Category</dt>
                                                <dd>
                                                    ${escapeHTML(
                                                        event.categoryLabel ||
                                                        event.category ||
                                                        "Not specified"
                                                    )}
                                                </dd>
                                            </div>

                                            <div>
                                                <dt>Date</dt>
                                                <dd>
                                                    ${escapeHTML(formatDate(event.date))}
                                                </dd>
                                            </div>

                                            <div>
                                                <dt>Location</dt>
                                                <dd>
                                                    ${escapeHTML(location || "Not specified")}
                                                </dd>
                                            </div>

                                            <div>
                                                <dt>Manager</dt>
                                                <dd>
                                                    ${escapeHTML(
                                                        event.ownerName ||
                                                        event.ownerEmail ||
                                                        "EventHub sample"
                                                    )}
                                                </dd>
                                            </div>

                                        </dl>

                                    </div>


                                    <div class="admin-event-actions">

                                        <a
                                            class="admin-view-link"
                                            href="event-details.html?id=${encodeURIComponent(event.id)}"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Preview
                                        </a>


                                        <button
                                            type="button"
                                            class="admin-reset-button"
                                            data-edit-event="${escapeHTML(event.id)}"
                                        >
                                            Edit
                                        </button>


                                        ${
                                            status !== "approved"

                                                ? `
                                                    <button
                                                        type="button"
                                                        class="admin-approve-button"
                                                        data-event-action="approved"
                                                        data-event-id="${escapeHTML(event.id)}"
                                                    >
                                                        Approve
                                                    </button>
                                                `

                                                : ""
                                        }


                                        ${
                                            status !== "rejected"

                                                ? `
                                                    <button
                                                        type="button"
                                                        class="admin-reject-button"
                                                        data-event-action="rejected"
                                                        data-event-id="${escapeHTML(event.id)}"
                                                    >
                                                        Reject
                                                    </button>
                                                `

                                                : ""
                                        }


                                        <button
                                            type="button"
                                            class="admin-reject-button"
                                            data-delete-event="${escapeHTML(event.id)}"
                                        >
                                            Delete
                                        </button>

                                    </div>

                                </article>

                            `;

                        }).join("")


                        : `

                            <div class="admin-empty-state">

                                <h3>
                                    No ${escapeHTML(filter)} events
                                </h3>

                                <p>
                                    There are no events in this section right now.
                                </p>

                            </div>

                        `
                }

            </div>

        `;


        /* ---------- Event filter buttons ---------- */

        root.querySelectorAll("[data-event-filter]").forEach(button => {

            button.addEventListener("click", () => {

                renderEvents(button.dataset.eventFilter);

            });

        });


        /* ---------- Approve / reject buttons ---------- */

        root.querySelectorAll("[data-event-action]").forEach(button => {

            button.addEventListener("click", () => {

                const eventId = button.dataset.eventId;
                const newStatus = button.dataset.eventAction;

                setEventStatus(eventId, newStatus);

                renderEvents(activeEventFilter);

            });

        });


        /* ---------- Delete buttons ---------- */

        root.querySelectorAll("[data-delete-event]").forEach(button => {

            button.addEventListener("click", () => {

                deleteEvent(button.dataset.deleteEvent);

            });

        });


        /* ---------- Edit buttons ---------- */

        root.querySelectorAll("[data-edit-event]").forEach(button => {

            button.addEventListener("click", () => {

                editEvent(button.dataset.editEvent);

            });

        });

    }


    /* =================================================
       11. ADMIN LOGOUT
       ================================================= */

    const logoutButton = $("adminLogout");

    if (logoutButton) {

        logoutButton.addEventListener("click", () => {
            auth.logout();
        });

    }


    /* =================================================
       12. INITIALIZE ADMIN DASHBOARD
       ================================================= */

    renderManagers();

    renderEvents("pending");

    console.log("EventHub Admin Dashboard initialized successfully.");

})();
