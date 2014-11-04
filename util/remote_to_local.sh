#!/bin/bash

# remote
DB_NAME="ch_openbroadcast"
DB_USER="osogna"
DB_PASS="p6RSEwV4xJZEJpazP"

# local
DB_LOCAL_NAME="ch_openbroadcast_local"
DB_LOCAL_USER="root"
DB_LOCAL_PASS="root"


echo
echo '*************************************************************'
echo "* REMOTE2LOCAL: $DB_NAME"
echo '*************************************************************'
echo "DB_NAME:       $DB_NAME"
echo "DB_USER:       $DB_USER"
echo "DB_PASS:       ************"
echo "DB_LOCAL_NAME: $DB_LOCAL_NAME"
echo "DB_LOCAL_USER: $DB_LOCAL_USER"
echo "DB_LOCAL_PASS: $DB_LOCAL_PASS"
echo '*************************************************************'
echo

echo
echo "# fetching remote database"

read -r -p "Are you sure? [y/N] " response
if [[ $response =~ ^([yY][eE][sS]|[yY])$ ]]
then
    ssh -C root@node05.scd.hazelfire.com \
    "mysqldump -h 10.0.0.2 -u $DB_USER -p$DB_PASS $DB_NAME" \
    | mysql5 -u $DB_LOCAL_USER -p$DB_LOCAL_PASS -D $DB_LOCAL_NAME
else
    echo "skipping database download"
fi




echo
echo "# fetching remote media"

read -r -p "Are you sure? [y/N] " response
if [[ $response =~ ^([yY][eE][sS]|[yY])$ ]]
then
    rsync -avz -e ssh root@node05.scd.hazelfire.com:/storage/shared/openbroadcast.ch/media/ \
    website/media/
else
    echo "skipping media download"
fi



