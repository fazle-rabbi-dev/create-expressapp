import rateLimit from "express-rate-limit";
import multer from "multer";
import { DOCUMENTATION_URL } from "../constants/index.js";

const otherErrorHandler = (error, req, res, next) => {
    console.error(error);

    // Rate limiter error handling
    if (error?.name === "RateLimitError") {
        console.log(error);
        res.status(429).json({
            error: "Too many requests, please try again later"
        });

        return;
    }

    // Multer error handling
    if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
            res.status(error?.status || 500).json({
                status: "Failed",
                error: {
                    message: "File size limit exceeded (Max: 500 KB)"
                }
            });
        }
    }

    // Other error handling
    const ERROR = {
        message: (error?.status && error?.message) || "Internal server error",
    };

    if (error.details) {
        ERROR.details = error.details;
    }

    res.status(error?.status || 500).json({
        status: error?.status || 500,
        success: false,
        errors: ERROR,
        links: {
          documentation: DOCUMENTATION_URL,
        }
    });
};

export default otherErrorHandler;
