import socket
import re
from django.conf import settings
from types import UnicodeType, StringType
import logging
logger = logging.getLogger(__name__)


HOST = getattr(settings, 'ASPSMS_HOST', 'xml1.aspsms.com')
PORT = getattr(settings, 'ASPSMS_PORT', 5061)
KEY = getattr(settings, 'ASPSMS_KEY', None)
PASSWORD = getattr(settings, 'ASPSMS_PASSWORD', None)
ORIGINATOR = getattr(settings, 'ASPSMS_ORIGINATOR', None)

class SMSAPI(object):
    
    def __init__(self):
        self.host = HOST
        self.port = PORT
        self.key = KEY
        self.password = PASSWORD
        self.originator = ORIGINATOR
    
    
    def send(self, number, message):
        
        """
        do some checks...
        """
        
        print self.call_gateway(number, message)
        
    def encode(self, s):
        if type(s) is UnicodeType:
            return re.sub(
                r'[\x26\x3c\x3e\x80-\xff]',
                lambda c: '&#'+str(ord(c.group(0)))+';',
                unicode(s, 'utf-8').encode("iso8859_15")
            )
        elif type(s) is StringType:
            return re.sub(
                r'[\x26\x3c\x3e\x80-\xff]',
                lambda c: '&#'+str(ord(c.group(0)))+';', s
            )
        else:
            return s
    
    
    def call_gateway(self, number, message, originator=None):
        
        if not originator:
            originator = self.originator
            
        status = 0
        response = None
        error = None
        
        CONTENT="""<?xml version="1.0" encoding="ISO-8859-1"?>
          <aspsms>
           <Userkey>"""+str(self.key)+"""</Userkey>
            <Password>"""+str(self.password)+"""</Password>
            <Originator>"""+ str(originator) +"""</Originator>
            <Recipient>
            <PhoneNumber>"""+ str(number) +"""</PhoneNumber>
            </Recipient>
            <MessageData>"""+ str(message) +"""</MessageData>
            <Action>SendTextSMS</Action>
            </aspsms>"""
        
        length=len(CONTENT)
        
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.connect((self.host, self.port))
            s.send("POST /xmlsvr.asp HTTP/1.0\r\n")
            s.send("Content-Type: text/xml\r\n")
            s.send("Content-Length: "+str(length)+"\r\n\r\n")
            s.send(CONTENT)
            
            datarecv = s.recv(1024)
            response = str(datarecv)
            
            s.close()
            
            status = 1
            
        except Exception, e:
            error = e
            
        return response, error