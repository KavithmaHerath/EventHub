
/* =====================================================
   EVENTHUB - FRONTEND ROLE-BASED AUTHENTICATION
   Roles: admin, manager
   Public visitors do not need accounts.

   IMPORTANT:
   This is a browser-only demonstration.
   Passwords and account records are stored in localStorage.
   This is NOT secure authentication.
   ===================================================== */

(() => {
    "use strict";

    const USERS_KEY = "eventhub_demo_users";
    const SESSION_KEY = "eventhub_demo_session";

    // Demo administrator account.
    const ADMIN_EMAIL = "Email";
    const ADMIN_PASSWORD = "Password";

    const $ = id => document.getElementById(id);

    /* ---------- Storage helpers ---------- */

    function getUsers() {
        try {
            const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
            return Array.isArray(users) ? users : [];
        } catch {
            return [];
        }
    }

    function saveUsers(users) {
        try {
            localStorage.setItem(USERS_KEY, JSON.stringify(users));
            return true;
        } catch (error) {
            console.error("Could not save accounts:", error);
            return false;
        }
    }

    function getSession() {
        try {
            return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
        } catch {
            return null;
        }
    }

    function saveSession(user) {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        }));
    }

    function logout() {
        sessionStorage.removeItem(SESSION_KEY);
        window.location.replace("auth.html");
    }

    /* ---------- Create demo admin if needed ---------- */

    function ensureAdminAccount() {
        const users = getUsers();
        const email = ADMIN_EMAIL.toLowerCase();

        const existing = users.find(user =>
            user.email?.toLowerCase() === email
        );

        if (existing) {
            existing.name = "EventHub Administrator";
            existing.role = "admin";
            existing.status = "approved";
            existing.password = ADMIN_PASSWORD;
        } else {
            users.push({
                id: "admin-eventhub",
                name: "EventHub Administrator",
                email,
                password: ADMIN_PASSWORD,
                role: "admin",
                status: "approved",
                createdAt: new Date().toISOString()
            });
        }

        saveUsers(users);
    }

    /* ---------- Registration ---------- */

    function registerManager(name, email, password) {
        const users = getUsers();
        const normalizedEmail = email.trim().toLowerCase();

        if (normalizedEmail === ADMIN_EMAIL.toLowerCase()) {
            return {
                success: false,
                message: "This email address is reserved for the administrator."
            };
        }

        const exists = users.some(user =>
            user.email?.toLowerCase() === normalizedEmail
        );

        if (exists) {
            return {
                success: false,
                message: "An account with this email already exists."
            };
        }

        const manager = {
            id: "manager-" + Date.now(),
            name: name.trim(),
            email: normalizedEmail,
            password,
            role: "manager",
            status: "pending",
            createdAt: new Date().toISOString()
        };

        users.push(manager);

        if (!saveUsers(users)) {
            return {
                success: false,
                message: "Could not save your registration in this browser."
            };
        }

        return { success: true };
    }

    /* ---------- Login ---------- */

    function login(email, password) {
        const normalizedEmail = email.trim().toLowerCase();

        const user = getUsers().find(account =>
            account.email?.toLowerCase() === normalizedEmail
        );

        if (!user || user.password !== password) {
            return {
                success: false,
                message: "The email address or password is incorrect."
            };
        }

        if (user.role === "manager" && user.status !== "approved") {
            if (user.status === "rejected") {
                return {
                    success: false,
                    message: "Your manager application was not approved. Please contact the administrator."
                };
            }

            return {
                success: false,
                message: "Your manager application is waiting for administrator approval."
            };
        }

        if (user.role !== "admin" && user.role !== "manager") {
            return {
                success: false,
                message: "This account does not have dashboard access."
            };
        }

        saveSession(user);

        return { success: true, user };
    }

    /* ---------- Role-based page access ---------- */

    function requireRole(role) {
        const session = getSession();

        if (!session) {
            window.location.replace("auth.html");
            return false;
        }

        if (session.role !== role) {
            window.location.replace(
                session.role === "admin"
                    ? "admin.html"
                    : "organizer.html"
            );
            return false;
        }

        // Re-check account status on every dashboard visit.
        const account = getUsers().find(user =>
            user.email?.toLowerCase() === session.email?.toLowerCase()
        );

        if (!account || account.status !== "approved") {
            sessionStorage.removeItem(SESSION_KEY);
            window.location.replace("auth.html");
            return false;
        }

        return true;
    }

    /* ---------- Login / registration page ---------- */

    function initializeAuthPage() {
        const loginForm = $("loginForm");
        const signupForm = $("signupForm");

        if (!loginForm || !signupForm) return;

        const session = getSession();

        if (session) {
            window.location.replace(
                session.role === "admin" ? "admin.html" : "organizer.html"
            );
            return;
        }

        const loginTab = $("loginTab");
        const signupTab = $("signupTab");
        const heading = $("authHeading");
        const subheading = $("authSubheading");
        const message = $("authMessage");

        function showMessage(text, type = "error") {
            message.textContent = text;
            message.className = "auth-message " + type;
            message.hidden = false;
        }

        function clearMessage() {
            message.textContent = "";
            message.hidden = true;
            message.className = "auth-message";
        }

        function showLogin() {
            loginForm.hidden = false;
            signupForm.hidden = true;
            loginTab.classList.add("is-active");
            signupTab.classList.remove("is-active");
            loginTab.setAttribute("aria-selected", "true");
            signupTab.setAttribute("aria-selected", "false");
            heading.textContent = "Welcome back.";
            subheading.textContent = "Log in to your EventHub dashboard.";
            clearMessage();
        }

        function showSignup() {
            loginForm.hidden = true;
            signupForm.hidden = false;
            loginTab.classList.remove("is-active");
            signupTab.classList.add("is-active");
            loginTab.setAttribute("aria-selected", "false");
            signupTab.setAttribute("aria-selected", "true");
            heading.textContent = "Manager registration.";
            subheading.textContent = "Submit your details for administrator approval.";
            clearMessage();
        }

        loginTab.addEventListener("click", showLogin);
        signupTab.addEventListener("click", showSignup);
        $("switchToSignup")?.addEventListener("click", showSignup);
        $("switchToLogin")?.addEventListener("click", showLogin);

        signupForm.addEventListener("submit", event => {
            event.preventDefault();
            clearMessage();

            const name = $("signupName").value.trim();
            const email = $("signupEmail").value.trim();
            const password = $("signupPassword").value;
            const confirm = $("confirmPassword").value;

            if (name.length < 2) {
                showMessage("Please enter your full name.");
                return;
            }

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                showMessage("Please enter a valid email address.");
                return;
            }

            if (password.length < 8) {
                showMessage("Your password must contain at least 8 characters.");
                return;
            }

            if (password !== confirm) {
                showMessage("The passwords do not match.");
                return;
            }

            const result = registerManager(name, email, password);

            if (!result.success) {
                showMessage(result.message);
                return;
            }

            signupForm.reset();
            showLogin();
            $("loginEmail").value = email;

            showMessage(
                "Your manager application has been submitted. You can log in after the administrator approves it.",
                "success"
            );
        });

        loginForm.addEventListener("submit", event => {
            event.preventDefault();
            clearMessage();

            const email = $("loginEmail").value.trim();
            const password = $("loginPassword").value;

            if (!email || !password) {
                showMessage("Please enter your email and password.");
                return;
            }

            const result = login(email, password);

            if (!result.success) {
                showMessage(result.message);
                return;
            }

            window.location.href =
                result.user.role === "admin"
                    ? "admin.html"
                    : "organizer.html";
        });

        $("currentYear").textContent = new Date().getFullYear();
    }

    /* ---------- Account page compatibility ---------- */

    function initializeAccountPage() {
        const nameElement = $("accountName");
        const profileName = $("profileName");
        const profileEmail = $("profileEmail");

        if (!nameElement || !profileName || !profileEmail) return;

        const session = getSession();

        if (!session) {
            window.location.replace("auth.html");
            return;
        }

        nameElement.textContent = session.name;
        profileName.textContent = session.name;
        profileEmail.textContent = session.email;

        if ($("accountAvatar")) {
            $("accountAvatar").textContent =
                session.name.charAt(0).toUpperCase();
        }
    }

    /* ---------- Public functions for other pages ---------- */

    window.EventHubAuth = {
        getUsers,
        getSession,
        saveUsers,
        requireRole,
        logout
    };

    // Make the admin account available for the demo.
    ensureAdminAccount();

    document.addEventListener("DOMContentLoaded", () => {
        initializeAuthPage();
        initializeAccountPage();

        $("logoutButton")?.addEventListener("click", logout);
    });
})();
