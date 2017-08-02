#!/usr/bin/python
# -*- coding: utf-8 -*-

''' 

  This script shows how to extract data from an html page and print this 
  data into the STDOUT.

'''


import datetime
import sys



# default parameters
DATE=datetime.date.today().strftime('%d%m%Y')
START_TIME='00:00'
END_TIME='23:00'



if len(sys.argv) not in (1,2,4):
    print 'Get ItapemaFM playlist at given date and time, and print to STDOUT'
    print '  Usage:     ./itapema.py [DATE] [ START_TIME  END_TIME ]'
    print '  Examples:  ./itapema.py '
    print '             ./itapema.py 23082014 07:00 23:59'
    sys.exit(1)



if len(sys.argv) == 4:
    START_TIME=sys.argv[2]
    END_TIME=sys.argv[3]

if len(sys.argv) > 1:
	DATE=sys.argv[1]

from BeautifulSoup import BeautifulSoup as BS
import urllib2

response = urllib2.urlopen('http://www.clicrbs.com.br/especial/sc/itapemafmsc/65,434,15,2,5,2,'+ DATE +',PlayList.html')
content = response.read().decode('latin1')
soup = BS(content)
elem = soup.findAll('tr')
for e in elem:
    tds = e.findAll('td')
    if len(tds) == 5:
        music=tds[1].text
        artist=tds[2].text.split('(')[0]
        time=tds[0].text
        content=u''+artist+' - '+music
        if 'Vinheta'.upper() not in content.upper() and 'Itapema'.upper() not in content.upper():
            if time >= START_TIME and time <= END_TIME:
                print content.encode('utf8')
