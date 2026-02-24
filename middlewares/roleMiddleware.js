exports.authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if(!req.user) {
            return res.status(401).json({
                message: "Not authenticated"
            });
        }
        if(!allowedRoles.includes(req.user.role.name)) {
            return res.status(403).json({
                message: "Unauthorized"
            });
        }
        next();
    }
}