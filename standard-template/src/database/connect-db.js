import mongoose from "mongoose";
import chalk from "chalk";
import { DB_NAME } from "../constants/index.js";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(chalk.bold.yellow(`\n✓ MongoDB connected !! DB HOST: ${connectionInstance.connection.host}\n`));
    } catch (error) {
        console.log(chalk.bold.red("MONGODB connection FAILED "), error);
        process.exit(1);
    }
};

export default connectDB;
