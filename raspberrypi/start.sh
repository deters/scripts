#!/bin/sh

mkfifo /tmp/tv
chmod 777 /tmp/tv
/usr/local/bin/cec-client < /tmp/tv > /tmp/tv.out &
echo "." > /tmp/tv #just to start the process.
exit 0;

