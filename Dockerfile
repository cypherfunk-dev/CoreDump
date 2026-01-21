# Stage 1: Build the React Application
FROM node:22 as build 
WORKDIR /app
COPY package*.json ./ 
RUN npm install 
COPY . . 
RUN npm run build-only
# Stage 2: Setup the Nginx Server to serve the React Application Dist es en caso de Vite, Build en caso de react
FROM nginx:1.25.0-alpine as production 
COPY --from=build app/dist /usr/share/nginx/html 
COPY nginx.conf /etc/nginx/conf.d/default.conf 
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
