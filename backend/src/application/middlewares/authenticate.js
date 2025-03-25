const jwt = require('jsonwebtoken');


exports.authenticate = async(req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    
    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
        req.user = decoded; // Attach user info to request object
        next();
    } catch (err) {
        res.status(403).json({ message: "Invalid Token" });
    }
};


