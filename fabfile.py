#!/usr/bin/env python
import sys
from fabric.api import local, settings, abort, run, cd, env, put, hide
from fabric.colors import green, red
from fabric.contrib import files

import urllib2

# glogal env
env.warn_only = True
env.debug = False
env.supervisor = '/etc/supervisor/conf.d'
env.nginx = '/etc/nginx/sites-enabled'

# skip functions for faster deploy...
env.skip_requirements = False
env.skip_db = False


"""
definition instances
"""
def openbroadcast_ch():
    env.site_id = 'openbroadcast.ch'
    env.hosts = ['node05.obp',]
    env.ci_host = 'ci.lab.anorg.net'
    env.git_url = 'git@lab.hazelfire.com:hazelfire/obp/openbroadcast-ch.git'
    env.git_branch = 'development'
    #env.git_branch = 'master'
    env.path = '/var/www/openbroadcast.ch'
    env.storage = '/nas/storage/prod.openbroadcast.ch'
    env.user = 'root'


def skip_req():
    env.skip_requirements = True

def skip_db():
    env.skip_db = True

def clean():
    local("find . -name '*.DS_Store' -type f -delete")
    local("find . -name '*.pyc' -type f -delete")

def build():
    print 'running ci'
    notify_url = 'http://%s/git/notifyCommit?url=%s' % (env.ci_host, env.git_url)
    r = urllib2.urlopen(notify_url)
    print r.read()


def deploy():

    print(green('*' * 72))
    print(green('deploying %s on %s' % (env.site_id, env.hosts)))
    print(green('*' * 72))


    #with hide('output'):
    if True:

        try:
            pass
            #run('supervisorctl stop %s' % env.site_id)
        except Exception, e:
            pass

        try:
            if not files.exists(env.path):
                print green('creating project directory: %s' % env.path)
                run('mkdir -p %s' % env.path)
        except Exception, e:
            print red('unable to create project directory: %s' % e)

        with cd(env.path):
            try:
                if not files.exists('%s/config' % env.path):
                    run('mkdir config')
            except Exception, e:
                pass

            try:
                run('cp src/website/project/local_settings.py config/')
            except Exception, e:
                pass


            try:
                run('rm -Rf src_new')
            except Exception, e:
                pass

            run('mkdir src_new')


        with cd(env.path + '/src_new'):
            print green('repository checkout. %s on %s' % (env.git_branch, env.git_url))
            run('git init')
            run('git remote add -t %s -f origin %s' % (env.git_branch, env.git_url))
            run('git fetch')
            run('git checkout %s' % (env.git_branch))

        with cd(env.path):

            """
            copy back the local_settings
            """
            try:
                run('cp config/local_settings.py src_new/website/project/')
            except Exception, e:
                print(red('*' * 72))
                print(red('unable to copy local_settings: %s' % e))
                print(red('*' * 72))
                pass


            """
            virtualenv and requirements
            """
            try:
                if not files.exists('/srv/%s' % env.site_id):
                    print green('creating virtualenv at: /srv/%s' % env.site_id)
                    run('virtualenv /srv/%s' % env.site_id)
            except Exception, e:
                print red('unable to create virtualenv: %s' % e)


            if not env.skip_requirements:
                print green('installing requirements')
                run('/srv/%s/bin/pip install -r  %s' % (env.site_id, 'src_new/website/requirements/requirements.txt'))


            """
            linking storage directories
            """
            try:
                run('ln -s %s/media %s/src_new/website/media' % (env.storage, env.path))
            except Exception, e:
                pass
            try:
                run('ln -s %s/static %s/src_new/website/static' % (env.storage, env.path))
            except Exception, e:
                pass

            """
            run migrations
            """
            if not env.skip_db:
                print(green('database sync & migration'))
                try:
                    with cd(env.path + '/src/website/'):
                        run('/srv/%s/bin/python /%s/src_new/website/manage.py migrate' % (env.site_id, env.path))

                except Exception, e:
                    print red('*' * 72)
                    print red('sync / migration error: %s' % e)
                    print red('*' * 72)



            try:
                print(green('changing permissions for %s/src/website/static/' % env.path))
                run('chown -R django:www-data %s/src/website/static/' % env.path)
            except Exception, e:
                pass

            with cd("%s/src_new/website" % env.path) :
                print(green("Collecting static files..."))
                run("/srv/%s/bin/python manage.py collectstatic --noinput --verbosity=0" % env.site_id)


            """
            generate git changelog
            git log > changelog.txt
            """
            try:
                with cd(env.path + '/src_new/website/'):
                    run('git log > changelog.txt')
            except Exception, e:
                pass



            """
            swap directories
            """
            with cd(env.path):
                try:
                    run('mv src src_old')
                except Exception, e:
                    print e
                try:
                    run('mv src_new src')
                except Exception, e:
                    print e


            """
            linking config files
            """
            try:
                run('rm %s/%s.conf' % (env.supervisor, env.site_id))
                run('ln -s %s/src/conf/%s.supervised.conf %s/%s.conf' % (env.path, env.site_id, env.supervisor, env.site_id))
            except Exception, e:
                pass

            """
            (re)start supervisor workers
            """
            print green('reloading application server')
            run('supervisorctl restart %s' % env.site_id)
            run('supervisorctl restart services.%s:*' % env.site_id)
            print green('status for: %s' % env.site_id)
            run('supervisorctl status | grep %s' % env.site_id)
            print green('*' * 72)

            with cd(env.path):
                try:
                    run('rm -R src_old')
                except Exception, e:
                    print e

"""
translation related
"""

def tx_make():

    """
    on a fresh project first run (for all locales.tx):
    django-admin.py makemessages -l en --all
    """

    local('cd website && django-admin.py makemessages --all \
           --no-obsolete \
           --domain=django \
           --ignore=*admin* \
           --ignore=*filer* \
           --ignore=*__DISABLED__l10n* \
           --ignore=*cms_plugins* \
           --ignore=*__DISABLED__shop/models/defaults* \
           --ignore=*shop_secondary_currencies* \
           --ignore=*paypal/pro* \
           --ignore=*multilingual* \
           --ignore=*newsletter* \
           --ignore=*cmsplugin_facebook* \
           --ignore=*cmsplugin_youtube* \
           --ignore=*cmsplugin_vimeo* \
           --ignore=*partner/models* \
           --ignore=*atoz/models* \
           --ignore=*faq/models* \
           --ignore=*taggit* \
           --ignore=*cms/* \
           --ignore=*userena/* \
           --ignore=*socialregistration/* \
           --ignore=ajax/* \
           --ignore=analytics/* \
           --ignore=dev/* \
           --ignore=fixtures/* \
           --ignore=registration/* \
           --ignore=lib/* \
           --ignore=locale/* \
           --ignore=media/* \
           --ignore=multilingual/* \
           --ignore=profiles/* \
           --ignore=social_auth/* \
           --ignore=taggit/* \
           --ignore=socialregistration/* \
           --ignore=filer/*')


def tx_push():
    local('tx push -t -s')


def tx_pull(remote=False):

    local('tx pull')
    local('cd website && ./manage.py compilemessages')


def tx_pull_remote():

    with cd(env.path + '/src'):
        run('tx pull')
    with cd(env.path + '/src/website'):
        run('/srv/%s/bin/python /%s/src/website/manage.py compilemessages' % (env.site_id, env.path))


