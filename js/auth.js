// Discord OAuth2 Configuration
const DISCORD_CLIENT_ID = '1383884204634275941';
const REDIRECT_URI = "https://www.littlekhim.online/auth/callback";
const DISCORD_AUTH_URL = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify%20email`;

const loginBtn = document.getElementById('login-btn');
const userInfo = document.getElementById('user-info');
const discordUsername = document.getElementById('discord-username');
const userCredits = document.getElementById('user-credits');

// Display user info
function showLoggedIn(username, credits) {
    loginBtn.style.display = 'none';
    userInfo.style.display = 'block';
    discordUsername.textContent = username;
    userCredits.textContent = credits;

    // Add logout button
    if (!document.getElementById('logout-btn')) {
        const logoutBtn = document.createElement('button');
        logoutBtn.id = 'logout-btn';
        logoutBtn.textContent = 'Logout';
        logoutBtn.className = 'login-btn';
        logoutBtn.style.marginLeft = '10px';
        logoutBtn.onclick = async () => {
            await fetch('/api/auth/logout');
            window.location.href = '/'; // return to homepage on logout
        };
        userInfo.appendChild(logoutBtn);
    }
}

// Hide user info
function showLoggedOut() {
    loginBtn.style.display = 'inline-flex';
    userInfo.style.display = 'none';
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.remove();
}

// Handle login button click
loginBtn.addEventListener('click', () => {
    window.location.href = DISCORD_AUTH_URL;
});

// Detect /auth/callback route
if (window.location.pathname === '/auth/callback') {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
        // Call the backend to process login, then redirect to home
        fetch(`/api/auth/callback?code=${encodeURIComponent(code)}`)
            .then(() => window.location.href = '/')
            .catch((err) => {
                console.error("Callback failed:", err);
                window.location.href = '/'; // Redirect even on error
            });
    } else {
        window.location.href = '/'; // No code? Redirect to home anyway
    }
}

// Check login session
async function checkLoginStatus() {
    try {
        const response = await fetch('/api/auth/session');
        const data = await response.json();
        if (data.user) {
            showLoggedIn(data.user.username, data.user.credits || 0);
        } else {
            showLoggedOut();
        }
    } catch (error) {
        console.error('Error checking login status:', error);
        showLoggedOut();
    }
}

// Run on page load (except on callback page)
if (window.location.pathname !== '/auth/callback') {
    document.addEventListener('DOMContentLoaded', checkLoginStatus);
}
