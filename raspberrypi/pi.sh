#!/bin/sh

# kill any net.sh script being executed...
pkill -TERM net.sh


# set TV input to raspberry pi
echo 'tx 1f 82 40 00' > /tmp/tv; # input 4

# start TV
echo 'on 0'           > /tmp/tv; # on 0

# Just to garantee, set TV input again to raspberry pi
echo 'tx 1f 82 40 00' > /tmp/tv; # input 4

exit 0;

