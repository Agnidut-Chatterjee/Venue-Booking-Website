FROM node:18-alpine AS build

WORKDIR /app


COPY package*.json ./
RUN npm install


COPY . .
RUN npm run build


FROM nginx:alpine

# Copy the built output from Step 1 to Nginx's web root
# NOTE: Use /app/dist if using Vite, or /app/build if using Create React App
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]