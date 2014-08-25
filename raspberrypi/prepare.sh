#!/bin/sh

# Create a fifo to receive CEC commands
mkfifo /tmp/tv

# This script is running as root, so we need to change permissions 
# of ths FIFO to allow "pi" user to write on FIFO.
chmod 777 /tmp/tv

# Any command written in FIFO (/tmp/tv) will be sent to CEC-CLIENT.
# The CEC-CLIENT output will be sent to the file /tmp/tv.out
/usr/local/bin/cec-client < /tmp/tv > /tmp/tv.out &

# put anything on the FIFO
echo "." > /tmp/tv #just to start the process.

exit 0;

