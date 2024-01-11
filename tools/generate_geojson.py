#!./venv/bin/python

import json
import click

from geojson import FeatureCollection, Feature, Point


def get_data(json_file):
    with open(json_file, 'r') as f:
        d = json.loads(f.read())
    
    return d


@click.command()
@click.argument('json_file')
@click.argument('geojson_file')
def main(json_file, geojson_file):
    d = get_data(json_file)
    fc = []

    crs = {
        'type': 'name',
        'properties': {
            'name': 'urn:ogc:def:crs:OGC:1.3:CRS84'
        }
    }

    for o in d:
        if not o['coords'] or len(o['coords']) != 2:
            continue

        point = Point((float(o['coords'][0]), float(o['coords'][1])))
            
        properties = {
            'type': o['type'],
            'location': o['location'],
            'details': o['details']
        }

        fc.append(Feature(geometry=point, properties=properties))

    c = FeatureCollection(fc, crs=crs)

    with open(geojson_file, 'w') as f:
        json.dump(c, f, ensure_ascii=False, indent=4)


if __name__ == '__main__':
    main()
