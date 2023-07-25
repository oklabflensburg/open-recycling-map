#!./venv/bin/python

import re
import json
import html as htm
import requests

from lxml import html


url = 'https://www.tbz-flensburg.de/Abfallwirtschaft/Alttextilien/'


r = requests.get(url)

if r.status_code != 200:
    pass

doc = html.document_fromstring(r.content)

a = doc.xpath('//script')

for i in a:
    if re.search(r'.*window\.ikiss_geodata = \[.*', i.text_content()):
        m = re.findall(r'(\[.*|\\u]\])+,\n|\r\n', i.text_content(), re.MULTILINE)
        data = []

        for n in m:
            dn = htm.unescape(n)
            dnc = re.sub(r'Name":|Beschreibung":|[\[\]\{\}"]|(\<h\d\>)', '', dn)
            dng = re.sub(r'(\<\/h\d\>)|(\<br\>)', ',', dnc)
            ll = dng.split(',')
            del ll[2]
            del ll[2]

            while len(ll) > 4:
                del ll[4]

            print(ll)

            d = {
                'type': 'recycling-bank',
                'location': ll[2],
                'details': ll[3],
                'coords': [float(ll[1]), float(ll[0])]
            }

            data.append(d)
        
        with open('flensburg_alttextilien_container.json', 'w') as f:
            json.dump(data, f, ensure_ascii=False, indent=4)

