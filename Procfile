web: daphne --port 8000 --bind 0.0.0.0 app.asgi:application
worker: celery --uid 1000 -A app worker --beat -c 1 -l INFO
