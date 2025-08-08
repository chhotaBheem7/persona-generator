FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

FROM node:18-alpine

RUN npm install -g serve

COPY --from=build /app/build ./build

EXPOSE 5173

CMD ["serve", "-s", "build", "-1", "5173"]
