// middleware/auth.js

function requireAuth(req, res, next) {
  // Passport handles sessions. If authenticated, req.user exists.
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }

  return res.status(401).json({ message: "Unauthorized" });
}

module.exports = { requireAuth };
