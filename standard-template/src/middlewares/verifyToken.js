import ApiError from "../utils/ApiError.js";
import jwt from "jsonwebtoken";

const verifyToken = (requiredRole = "user") => (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            throw new ApiError(401, "Authorization header is missing");
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            throw new ApiError(401, "Authorization token is missing");
        }

        const secret = process.env.JWT_SECRET;

        if (!secret) {
            throw new Error("JWT secret is not defined in environment variables");
        }

        jwt.verify(token, secret, (err, user) => {
            if (err) {
                console.log(err)
                throw new ApiError(401, "Unauthorized Access: Please log in to perform this operation.");
            }
            
            if(user.role !== requiredRole){
              throw new ApiError(
                  403,
                  "You do not have the authorization and permissions to access this resource."
                )
            }
            
            req.user = user;
            next();
        });
    } catch (err) {
        console.error(`Authentication error: ${err.message}`);
        throw err;
    }
};

export default verifyToken;
