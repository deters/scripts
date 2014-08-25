#!/bin/sh

# Set TV input to Cable box
echo 'tx 1f 82 10 00' > /tmp/tv;

# Power on the TV
echo 'on 0' > /tmp/tv;

# Just to garantee, set TV input again to cable box.
echo 'tx 1f 82 10 00' > /tmp/tv;

exit 0;

