module.exports = (req, res) => {
  res.setHeader('Set-Cookie', 'session_user=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax');
  res.writeHead(302, { Location: '/' });
  res.end();
}; 