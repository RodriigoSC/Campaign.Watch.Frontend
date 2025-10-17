# ---- 1. Estágio de Build ----
# Usa uma imagem oficial do Node.js como base
FROM node:20-alpine as build

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia o package.json e o package-lock.json para o diretório de trabalho
COPY package*.json ./

# Instala as dependências do projeto
RUN npm install

# Copia o restante dos arquivos da aplicação para o diretório de trabalho
COPY . .

# Executa o script de build para gerar os arquivos estáticos
RUN npm run build

# ---- 2. Estágio de Servidor ----
# Usa uma imagem oficial e leve do Nginx como base
FROM nginx:stable-alpine

# Copia os arquivos estáticos gerados no estágio de build para o diretório padrão do Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copia o arquivo de configuração customizado do Nginx
COPY config/nginx.conf /etc/nginx/conf.d/default.conf

# Expõe a porta 80 para permitir o acesso à aplicação
EXPOSE 80

# Comando para iniciar o Nginx quando o container for executado
CMD ["nginx", "-g", "daemon off;"]