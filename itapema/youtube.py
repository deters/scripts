#!/usr/bin/python
# -*- coding: utf-8 -*-

''' 

  This script shows how to automate the download of audio  or video
  from youtube, using data read from STDIN as search parameter.
  
'''

MAX_DOWNLOADS=1000
MAX_FILE_SIZE=''
AUDIO_ONLY=True
MAX_THREADS=5
CONTROLFILE='controlfile.txt'

import Queue
import subprocess
import threading
import sys

q = Queue.Queue()

# read some data from stdin
for line in sys.stdin:
    q.put(line)

downloads=0
stop=False

# 
def worker():
    global downloads
    global stop
    while not stop:
        if downloads > MAX_DOWNLOADS:
            stop=True
            return
        try:
            searchTerm = q.get()
            if searchTerm is None:
                return
            command=['youtube-dl']
            if AUDIO_ONLY:
                command+=['--extract-audio','--audio-format=aac']
            if MAX_FILE_SIZE:
                command+=['--max-filesize='+MAX_FILE_SIZE]
            if CONTROLFILE:
                command+=['--download-archive='+CONTROLFILE]
            command+=['ytsearch:'+searchTerm]
            process = subprocess.Popen(command, stdout=subprocess.PIPE)
            process.wait()
            if process.returncode == 0:
                downloads+=1
                print 'OK',searchTerm
            else:
                print 'ERRO ',process.returncode,searchTerm        				
        except KeyboardInterrupt:
            print 'Saindo'
            stop=True
            return

threads = [ threading.Thread(target=worker) for _i in range(MAX_THREADS) ]
for thread in threads:
    thread.start()
    q.put(None) 
