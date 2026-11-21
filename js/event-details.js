
/* =========================================
   EVENTHUB
   Individual event details
   ========================================= */


/* =========================================
   01. SELECT ELEMENTS
   ========================================= */

const detailsLoading = document.getElementById("eventDetailsLoading");

const detailsContent = document.getElementById("eventDetailsContent");

const eventNotFound = document.getElementById("eventNotFound");

const shareEventButton = document.getElementById("shareEventButton");

const shareFeedback = document.getElementById("shareFeedback");


/* =========================================
   02. GET EVENT ID FROM URL
   ========================================= */

/*
    Example URL:

    event-details.html?id=1

    URLSearchParams reads the value after ?id=
*/

const urlParameters = new URLSearchParams(window.location.search);

const eventId = urlParameters.get("id");


/* =========================================
   03. GET EVENT DATA
   ========================================= */

const availableEvents = Array.isArray(window.EVENTHUB_EVENTS)
    ? window.EVENTHUB_EVENTS
    : [];


/* =========================================
   04. FIND THE SELECTED EVENT
   ========================================= */

function findSelectedEvent() {

    if (!eventId || !/^\d+$/.test(eventId)) {
        return null;
    }

    return availableEvents.find(function (event) {

        return String(event.id) === eventId;

    }) || null;

}


/* =========================================
   05. FORMAT DATE
   ========================================= */

function formatDetailsDate(dateValue) {

    const date = new Date(dateValue + "T00:00:00");

    if (Number.isNaN(date.getTime())) {
        return "Date to be announced";
    }

    return new Intl.DateTimeFormat("en", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    }).format(date);

}


/* =========================================
   06. SET TEXT CONTENT SAFELY
   ========================================= */

/*
    textContent treats event information as text.
    It avoids interpreting event data as HTML.
*/

function setText(elementId, value) {

    const element = document.getElementById(elementId);

    if (!element) {
        return;
    }

    element.textContent = value || "Information unavailable";

}


/* =========================================
   07. SHOW NOT FOUND MESSAGE
   ========================================= */

function showEventNotFound() {

    if (detailsLoading) {
        detailsLoading.hidden = true;
    }

    if (detailsContent) {
        detailsContent.hidden = true;
    }

    if (eventNotFound) {
        eventNotFound.hidden = false;
    }

    document.title = "Event Not Found | EventHub";

}


/* =========================================
   08. DISPLAY EVENT DETAILS
   ========================================= */

function displayEventDetails(event) {

    if (!event) {
        showEventNotFound();
        return;
    }


    // Update the page title.

    document.title = `${event.title} | EventHub`;


    // Display the event image.

    const detailImage = document.getElementById("detailImage");

    if (detailImage) {

        detailImage.src = event.image;

        detailImage.alt = event.title;

    }


    // Display category.

    setText("detailCategory", event.categoryLabel);


    // Display event title.

    setText("detailTitle", event.title);


    // Display event location.

    setText(
        "detailLocation",
        `${event.city}, ${event.country}`
    );


    // Display description.

    setText("detailDescription", event.description);


    // Display venue.

    setText("detailVenue", event.venue);


    setText(
        "detailFullLocation",
        `${event.city}, ${event.country}`
    );


    // Display event summary information.

    setText(
        "detailDate",
        formatDetailsDate(event.date)
    );


    setText("detailTime", event.time);

    setText("detailCity", `${event.city}, ${event.country}`);

    setText("detailPrice", event.price);


    // Make the event available to the share button.

    if (shareEventButton) {

        shareEventButton.dataset.eventTitle = event.title;

        shareEventButton.dataset.eventId = event.id;

    }


    // Show the finished page.

    if (detailsLoading) {
        detailsLoading.hidden = true;
    }

    if (eventNotFound) {
        eventNotFound.hidden = true;
    }

    if (detailsContent) {
        detailsContent.hidden = false;
    }

}


/* =========================================
   09. SHARE EVENT
   ========================================= */

async function shareEvent() {

    if (!shareEventButton) {
        return;
    }

    const title = shareEventButton.dataset.eventTitle;

    const id = shareEventButton.dataset.eventId;

    if (!title || !id) {
        return;
    }

    const eventUrl = new URL(
        `event-details.html?id=${encodeURIComponent(id)}`,
        window.location.href
    ).href;

    const shareData = {
        title: `${title} | EventHub`,
        text: `Take a look at this event on EventHub: ${title}`,
        url: eventUrl
    };


    try {

        if (navigator.share) {

            await navigator.share(shareData);

            if (shareFeedback) {
                shareFeedback.textContent = "Share options opened.";
            }

        } else if (navigator.clipboard && window.isSecureContext) {

            await navigator.clipboard.writeText(eventUrl);

            if (shareFeedback) {
                shareFeedback.textContent = "Event link copied to clipboard.";
            }

        } else {

            if (shareFeedback) {
                shareFeedback.textContent =
                    "Sharing is not supported in this browser. Copy the event URL from your address bar.";
            }

        }

    } catch (error) {

        if (error.name !== "AbortError" && shareFeedback) {

            shareFeedback.textContent =
                "Unable to share this event right now.";

        }

    }

}


/* =========================================
   10. SHARE BUTTON EVENT
   ========================================= */

if (shareEventButton) {

    shareEventButton.addEventListener("click", shareEvent);

}


/* =========================================
   11. INITIALIZE EVENT DETAILS PAGE
   ========================================= */

document.addEventListener("DOMContentLoaded", function () {

    const selectedEvent = findSelectedEvent();

    displayEventDetails(selectedEvent);

});
