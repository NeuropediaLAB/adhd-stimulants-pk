FROM nginx:alpine

# Copiar archivos de la aplicación
COPY index.html /usr/share/nginx/html/
COPY app.js /usr/share/nginx/html/
COPY medicacionTDAH.png /usr/share/nginx/html/
COPY images/ /usr/share/nginx/html/images/

# Exponer puerto 80
EXPOSE 80

# Nginx se ejecuta automáticamente con la imagen base
CMD ["nginx", "-g", "daemon off;"]
