FROM node:22-alpine

WORKDIR /app

# install dependencies first (cached layer)
COPY package.json package-lock.json ./
RUN npm ci

# copy the rest of the code
COPY . .

# expose the port
EXPOSE 3333

# run migrations then start the server
CMD sh -c "node ace migration:run --force && node ace serve --hmr"
