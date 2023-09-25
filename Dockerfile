FROM nginxinc/nginx-unprivileged:1.24

USER root
RUN rm -rf /usr/share/nginx/html/*
USER nginx

COPY ./docs /usr/share/nginx/html
WORKDIR /usr/share/nginx/html

EXPOSE 8080
