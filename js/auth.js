// Discord OAuth2 Configuration
const DISCORD_CLIENT_ID = '1383884204634275941';
const REDIRECT_URI = "https://www.littlekhim.online/api/auth/callback";
const DISCORD_AUTH_URL = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify%20email`;

const loginBtn = document.getElementById('login-btn');
const userMenu = document.getElementById('user-menu');
const userMenuBtn = document.getElementById('user-menu-btn');
const userMenuUsername = document.getElementById('user-menu-username');
const userDropdown = document.getElementById('user-dropdown');
const dropdownCreditsValue = document.getElementById('dropdown-credits-value');
const dropdownLogout = document.getElementById('dropdown-logout');
const dropdownSettings = document.getElementById('dropdown-settings');

// Display user info
function showLoggedIn(username, credits) {
    loginBtn.style.display = 'none';
    userMenu.style.display = 'block';
    userMenuUsername.textContent = username;
    dropdownCreditsValue.textContent = credits;
}

// Hide user info
function showLoggedOut() {
    loginBtn.style.display = 'inline-flex';
    userMenu.style.display = 'none';
    userDropdown.style.display = 'none';
}

// Handle login button click
loginBtn.addEventListener('click', () => {
    window.location.href = DISCORD_AUTH_URL;
});

userMenuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    userDropdown.style.display = userDropdown.style.display === 'block' ? 'none' : 'block';
});

dropdownLogout.addEventListener('click', async () => {
    await fetch('/api/auth/logout');
    window.location.reload();
});

dropdownSettings.addEventListener('click', () => {
    alert('Settings page coming soon!');
});

document.addEventListener('click', (e) => {
    if (userDropdown.style.display === 'block') {
        userDropdown.style.display = 'none';
    }
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
