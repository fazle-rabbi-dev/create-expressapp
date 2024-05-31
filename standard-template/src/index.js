import dotenv from "dotenv/config";
import app from "./app.js";
import connectDB from "./database/connect-db.js";
import chalk from "chalk";

const PORT = process.env.PORT;

(async () => {
    await connectDB();

    app.listen(PORT, err => {
        if (!err) {
            console.log(chalk.bold.magenta("✓ Server is running at: http://localhost:" + PORT));
        } else {
            console.log(chalk.bold.red(`✘ Failed to start server! CAUSE: ${err}`));
        }
    });
})();
