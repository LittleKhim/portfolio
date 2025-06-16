// Discord OAuth2 Configuration
const DISCORD_CLIENT_ID = '1383884204634275941'; // Replace with your Discord client ID
const REDIRECT_URI = "https://www.littlekhim.online/api/auth/callback";
const DISCORD_AUTH_URL = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify%20email`;

// Login button click handler
const loginBtn = document.getElementById('login-btn');
const userInfo = document.getElementById('user-info');
const discordUsername = document.getElementById('discord-username');
const userCredits = document.getElementById('user-credits');

function showLoggedIn(username, credits) {
    loginBtn.style.display = 'none';
    userInfo.style.display = 'block';
    discordUsername.textContent = username;
    userCredits.textContent = credits;
    // Add logout button if not present
    if (!document.getElementById('logout-btn')) {
        const logoutBtn = document.createElement('button');
        logoutBtn.id = 'logout-btn';
        logoutBtn.textContent = 'Logout';
        logoutBtn.className = 'login-btn';
        logoutBtn.style.marginLeft = '10px';
        logoutBtn.onclick = async () => {
            await fetch('/api/auth/logout');
            window.location.reload();
        };
        userInfo.appendChild(logoutBtn);
    }
}

function showLoggedOut() {
    loginBtn.style.display = 'inline-flex';
    userInfo.style.display = 'none';
    // Remove logout button if present
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.remove();
}

loginBtn.addEventListener('click', () => {
    window.location.href = DISCORD_AUTH_URL;
});

// Check if we're on the callback page
if (window.location.pathname === '/auth/callback') {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
        // Redirect to backend callback to handle login and set cookie
        window.location.href = `/api/auth/callback?code=${encodeURIComponent(code)}`;
    }
}

// Function to check if user is logged in
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

document.addEventListener('DOMContentLoaded', checkLoginStatus); 