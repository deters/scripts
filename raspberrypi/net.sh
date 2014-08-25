#!/bin/sh

# This script will wait 30 segs and after that time will switch
# TV input to Cable Box, unless on_term hook occurs. In that case,
# the switch to TV will be cancelled.

on_term()
{
    exit 0
}

trap "on_term" TERM

# Wait 30 segs
sleep 10;
sleep 10;
sleep 10;

# switch TV to cable box.
echo 'tx 1f 82 10 00' > /tmp/tv;

exit 0;

