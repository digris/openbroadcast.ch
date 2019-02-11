FROM python:3.6-alpine3.8

RUN mkdir /app/
WORKDIR /app/

ADD requirements.txt /app/requirements.txt
ADD package.json /app/package.json

RUN set -ex \
    && apk add --no-cache --virtual .build-deps \
        build-base \
        libffi-dev \
        linux-headers \
        postgresql-dev \
        yarn \
        libev \
        libevdev \
    && apk add --no-cache --virtual .run-deps \
        bash \
        git \
        pcre-dev \
        postgresql-client \
        nodejs \
        nodejs-npm \
        libjpeg-turbo-dev \
        libpng-dev \
        freetype-dev \
        libxml2-dev \
        libxslt-dev \
    && pip3 install -U pip \
    && LIBRARY_PATH=/lib:/usr/lib /bin/sh -c "pip3 install --no-use-pep51 --no-cache-dir -r ./requirements.txt" \
    && yarn install \
    && apk del .build-deps

# Copy your application code to the container
# (make sure you create a .dockerignore file if any large files or directories should be excluded)
ADD . /app/
WORKDIR /app/

# install npm dependencies, build static src & cleanup
RUN npm run dist \
    && rm -R /app/node_modules/ \
    && rm -R /app/static/

RUN DJANGO_SETTINGS_MODULE=app.settings.build python manage.py check
#RUN DJANGO_SETTINGS_MODULE=app.settings.build python manage.py collectstatic --noinput \
#    && rm -R /app/app/static-src/

RUN adduser -D app
RUN chown -R app ./app/static-dist
USER app

#COPY docker-entrypoint.sh /app/
# entrypoint (contains migration/static handling)
ENTRYPOINT ["/app/docker-entrypoint.sh"]

# Add any custom, static environment variables needed by Django or your settings file here:
ENV DJANGO_SETTINGS_MODULE=app.settings.base

# uWSGI port
EXPOSE 8000

CMD [ "daphne", \
      "--port", "8000", \
      "--bind", "0.0.0.0", \
      "app.asgi:application" ]
