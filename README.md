# 🎟️ EventHub – Smart Event Management & Discovery Platform

<p align="center">
  <img src="images/eventhub.png" alt="EventHub Preview" width="100%">
</p>

<p align="center">
  **Discover. Organize. Manage. Experience Events.**
</p>

## 📌 Overview

EventHub is a frontend-based platform for event discovery and management. It provides dedicated functionality for visitors, event managers, and administrators.

## ✨ Key Features

- 🔎 **Event Discovery** – Browse events and view event details.
- 🧑‍💼 **Manager Registration** – Apply for event manager access.
- 📋 **Event Management** – Create, edit, view, and delete event listings.
- 🛡️ **Admin Dashboard** – Approve managers and moderate events.
- 📊 **Analytics** – View event statistics and platform activity.

## 🛠️ Technologies

| Technology | Purpose |
|---|---|
| HTML | Structure |
| CSS | Styling |
| JavaScript | Functionality |
| Git & GitHub | Version control |
| Visual Studio Code | Development |

## 🏗️ Architecture

EventHub uses a client-side architecture with JavaScript and browser storage.

```text
Visitors ───────> Event Discovery
Managers ───────> Event Management
Administrators ─> Application Approval
                         |
                         v
                  JavaScript Logic
                         |
                         v
                  Browser Storage
```

## 👥 User Roles

| Role | Access |
|---|---|
| Visitor | Discover events |
| Event Manager | Manage event listings after approval |
| Administrator | Manage applications and events |

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
├── css/
│   └── style.css
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
├── images/
│   ├── eventhub.png
│   └── hero-event.jpg
└── README.md
```

## ⚙️ Installation

**1. Clone the repository**

```bash
git clone https://github.com/KavithmaHerath/EventHub.git
```

**2. Open the project**

```bash
cd EventHub
code .
```

**3. Run the application**

Open `index.html` in a browser or use the VS Code Live Server extension.

## 💾 Data Storage

- `localStorage` – Stores demonstration account and event data.
- `sessionStorage` – Maintains browser session information.

## 🚀 Future Enhancements

- Backend and database integration.
- Secure authentication and authorization.
- Advanced event search and filtering.
- Cloud image storage.
- Enhanced analytics.

## ⚠️ Project Limitations

EventHub is a frontend demonstration project. It does not currently use a backend server or external database. Browser storage is used for demonstration data and is not suitable for production authentication or sensitive information.

## 👩‍💻 Author

**Kavithma Herath**
