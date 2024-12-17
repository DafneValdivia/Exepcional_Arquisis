FROM node:18

# Crear directorio de trabajo
WORKDIR /app

# Copiar dependencias
COPY package*.json ./
RUN npm install

# Copiar código fuente y archivo .env
COPY . .
COPY .env .env

# Comando para ejecutar el listener
CMD ["node", "broker.js"]
