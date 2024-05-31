#!/usr/bin/env node
const readline = require("readline");
const { execSync, exec } = require("child_process");
const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");

const clearTerminal = async function clear() {
    const data = await execSync("clear");
    if (!data) return "";
    process.stdout.write(data);
};

// Function to create a directory
function createDirectory(directoryPath) {
    try {
        fs.mkdirSync(directoryPath);
        console.log(chalk.green.bold("✔ Project created successfully!"));
    } catch (err) {
        console.log(
            chalk.red.bold("✘ Failed to create directory:", err.message)
        );
        process.exit(1);
    }
}

// Function to copy template directory
async function copyTemplateDirectory(templatePath, targetPath) {
    try {
        await fs.copy(templatePath, targetPath);
        // console.log(
        //     chalk.green.bold("✔ Template directory copied successfully!")
        // );
    } catch (err) {
        console.log(
            chalk.red.bold("✘ Failed to copy template directory:", err.message)
        );
        process.exit(1);
    }
}

// Function to display colorful text
function displayText(text) {
    console.log(chalk.bold(text));
}

// Function to ask for user input
function askQuestion(question) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise(resolve => {
        rl.question(question, answer => {
            rl.close();
            resolve(answer);
        });
    });
}

async function main() {
    try {
        await clearTerminal();

        // Ask for project name
        const projectName = await askQuestion(
            chalk.bold(`${chalk.cyan("?")} Project name: `)
        );
        const targetDirectory = path.join(process.cwd(), projectName);

        // Create directory
        createDirectory(targetDirectory);

        // Ask for template choice
        displayText(
            `\n${chalk.cyan("?")} Which template would you like to use:`
        );
        displayText(chalk.magenta(" 1. express-api-full-setup (deprecated)"));
        displayText(chalk.yellow(" 2. express-app-with-ejs"));
        displayText(chalk.magenta(" 3. standard-template (recommended)"));

        const templateChoice = await askQuestion(chalk.gray.bold(" > "));

        // Determine template path based on choice
        let templatePath = "";

        if (templateChoice === "1") {
            templatePath = path.join(__dirname, "express-api-full-setup");
        } else if (templateChoice === "2") {
            templatePath = path.join(__dirname, "express-app-with-ejs");
        } else if (templateChoice === "3") {
            templatePath = path.join(__dirname, "standard-template");
        } else {
            console.log(chalk.red.bold("✘ Invalid template choice."));
            process.exit(1);
        }

        // Copy template files
        await copyTemplateDirectory(templatePath, targetDirectory);

        // Change app name in package.json
        let content = fs.readFileSync(
            `${targetDirectory}/package.json`,
            "utf-8"
        );
        content = JSON.parse(content);
        content.name = projectName;
        content = JSON.stringify(content, null, 4);
        fs.writeFileSync(`${targetDirectory}/package.json`, content);

        console.log(
            chalk.green.bold("\n✔ Boilerplate generated successfully!"),
            "\n✔ Now type the following command:",
            chalk.italic.dim(`\n\n  $ cd ${projectName}`),
            chalk.italic.dim(`\n  $ bash install.sh`),
            chalk.italic.dim(`\n  $ npm run dev`)
        );
        if(templateChoice === "1") console.log(chalk.italic.red(`\n  [*] Make sure to set up your .env file.\n`));
    } catch (err) {
        console.log(chalk.red.bold("✘ Error:", err.message));
        process.exit(1);
    }
}

main();
