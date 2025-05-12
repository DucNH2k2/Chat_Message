# Use official Node.js image as a base
FROM node:18

WORKDIR /var/www/html

# Set the working directory in the containerWORKDIR /var/www/html
COPY ./package.json ./package-lock.json ./

RUN npm install