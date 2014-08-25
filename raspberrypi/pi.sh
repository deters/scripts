#!/bin/sh

# kill any waiting process...
pkill -TERM wait.sh


# if TV is already on, it is faster to just change tv input to raspberry pi.
echo 'tx 1f 82 40 00' > /tmp/tv; # input 4

# if TV was not ON, then turn it ON and try to switch input again.
echo 'on 0'           > /tmp/tv; # on 0
echo 'tx 1f 82 40 00' > /tmp/tv; # input 4 

exit 0;

