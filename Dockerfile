# Nginx serves the static frontend directly; no build step is needed.
FROM nginx:alpine

COPY frontend-web /usr/share/nginx/html/

EXPOSE 80
