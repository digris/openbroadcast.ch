"""
TODO: depreciated. rework to pass settings via supervisord conf
"""


proc_name = "openbroadcast.ch"
backlog = 2048
bind = "0.0.0.0:8002"
pidfile = "/home/django/run/openbroadcast.ch.pid"
daemon = False
debug = False
workers = 2
logfile = "/var/log/django/app.openbroadcast.ch.log"
loglevel = "info"