FROM node:lts-alpine as node-builder

WORKDIR /root/

COPY ["yarn.lock", "package.json", "./"]
RUN set -ex \
    && apk add --no-cache --virtual .build-deps \
        git \
    && yarn install \
    && apk del .build-deps

COPY ["postcss.config.js", "./"]
ADD ./webpack/ ./webpack/
ADD ./src/ ./src/
RUN yarn build


FROM python:3.7-alpine3.10

RUN mkdir /app/
WORKDIR /app/

# COPY ["Pipfile","Pipfile.lock", "./"]
COPY ["requirements.txt", "./"]

RUN set -ex \
    && apk add --no-cache --virtual .build-deps \
        build-base \
        libffi-dev \
        linux-headers \
        postgresql-dev \
        libev \
        libevdev \
    && apk add --no-cache --virtual .run-deps \
        bash \
        git \
        pcre-dev \
        postgresql-client \
        libjpeg-turbo-dev \
        libpng-dev \
        freetype-dev \
        libxslt-dev \
        libxml2-dev \
    && pip3 install -U pip pipenv \
    && LIBRARY_PATH=/lib:/usr/lib /bin/sh -c "pip3 install --no-cache-dir -r ./requirements.txt" \
    # && LIBRARY_PATH=/lib:/usr/lib /bin/sh -c "pipenv install --system --deploy --ignore-pipfile" \
    && apk del .build-deps

# Copy application code to context
COPY ["Procfile", "manage.py", "docker-entrypoint.sh", "./"]
ADD ./app/ ./app/

COPY --from=node-builder /root/build/ ./build

RUN DJANGO_SETTINGS_MODULE=app.settings.build python manage.py check
RUN DJANGO_SETTINGS_MODULE=app.settings.build python manage.py collectstatic -v 0 --clear --no-input

RUN rm -f ./celerybeat-schedule

RUN addgroup -g 1000 -S app \
    && adduser -u 1000 -S app -G app \
    && chown -R app:app /app/

USER app

ENTRYPOINT ["/app/docker-entrypoint.sh"]

ENV DJANGO_SETTINGS_MODULE=app.settings.base

# ASGI port
EXPOSE 8000

CMD [ "daphne", \
      "--port", "8000", \
      "--bind", "0.0.0.0", \
      "app.asgi:application" ]
