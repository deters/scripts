#!/bin/bash

DESTINO=$1

PGCTL="/usr/lib/postgresql/9.5/bin/pg_ctl"
DATE="$(date --rfc-3339=seconds | sed 's; ;.;g')"

cd /tmp

zfs create dados/$DESTINO
chown postgres:postgres /dados/$DESTINO

/bin/su -s /bin/bash -c "$PGCTL -D /dados/$DESTINO initdb" postgres

/bin/su -s /bin/bash -c "$PGCTL -D /dados/$DESTINO -l /tmp/$DESTINO.log start" postgres

echo " Aguardando 5 segundos"
sleep 5;

echo "gerando 1 milhão de linhas na tabela t1"

psql -U postgres -c "create table t1 as select s as id, s||'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ' as nome from generate_Series(1,1000000) s; "

tail -f /tmp/$DESTINO.log
