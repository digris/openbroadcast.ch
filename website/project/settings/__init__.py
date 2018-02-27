from split_settings.tools import optional, include
import os

base_settings = [
    'components/base.py',
    'components/media.py',
    'components/template.py',

    # optional local settings
    optional(os.path.abspath(os.path.join(APP_ROOT, 'local_settings.py'))),

    # via server based settings in etc (placed by ansible deployment tasks)
    optional('/etc/openbroadcast.ch/application-settings.py'),
    optional('/etc/openbroadcast.ch/logging.py'),
]

include(*base_settings)
