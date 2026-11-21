# 🎟️ EventHub – Smart Event Management & Discovery Platform

<p align="center">
  <img src="images/eventhub.png" alt="EventHub Application Preview" width="100%">
</p>

<p align="center">
  **Discover. Organize. Manage. Experience Events.**
</p>

## 📌 Overview

EventHub is a frontend-based event discovery and management platform that connects visitors, event managers, and administrators through a centralized application.

Visitors can explore events, prospective event managers can apply for approval, approved managers can manage event listings, and administrators can review applications and moderate events.

The project uses HTML, CSS, and JavaScript, with browser storage to simulate application data and user sessions.

## ✨ Features

### 🔎 Event Discovery
- Browse available events.
- View event information and details.
- Explore events without creating an account.

### 🧑‍💼 Event Manager Registration
- Submit an application to become an event manager.
- Wait for administrator approval.
- Access management features after approval.

### 📋 Event Management
- Add new event listings.
- View and edit submitted events.
- Delete event listings.

### 🛡️ Administrator Dashboard
- Review event manager applications.
- Approve or reject applications.
- View manager information.
- Review and moderate event listings.

### 📊 Analytics Dashboard
- View event statistics.
- Monitor event approval statuses.
- Explore event category distribution.
- Review organizer activity and platform data.

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| HTML | Page structure |
| CSS | Styling and layouts |
| JavaScript | Application functionality |
| Git | Version control |
| GitHub | Source code hosting |
| Visual Studio Code | Development environment |

## 🏗️ System Architecture

EventHub uses a client-side architecture.

```text
              EVENTHUB
                 |
       +---------+----------+
       |         |          |
       v         v          v
   VISITORS   MANAGERS   ADMINISTRATORS
       |         |          |
       v         v          v
   EVENT      EVENT      APPLICATION
 DISCOVERY  MANAGEMENT   APPROVAL
                 |          |
                 +-----+----+
                       |
                       v
                JAVASCRIPT LOGIC
                       |
                       v
                BROWSER STORAGE
                 localStorage
                sessionStorage
```

The application uses JavaScript to manage user interactions, event operations, and role-based workflows. Data is stored in the browser for demonstration purposes.

## 👥 User Roles

| Role | Responsibilities |
|---|---|
| Visitor | Browse and discover events |
| Event Manager | Apply for approval and manage events |
| Administrator | Review applications and moderate events |

### 🔄 Event Manager Approval Workflow

1. A prospective manager submits an application.
2. The application is stored in browser storage.
3. The administrator reviews the application.
4. The administrator approves or rejects it.
5. Approved managers can access the manager dashboard.
6. Approved managers can manage their event listings.

## 📂 Project Structure

```text
EventHub/
│
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

## ⚙️ Installation and Setup

### 📋 Prerequisites

- A modern web browser.
- Visual Studio Code or another code editor.
- Git installed on your computer.

### 1. 📥 Clone the Repository

```bash
git clone https://github.com/KavithmaHerath/EventHub.git
```

### 2. 📁 Navigate to the Project

```bash
cd EventHub
```

### 3. 💻 Open in Visual Studio Code

```bash
code .
```

### 4. ▶️ Run the Application

Open `index.html` in your browser.

Alternatively, use the **Live Server** extension in Visual Studio Code:

1. Install Live Server.
2. Open `index.html`.
3. Right-click inside the editor.
4. Select **Open with Live Server**.

## 💾 Data Storage

EventHub uses browser storage to simulate application data.

| Storage | Purpose |
|---|---|
| localStorage | Store demonstration account and event data |
| sessionStorage | Maintain the current browser session |

Data is stored locally and is not synchronized between users or devices. Clearing browser storage may remove saved demonstration data.

## 🎯 Project Objectives

- Provide a centralized event discovery platform.
- Simplify event manager registration and approval.
- Support event creation and management.
- Allow administrators to moderate event listings.
- Demonstrate role-based workflows using JavaScript.

## 🚀 Future Enhancements

- Backend API integration.
- Secure server-side authentication and authorization.
- Database integration.
- Cloud-based image storage.
- Advanced event search and filtering.
- Enhanced analytics and reporting.
- Production deployment.

## ⚠️ Limitations

EventHub is a frontend demonstration project. It does not currently use a backend server or external database.

Authentication and application data are handled using browser storage. This implementation is not suitable for production authentication or storing sensitive information.

## 👩‍💻 Author

**Kavithma Herath**

**EventHub – Smart Event Management & Discovery Platform**
