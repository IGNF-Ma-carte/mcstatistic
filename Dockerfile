ARG registry=docker.io
FROM ${registry}/library/ubuntu:24.04

#------------------------------------------------------------------------
# Installation de apache2
#------------------------------------------------------------------------
RUN apt-get update \
 && apt-get install -y apache2 \
 && rm -rf /var/lib/apt/lists/*

#------------------------------------------------------------------------
# Ajout d'un utilitaire pour démarrer le serveur
# (see https://github.com/docker-library/php)
#------------------------------------------------------------------------
COPY .docker/apache2-foreground /usr/local/bin/apache2-foreground
RUN chmod +x /usr/local/bin/apache2-foreground

#------------------------------------------------------------------------
# Create apache2 repository
# (see https://github.com/docker-library/php)
#------------------------------------------------------------------------
RUN mkdir -p /var/run/apache2 && chown -R www-data:www-data /var/run/apache2 \
    && mkdir -p /var/lock/apache2 && chown -R www-data:www-data /var/lock/apache2 \
    && mkdir -p /var/log/apache2 && chown -R www-data:www-data /var/log/apache2
   
#------------------------------------------------------------------------
# Redirects logs to stdout / stderr
# (see https://github.com/docker-library/php)
#------------------------------------------------------------------------
RUN ln -sfT /dev/stderr "/var/log/apache2/error.log" \
    && ln -sfT /dev/stdout "/var/log/apache2/access.log" \
    && ln -sfT /dev/stdout "/var/log/apache2/other_vhosts_access.log" \
    && chown www-data:www-data /var/log/apache2/*.log


# Configuration de apache
COPY .docker/apache-vhost.conf /etc/apache2/sites-available/000-default.conf
COPY .docker/apache-security.conf /etc/apache2/conf-enabled/security.conf
COPY .docker/apache-ports.conf /etc/apache2/ports.conf

RUN a2enmod rewrite remoteip alias headers

COPY --chown=www-data:www-data ./docs /opt/mcstatistic/
WORKDIR /opt/mcstatistic

EXPOSE 8080
CMD ["apache2-foreground"]