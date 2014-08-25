#!/bin/sh


on_term()
{
    echo "Cancelando retorno para a NET..."
    exit 0
}

trap "on_term" TERM

echo 'Retorno para NET em 30 segundos.'

sleep 10;
sleep 10;
sleep 10;

echo 'tx 1f 82 10 00' > /tmp/tv;
exit 0;

