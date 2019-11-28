web: daphne --port 8000 --bind 0.0.0.0 app.asgi:application
worker: celery -A app worker --beat -c 1 -l INFO
# beat: celery -A app beat -l INFO
# worker: celery -A app worker -c 2 -l INFO
