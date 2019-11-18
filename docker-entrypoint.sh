#!/bin/sh
set -e

#until /usr/bin/psql ${DATABASE_URL} -c '\l'; do
#  >&2 echo "Postgres is unavailable - sleeping"
#  sleep 1
#done

>&2 echo "Postgres is up - continuing"

if [ "x$DJANGO_MANAGE_COLLECTSTATIC" = 'xon' ]; then
    # staticfile app fails in LIVE mode -> enable DEBUG for collectstatic
    # DEBUG=True ./manage.py collectstatic --noinput
    echo "collectstatic refactored to docker build step"
fi

if [ "x$DJANGO_MANAGE_MIGRATE" = 'xon' ]; then
    DEBUG=True ./manage.py migrate --noinput
fi

exec "$@"
