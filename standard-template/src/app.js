import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import swaggerUi from "swagger-ui-express";
import fs from "fs";

import corsOptions from "./utils/corsOptions.js";
import { limiter } from "./utils/limiter.js";
import notFoundErrorHandler from "./middlewares/notFoundErrorHandler.js";
import otherErrorHandler from "./middlewares/otherErrorHandler.js";

// routes import
import { userRouter, adminRouter } from "./routes/index.js";

const app = express();
const swaggerDocument = JSON.parse(fs.readFileSync("swagger.json", "utf-8"));

app.use(hpp());
// app.use(limiter);
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

// routes declaration
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/api/admin", adminRouter);
app.use("/api/v1/users", userRouter);
app.use("*", notFoundErrorHandler);
app.use(otherErrorHandler);

export default app;
