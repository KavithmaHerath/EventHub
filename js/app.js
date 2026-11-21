
/* =========================================
   EVENTHUB
   Main application JavaScript
   ========================================= */


/* =========================================
   01. SELECT ELEMENTS
   ========================================= */

const menuToggle = document.getElementById("menuToggle");
const mainNavigation = document.getElementById("mainNavigation");
const currentYear = document.getElementById("currentYear");

const eventGrid = document.getElementById("eventGrid");
const eventSearch = document.getElementById("eventSearch");

const categoryFilter = document.getElementById("categoryFilter");
const locationFilter = document.getElementById("locationFilter");
const sortFilter = document.getElementById("sortFilter");

const resultsCount = document.getElementById("resultsCount");
const clearFiltersButton = document.getElementById("clearFilters");
const noEventsMessage = document.getElementById("noEventsMessage");
const resetSearchButton = document.getElementById("resetSearch");


/* =========================================
   02. EVENT DATA
   ========================================= */

const events = Array.isArray(window.EVENTHUB_EVENTS)
    ? window.EVENTHUB_EVENTS
    : [];


/* =========================================
   03. MOBILE NAVIGATION
   ========================================= */

function openMobileMenu() {

    if (!menuToggle || !mainNavigation) {
        return;
    }

    menuToggle.classList.add("is-active");
    mainNavigation.classList.add("is-open");

    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Close navigation menu");

}


function closeMobileMenu() {

    if (!menuToggle || !mainNavigation) {
        return;
    }

    menuToggle.classList.remove("is-active");
    mainNavigation.classList.remove("is-open");

    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");

}


function toggleMobileMenu() {

    if (!mainNavigation) {
        return;
    }

    const menuIsOpen = mainNavigation.classList.contains("is-open");

    if (menuIsOpen) {
        closeMobileMenu();
    } else {
        openMobileMenu();
    }

}


if (menuToggle) {

    menuToggle.addEventListener("click", toggleMobileMenu);

}


if (mainNavigation) {

    const navigationLinks = mainNavigation.querySelectorAll("a");

    navigationLinks.forEach(function (link) {

        link.addEventListener("click", closeMobileMenu);

    });

}


document.addEventListener("keydown", function (event) {

    if (event.key === "Escape") {
        closeMobileMenu();
    }

});


document.addEventListener("click", function (event) {

    if (!mainNavigation || !menuToggle) {
        return;
    }

    const clickedInsideNavigation =
        mainNavigation.contains(event.target);

    const clickedMenuButton =
        menuToggle.contains(event.target);

    if (!clickedInsideNavigation && !clickedMenuButton) {
        closeMobileMenu();
    }

});


window.addEventListener("resize", function () {

    if (window.innerWidth > 760) {
        closeMobileMenu();
    }

});


/* =========================================
   04. FOOTER YEAR
   ========================================= */

if (currentYear) {

    currentYear.textContent = new Date().getFullYear();

}


/* =========================================
   05. FORMAT EVENT DATE
   ========================================= */

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


/* =========================================
   06. ESCAPE HTML
   ========================================= */

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


/* =========================================
   07. CREATE EVENT CARD
   ========================================= */

function createEventCard(event) {

    const safeId = encodeURIComponent(String(event.id));

    const safeTitle = escapeHTML(event.title);
    const safeDescription = escapeHTML(event.description);
    const safeCategory = escapeHTML(event.categoryLabel);
    const safeDate = escapeHTML(formatEventDate(event.date));
    const safeTime = escapeHTML(event.time);
    const safeVenue = escapeHTML(event.venue);
    const safeCity = escapeHTML(event.city);
    const safeCountry = escapeHTML(event.country);
    const safePrice = escapeHTML(event.price);
    const safeImage = escapeHTML(event.image);

    const detailsUrl = `event-details.html?id=${safeId}`;

    const reviewSummary = window.EventHubReviews
    ? window.EventHubReviews.getSummary(event.id)
    : { average: 0, count: 0 };

const ratingMarkup = reviewSummary.count > 0
    ? `
        <div
            class="event-card-rating"
            aria-label="${reviewSummary.average.toFixed(1)} out of 5 stars, based on ${reviewSummary.count} reviews"
        >
            <span class="event-rating-stars" aria-hidden="true">★</span>
            <strong>${reviewSummary.average.toFixed(1)}</strong>
            <span>(${reviewSummary.count} ${reviewSummary.count === 1 ? "review" : "reviews"})</span>
        </div>
    `
    : `
        <div class="event-card-rating event-card-rating-empty">
            <span aria-hidden="true">☆</span>
            <span>Be the first to review</span>
        </div>
    `;

    // Check whether the event is already saved.
    const isEventSaved =
        window.EventHubWishlist &&
        typeof window.EventHubWishlist.isSaved === "function"
            ? window.EventHubWishlist.isSaved(event.id)
            : false;

    const saveButtonLabel = isEventSaved ? "Saved" : "Save";
    const saveButtonIcon = isEventSaved ? "♥" : "♡";

    return `
        <article class="event-card">

            <a
                class="event-card-image event-card-image-link"
                href="${detailsUrl}"
                aria-label="View details for ${safeTitle}"
            >

                <img
                    src="${safeImage}"
                    alt="${safeTitle}"
                    loading="lazy"
                >

                <span class="event-category-badge">
                    ${safeCategory}
                </span>

            </a>


            <div class="event-card-content">

                <div class="event-date">

                    <span class="event-date-icon">◷</span>

                    ${safeDate}

                    <span class="event-date-divider">·</span>

                    ${safeTime}

                    ${ratingMarkup}
                    
                </div>


                <h3>
                    <a
                        class="event-title-link"
                        href="${detailsUrl}"
                    >
                        ${safeTitle}
                    </a>
                </h3>


                <p class="event-description">
                    ${safeDescription}
                </p>


                <div class="event-location">

                    <span aria-hidden="true">⌖</span>

                    <span>
                        ${safeVenue},
                        ${safeCity},
                        ${safeCountry}
                    </span>

                </div>


                <div class="event-card-footer">

                    <span class="event-price">
                        ${safePrice}
                    </span>


                    <!-- SAVE EVENT BUTTON -->

                    <button
                        type="button"
                        class="wishlist-button ${isEventSaved ? "is-saved" : ""}"
                        data-wishlist-toggle
                        data-event-id="${safeId}"
                        aria-pressed="${isEventSaved}"
                        aria-label="${isEventSaved ? "Remove this event from saved events" : "Save this event"}"
                    >

                        <span aria-hidden="true">
                            ${saveButtonIcon}
                        </span>

                        <span class="wishlist-button-label">
                            ${saveButtonLabel}
                        </span>

                    </button>


                    <a
                        class="event-card-link"
                        href="${detailsUrl}"
                        aria-label="View details for ${safeTitle}"
                    >
                        View details
                        <span aria-hidden="true">↗</span>
                    </a>

                </div>

            </div>

        </article>
    `;

}


