#!/bin/sh

# kill any waiting process...
pkill -TERM wait.sh

# if TV is already on, it is faster to just change tv input to cable box.
echo 'tx 1f 82 10 00' > /tmp/tv;

# if TV was not ON, then turn it ON and try to switch input again.
echo 'on 0' > /tmp/tv;
echo 'tx 1f 82 10 00' > /tmp/tv;

exit 0;

