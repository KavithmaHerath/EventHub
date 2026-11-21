# 🎟️ EventHub – Smart Event Management & Discovery Platform

<p align="center">
  <img src="images/eventhub.png" alt="EventHub" width="100%">
</p>

## 📌 Overview

EventHub is a web-based event discovery and management platform built with HTML, CSS, and JavaScript. It provides three levels of access: visitors, event managers, and administrators.

The platform enables visitors to discover events, managers to create and manage event listings, and administrators to approve managers and oversee event activities.

## ✨ Core Features

- **Event Discovery:** Browse events and view event details.
- **Manager Registration:** Apply for event manager access.
- **Manager Approval:** Administrators review and approve or reject applications.
- **Event Management:** Approved managers can create, edit, view, and delete their events.
- **Event Moderation:** Administrators can review and manage submitted events.
- **Analytics:** View event statistics, approval statuses, and category distribution.

## 🛠️ Technologies

- HTML
- CSS
- JavaScript
- Git and GitHub

## 👥 User Roles

| Role | Main Functions |
|---|---|
| Visitor | Discover and view events |
| Event Manager | Manage event listings after approval |
| Administrator | Approve managers and moderate events |

## 🔄 Manager Approval Process

1. Manager submits a registration application.
2. Administrator reviews the application.
3. Administrator approves or rejects the request.
4. Approved manager gains access to the dashboard.
5. Manager can manage event listings.

## 📂 Project Structure

```text
EventHub/
├── index.html
├── account.html
├── admin.html
├── analytics.html
├── auth.html
├── event-details.html
├── organizer.html
├── registration.html
├── saved-events.html
│
├── css/
│   └── style.css
│
├── js/
│   ├── admin.js
│   ├── analytics.js
│   ├── app.js
│   ├── auth.js
│   ├── event-details.js
│   ├── events.js
│   ├── notifications.js
│   ├── organizer.js
│   ├── registration.js
│   ├── reviews.js
│   ├── storage.js
│   └── wishlist.js
│
├── images/
│   ├── eventhub.png
│   └── hero-event.jpg
│
├── .gitignore
└── README.md
```

## ⚙️ Installation & Execution

**1. Clone the repository**

```bash
git clone https://github.com/KavithmaHerath/EventHub.git
```

**2. Open the project directory**

```bash
cd EventHub
```

**3. Open in Visual Studio Code**

```bash
code .
```

**4. Run the application**

Open `index.html` in a browser or use the Visual Studio Code Live Server extension.

## 💾 Data Management

The application uses browser storage:

- `localStorage` – Stores demonstration application and event data.
- `sessionStorage` – Maintains the current login session.

Data is stored locally in the browser. There is no backend server or external database.

## 🚀 Future Development

- Backend and database integration.
- Secure server-side authentication.
- Advanced event search and filtering.
- Cloud image storage.
- Expanded analytics and reporting.

## ⚠️ Project Note

EventHub is a frontend demonstration project. Authentication and data management are simulated using browser storage and are not suitable for production use or sensitive information.

## 👩‍💻 Author

**Kavithma Herath**

EventHub – Smart Event Management & Discovery Platform
