FROM harbor.duomai.com/julius/nginx:front

COPY dist  /usr/share/nginx/html/

