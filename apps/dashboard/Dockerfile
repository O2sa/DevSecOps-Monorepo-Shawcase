# ==============================================================================
# Production Dockerfile for Angular Dashboard
# ==============================================================================
FROM nginxinc/nginx-unprivileged:alpine AS runner

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY dist/devsecops-dashboard/browser /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
