# Development Set-up
## Prerequisites
* NodeJS
* NPM
* Docker
* Google Cloud Platform Project for Client Keys
## Instructions
1. Run `npm install` on client and server directory to install the necessary packages
2. Provide the necessary values in .env, the variables needed can be seen in index.ts of /server. The values can be obtained on your own GCP Project and MongoDB

3. Change the url according to your setup in the following files:
* /server/src/controller/auth.ts - res.redirect()
* /client/src/pages/Login.tsx - window.open()
* /client/webpack.config.js - devServer:{proxy:{'/api'}}

4. Run the following command to use the program (For local machine):
* /server - `npm run dev2`
* /client - `npm start`

5. Run the following command to use the program (For docker):
* /code - `docker-compose up --build` or `docker-compose up -d --build` 


