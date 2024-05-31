import dotenv from "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import chalk from "chalk";
import readline from "readline";
import util from "util";

import connectDB from "./database/connect-db.js";
import UserModel from "./models/UserModel.js";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = util.promisify(rl.question).bind(rl);
const sleep = util.promisify(setTimeout);

async function createAdminUser() {
  while (true) {
    try {
      // Connect to the database
      await connectDB();

      // Get user input
      const fullName = await question(chalk.cyanBright('Enter full name: '));
      const username = await question(chalk.cyanBright('Enter username: '));
      const email = await question(chalk.cyanBright('Enter email: '));
      const password = await question(chalk.cyanBright('Enter password: '), { echo: '*' });
      
      if(fullName?.trim().length < 3){
        throw new Error("Fullname must be at least 3 characters long.");
      } else if(username?.length < 4 && !email){
        throw new Error("Username (must be at least 4 characters long) or email both is required.");
      } else if(password.length < 6){
        throw new Error("Password must be at least 6 characters long.");
      }
      
      // Check if user already exists
      const existingUser = await UserModel.findOne({
        $or: [
          { username },
          { email }
        ]
      });

      if (existingUser) {
        throw new Error("Username or Email already exists.");
      }

      // Create new user
      const newUser = new UserModel({
        fullName,
        username,
        email,
        authentication: {
          password,
          role: "admin"
        }
      });

      const res = await newUser.save();
      console.log(chalk.greenBright(`[*] New user created successfully.`));
      console.log(res.toObject());

      rl.close(); // Close the readline interface
      break; // Exit the loop after successful user creation

    } catch (error) {
      console.log(chalk.redBright(`Error: ${error.message}`));
      console.log(chalk.yellowBright('Retrying in 1 second...'));
      await sleep(1500); // Wait for 1 second before retrying
      console.clear();
    } finally {
      // Ensure the database connection is closed
      await mongoose.connection.close();
    }
  }
}

// Handle SIGINT signal for graceful termination
process.on('SIGINT', async () => {
  console.log(chalk.redBright('\nGracefully shutting down...'));
  await mongoose.connection.close();
  rl.close();
  process.exit(0);
});

// Start the script
createAdminUser();


// =====================================================================================================================
// Previous Code With promptSync
// =====================================================================================================================
/*
import dotenv from "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import chalk from "chalk";
import promptSync from "prompt-sync";
import util from "util";

import connectDB from "./database/connect-db.js";
import UserModel from "./models/UserModel.js";

const prompt = promptSync();
const sleep = util.promisify(setTimeout);

async function createAdminUser() {
  while (true) {
    try {
      // Connect to the database
      await connectDB();

      // Get user input
      const fullName = prompt(chalk.cyanBright('Enter full name: '));
      const username = prompt(chalk.cyanBright('Enter username: '));
      const email = prompt(chalk.cyanBright('Enter email: '));
      const password = prompt(chalk.cyanBright('Enter password: '), { echo: '*' });
      
      if(fullName?.trim().length < 3){
        throw new Error("Fullname must be at least 3 characters long.")
      } else if(username?.length < 4 && !email){
        throw new Error("Username (must be at least 4 characters long) or email both is required.")
      } else if(password.length < 6){
        throw new Error("Password must be at least 6 characters long.")
      }
      
      // Check if user already exists
      const existingUser = await UserModel.findOne({
        $or: [
          { username },
          { email }
        ]
      });

      if (existingUser) {
        throw new Error("Username or Email already exists.");
      }

      // Create new user
      const newUser = new UserModel({
        fullName,
        username,
        email,
        authentication: {
          password,
          role: "admin"
        }
      });

      const res = await newUser.save();
      console.log(chalk.greenBright(`[*] New user created successfully.`));
      console.log(res.toObject());

      break; // Exit the loop after successful user creation

    } catch (error) {
      console.log(chalk.redBright(`Error: ${error.message}`));
      console.log(chalk.yellowBright('Retrying in 1 second...'));
      await sleep(1500); // Wait for 1 second before retrying
      console.clear()
    } finally {
      // Ensure the database connection is closed
      await mongoose.connection.close();
    }
  }
}

// Handle SIGINT signal for graceful termination
process.on('SIGINT', async () => {
  console.log(chalk.redBright('\nGracefully shutting down...'));
  await mongoose.connection.close();
  process.exit(0);
});

// Start the script
createAdminUser();
*/