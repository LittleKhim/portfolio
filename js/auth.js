// Discord OAuth2 Configuration
const DISCORD_CLIENT_ID = '1383884204634275941'; // Replace with your Discord client ID
const REDIRECT_URI = window.location.origin + '/auth/callback';
const DISCORD_AUTH_URL = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify%20email`;

// Login button click handler
document.getElementById('login-btn').addEventListener('click', () => {
    window.location.href = DISCORD_AUTH_URL;
});

// Check if we're on the callback page
if (window.location.pathname === '/auth/callback') {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
        // Here you would typically exchange the code for an access token
        // and fetch the user's information from Discord
        console.log('Authorization code received:', code);
        // Redirect back to home page after successful login
        window.location.href = '/';
    }
}

// Function to check if user is logged in
async function checkLoginStatus() {
    try {
        const response = await fetch('/api/auth/session');
        const data = await response.json();
        
        if (data.user) {
            // Hide login button
            document.getElementById('login-btn').style.display = 'none';
            // Show user info
            const userInfo = document.getElementById('user-info');
            userInfo.style.display = 'block';
            document.getElementById('discord-username').textContent = data.user.username;
            // Set credits (mock: 0)
            document.getElementById('user-credits').textContent = data.user.credits || 0;
        }
    } catch (error) {
        console.error('Error checking login status:', error);
    }
}

// Check login status when page loads
document.addEventListener('DOMContentLoaded', checkLoginStatus); 