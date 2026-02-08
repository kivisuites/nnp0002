FROM jlesage/nginx-proxy-manager:latest

# Configure ports as per Railway settings
ENV DISABLE_IPV6="true"
ENV HTTP_PORT="80"
ENV HTTPS_PORT="443"
ENV LISTEN_PORT="81"

# NPM uses LISTEN_PORT for admin UI, HTTP_PORT for HTTP, HTTPS_PORT for HTTPS
EXPOSE 81 80 443

# NPM expects volumes for data and letsencrypt
VOLUME /config
