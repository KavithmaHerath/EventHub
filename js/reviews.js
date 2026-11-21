
/* =========================================
   EVENTHUB
   Event Reviews & Ratings
========================================= */

(function () {
    "use strict";

    const REVIEWS_STORAGE_KEY = "eventhub_demo_reviews";
    const SESSION_STORAGE_KEY = "eventhub_demo_session";

    /* -------------------------------------
       STORAGE
    ------------------------------------- */

    function getReviews() {
        try {
            const stored = localStorage.getItem(REVIEWS_STORAGE_KEY);
            const reviews = stored ? JSON.parse(stored) : [];

            return Array.isArray(reviews) ? reviews : [];
        } catch (error) {
            console.error("Unable to load event reviews.", error);
            return [];
        }
    }

    function saveReviews(reviews) {
        try {
            localStorage.setItem(
                REVIEWS_STORAGE_KEY,
                JSON.stringify(reviews)
            );

            return true;
        } catch (error) {
            console.error("Unable to save event reviews.", error);
            return false;
        }
    }

    function getCurrentSession() {
        try {
            const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
            return stored ? JSON.parse(stored) : null;
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

    function getCurrentName() {
        const session = getCurrentSession();

        return session && session.name
            ? String(session.name).trim()
            : "EventHub member";
    }

    /* -------------------------------------
       REVIEW HELPERS
    ------------------------------------- */

    function getEventReviews(eventId) {
        return getReviews().filter(function (review) {
            return String(review.eventId) === String(eventId);
        });
    }

    function getUserReview(eventId) {
        const email = getCurrentEmail();

        if (!email) {
            return null;
        }

        return getEventReviews(eventId).find(function (review) {
            return review.userEmail === email;
        }) || null;
    }

    function getSummary(eventId) {
        const reviews = getEventReviews(eventId);

        if (reviews.length === 0) {
            return {
                average: 0,
                count: 0
            };
        }

        const total = reviews.reduce(function (sum, review) {
            return sum + Number(review.rating || 0);
        }, 0);

        return {
            average: total / reviews.length,
            count: reviews.length
        };
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

    function formatReviewDate(dateValue) {
        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return "";
        }

        return new Intl.DateTimeFormat("en", {
            day: "numeric",
            month: "short",
            year: "numeric"
        }).format(date);
    }

    function getStars(rating) {
        const value = Math.max(0, Math.min(5, Number(rating) || 0));

        return "★".repeat(value) + "☆".repeat(5 - value);
    }

    /* -------------------------------------
       REVIEW DISPLAY
    ------------------------------------- */

    function renderReviewList(eventId) {
        const list = document.getElementById("eventReviewList");
        const countElement = document.getElementById("reviewCount");
        const summaryElement = document.getElementById("reviewSummary");

        if (!list) {
            return;
        }

        const reviews = getEventReviews(eventId).sort(function (a, b) {
            return new Date(b.updatedAt || b.createdAt) -
                new Date(a.updatedAt || a.createdAt);
        });

        const summary = getSummary(eventId);

        if (countElement) {
            countElement.textContent =
                summary.count +
                (summary.count === 1 ? " review" : " reviews");
        }

        if (summaryElement) {
            summaryElement.textContent = summary.count > 0
                ? summary.average.toFixed(1) + " / 5"
                : "Not rated yet";
        }

        if (reviews.length === 0) {
            list.innerHTML = `
                <div class="reviews-empty">
                    <span aria-hidden="true">☆</span>
                    <p>No reviews yet. Be the first to share your experience.</p>
                </div>
            `;

            return;
        }

        list.innerHTML = reviews.map(function (review) {
            const reviewer = escapeHTML(review.reviewerName || "EventHub member");
            const comment = escapeHTML(review.comment || "");
            const date = escapeHTML(
                formatReviewDate(review.updatedAt || review.createdAt)
            );

            return `
                <article class="event-review">

                    <div class="event-review-header">

                        <div class="event-review-person">
                            <span class="event-review-avatar" aria-hidden="true">
                                ${escapeHTML(reviewer.charAt(0).toUpperCase())}
                            </span>

                            <div>
                                <h3>${reviewer}</h3>
                                <time>${date}</time>
                            </div>
                        </div>

                        <span
                            class="event-review-stars"
                            aria-label="${Number(review.rating)} out of 5 stars"
                        >
                            ${getStars(review.rating)}
                        </span>

                    </div>

                    ${
                        comment
                            ? `<p class="event-review-comment">${comment}</p>`
                            : `<p class="event-review-comment review-no-comment">Rating submitted without a written comment.</p>`
                    }

                </article>
            `;
        }).join("");
    }

    /* -------------------------------------
       REVIEW FORM
    ------------------------------------- */

    function renderReviewForm(eventId) {
        const container = document.getElementById("reviewFormContainer");

        if (!container) {
            return;
        }

        const email = getCurrentEmail();

        if (!email) {
            container.innerHTML = `
                <div class="review-sign-in">

                    <h3>Been to this event?</h3>

                    <p>
                        Sign in to leave a rating and share your experience.
                    </p>

                    <a href="auth.html" class="button button-primary">
                        Sign in to review
                        <span aria-hidden="true">↗</span>
                    </a>

                </div>
            `;

            return;
        }

        const existingReview = getUserReview(eventId);

        const selectedRating = existingReview
            ? Number(existingReview.rating)
            : 5;

        const comment = existingReview
            ? escapeHTML(existingReview.comment || "")
            : "";

        container.innerHTML = `
            <form class="event-review-form" id="eventReviewForm">

                <div class="review-form-heading">
                    <div>
                        <span class="section-kicker">YOUR EXPERIENCE</span>

                        <h3>
                            ${existingReview ? "Update your review" : "Share your experience"}
                        </h3>
                    </div>

                    <span class="review-form-note">
                        ${existingReview ? "Your existing review can be updated." : "One review per account."}
                    </span>
                </div>

                <label for="reviewRating">Your rating</label>

                <select id="reviewRating" name="rating" required>
                    <option value="5" ${selectedRating === 5 ? "selected" : ""}>
                        5 — Excellent
                    </option>

                    <option value="4" ${selectedRating === 4 ? "selected" : ""}>
                        4 — Very good
                    </option>

                    <option value="3" ${selectedRating === 3 ? "selected" : ""}>
                        3 — Good
                    </option>

                    <option value="2" ${selectedRating === 2 ? "selected" : ""}>
                        2 — Fair
                    </option>

                    <option value="1" ${selectedRating === 1 ? "selected" : ""}>
                        1 — Poor
                    </option>
                </select>

                <label for="reviewComment">
                    Your review
                    <span class="review-optional">(optional)</span>
                </label>

                <textarea
                    id="reviewComment"
                    name="comment"
                    rows="4"
                    maxlength="500"
                    placeholder="What did you think about this event?"
                >${comment}</textarea>

                <div class="review-form-footer">

                    <span class="review-character-note">
                        Maximum 500 characters
                    </span>

                    <button type="submit" class="button button-primary">
                        ${existingReview ? "Update review" : "Submit review"}
                        <span aria-hidden="true">→</span>
                    </button>

                </div>

                <p
                    class="review-form-message"
                    id="reviewFormMessage"
                    role="status"
                    aria-live="polite"
                ></p>

            </form>
        `;

        const form = document.getElementById("eventReviewForm");

        if (form) {
            form.addEventListener("submit", function (event) {
                submitReview(event, eventId);
            });
        }
    }

    /* -------------------------------------
       SAVE OR UPDATE REVIEW
    ------------------------------------- */

    function submitReview(event, eventId) {
        event.preventDefault();

        const form = event.currentTarget;
        const message = document.getElementById("reviewFormMessage");
        const ratingInput = document.getElementById("reviewRating");
        const commentInput = document.getElementById("reviewComment");

        const email = getCurrentEmail();

        if (!email) {
            if (message) {
                message.textContent = "Please sign in before submitting a review.";
            }

            return;
        }

        const rating = Number(ratingInput.value);
        const comment = commentInput.value.trim();

        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            if (message) {
                message.textContent = "Please select a rating between 1 and 5.";
            }

            return;
        }

        if (comment.length > 500) {
            if (message) {
                message.textContent = "Your review must be 500 characters or fewer.";
            }

            return;
        }

        const reviews = getReviews();
        const existingIndex = reviews.findIndex(function (review) {
            return (
                String(review.eventId) === String(eventId) &&
                review.userEmail === email
            );
        });

        const now = new Date().toISOString();

        if (existingIndex >= 0) {
            reviews[existingIndex] = {
                ...reviews[existingIndex],
                rating: rating,
                comment: comment,
                updatedAt: now
            };
        } else {
            reviews.push({
                id: "review-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8),
                eventId: String(eventId),
                userEmail: email,
                reviewerName: getCurrentName(),
                rating: rating,
                comment: comment,
                createdAt: now,
                updatedAt: now
            });
        }

        if (!saveReviews(reviews)) {
            if (message) {
                message.textContent =
                    "Your review could not be saved. Please try again.";
            }

            return;
        }

        renderReviewList(eventId);
        renderReviewForm(eventId);

        const updatedMessage = document.getElementById("reviewFormMessage");

        if (updatedMessage) {
            updatedMessage.textContent = "Your review has been saved.";
        }

        // Refresh any review summaries currently displayed on this page.
        document.dispatchEvent(new CustomEvent("eventhub:reviews-updated", {
            detail: { eventId: String(eventId) }
        }));
    }

    /* -------------------------------------
       CREATE EVENT REVIEWS SECTION
    ------------------------------------- */

    function createReviewsSection(eventId) {
        const mainColumn = document.querySelector(
            ".event-details-main-column"
        );

        if (!mainColumn || document.getElementById("eventReviewsSection")) {
            return;
        }

        const section = document.createElement("section");

        section.className = "event-reviews-section";
        section.id = "eventReviewsSection";

        section.innerHTML = `
            <div class="event-reviews-heading">

                <div>
                    <span class="section-kicker">COMMUNITY FEEDBACK</span>
                    <h2>Reviews & ratings</h2>
                    <p>
                        Hear from people who have shared their thoughts
                        about this event.
                    </p>
                </div>

                <div class="event-reviews-summary">

                    <strong id="reviewSummary">Not rated yet</strong>

                    <span class="event-review-summary-stars" aria-hidden="true">
                        ★★★★★
                    </span>

                    <span id="reviewCount">0 reviews</span>

                </div>

            </div>

            <div id="reviewFormContainer"></div>

            <div class="event-review-list-heading">
                <h3>What people are saying</h3>
            </div>

            <div
                class="event-review-list"
                id="eventReviewList"
                aria-live="polite"
            ></div>
        `;

        const actions = mainColumn.querySelector(".event-details-actions");

        if (actions) {
            mainColumn.insertBefore(section, actions);
        } else {
            mainColumn.appendChild(section);
        }

        renderReviewForm(eventId);
        renderReviewList(eventId);
    }

    /* -------------------------------------
       INITIALIZATION
    ------------------------------------- */

    function initializeEventReviews() {
        const detailsContent = document.getElementById(
            "eventDetailsContent"
        );

        if (!detailsContent) {
            return;
        }

        const params = new URLSearchParams(window.location.search);
        const eventId = params.get("id");

        if (!eventId) {
            return;
        }

        const events = Array.isArray(window.EVENTHUB_EVENTS)
            ? window.EVENTHUB_EVENTS
            : [];

        const matchingEvent = events.find(function (event) {
            return String(event.id) === String(eventId);
        });

        if (!matchingEvent) {
            return;
        }

        createReviewsSection(eventId);
    }

    window.EventHubReviews = {
        getSummary: getSummary,
        getEventReviews: getEventReviews,
        getUserReview: getUserReview
    };

    document.addEventListener(
        "DOMContentLoaded",
        initializeEventReviews
    );

    window.addEventListener("storage", function (event) {
        if (event.key === REVIEWS_STORAGE_KEY) {
            const params = new URLSearchParams(window.location.search);
            const eventId = params.get("id");

            if (eventId) {
                renderReviewList(eventId);
                renderReviewForm(eventId);
            }
        }
    });

})();
