# 🎟️ EventHub – Smart Event Management & Discovery Platform

<p align="center">
  <img src="eventhub.png" alt="EventHub Application Preview" width="100%">
</p>

<p align="center">
  <strong>Discover. Organize. Manage. Experience Events.</strong>
</p>

<p align="center">
  A modern frontend-based event discovery and management platform designed to connect event visitors, event managers, and administrators through a unified digital experience.
</p>

---

## 📌 Overview

**EventHub** is a Smart Event Management & Discovery Platform designed to simplify event discovery and event administration.

The platform provides a centralized interface where visitors can explore available events, event managers can submit and manage event listings, and administrators can review manager applications and moderate submitted events.

EventHub focuses on a clean, intuitive, and responsive user interface while demonstrating role-based workflows using frontend technologies.

The application is developed as a **frontend-only demonstration project**, with browser storage used to simulate account sessions and application data.

## ✨ Key Features

### 🔎 Event Discovery

- Explore available events through a centralized platform.
- Browse event information and details.
- Discover events through an organized interface.
- Access the public event discovery experience without creating a visitor account.

### 🧑‍💼 Event Manager Registration

- Submit an application to become an event manager.
- Provide manager account information through a registration form.
- Wait for administrator approval before accessing the manager dashboard.
- Prevent unapproved managers from accessing management features.

### 📋 Event Management

- Access the manager dashboard after approval.
- Submit new event listings.
- View and manage submitted events.
- Edit existing event information.
- Delete event listings.

### 🛡️ Administrator Dashboard

- Access the administrator dashboard.
- Review event manager applications.
- Approve or reject manager applications.
- View manager information.
- Review submitted events.
- Manage event moderation.

### 📊 Analytics Dashboard

- View platform-level event statistics.
- Review event approval statuses.
- Explore event category distribution.
- View organizer activity and platform insights.
- Display demonstration analytics using browser-stored data.

### 🎨 User Interface

- Modern and consistent visual design.
- Responsive layouts for different screen sizes.
- Clear navigation and organized page sections.
- Consistent typography, colors, and interface components.

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| HTML5 | Web page structure and semantic markup |
| CSS3 | Styling, layouts, and responsive design |
| JavaScript (ES6+) | Frontend functionality and application logic |
| localStorage | Browser-based demonstration data storage |
| sessionStorage | Temporary browser session management |
| Git | Version control |
| GitHub | Source code hosting and project collaboration |
| Visual Studio Code | Development environment |

## 🏗️ System Architecture

EventHub follows a **client-side frontend architecture**.

```text
              VISITOR
                 |
                 v
          EVENTHUB WEBSITE
                 |
       +---------+----------+
       |         |          |
       v         v          v
   DISCOVERY  MANAGER    ADMINISTRATOR
              PORTAL       PORTAL
       |         |          |
       |         |          |
       v         v          v
    EVENT     EVENT      APPLICATION
   BROWSING  MANAGEMENT   APPROVAL
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

The application uses JavaScript to handle frontend interactions, account workflows, event management, and administrator operations.

Browser storage is used to simulate persistent application data and temporary login sessions.

**Note:** EventHub does not currently use a backend server or an external database. Browser storage is used only for demonstration purposes.

## 🔐 User Roles & Access Control

EventHub provides two dashboard roles and a public visitor experience.

| Role | Access |
|---|---|
| Visitor | Browse and discover available events |
| Event Manager | Register, receive approval, and manage events |
| Administrator | Manage manager applications and moderate all events |

### Event Manager Approval Workflow

1. A prospective event manager submits a registration application.
2. The application is stored in browser storage.
3. The administrator reviews the application.
4. The administrator approves or rejects the application.
5. Approved managers can access the manager dashboard.
6. Approved managers can manage their event listings.

### Administrator Responsibilities

- Review manager applications.
- Approve or reject applications.
- View manager information.
- Review and manage event listings.
- Access platform analytics.

## 📂 Project Structure

```text
EventHub/
│
├── index.html
├── events.html
├── event-details.html
├── auth.html
├── account.html
├── organizer.html
├── admin.html
├── analytics.html
├── reminders.html
│
├── css/
│   └── style.css
│
├── js/
│   ├── storage.js
│   ├── app.js
│   ├── auth.js
│   ├── events.js
│   ├── organizer.js
│   ├── admin.js
│   └── analytics.js
│
├── eventhub.png
├── .gitignore
└── README.md
```

*Note: This structure represents the main application files. Keep only the HTML pages and JavaScript files that actually exist in your project.*

## ⚙️ Installation & Setup

Follow these steps to run EventHub locally.

### Prerequisites

Make sure you have:

- A modern web browser (Chrome, Edge, Firefox, etc.).
- Visual Studio Code or another code editor.
- Git installed on your computer.

No Node.js, npm, backend server, or database installation is required.

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

Navigate into the project directory:

```bash
cd EventHub
```

### 2. Open the Project

Open the project folder in Visual Studio Code:

```bash
code .
```

Alternatively, open the folder directly through Visual Studio Code.

### 3. Run the Application

Open `index.html` in your browser.

For a more convenient development experience, you can use the **Live Server** extension in Visual Studio Code.

1. Install the Live Server extension.
2. Open `index.html`.
3. Right-click inside the editor.
4. Select **Open with Live Server**.

The application will open in your default browser.

## 💾 Data Storage

EventHub uses browser storage for demonstration purposes.

| Storage | Purpose |
|---|---|
| localStorage | Store demonstration account and event data |
| sessionStorage | Maintain the current browser login session |

Data is stored locally in the browser and is not synchronized between different users or devices.

Clearing browser storage may remove demonstration data.

## 🎯 Project Objectives

- Develop a centralized event discovery experience.
- Simplify event manager registration and approval workflows.
- Provide event managers with event management functionality.
- Give administrators control over manager applications and event moderation.
- Create a modern and responsive user interface.
- Demonstrate JavaScript-based role workflows without requiring a backend.

## 🚀 Future Enhancements

- Backend API integration.
- Secure server-side authentication and authorization.
- Database integration for persistent application data.
- Cloud-based event image storage.
- Advanced event search and filtering.
- Improved platform reporting and analytics.
- Deployment to a production hosting environment.

## ⚠️ Important Notice

EventHub is a frontend demonstration project.

Authentication, account information, and application data are handled using browser storage. This implementation is not suitable for production authentication or sensitive information.

A production version would require secure server-side authentication, authorization, validation, and database management.

## 👩‍💻 Author

**Kavithma Herath**

EventHub – Smart Event Management & Discovery Platform

---

<p align="center">
  <strong>EventHub – Discover Events. Connect Experiences.</strong>
</p>