# Use a lightweight web server
FROM nginx:alpine

# Copy build output to Nginx’s public directory
COPY ./dist /usr/share/nginx/html

# Remove default config and add your own if needed
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