/* =========================================
   08. GET FILTERED EVENTS
   ========================================= */

function getFilteredEvents() {

    const searchTerm = eventSearch
        ? eventSearch.value.trim().toLowerCase()
        : "";

    const selectedCategory = categoryFilter
        ? categoryFilter.value
        : "all";

    const selectedLocation = locationFilter
        ? locationFilter.value
        : "all";

    const selectedSort = sortFilter
        ? sortFilter.value
        : "date-asc";


    let filteredEvents = events.filter(function (event) {

        const searchableText = [
            event.title,
            event.description,
            event.venue,
            event.city,
            event.country,
            event.categoryLabel
        ].join(" ").toLowerCase();


        const matchesSearch =
            searchableText.includes(searchTerm);


        const matchesCategory =
            selectedCategory === "all" ||
            event.category === selectedCategory;


        const matchesLocation =
            selectedLocation === "all" ||
            event.locationType === selectedLocation;


        return matchesSearch && matchesCategory && matchesLocation;

    });


    // Sort the results based on the selected option.

    if (selectedSort === "date-asc") {

        filteredEvents.sort(function (a, b) {
            return new Date(a.date) - new Date(b.date);
        });

    } else if (selectedSort === "date-desc") {

        filteredEvents.sort(function (a, b) {
            return new Date(b.date) - new Date(a.date);
        });

    } else if (selectedSort === "title-asc") {

        filteredEvents.sort(function (a, b) {
            return a.title.localeCompare(b.title);
        });

    }


    return filteredEvents;

}


/* =========================================
   09. DISPLAY EVENT CARDS
   ========================================= */

function displayEvents() {

    if (!eventGrid) {
        return;
    }

    const filteredEvents = getFilteredEvents();


    // Update the number of matching events.

    if (resultsCount) {

        const eventWord =
            filteredEvents.length === 1 ? "event" : "events";

        resultsCount.textContent =
            `Showing ${filteredEvents.length} ${eventWord}`;

    }


    // Display the empty state when there are no matches.

    if (noEventsMessage) {

        noEventsMessage.hidden = filteredEvents.length !== 0;

    }


    // Hide the event grid when no results are available.

    eventGrid.hidden = filteredEvents.length === 0;


    // Generate the event cards.

    eventGrid.innerHTML = filteredEvents
        .map(createEventCard)
        .join("");


    // Synchronise wishlist button states after rendering.

    if (
        window.EventHubWishlist &&
        typeof window.EventHubWishlist.syncButtons === "function"
    ) {

        window.EventHubWishlist.syncButtons(eventGrid);

    }

}


/* =========================================
   10. RESET FILTERS
   ========================================= */

function resetFilters() {

    if (eventSearch) {
        eventSearch.value = "";
    }

    if (categoryFilter) {
        categoryFilter.value = "all";
    }

    if (locationFilter) {
        locationFilter.value = "all";
    }

    if (sortFilter) {
        sortFilter.value = "date-asc";
    }

    displayEvents();

}


/* =========================================
   11. SEARCH INPUT
   ========================================= */

if (eventSearch) {

    eventSearch.addEventListener("input", displayEvents);

}


/* =========================================
   12. CATEGORY FILTER
   ========================================= */

if (categoryFilter) {

    categoryFilter.addEventListener("change", displayEvents);

}


/* =========================================
   13. LOCATION FILTER
   ========================================= */

if (locationFilter) {

    locationFilter.addEventListener("change", displayEvents);

}


/* =========================================
   14. SORTING
   ========================================= */

if (sortFilter) {

    sortFilter.addEventListener("change", displayEvents);

}


/* =========================================
   15. CLEAR FILTER BUTTON
   ========================================= */

if (clearFiltersButton) {

    clearFiltersButton.addEventListener("click", resetFilters);

}


if (resetSearchButton) {

    resetSearchButton.addEventListener("click", resetFilters);

}


/* =========================================
   16. INITIALIZE EVENT DISCOVERY
   ========================================= */

function initializeEventDiscovery() {

    if (!eventGrid) {
        return;
    }

    displayEvents();

}


/* =========================================
   17. APPLICATION INITIALIZATION
   ========================================= */

document.addEventListener("DOMContentLoaded", function () {

    closeMobileMenu();

    initializeEventDiscovery();

    console.log("EventHub application initialized.");

});
