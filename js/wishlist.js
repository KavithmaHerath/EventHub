
/* =========================================
   EVENTHUB
   Saved Events / Wishlist
========================================= */

(function () {
    "use strict";

    const WISHLIST_STORAGE_KEY = "eventhub_demo_saved_events";
    const SESSION_STORAGE_KEY = "eventhub_demo_session";

    function getCurrentSession() {
        try {
            const session = sessionStorage.getItem(SESSION_STORAGE_KEY);
            return session ? JSON.parse(session) : null;
        } catch (error) {
            console.error("Unable to read the current session.", error);
            return null;
        }
    }

    function getCurrentEmail() {
        const session = getCurrentSession();

        return session && session.email
            ? String(session.email).trim().toLowerCase()
            : "";
    }

    function getSavedRecords() {
        try {
            const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
            const records = stored ? JSON.parse(stored) : [];

            return Array.isArray(records) ? records : [];
        } catch (error) {
            console.error("Unable to read saved events.", error);
            return [];
        }
    }

    function saveRecords(records) {
        try {
            localStorage.setItem(
                WISHLIST_STORAGE_KEY,
                JSON.stringify(records)
            );

            return true;
        } catch (error) {
            console.error("Unable to save wishlist.", error);
            return false;
        }
    }

    function getSavedIds() {
        const email = getCurrentEmail();

        if (!email) {
            return [];
        }

        return getSavedRecords()
            .filter(function (record) {
                return record.userEmail === email;
            })
            .map(function (record) {
                return String(record.eventId);
            });
    }

    function isSaved(eventId) {
        return getSavedIds().includes(String(eventId));
    }

    function toggleSaved(eventId) {
        const email = getCurrentEmail();

        if (!email) {
            return {
                success: false,
                reason: "signed-out"
            };
        }

        const id = String(eventId);
        const records = getSavedRecords();

        const existingIndex = records.findIndex(function (record) {
            return (
                record.userEmail === email &&
                String(record.eventId) === id
            );
        });

        if (existingIndex >= 0) {
            records.splice(existingIndex, 1);

            return {
                success: saveRecords(records),
                saved: false
            };
        }

        records.push({
            userEmail: email,
            eventId: id,
            savedAt: new Date().toISOString()
        });

        return {
            success: saveRecords(records),
            saved: true
        };
    }

    function syncButtons(container) {
        const root = container || document;

        root.querySelectorAll("[data-wishlist-toggle]").forEach(
            function (button) {
                const eventId = button.dataset.eventId;

                if (!eventId) {
                    return;
                }

                const saved = isSaved(eventId);

                button.setAttribute("aria-pressed", String(saved));
                button.classList.toggle("is-saved", saved);

                const icon = button.querySelector(
                    '[aria-hidden="true"]'
                );

                const label = button.querySelector(
                    ".wishlist-button-label"
                );

                if (icon) {
                    icon.textContent = saved ? "♥" : "♡";
                }

                if (label) {
                    label.textContent = button.classList.contains(
                        "wishlist-details-button"
                    )
                        ? (saved ? "Saved" : "Save event")
                        : (saved ? "Saved" : "Save");
                }

                button.setAttribute(
                    "aria-label",
                    saved ? "Remove this event from saved events" : "Save this event"
                );
            }
        );
    }

    function showWishlistMessage(message) {
        const messageElement = document.getElementById("wishlistMessage");

        if (messageElement) {
            messageElement.textContent = message;
        }
    }

    function handleWishlistClick(event) {
        const button = event.target.closest("[data-wishlist-toggle]");

        if (!button) {
            return;
        }

        event.preventDefault();

        const eventId = button.dataset.eventId;

        if (!eventId) {
            return;
        }

        if (!getCurrentEmail()) {
            const shouldSignIn = window.confirm(
                "Please sign in to save events. Go to the sign-in page?"
            );

            if (shouldSignIn) {
                window.location.href = "auth.html";
            }

            return;
        }

        const result = toggleSaved(eventId);

        if (!result.success) {
            showWishlistMessage(
                "Your saved events could not be updated. Please try again."
            );
            return;
        }

        syncButtons(document);

        if (document.getElementById("savedEventsGrid")) {
            renderSavedEvents();
        }

        showWishlistMessage(
            result.saved
                ? "Event added to your saved events."
                : "Event removed from your saved events."
        );
    }

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, function (character) {
            const characters = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            };

            return characters[character];
        });
    }

    function formatEventDate(dateValue) {
        if (!dateValue) {
            return "Date to be announced";
        }

        const date = new Date(dateValue + "T00:00:00");

        if (Number.isNaN(date.getTime())) {
            return "Date to be announced";
        }

        return new Intl.DateTimeFormat("en", {
            day: "numeric",
            month: "short",
            year: "numeric"
        }).format(date);
    }

    function createSavedEventCard(event) {
        const eventId = encodeURIComponent(String(event.id));
        const detailsUrl = "event-details.html?id=" + eventId;

        return `
            <article class="saved-event-card">

                <a
                    href="${detailsUrl}"
                    class="saved-event-image"
                    aria-label="View ${escapeHTML(event.title)}"
                >
                    <img
                        src="${escapeHTML(event.image)}"
                        alt="${escapeHTML(event.title)}"
                        loading="lazy"
                    >
                </a>

                <div class="saved-event-content">

                    <span class="saved-event-category">
                        ${escapeHTML(event.categoryLabel)}
                    </span>

                    <h2>
                        <a href="${detailsUrl}">
                            ${escapeHTML(event.title)}
                        </a>
                    </h2>

                    <p class="saved-event-meta">
                        ${escapeHTML(formatEventDate(event.date))}
                        <span aria-hidden="true">·</span>
                        ${escapeHTML(event.time)}
                    </p>

                    <p class="saved-event-location">
                        ${escapeHTML(event.venue)},
                        ${escapeHTML(event.city)},
                        ${escapeHTML(event.country)}
                    </p>

                    <div class="saved-event-footer">

                        <span class="saved-event-price">
                            ${escapeHTML(event.price)}
                        </span>

                        <button
                            type="button"
                            class="wishlist-button is-saved"
                            data-wishlist-toggle
                            data-event-id="${eventId}"
                            aria-pressed="true"
                            aria-label="Remove ${escapeHTML(event.title)} from saved events"
                        >
                            <span aria-hidden="true">♥</span>
                            <span class="wishlist-button-label">Saved</span>
                        </button>

                    </div>

                </div>

            </article>
        `;
    }

    function renderSavedEvents() {
        const grid = document.getElementById("savedEventsGrid");
        const emptyState = document.getElementById("savedEventsEmpty");
        const signedOutState = document.getElementById("savedEventsSignedOut");
        const countElement = document.getElementById("savedEventsCount");

        if (!grid) {
            return;
        }

        if (!getCurrentEmail()) {
            grid.innerHTML = "";
            grid.hidden = true;

            if (emptyState) {
                emptyState.hidden = true;
            }

            if (signedOutState) {
                signedOutState.hidden = false;
            }

            if (countElement) {
                countElement.textContent = "0 saved events";
            }

            return;
        }

        if (signedOutState) {
            signedOutState.hidden = true;
        }

        const savedIds = getSavedIds();
        const allEvents = Array.isArray(window.EVENTHUB_EVENTS)
            ? window.EVENTHUB_EVENTS
            : [];

        const savedEvents = savedIds
            .map(function (id) {
                return allEvents.find(function (event) {
                    return String(event.id) === id;
                });
            })
            .filter(Boolean);

        if (countElement) {
            countElement.textContent =
                savedEvents.length +
                (savedEvents.length === 1 ? " saved event" : " saved events");
        }

        grid.innerHTML = savedEvents
            .map(createSavedEventCard)
            .join("");

        grid.hidden = savedEvents.length === 0;

        if (emptyState) {
            emptyState.hidden = savedEvents.length !== 0;
        }

        syncButtons(grid);
    }

    function initializeWishlist() {
        document.addEventListener("click", handleWishlistClick);

        // Attach the current event ID to the event-details button.
        const detailsButton = document.getElementById(
            "wishlistToggleButton"
        );

        if (detailsButton) {
            const params = new URLSearchParams(window.location.search);
            const eventId = params.get("id");

            if (eventId) {
                detailsButton.dataset.eventId = eventId;
            }
        }

        syncButtons(document);
        renderSavedEvents();
    }

    window.EventHubWishlist = {
        isSaved: isSaved,
        getSavedIds: getSavedIds,
        toggleSaved: toggleSaved,
        syncButtons: syncButtons,
        renderSavedEvents: renderSavedEvents
    };

    document.addEventListener("DOMContentLoaded", initializeWishlist);

    window.addEventListener("storage", function (event) {
        if (event.key === WISHLIST_STORAGE_KEY) {
            syncButtons(document);
            renderSavedEvents();
        }
    });

})();
