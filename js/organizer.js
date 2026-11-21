
/* =====================================================
   EVENTHUB
   MANAGER / ORGANIZER DASHBOARD

   Frontend demonstration only.

   - Manager accounts are stored in localStorage.
   - Login sessions are stored in sessionStorage.
   - Events are stored in localStorage.
   - Only approved managers can access this dashboard.
   - New and edited events require admin approval.

   IMPORTANT:
   This is not a secure production authentication system.
   ===================================================== */


/* =====================================================
   01. STORAGE CONFIGURATION
   ===================================================== */

const ORGANIZER_STORAGE_KEY = "eventhub_demo_events";
const ORGANIZER_SESSION_KEY = "eventhub_demo_session";

const DEFAULT_EVENT_IMAGE =
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=85";

const CATEGORY_LABELS = {
    music: "Music & Concerts",
    arts: "Arts & Culture",
    business: "Business & Networking",
    workshops: "Workshops & Learning",
    food: "Food & Lifestyle",
    community: "Community & Social"
};


/* =====================================================
   02. SELECT PAGE ELEMENTS
   ===================================================== */

const organizerName = document.getElementById("organizerName");
const organizerEmail = document.getElementById("organizerEmail");

const totalEventsElement = document.getElementById("totalEvents");
const upcomingEventsElement = document.getElementById("upcomingEvents");

// Kept only for compatibility with the existing HTML.
// Visitor registration statistics are not used.
const totalRegistrationsElement =
    document.getElementById("totalRegistrations");

const eventFormPanel = document.getElementById("eventFormPanel");
const eventForm = document.getElementById("organizerEventForm");

const eventFormHeading = document.getElementById("eventFormHeading");
const saveEventButton = document.getElementById("saveEventButton");

const createEventButton = document.getElementById("createEventButton");
const emptyCreateEventButton =
    document.getElementById("emptyCreateEventButton");

const closeEventFormButton =
    document.getElementById("closeEventForm");

const cancelEventFormButton =
    document.getElementById("cancelEventForm");

const organizerEventList =
    document.getElementById("organizerEventList");

const organizerEmptyState =
    document.getElementById("organizerEmptyState");

const eventListCount =
    document.getElementById("eventListCount");

const organizerMessage =
    document.getElementById("organizerMessage");

const organizerLogoutButton =
    document.getElementById("organizerLogout");


/* =====================================================
   03. CURRENT MANAGER SESSION
   ===================================================== */

let currentOrganizer = null;


/*
   Read the current login session.

   EventHubAuth is provided by auth.js.
*/
function getOrganizerSession() {

    try {

        if (window.EventHubAuth) {
            return window.EventHubAuth.getSession();
        }

        const storedSession = sessionStorage.getItem(
            ORGANIZER_SESSION_KEY
        );

        return storedSession
            ? JSON.parse(storedSession)
            : null;

    } catch (error) {

        console.error(
            "Unable to read the manager session.",
            error
        );

        return null;
    }
}


/* =====================================================
   04. MANAGER ROLE AND APPROVAL CHECK
   ===================================================== */

function initializeOrganizerSession() {

    const auth = window.EventHubAuth;

    /*
       Only approved managers can access this dashboard.

       requireRole() also checks the saved account status.
    */

    if (!auth || !auth.requireRole("manager")) {
        return false;
    }

    const session = getOrganizerSession();

    if (
        !session ||
        !session.email ||
        !session.name ||
        session.role !== "manager"
    ) {

        window.location.replace("auth.html");

        return false;
    }

    currentOrganizer = session;

    // Display the manager's account details.
    if (organizerName) {
        organizerName.textContent = session.name;
    }

    if (organizerEmail) {
        organizerEmail.textContent = session.email;
    }

    return true;
}


/* =====================================================
   05. STORAGE HELPERS
   ===================================================== */


/*
   Safely read all manager-created events.
*/
function getAllOrganizerEvents() {

    try {

        const storedEvents = localStorage.getItem(
            ORGANIZER_STORAGE_KEY
        );

        if (!storedEvents) {
            return [];
        }

        const parsedEvents = JSON.parse(storedEvents);

        return Array.isArray(parsedEvents)
            ? parsedEvents
            : [];

    } catch (error) {

        console.error(
            "Unable to read organizer events.",
            error
        );

        return [];
    }
}


