
/* =========================================================
   EVENTHUB - ANALYTICS DASHBOARD
   Front-end demonstration using localStorage.
   ========================================================= */

(() => {
    "use strict";

    // Keep this email identical to the administrator in auth.js.
    const ADMIN_EMAILS = [
        "amanda33herath@gmail.com"
    ];

    const EVENTS_STORAGE_KEY = "eventhub_demo_events";
    const REGISTRATIONS_STORAGE_KEY = "eventhub_demo_registrations";
    const SESSION_STORAGE_KEY = "eventhub_demo_session";

    // Read the current logged-in session.
    function getCurrentSession() {
        try {
            return JSON.parse(
                sessionStorage.getItem(SESSION_STORAGE_KEY) || "null"
            );
        } catch {
            return null;
        }
    }

    const session = getCurrentSession();
    const currentEmail = session?.email?.toLowerCase() || "";

    // Confirm that the logged-in account is the administrator.
    function isAdmin() {
        return (
            session?.role === "admin" &&
            ADMIN_EMAILS.includes(currentEmail)
        );
    }

    function readArray(storageKey) {
        try {
            const value = JSON.parse(localStorage.getItem(storageKey));
            return Array.isArray(value) ? value : [];
        } catch {
            return [];
        }
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

    function getAllEvents() {
        const sampleEvents = Array.isArray(window.EVENTHUB_EVENTS)
            ? window.EVENTHUB_EVENTS
            : [];

        const organizerEvents = readArray(EVENTS_STORAGE_KEY);

        // Merge both sources without duplicating organizer events.
        const eventMap = new Map();

        [...sampleEvents, ...organizerEvents].forEach(event => {
            if (event && event.id !== undefined) {
                eventMap.set(String(event.id), event);
            }
        });

        return [...eventMap.values()];
    }

    function getStatus(event) {
        return event.status || "approved";
    }

    function getRegistrations() {
        return readArray(REGISTRATIONS_STORAGE_KEY);
    }

    function getEventRegistrations(eventId, registrations) {
        return registrations.filter(registration =>
            String(registration.eventId) === String(eventId)
        );
    }

    function getCategoryName(event) {
        return event.categoryLabel || event.category || "Other";
    }

    function getRegistrationDate(registration) {
        const possibleDates = [
            registration.createdAt,
            registration.registeredAt,
            registration.registrationDate,
            registration.date
        ];

        for (const value of possibleDates) {
            if (!value) continue;

            const parsed = new Date(value);

            if (!Number.isNaN(parsed.getTime())) {
                return parsed;
            }
        }

        return null;
    }

    function formatNumber(value) {
        return new Intl.NumberFormat("en").format(value);
    }

    function formatMonth(date) {
        return new Intl.DateTimeFormat("en", {
            month: "short"
        }).format(date);
    }

    function getMonthlyRegistrations(registrations) {
        const now = new Date();
        const months = [];

        for (let offset = 5; offset >= 0; offset--) {
            const date = new Date(
                now.getFullYear(),
                now.getMonth() - offset,
                1
            );

            months.push({
                year: date.getFullYear(),
                month: date.getMonth(),
                label: formatMonth(date),
                count: 0
            });
        }

        registrations.forEach(registration => {
            const date = getRegistrationDate(registration);

            if (!date) return;

            const month = months.find(item =>
                item.year === date.getFullYear() &&
                item.month === date.getMonth()
            );

            if (month) month.count += 1;
        });

        return months;
    }

    function getCategoryStatistics(events) {
        const counts = new Map();

        events
            .filter(event => getStatus(event) === "approved")
            .forEach(event => {
                const category = getCategoryName(event);
                counts.set(category, (counts.get(category) || 0) + 1);
            });

        return [...counts.entries()]
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);
    }

    function getPopularEvents(events, registrations) {
        return events
            .filter(event => getStatus(event) === "approved")
            .map(event => ({
                event,
                registrations: getEventRegistrations(
                    event.id,
                    registrations
                ).length
            }))
            .sort((a, b) => b.registrations - a.registrations)
            .slice(0, 5);
    }

    function getOrganizerStatistics(events, registrations) {
        const organizers = new Map();

        events.forEach(event => {
            const email = event.ownerEmail?.toLowerCase();

            if (!email) return;

            if (!organizers.has(email)) {
                organizers.set(email, {
                    name: event.ownerName || email,
                    eventCount: 0,
                    approvedCount: 0,
                    registrationCount: 0
                });
            }

            const organizer = organizers.get(email);

            organizer.eventCount += 1;

            if (getStatus(event) === "approved") {
                organizer.approvedCount += 1;
            }

            organizer.registrationCount += getEventRegistrations(
                event.id,
                registrations
            ).length;
        });

        return [...organizers.values()]
            .sort((a, b) =>
                b.registrationCount - a.registrationCount ||
                b.eventCount - a.eventCount
            )
            .slice(0, 5);
    }

    function renderMonthlyChart(months) {
        const maximum = Math.max(
            1,
            ...months.map(month => month.count)
        );

        return `
            <div class="analytics-bar-chart" role="img"
                aria-label="Monthly registrations: ${months.map(month =>
                    `${month.label} ${month.count}`
                ).join(", ")}">
                ${months.map(month => {
                    const height = month.count === 0
                        ? 3
                        : Math.max(8, (month.count / maximum) * 100);

                    return `
                        <div class="analytics-bar-column">
                            <span class="analytics-bar-value">
                                ${formatNumber(month.count)}
                            </span>
                            <div class="analytics-bar-track">
                                <div
                                    class="analytics-bar"
                                    style="height: ${height}%"
                                ></div>
                            </div>
                            <span class="analytics-bar-label">
                                ${escapeHTML(month.label)}
                            </span>
                        </div>
                    `;
                }).join("")}
            </div>
        `;
    }

    function renderCategoryChart(categories) {
        if (!categories.length) {
            return `<p class="analytics-empty-message">No approved event categories yet.</p>`;
        }

        const total = categories.reduce(
            (sum, category) => sum + category.count,
            0
        );

        return `
            <div class="analytics-category-list">
                ${categories.map(category => {
                    const percentage = total
                        ? (category.count / total) * 100
                        : 0;

                    return `
                        <div class="analytics-category-item">
                            <div class="analytics-category-heading">
                                <span>${escapeHTML(category.name)}</span>
                                <strong>${category.count}</strong>
                            </div>
                            <div class="analytics-category-track">
                                <div
                                    class="analytics-category-fill"
                                    style="width: ${percentage}%"
                                ></div>
                            </div>
                        </div>
                    `;
                }).join("")}
            </div>
        `;
    }

    function renderPopularEvents(popularEvents) {
        if (!popularEvents.length) {
            return `<p class="analytics-empty-message">No approved events to display.</p>`;
        }

        return `
            <div class="analytics-ranking-list">
                ${popularEvents.map((item, index) => `
                    <article class="analytics-ranking-item">
                        <span class="analytics-rank">
                            ${String(index + 1).padStart(2, "0")}
                        </span>
                        <div class="analytics-ranking-info">
                            <h3>${escapeHTML(item.event.title)}</h3>
                            <p>
                                ${escapeHTML(item.event.city || "Location not specified")}
                            </p>
                        </div>
                        <strong>
                            ${formatNumber(item.registrations)}
                            <span>registrations</span>
                        </strong>
                    </article>
                `).join("")}
            </div>
        `;
    }

    function renderOrganizerTable(organizers) {
        if (!organizers.length) {
            return `<p class="analytics-empty-message">No organizer submissions yet.</p>`;
        }

        return `
            <div class="analytics-table-wrap">
                <table class="analytics-table">
                    <thead>
                        <tr>
                            <th>Organizer</th>
                            <th>Total events</th>
                            <th>Approved</th>
                            <th>Registrations</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${organizers.map(organizer => `
                            <tr>
                                <td>${escapeHTML(organizer.name)}</td>
                                <td>${formatNumber(organizer.eventCount)}</td>
                                <td>${formatNumber(organizer.approvedCount)}</td>
                                <td>${formatNumber(organizer.registrationCount)}</td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        `;
    }

    function renderAccessDenied(root) {
        root.innerHTML = `
            <div class="analytics-access-denied">
                <h2>Administrator access required</h2>
                <p>
                    Sign in with an authorised administrator account
                    to view platform analytics.
                </p>
                <a href="account.html">Return to your account</a>
            </div>
        `;
    }

    function renderAnalytics() {
        const root = document.getElementById("analyticsDashboardContent");

        if (!root || !isAdmin()) return;

        const events = getAllEvents();
        const registrations = getRegistrations();

        const pendingCount = events.filter(
            event => getStatus(event) === "pending"
        ).length;

        const approvedCount = events.filter(
            event => getStatus(event) === "approved"
        ).length;

        const rejectedCount = events.filter(
            event => getStatus(event) === "rejected"
        ).length;

        const months = getMonthlyRegistrations(registrations);
        const categories = getCategoryStatistics(events);
        const popularEvents = getPopularEvents(events, registrations);
        const organizers = getOrganizerStatistics(events, registrations);

        root.innerHTML = `
            <section class="analytics-stat-grid" aria-label="Platform statistics">
                <article class="analytics-stat-card">
                    <span>Total events</span>
                    <strong>${formatNumber(events.length)}</strong>
                    <small>All submission statuses</small>
                </article>

                <article class="analytics-stat-card">
                    <span>Total registrations</span>
                    <strong>${formatNumber(registrations.length)}</strong>
                    <small>Recorded demo registrations</small>
                </article>

                <article class="analytics-stat-card">
                    <span>Approved events</span>
                    <strong>${formatNumber(approvedCount)}</strong>
                    <small>Visible to visitors</small>
                </article>

                <article class="analytics-stat-card">
                    <span>Pending review</span>
                    <strong>${formatNumber(pendingCount)}</strong>
                    <small>Awaiting moderation</small>
                </article>
            </section>

            <section class="analytics-status-summary">
                <div>
                    <span>Approved</span>
                    <strong>${approvedCount}</strong>
                </div>
                <div>
                    <span>Pending</span>
                    <strong>${pendingCount}</strong>
                </div>
                <div>
                    <span>Rejected</span>
                    <strong>${rejectedCount}</strong>
                </div>
            </section>

            <section class="analytics-main-grid">
                <article class="analytics-panel analytics-trend-panel">
                    <div class="analytics-panel-heading">
                        <div>
                            <span class="section-eyebrow">REGISTRATION ACTIVITY</span>
                            <h2>Registration trends</h2>
                        </div>
                        <span class="analytics-panel-caption">Last 6 months</span>
                    </div>
                    ${renderMonthlyChart(months)}
                </article>

                <article class="analytics-panel">
                    <div class="analytics-panel-heading">
                        <div>
                            <span class="section-eyebrow">EVENT DISTRIBUTION</span>
                            <h2>Popular categories</h2>
                        </div>
                    </div>
                    ${renderCategoryChart(categories)}
                </article>
            </section>

            <section class="analytics-panel analytics-wide-panel">
                <div class="analytics-panel-heading">
                    <div>
                        <span class="section-eyebrow">AUDIENCE INTEREST</span>
                        <h2>Most popular events</h2>
                    </div>
                    <span class="analytics-panel-caption">Ranked by registrations</span>
                </div>
                ${renderPopularEvents(popularEvents)}
            </section>

            <section class="analytics-panel analytics-wide-panel">
                <div class="analytics-panel-heading">
                    <div>
                        <span class="section-eyebrow">ORGANIZER PERFORMANCE</span>
                        <h2>Top organizers</h2>
                    </div>
                    <span class="analytics-panel-caption">Top 5 by registrations</span>
                </div>
                ${renderOrganizerTable(organizers)}
            </section>

            <p class="analytics-disclaimer">
                Demo analytics are calculated from data stored in this browser.
                Registration trend dates are shown only when registration records
                contain a valid date field.
            </p>
        `;
    }

    function initialize() {
        const root = document.getElementById("analyticsDashboardContent");

        if (!root) return;

        if (!session) {
            window.location.href = "auth.html";
            return;
        }

        if (!isAdmin()) {
            renderAccessDenied(root);
            return;
        }

        renderAnalytics();
    }

    document.addEventListener("DOMContentLoaded", initialize);

    window.EventHubAnalytics = {
        renderAnalytics
    };
})();
