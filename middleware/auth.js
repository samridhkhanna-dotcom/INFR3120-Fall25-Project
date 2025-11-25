module.exports = (req, res, next) => {
    // Check if the session exists AND has a logged-in user
    if (req.session && req.session.user) {
        return next();
    }

    // If not logged in → block access
    return res.status(401).json({ message: "Unauthorized" });
};
