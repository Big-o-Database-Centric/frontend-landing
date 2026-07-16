# frontend-landing — HTML/CSS/JS plano, sin build step
FROM nginx:alpine

# Copia todo el contenido estático directo (ajusta la ruta si tu HTML está en /src o /public)
COPY . /usr/share/nginx/html

# Configuración de nginx (try_files + cache de assets estáticos)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
