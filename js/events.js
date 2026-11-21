
/* =====================================================
   EVENTHUB
   EVENT DATA MANAGEMENT

   Features:
   1. Sample event data
   2. Manager-created event data
   3. Administrator event edits
   4. Administrator event deletions
   5. Public event filtering

   Public visitors:
   - Can view approved events.
   - Do not need an account.

   Managers:
   - Can create events after approval.
   - New events remain pending until Admin approval.

   Administrator:
   - Can view all events.
   - Can approve or reject event submissions.
   - Can edit and delete events.

   IMPORTANT:
   This is a frontend-only project.
   Data is stored in browser localStorage.
   ===================================================== */


/* =====================================================
   1. STORAGE KEYS
   ===================================================== */

const EVENTHUB_STORAGE_KEYS = {

    organizerEvents: "eventhub_demo_events",

    adminOverrides: "eventhub_admin_event_overrides",

    adminDeleted: "eventhub_admin_deleted_events"

};


/* =====================================================
   2. SAMPLE EVENT DATA

   These are sample events for the project.
   They are not verified real-world events.
   ===================================================== */

const EVENTHUB_SAMPLE_EVENTS = [

    {
        id: 1,

        title: "Colombo Music Nights",

        category: "music",

        categoryLabel: "Music & Concerts",

        description:
            "An evening of live performances, independent artists, and great music.",

        date: "2026-12-12",

        time: "6:00 PM",

        venue: "Viharamahadevi Open Air Theatre",

        city: "Colombo",

        country: "Sri Lanka",

        locationType: "sri-lanka",

        price: "LKR 2,500",

        image:
            "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=85"

    },


    {
        id: 2,

        title: "Creative Minds Exhibition",

        category: "arts",

        categoryLabel: "Arts & Culture",

        description:
            "Explore contemporary artwork, creative installations, and emerging artistic talent.",

        date: "2026-12-18",

        time: "10:00 AM",

        venue: "Colombo Art Gallery",

        city: "Colombo",

        country: "Sri Lanka",

        locationType: "sri-lanka",

        price: "Free entry",

        image:
            "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=900&q=85"

    },


    {
        id: 3,

        title: "Future of Business Forum",

        category: "business",

        categoryLabel: "Business & Networking",

        description:
            "A professional gathering focused on entrepreneurship, technology, and new business ideas.",

        date: "2027-01-09",

        time: "9:00 AM",

        venue: "Colombo Conference Centre",

        city: "Colombo",

        country: "Sri Lanka",

        locationType: "sri-lanka",

        price: "LKR 4,000",

        image:
            "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=900&q=85"

    },


    {
        id: 4,

        title: "Photography Masterclass",

        category: "workshops",

        categoryLabel: "Workshops & Learning",

        description:
            "A practical learning experience covering visual storytelling and creative photography.",

        date: "2027-01-16",

        time: "2:00 PM",

        venue: "Creative Studio",

        city: "Kandy",

        country: "Sri Lanka",

        locationType: "sri-lanka",

        price: "LKR 3,000",

        image:
            "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&w=900&q=85"

    },


    {
        id: 5,

        title: "Taste & Culture Festival",

        category: "food",

        categoryLabel: "Food & Lifestyle",

        description:
            "Discover different flavours, food traditions, and local culinary creativity.",

        date: "2027-01-23",

        time: "11:00 AM",

        venue: "Galle Face Green",

        city: "Colombo",

        country: "Sri Lanka",

        locationType: "sri-lanka",

        price: "Free entry",

        image:
            "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=900&q=85"

    },


    {
        id: 6,

        title: "Community Connections Day",

        category: "community",

        categoryLabel: "Community & Social",

        description:
            "Meet new people, share ideas, and take part in a community-focused gathering.",

        date: "2027-02-06",

        time: "10:00 AM",

        venue: "Independence Square",

        city: "Colombo",

        country: "Sri Lanka",

        locationType: "sri-lanka",

        price: "Free entry",

        image:
            "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=900&q=85"

    },


    {
        id: 7,

        title: "Global Design Conference",

        category: "business",

        categoryLabel: "Business & Networking",

        description:
            "Explore design thinking, digital innovation, and creative industry perspectives.",

        date: "2027-02-14",

        time: "9:30 AM",

        venue: "Marina Bay Conference Centre",

        city: "Singapore",

        country: "Singapore",

        locationType: "international",

        price: "SGD 80",

        image:
            "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=85"

    },


    {
        id: 8,

        title: "International Music Festival",

        category: "music",

        categoryLabel: "Music & Concerts",

        description:
            "A sample international festival featuring a variety of musical styles and performances.",

        date: "2027-03-05",

        time: "5:00 PM",

        venue: "Sydney Harbour Event Grounds",

        city: "Sydney",

        country: "Australia",

        locationType: "international",

        price: "AUD 65",

        image:
            "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=900&q=85"

    },


    {
        id: 9,

        title: "Creative Writing Workshop",

        category: "workshops",

        categoryLabel: "Workshops & Learning",

        description:
            "Develop storytelling skills and explore new approaches to creative writing.",

        date: "2027-03-13",

        time: "1:00 PM",

        venue: "The Learning Studio",

        city: "London",

        country: "United Kingdom",

        locationType: "international",

        price: "GBP 35",

        image:
            "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=85"

    },


    {
        id: 10,

        title: "International Food Showcase",

        category: "food",

        categoryLabel: "Food & Lifestyle",

        description:
            "A sample culinary event celebrating food traditions and international flavours.",

        date: "2027-03-20",

        time: "12:00 PM",

        venue: "Melbourne Exhibition Centre",

        city: "Melbourne",

        country: "Australia",

        locationType: "international",

        price: "AUD 25",

        image:
            "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=85"

    }

];


