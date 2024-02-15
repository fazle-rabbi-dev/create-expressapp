clear
echo -e "\033[1;95m[*] Installing dependencies.."

npm i dotenv ejs express nodemon tailwindcss 

clear
sleep .5

echo -e "\033[1;92m[*] Installation completed."
echo -e "\033[1;93m[*] Now type: npm run dev"

rm install.sh