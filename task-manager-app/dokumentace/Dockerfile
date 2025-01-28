# Použij oficiální Node.js obraz jako základ
FROM node:18-alpine

# Nastav pracovní adresář
WORKDIR /app

# Zkopíruj package.json a package-lock.json
COPY package*.json ./

# Nainstaluj závislosti
RUN npm install
RUN npm install --save-dev @types/swagger-ui-express
RUN npm install --save-dev @types/swagger-ui-express @types/yamljs

# Zkopíruj zbytek aplikace
COPY . .

# Přelož TypeScript do JavaScriptu
RUN npm run build

# Exponuj port 6000
EXPOSE 5005

# Definuj příkaz pro spuštění aplikace
CMD ["node", "dist/server.js"]