/* =====================================================
   3. LOCAL STORAGE HELPER
   ===================================================== */

function getEventStorage(key) {

    try {

        const storedData = localStorage.getItem(key);

        if (!storedData) {
            return [];
        }

        const parsedData = JSON.parse(storedData);

        return Array.isArray(parsedData)
            ? parsedData
            : [];

    } catch (error) {

        console.error(
            "EventHub: Unable to read storage:",
            key,
            error
        );

        return [];

    }

}


/* =====================================================
   4. GET MANAGER-CREATED EVENTS
   ===================================================== */

function getOrganizerCreatedEvents() {

    return getEventStorage(
        EVENTHUB_STORAGE_KEYS.organizerEvents
    );

}


/* =====================================================
   5. GET ADMINISTRATOR EVENT OVERRIDES
   ===================================================== */

function getAdminEventOverrides() {

    return getEventStorage(
        EVENTHUB_STORAGE_KEYS.adminOverrides
    );

}


/* =====================================================
   6. GET DELETED EVENT IDS
   ===================================================== */

function getAdminDeletedEventIds() {

    return getEventStorage(
        EVENTHUB_STORAGE_KEYS.adminDeleted
    ).map(id => String(id));

}


/* =====================================================
   7. BUILD COMPLETE EVENT LIST

   Combines:
   - Sample events
   - Manager-created events
   - Administrator-edited event data

   Removes:
   - Administrator-deleted events
   ===================================================== */

function buildAllEventData() {

    const managerEvents = getOrganizerCreatedEvents();

    const overrides = getAdminEventOverrides();

    const deletedIds = getAdminDeletedEventIds();


    // Combine sample and manager-created events.
    const combinedEvents = [
        ...EVENTHUB_SAMPLE_EVENTS,
        ...managerEvents
    ];


    // Apply administrator edits.
    const updatedEvents = combinedEvents.map(event => {

        const override = overrides.find(item =>
            String(item.id) === String(event.id)
        );

        if (override) {

            return {
                ...event,
                ...override
            };

        }

        return event;

    });


    // Remove deleted events.
    const visibleToAdmin = updatedEvents.filter(event => {

        return !deletedIds.includes(
            String(event.id)
        );

    });


    return visibleToAdmin;

}


/* =====================================================
   8. ALL EVENTS

   Used by the administrator dashboard.

   Includes:
   - Approved events
   - Pending events
   - Rejected events
   ===================================================== */

window.EVENTHUB_ALL_EVENTS = buildAllEventData();


/* =====================================================
   9. PUBLIC EVENTS

   Public website visitors only see approved events.

   Sample events without a status are considered approved.
   ===================================================== */

window.EVENTHUB_EVENTS = window.EVENTHUB_ALL_EVENTS.filter(event => {

    return !event.status || event.status === "approved";

});


/* =====================================================
   10. OPTIONAL GLOBAL HELPER

   Other JavaScript files can use these functions.
   ===================================================== */

window.EventHubEvents = {

    getAll: function () {
        return buildAllEventData();
    },

    getPublic: function () {
        return buildAllEventData().filter(event => {
            return !event.status || event.status === "approved";
        });
    },

    getOrganizerCreated: function () {
        return getOrganizerCreatedEvents();
    },

    refresh: function () {

        window.EVENTHUB_ALL_EVENTS = buildAllEventData();

        window.EVENTHUB_EVENTS =
            window.EVENTHUB_ALL_EVENTS.filter(event => {
                return !event.status || event.status === "approved";
            });

        return window.EVENTHUB_ALL_EVENTS;

    }

};


/* =====================================================
   11. INITIALIZATION MESSAGE
   ===================================================== */

console.log(
    "EventHub events loaded:",
    window.EVENTHUB_ALL_EVENTS.length,
    "total events;",
    window.EVENTHUB_EVENTS.length,
    "public events."
);
