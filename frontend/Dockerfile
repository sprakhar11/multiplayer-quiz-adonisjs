FROM node:22-alpine

WORKDIR /app

# install dependencies first (cached layer)
COPY package.json package-lock.json ./
RUN npm ci

# copy the rest of the code
COPY . .

# expose the port
EXPOSE 5173

# start vite dev server, accessible from outside the container
CMD ["npx", "vite", "--host", "0.0.0.0"]
