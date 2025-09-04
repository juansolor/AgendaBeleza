FROM node:20-alpine

WORKDIR /usr/src/app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install --production

# Copy source
COPY . .

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "app.js"]
