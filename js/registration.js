
/* =========================================================
   EVENTHUB - EVENT REGISTRATION SYSTEM
   File: js/registration.js

   Prototype only:
   - Stores registrations in localStorage.
   - Uses the existing demo session in sessionStorage.
   - Does not create real tickets or process payments.
========================================================= */

(() => {
    "use strict";

    const REGISTRATION_STORAGE_KEY = "eventhub_demo_registrations";
    const SESSION_STORAGE_KEY = "eventhub_demo_session";

    const params = new URLSearchParams(window.location.search);
    const isHistoryPage = params.get("view") === "history";
    const eventId = params.get("id");

    const form = document.getElementById("eventRegistrationForm");
    const formSection = document.getElementById("registrationFormSection");
    const successSection = document.getElementById("registrationSuccess");
    const messageBox = document.getElementById("registrationMessage");

    const $ = (id) => document.getElementById(id);


    /* =====================================================
       STORAGE HELPERS
    ===================================================== */

    function readJSON(storage, key, fallback) {
        try {
            const value = storage.getItem(key);

            if (!value) {
                return fallback;
            }

            return JSON.parse(value);
        } catch (error) {
            console.error(`Could not read ${key}:`, error);
            return fallback;
        }
    }


    function getCurrentUser() {
        return readJSON(
            sessionStorage,
            SESSION_STORAGE_KEY,
            null
        );
    }


    function getRegistrations() {
        const registrations = readJSON(
            localStorage,
            REGISTRATION_STORAGE_KEY,
            []
        );

        return Array.isArray(registrations) ? registrations : [];
    }


    function saveRegistrations(registrations) {
        try {
            localStorage.setItem(
                REGISTRATION_STORAGE_KEY,
                JSON.stringify(registrations)
            );

            return true;
        } catch (error) {
            console.error("Could not save registrations:", error);
            return false;
        }
    }


    /* =====================================================
       GENERAL HELPERS
    ===================================================== */

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, (character) => {
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


    function formatDate(dateValue) {
        if (!dateValue) {
            return "Date to be announced";
        }

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return String(dateValue);
        }

        return new Intl.DateTimeFormat("en", {
            day: "numeric",
            month: "long",
            year: "numeric"
        }).format(date);
    }


    function formatPrice(price) {
        if (price === undefined || price === null || price === "") {
            return "Price not listed";
        }

        if (typeof price === "number") {
            return price === 0 ? "Free" : String(price);
        }

        return String(price);
    }


    function getEvents() {
        return Array.isArray(window.EVENTHUB_EVENTS)
            ? window.EVENTHUB_EVENTS
            : [];
    }


    function getEventById(id) {
        return getEvents().find(
            event => String(event.id) === String(id)
        );
    }


    function showMessage(message, type = "error") {
        if (!messageBox) return;

        messageBox.textContent = message;
        messageBox.className = `registration-message ${type}`;
        messageBox.hidden = false;
    }


    function clearMessage() {
        if (!messageBox) return;

        messageBox.textContent = "";
        messageBox.hidden = true;
    }


    function setFieldError(fieldId, message) {
        const errorElement = $(fieldId);

        if (errorElement) {
            errorElement.textContent = message;
        }
    }


    function clearFieldErrors() {
        [
            "attendeeNameError",
            "attendeeEmailError",
            "consentError"
        ].forEach(id => setFieldError(id, ""));
    }


    function makeReference() {
        const randomPart = Math.random()
            .toString(36)
            .substring(2, 8)
            .toUpperCase();

        return `EH-${Date.now().toString(36).toUpperCase()}-${randomPart}`;
    }


    /* =====================================================
       AUTHENTICATION CHECK
    ===================================================== */

    function requireLogin() {
        const user = getCurrentUser();

        if (!user || !user.email) {
            const returnUrl = `registration.html?id=${encodeURIComponent(eventId || "")}`;

            window.location.href =
                `auth.html?redirect=${encodeURIComponent(returnUrl)}`;

            return null;
        }

        return user;
    }


    /* =====================================================
       EVENT INFORMATION
    ===================================================== */

    function displayEvent(event) {
        if (!event) return;

        $("registrationEventTitle").textContent =
            event.title || "Untitled event";

        $("registrationEventCategory").textContent =
            event.categoryLabel || event.category || "Event";

        $("registrationEventDate").textContent =
            `${formatDate(event.date)}${event.time ? ` · ${event.time}` : ""}`;

        const locationParts = [
            event.venue,
            event.city,
            event.country
        ].filter(Boolean);

        $("registrationEventLocation").textContent =
            locationParts.join(", ") || "Location to be announced";

        $("registrationEventPrice").textContent =
            formatPrice(event.price);

        const imageWrapper = $("registrationEventImage");

        if (imageWrapper && event.image) {
            const safeImage = String(event.image);

            if (/^https?:\/\//i.test(safeImage) || safeImage.startsWith("assets/")) {
                imageWrapper.style.backgroundImage =
                    `url("${safeImage.replace(/["\\]/g, "")}")`;
                imageWrapper.classList.add("has-event-image");
            }
        }
    }


    /* =====================================================
       FORM INITIALIZATION
    ===================================================== */

    function initializeForm(event, user) {
        if (!form) return;

        displayEvent(event);

        $("attendeeName").value = user.name || "";
        $("attendeeEmail").value = user.email || "";

        $("attendeeEmail").readOnly = Boolean(user.email);

        const existingRegistration = getRegistrations().some(registration => {
            return (
                String(registration.eventId) === String(event.id) &&
                String(registration.userEmail).toLowerCase() ===
                    String(user.email).toLowerCase()
            );
        });

        if (existingRegistration) {
            formSection.innerHTML = `
                <div class="already-registered">
                    <span class="section-kicker">ALREADY REGISTERED</span>
                    <h2>You're already on this event's list.</h2>
                    <p>
                        This demo account already has a registration for
                        this event. You can view your registration history below.
                    </p>
                    <a href="registration.html?view=history"
                       class="button button-primary">
                        View my registrations
                    </a>
                </div>
            `;

            return;
        }

        form.addEventListener("submit", (eventObject) => {
            eventObject.preventDefault();

            handleRegistration(event, user);
        });
    }


    /* =====================================================
       VALIDATION
    ===================================================== */

    function validateForm() {
        clearFieldErrors();
        clearMessage();

        let isValid = true;

        const name = $("attendeeName").value.trim();
        const email = $("attendeeEmail").value.trim();
        const consent = $("registrationConsent").checked;

        if (name.length < 2) {
            setFieldError(
                "attendeeNameError",
                "Please enter your full name."
            );

            isValid = false;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setFieldError(
                "attendeeEmailError",
                "Please enter a valid email address."
            );

            isValid = false;
        }

        if (!consent) {
            setFieldError(
                "consentError",
                "Please confirm that you understand this is a demo registration."
            );

            isValid = false;
        }

        return isValid;
    }


    /* =====================================================
       REGISTRATION PROCESS
    ===================================================== */

    function handleRegistration(event, user) {
        if (!validateForm()) {
            return;
        }

        const registrations = getRegistrations();

        const normalizedEmail = String(user.email).toLowerCase();

        const duplicate = registrations.some(registration => {
            return (
                String(registration.eventId) === String(event.id) &&
                String(registration.userEmail).toLowerCase() === normalizedEmail
            );
        });

        if (duplicate) {
            showMessage(
                "You already have a registration for this event."
            );

            return;
        }

        const registration = {
            id: makeReference(),
            eventId: event.id,
            eventTitle: event.title || "Untitled event",
            eventDate: event.date || "",
            eventTime: event.time || "",
            eventVenue: event.venue || "",
            eventCity: event.city || "",
            eventCountry: event.country || "",
            attendeeName: $("attendeeName").value.trim(),
            userEmail: normalizedEmail,
            note: $("attendeeNote").value.trim(),
            status: "Demo registration saved",
            createdAt: new Date().toISOString()
        };

        registrations.push(registration);

        if (!saveRegistrations(registrations)) {
            showMessage(
                "Your registration could not be saved. Please check your browser storage and try again."
            );

            return;
        }

        displaySuccess(registration);
    }


    /* =====================================================
       SUCCESS SCREEN
    ===================================================== */

    function displaySuccess(registration) {
        if (formSection) {
            formSection.hidden = true;
        }

        if (successSection) {
            successSection.hidden = false;
        }

        $("registrationReference").textContent = registration.id;

        $("registrationSuccessText").textContent =
            `Your demo registration for ${registration.eventTitle} has been saved in this browser. This is not a real ticket or confirmed booking.`;

        document.title = "Registration Saved — EventHub";

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }


    /* =====================================================
       REGISTRATION HISTORY
    ===================================================== */

    function initializeHistory(user) {
        const container = document.querySelector(".registration-container");

        if (!container) return;

        const userEmail = String(user.email).toLowerCase();

        const registrations = getRegistrations()
            .filter(registration =>
                String(registration.userEmail).toLowerCase() === userEmail
            )
            .sort((a, b) =>
                new Date(b.createdAt) - new Date(a.createdAt)
            );

        container.innerHTML = `
            <div class="registration-heading">
                <span class="section-kicker">YOUR EVENTHUB ACCOUNT</span>
                <h1>My <span>registrations.</span></h1>
                <p>
                    Your saved demonstration registrations appear here.
                </p>
            </div>

            <div class="registration-history-card">

                <div class="registration-history-header">
                    <div>
                        <span class="section-kicker">REGISTRATION HISTORY</span>
                        <h2>Your events</h2>
                    </div>

                    <a href="index.html" class="text-link">
                        Discover events →
                    </a>
                </div>

                ${
                    registrations.length
                        ? `
                            <div class="registration-history-list">
                                ${registrations.map(registration => `
                                    <article class="history-item">

                                        <div class="history-item-main">
                                            <span class="history-status">
                                                ${escapeHTML(registration.status)}
                                            </span>

                                            <h3>
                                                ${escapeHTML(registration.eventTitle)}
                                            </h3>

                                            <p>
                                                ${escapeHTML(formatDate(registration.eventDate))}
                                                ${registration.eventTime
                                                    ? ` · ${escapeHTML(registration.eventTime)}`
                                                    : ""}
                                            </p>

                                            <p>
                                                ${escapeHTML([
                                                    registration.eventVenue,
                                                    registration.eventCity,
                                                    registration.eventCountry
                                                ].filter(Boolean).join(", ") || "Location not listed")}
                                            </p>
                                        </div>

                                        <div class="history-reference">
                                            <span>Reference</span>
                                            <strong>${escapeHTML(registration.id)}</strong>
                                        </div>

                                    </article>
                                `).join("")}
                            </div>
                        `
                        : `
                            <div class="history-empty">
                                <div class="empty-state-symbol">◇</div>
                                <h3>No registrations yet.</h3>
                                <p>
                                    When you register for an event, it will
                                    appear here.
                                </p>
                                <a href="index.html#featured"
                                   class="button button-primary">
                                    Explore events
                                </a>
                            </div>
                        `
                }

                <p class="history-disclaimer">
                    These are browser-saved demo records, not confirmed tickets.
                </p>

            </div>
        `;

        document.title = "My Registrations — EventHub";
    }


    /* =====================================================
       PAGE INITIALIZATION
    ===================================================== */

    function initialize() {
        const yearElement = $("currentYear");

        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }

        const user = requireLogin();

        if (!user) return;

        if (isHistoryPage) {
            initializeHistory(user);
            return;
        }

        if (!eventId) {
            if (formSection) {
                formSection.innerHTML = `
                    <div class="already-registered">
                        <h2>No event selected.</h2>
                        <p>
                            Please return to the events page and choose
                            an event before registering.
                        </p>
                        <a href="index.html#featured"
                           class="button button-primary">
                            Browse events
                        </a>
                    </div>
                `;
            }

            return;
        }

        const event = getEventById(eventId);

        if (!event) {
            if (formSection) {
                formSection.innerHTML = `
                    <div class="already-registered">
                        <h2>Event not found.</h2>
                        <p>
                            This event may no longer be available.
                        </p>
                        <a href="index.html#featured"
                           class="button button-primary">
                            Browse events
                        </a>
                    </div>
                `;
            }

            return;
        }

        initializeForm(event, user);
    }


    document.addEventListener("DOMContentLoaded", initialize);

})();
