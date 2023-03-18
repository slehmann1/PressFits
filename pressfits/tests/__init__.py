# Enable vscode django unittesting

import os

from django import setup

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "server.settings")
setup()
