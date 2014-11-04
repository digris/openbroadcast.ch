import os
from project.settings import *

gettext = lambda s: s
_ = gettext

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))


print BASE_DIR

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'data.sqlite3'),
    }
}