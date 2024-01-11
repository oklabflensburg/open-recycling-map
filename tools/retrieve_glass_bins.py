#!./venv/bin/python

import re
import httpx
import click
import json

from lxml import html
from html import unescape
from pathlib import Path


def request_content(url):
    r = httpx.get(url, timeout=2)

    if r.status_code != 200:
        return None

    return r.text


def parse_result(content):
    doc = html.document_fromstring(content)
    a = doc.xpath('//script')

    data = []

    for i in a:
        if re.search(r'.*window\.ikiss_geodata = \[.*', i.text_content()):
            m = re.findall(r'(\[.*|\\u]\])+,\n|\r\n', i.text_content(), re.MULTILINE)

            for n in m:
                dn = unescape(n)
                dnc = re.sub(r'Name":|Beschreibung":|[\[\]\{\}"]|(\<h\d\>)', '', dn)
                dng = re.sub(r'(\<\/h\d\>)|(\<br\>)', ',', dnc)
                ll = dng.split(',')
                del ll[2]
                del ll[2]

                while len(ll) > 4:
                    del ll[4]

                d = {
                    'type': 'glass_bottle_bin',
                    'location': ll[2],
                    'details': ll[3],
                    'coords': [float(ll[1]), float(ll[0])]
                }

            data.append(d)

    return data


def write_result(data, dst):
    with open(Path(dst), 'w') as f:
        json.dump(data, f, ensure_ascii=False)


@click.command()
@click.argument('dst')
def main(dst):
    url = 'https://www.tbz-flensburg.de/Abfallwirtschaft/Altglas/'
    content = request_content(url)
    data = parse_result(content)
    write_result(data, dst)


if __name__ == '__main__':
    main()
