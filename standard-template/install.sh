clear
echo -e "\033[1;95m[*] Installing dependencies.."

npm i bcryptjs chalk cloudinary cookie-parser cors dotenv express express-async-handler express-rate-limit express-validator hpp jsonwebtoken mongoose multer nodemailer nodemon swagger-ui-express prompt-sync util

clear
sleep .5

echo -e "\033[1;92m[*] Installation completed."
echo -e "\033[1;91m[*] Make sure to set up your .env file."
echo -e "\033[1;93m[*] Then type: npm run dev"

mv .npmignore .gitignore
rm install.sh
