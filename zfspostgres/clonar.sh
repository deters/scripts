#!/bin/bash

STANDBY=$4
ORIGEM=$1
DESTINO=$2
PORTA=$3


PGCTL="/usr/lib/postgresql/9.5/bin/pg_ctl"
DATE="$(date --rfc-3339=seconds | sed 's; ;.;g')"

cd /tmp

# 1) parar o postgresql para ficar em um estado consistente

/bin/su -s /bin/bash -c "$PGCTL -D /dados/$ORIGEM -l /tmp/$ORIGEM.log stop" postgres

# 2) tirar um snapshot do diretorio de origem

/bin/su -s /bin/bash -c "$PGCTL -D /dados/$DESTINO -l /tmp/$DESTINO.log stop" postgres

zfs destroy -r dados/$DESTINO
zfs snapshot dados/$ORIGEM@$DATE

# 3) "montar" um novo diretorio baseado no snapshot

zfs clone dados/$ORIGEM@$DATE dados/$DESTINO

# 4) configurar a porta em que o novo banco irá subir


#sed -i.bak '/hot_standby = /d' /dados/$DESTINO/postgresql.conf

/bin/su -s /bin/bash -c "$PGCTL -D /dados/$ORIGEM -l /tmp/$ORIGEM.log start" postgres

PORTA_ORIGEM=$(cat "/dados/$ORIGEM/postgresql.conf" | egrep -i "#*PORT *=" | sed -e 's/.*=\s*//g' -e 's/[^0123456789].*//g');

case "$STANDBY" in 
  "--standby" )
      echo "CONFIGURANDO STANDBY"
      # modifica a origem para gerar logs de standby
      sed -i.bak "s/.*wal_level *=.*/wal_level = hot_standby/" /dados/$ORIGEM/postgresql.conf
      sed -i.bak "s/.*max_wal_senders *=.*/max_wal_senders = 3/" /dados/$ORIGEM/postgresql.conf
      sed -i.bak "s/.*wal_keep_segments *=.*/wal_keep_segments = 8/" /dados/$ORIGEM/postgresql.conf
      # habilita o usuario
      sed -i.bak "s/#local   replication/local	replication/g" /dados/$ORIGEM/pg_hba.conf
      sed -i.bak "s/#host    replication/host    replication/g" /dados/$ORIGEM/pg_hba.conf
      # modifica o destino para ser um standby
      sed -i.bak "s/.*hot_standby *=.*/hot_standby = on/" /dados/$DESTINO/postgresql.conf
      # cria o arquivo de recovery no destino
      cat > /dados/$DESTINO/recovery.conf <<- ______EOF
        standby_mode = 'on' 
        primary_conninfo = 'host=localhost port=$PORTA_ORIGEM '
        trigger_file = '/dados/$DESTINO/recovery.trigger'
______EOF
;;

  "--normal" )
      echo "CONFIGURANDO NORMAL"
      # se o destino foi gerado a partir de um standby, diz que nao será mais standby
      sed -i.bak "s/.*hot_standby *=.*/#hot_standby = on/" /dados/$DESTINO/postgresql.conf
      rm /dados/$DESTINO/recovery.conf
      
   ;;
esac

# modifica a porta do novo servidor

echo "[$PORTA_ORIGEM]"
sed -i.bak "s/.*port *=.*/port = $PORTA/" /dados/$DESTINO/postgresql.conf

sleep 5;

/bin/su -s /bin/bash -c "$PGCTL -D /dados/$DESTINO -l /tmp/$DESTINO.log start" postgres

zfs list -o origin,mountpoint | egrep "$DATE|NAME"

tail -f /tmp/$DESTINO.log
