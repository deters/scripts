#!/bin/sh


pkill -TERM net.sh


echo 'tx 1f 82 40 00' > /tmp/tv; # input 4
echo 'on 0'           > /tmp/tv; # on 0
echo 'tx 1f 82 40 00' > /tmp/tv; # input 4
exit 0;