/*
   Save manager-created events.
*/
function saveAllOrganizerEvents(events) {

    try {

        localStorage.setItem(
            ORGANIZER_STORAGE_KEY,
            JSON.stringify(events)
        );

        return true;

    } catch (error) {

        console.error(
            "Unable to save organizer events.",
            error
        );

        showOrganizerMessage(
            "Unable to save your event. Browser storage may be unavailable.",
            "error"
        );

        return false;
    }
}


/*
   Return only events belonging to the current manager.

   Managers cannot manage another manager's events
   through the normal dashboard interface.
*/
function getMyEvents() {

    if (!currentOrganizer || !currentOrganizer.email) {
        return [];
    }

    const myEmail = currentOrganizer.email.toLowerCase();

    return getAllOrganizerEvents().filter(event => {

        return (
            event.ownerEmail &&
            event.ownerEmail.toLowerCase() === myEmail
        );

    });
}


/* =====================================================
   06. FEEDBACK MESSAGES
   ===================================================== */

function showOrganizerMessage(message, type = "success") {

    if (!organizerMessage) {
        console.log(message);
        return;
    }

    organizerMessage.textContent = message;

    organizerMessage.className =
        "organizer-message " + type;

    organizerMessage.hidden = false;

    organizerMessage.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
    });
}


function clearOrganizerMessage() {

    if (!organizerMessage) {
        return;
    }

    organizerMessage.textContent = "";

    organizerMessage.hidden = true;

    organizerMessage.className = "organizer-message";
}


/* =====================================================
   07. FORM HELPERS
   ===================================================== */

function getFormValue(id) {

    const element = document.getElementById(id);

    return element ? element.value.trim() : "";
}


/*
   Convert 24-hour time into a readable 12-hour format.
*/
function formatTime(timeValue) {

    if (!timeValue) {
        return "";
    }

    const parts = timeValue.split(":");

    if (parts.length !== 2) {
        return timeValue;
    }

    const hours = Number(parts[0]);
    const minutes = parts[1];

    const period = hours >= 12 ? "PM" : "AM";

    const displayHours = hours % 12 || 12;

    return displayHours + ":" + minutes + " " + period;
}


/*
   Convert stored 12-hour time into an HTML time input value.
*/
function convertToTimeInput(timeValue) {

    if (!timeValue) {
        return "";
    }

    const match = timeValue.match(
        /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i
    );

    if (!match) {
        return "";
    }

    let hours = Number(match[1]);

    const minutes = match[2];

    const period = match[3].toUpperCase();

    if (period === "PM" && hours !== 12) {
        hours += 12;
    }

    if (period === "AM" && hours === 12) {
        hours = 0;
    }

    return (
        String(hours).padStart(2, "0") +
        ":" +
        minutes
    );
}


/*
   Format an event date for display.
*/
function formatEventDate(dateValue) {

    if (!dateValue) {
        return "Date unavailable";
    }

    const date = new Date(dateValue + "T00:00:00");

    if (Number.isNaN(date.getTime())) {
        return "Date unavailable";
    }

    return new Intl.DateTimeFormat("en", {
        day: "numeric",
        month: "short",
        year: "numeric"
    }).format(date);
}


/*
   Get today's date in YYYY-MM-DD format.
*/
function getTodayDate() {

    const today = new Date();

    const year = today.getFullYear();

    const month = String(
        today.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        today.getDate()
    ).padStart(2, "0");

    return year + "-" + month + "-" + day;
}


/*
   Create a unique event ID.
*/
function createEventId() {

    if (
        window.crypto &&
        typeof window.crypto.randomUUID === "function"
    ) {
        return window.crypto.randomUUID();
    }

    return "event-" + Date.now() + "-" +
        Math.random().toString(36).slice(2, 9);
}


/* =====================================================
   08. OPEN AND CLOSE EVENT FORM
   ===================================================== */

let editingEventId = null;


