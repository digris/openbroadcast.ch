from bs4 import BeautifulSoup
from feincms_cleanse import cleanse_html

def parse_text(text):

    soup = BeautifulSoup(text)

    #rels = soup.find_all(attrs={'data-ct': 'user'})
    #for rel in rels:
    #    print rel

    return soup.getText()

    #return cleanse_html(text)