/*
   Open the form for creating a new event.
*/
function openEventForm() {

    clearOrganizerMessage();

    editingEventId = null;

    if (!eventForm || !eventFormPanel) {
        return;
    }

    eventForm.reset();

    if (eventFormHeading) {
        eventFormHeading.textContent = "Create a new event";
    }

    if (saveEventButton) {
        saveEventButton.textContent = "Submit event";
    }

    const dateInput = document.getElementById("eventDate");

    if (dateInput) {
        dateInput.min = getTodayDate();
    }

    eventFormPanel.hidden = false;

    eventFormPanel.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


/*
   Close the form and reset editing mode.
*/
function closeEventForm() {

    if (eventForm) {
        eventForm.reset();
    }

    if (eventFormPanel) {
        eventFormPanel.hidden = true;
    }

    editingEventId = null;

    if (eventFormHeading) {
        eventFormHeading.textContent = "Create a new event";
    }

    if (saveEventButton) {
        saveEventButton.textContent = "Submit event";
    }

    clearOrganizerMessage();
}


/* =====================================================
   09. EVENT FORM DATA
   ===================================================== */

function getEventFormData() {

    const category = getFormValue("eventCategory");

    const date = getFormValue("eventDate");

    const image = getFormValue("eventImage");

    return {

        title: getFormValue("eventTitle"),

        description: getFormValue("eventDescription"),

        category: category,

        categoryLabel:
            CATEGORY_LABELS[category] || "Other",

        date: date,

        time: formatTime(
            getFormValue("eventTime")
        ),

        venue: getFormValue("eventVenue"),

        city: getFormValue("eventCity"),

        country: getFormValue("eventCountry"),

        locationType:
            getFormValue("eventLocationType"),

        price: getFormValue("eventPrice"),

        image: image || DEFAULT_EVENT_IMAGE

    };
}


/* =====================================================
   10. CREATE EVENT
   ===================================================== */

function createOrganizerEvent(eventData) {

    if (!currentOrganizer) {
        return false;
    }

    const allEvents = getAllOrganizerEvents();

    const newEvent = {

        id: createEventId(),

        ...eventData,

        ownerEmail: currentOrganizer.email,

        ownerName: currentOrganizer.name,

        createdAt: new Date().toISOString(),

        updatedAt: null,

        /*
           Every new event must be reviewed by the admin.
        */
        status: "pending"

    };

    allEvents.push(newEvent);

    return saveAllOrganizerEvents(allEvents);
}


/* =====================================================
   11. UPDATE EVENT
   ===================================================== */

function updateOrganizerEvent(eventId, eventData) {

    const allEvents = getAllOrganizerEvents();

    const myEmail = currentOrganizer.email.toLowerCase();

    const eventIndex = allEvents.findIndex(event => {

        return (
            String(event.id) === String(eventId) &&
            event.ownerEmail &&
            event.ownerEmail.toLowerCase() === myEmail
        );

    });

    if (eventIndex === -1) {

        showOrganizerMessage(
            "This event could not be found in your collection.",
            "error"
        );

        return false;
    }

    allEvents[eventIndex] = {

        ...allEvents[eventIndex],

        ...eventData,

        updatedAt: new Date().toISOString(),

        /*
           An edited event returns to pending status.
           The administrator must review it again.
        */
        status: "pending"

    };

    return saveAllOrganizerEvents(allEvents);
}


/* =====================================================
   12. FORM SUBMISSION
   ===================================================== */

function handleEventFormSubmit(event) {

    event.preventDefault();

    clearOrganizerMessage();

    if (!currentOrganizer) {
        return;
    }

    const eventData = getEventFormData();

    // Basic required-field validation.
    if (
        !eventData.title ||
        !eventData.description ||
        !eventData.category ||
        !eventData.date ||
        !eventData.venue ||
        !eventData.city ||
        !eventData.country
    ) {

        showOrganizerMessage(
            "Please complete all required event information.",
            "error"
        );

        return;
    }

    // Do not accept past dates.
    if (eventData.date < getTodayDate()) {

        showOrganizerMessage(
            "Please select today or a future date.",
            "error"
        );

        return;
    }

    let saved = false;

    const wasEditing = editingEventId !== null;

    if (wasEditing) {

        saved = updateOrganizerEvent(
            editingEventId,
            eventData
        );

    } else {

        saved = createOrganizerEvent(eventData);

    }

    if (!saved) {
        return;
    }

    closeEventForm();

    renderOrganizerDashboard();

    showOrganizerMessage(
        wasEditing
            ? "Your changes have been submitted for administrator review."
            : "Your event has been submitted. It will appear publicly after administrator approval.",
        "success"
    );
}


/* =====================================================
   13. EDIT EVENT
   ===================================================== */

function editOrganizerEvent(eventId) {

    const selectedEvent = getMyEvents().find(event => {

        return String(event.id) === String(eventId);

    });

    if (!selectedEvent) {

        showOrganizerMessage(
            "You can only edit events created by your account.",
            "error"
        );

        return;
    }

    clearOrganizerMessage();

    editingEventId = selectedEvent.id;

    /*
       Populate the form with the selected event's data.
    */

    const fields = {

        eventTitle: selectedEvent.title,

        eventDescription: selectedEvent.description,

        eventCategory: selectedEvent.category,

        eventPrice: selectedEvent.price,

        eventDate: selectedEvent.date,

        eventTime: convertToTimeInput(selectedEvent.time),

        eventVenue: selectedEvent.venue,

        eventCity: selectedEvent.city,

        eventCountry: selectedEvent.country,

        eventLocationType: selectedEvent.locationType,

        eventImage:
            selectedEvent.image === DEFAULT_EVENT_IMAGE
                ? ""
                : selectedEvent.image

    };

    Object.entries(fields).forEach(([id, value]) => {

        const field = document.getElementById(id);

        if (field) {
            field.value = value || "";
        }

    });

    if (eventFormHeading) {
        eventFormHeading.textContent = "Edit your event";
    }

    if (saveEventButton) {
        saveEventButton.textContent = "Submit changes";
    }

    if (eventFormPanel) {

        eventFormPanel.hidden = false;

        eventFormPanel.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}


/* =====================================================
   14. DELETE EVENT
   ===================================================== */

function deleteOrganizerEvent(eventId) {

    const selectedEvent = getMyEvents().find(event => {

        return String(event.id) === String(eventId);

    });

    if (!selectedEvent) {

        showOrganizerMessage(
            "You can only delete events created by your account.",
            "error"
        );

        return;
    }

    const confirmed = window.confirm(
        'Delete "' + selectedEvent.title + '" from your events?'
    );

    if (!confirmed) {
        return;
    }

    const remainingEvents = getAllOrganizerEvents().filter(event => {

        return String(event.id) !== String(eventId);

    });

    if (!saveAllOrganizerEvents(remainingEvents)) {
        return;
    }

    renderOrganizerDashboard();

    showOrganizerMessage(
        "The event has been deleted from your collection.",
        "success"
    );
}


/* =====================================================
   15. CREATE EVENT CARD
   ===================================================== */

function createEventCard(event) {

    const article = document.createElement("article");

    article.className = "organizer-event-card";


    /* Event image */

    const image = document.createElement("img");

    image.className = "organizer-event-image";

    image.src = event.image || DEFAULT_EVENT_IMAGE;

    image.alt = event.title
        ? event.title + " event image"
        : "Event image";

    image.loading = "lazy";

    image.addEventListener("error", function () {

        image.src = DEFAULT_EVENT_IMAGE;

    });


    /* Main content */

    const content = document.createElement("div");

    content.className = "organizer-event-content";


    /* Category */

    const category = document.createElement("span");

    category.className = "organizer-event-category";

    category.textContent =
        event.categoryLabel || "Event";


    /* Approval status */

    const status = document.createElement("span");

    const eventStatus = event.status || "approved";

    status.className =
        "organizer-event-status status-" + eventStatus;

    status.textContent =
        eventStatus.charAt(0).toUpperCase() +
        eventStatus.slice(1);


    /* Event title */

    const title = document.createElement("h4");

    title.textContent = event.title || "Untitled event";


    /* Description */

    const description = document.createElement("p");

    description.className = "organizer-event-description";

    description.textContent =
        event.description || "";


    /* Event metadata */

    const metadata = document.createElement("div");

    metadata.className = "organizer-event-meta";


    const date = document.createElement("span");

    date.textContent = formatEventDate(event.date);


    const location = document.createElement("span");

    location.textContent = [
        event.city,
        event.country
    ].filter(Boolean).join(", ");


    const price = document.createElement("span");

    price.textContent = event.price || "Price not specified";


    metadata.append(
        date,
        location,
        price
    );


    /* Event action buttons */

    const actions = document.createElement("div");

    actions.className = "organizer-event-actions";


    // Preview event.
    const viewLink = document.createElement("a");

    viewLink.className = "organizer-view-link";

    viewLink.href =
        "event-details.html?id=" +
        encodeURIComponent(event.id);

    viewLink.textContent = "View event";


    // Edit event.
    const editButton = document.createElement("button");

    editButton.type = "button";

    editButton.className = "organizer-edit-button";

    editButton.textContent = "Edit";

    editButton.addEventListener("click", function () {

        editOrganizerEvent(event.id);

    });


    // Delete event.
    const deleteButton = document.createElement("button");

    deleteButton.type = "button";

    deleteButton.className = "organizer-delete-button";

    deleteButton.textContent = "Delete";

    deleteButton.addEventListener("click", function () {

        deleteOrganizerEvent(event.id);

    });


    actions.append(
        viewLink,
        editButton,
        deleteButton
    );


    /*
       Arrange all card elements.
    */

    content.append(
        category,
        status,
        title,
        description,
        metadata,
        actions
    );

    article.append(
        image,
        content
    );

    return article;
}


/* =====================================================
   16. DASHBOARD STATISTICS
   ===================================================== */

function updateOrganizerStatistics(events) {

    const today = getTodayDate();

    const upcomingEvents = events.filter(event => {

        return event.date >= today;

    });

    const pendingEvents = events.filter(event => {

        return event.status === "pending";

    });

    if (totalEventsElement) {
        totalEventsElement.textContent = events.length;
    }

    if (upcomingEventsElement) {
        upcomingEventsElement.textContent =
            upcomingEvents.length;
    }

    /*
       The previous project had a registration statistic.

       Normal user accounts and visitor registrations are
       outside the current project requirements.

       Hide that statistic if the old HTML still contains it.
    */

    if (totalRegistrationsElement) {

        const registrationCard =
            totalRegistrationsElement.closest(
                ".organizer-stat-card, .dashboard-stat-card, .stat-card"
            );

        if (registrationCard) {
            registrationCard.hidden = true;
        }
    }

    // Update pending count if the HTML has this optional element.
    const pendingElement =
        document.getElementById("pendingEvents");

    if (pendingElement) {
        pendingElement.textContent = pendingEvents.length;
    }
}


/* =====================================================
   17. RENDER EVENT COLLECTION
   ===================================================== */

function renderOrganizerEvents(events) {

    if (!organizerEventList) {
        return;
    }

    organizerEventList.replaceChildren();

    if (eventListCount) {

        eventListCount.textContent =
            events.length +
            (events.length === 1 ? " event" : " events");
    }

    if (organizerEmptyState) {
        organizerEmptyState.hidden = events.length !== 0;
    }

    if (events.length === 0) {
        return;
    }

    /*
       Sort events by date.
    */

    const sortedEvents = [...events].sort((first, second) => {

        return (first.date || "").localeCompare(
            second.date || ""
        );

    });

    sortedEvents.forEach(event => {

        organizerEventList.appendChild(
            createEventCard(event)
        );

    });
}


/* =====================================================
   18. RENDER MANAGER DASHBOARD
   ===================================================== */

function renderOrganizerDashboard() {

    if (!currentOrganizer) {
        return;
    }

    const myEvents = getMyEvents();

    updateOrganizerStatistics(myEvents);

    renderOrganizerEvents(myEvents);
}


/* =====================================================
   19. MANAGER LOGOUT
   ===================================================== */

function logoutOrganizer() {

    if (window.EventHubAuth) {

        window.EventHubAuth.logout();

    } else {

        sessionStorage.removeItem(
            ORGANIZER_SESSION_KEY
        );

        window.location.replace("auth.html");
    }
}


/* =====================================================
   20. INITIALIZE DASHBOARD
   ===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    /*
       Check manager permission before rendering
       any dashboard information.
    */

    if (!initializeOrganizerSession()) {
        return;
    }

    // Display current year if the element exists.
    const currentYear = document.getElementById("currentYear");

    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }

    // Set minimum event date.
    const eventDateInput =
        document.getElementById("eventDate");

    if (eventDateInput) {
        eventDateInput.min = getTodayDate();
    }

    // Connect form submission.
    if (eventForm) {

        eventForm.addEventListener(
            "submit",
            handleEventFormSubmit
        );
    }

    // Connect create buttons.
    createEventButton?.addEventListener(
        "click",
        openEventForm
    );

    emptyCreateEventButton?.addEventListener(
        "click",
        openEventForm
    );

    // Connect close buttons.
    closeEventFormButton?.addEventListener(
        "click",
        closeEventForm
    );

    cancelEventFormButton?.addEventListener(
        "click",
        closeEventForm
    );

    // Connect logout button.
    organizerLogoutButton?.addEventListener(
        "click",
        logoutOrganizer
    );

    // Render the manager's events.
    renderOrganizerDashboard();

});
