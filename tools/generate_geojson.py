#!./venv/bin/python

import glob
import click
import json

from geojson import FeatureCollection, Feature, Point
from pathlib import Path


def retrieve_collections():
    files = glob.glob('../data/flensburg_*.json')
    collection = []

    for file in files:
        with open(file, 'r') as f:
            features = json.loads(f.read())

            for feature in features:
                collection.append(feature)

    return collection


def parse_collections(features):
    fc = []

    crs = {
        'type': 'name',
        'properties': {
            'name': 'urn:ogc:def:crs:OGC:1.3:CRS84'
        }
    }

    for feature in features:
        point = Point((float(feature['coords'][0]), float(feature['coords'][1])))

        properties = {
            'type': feature['type'],
            'details': feature['details'],
            'place': feature['place']
        }

        fc.append(Feature(geometry=point, properties=properties))

    c = FeatureCollection(fc, crs=crs)

    return c


def write_result(data, dst):
    with open(Path(dst), 'w') as f:
        json.dump(data, f, ensure_ascii=False)


@click.command()
@click.argument('dst')
def main(dst):
    features = retrieve_collections()
    collection = parse_collections(features)
    write_result(collection, dst)


if __name__ == '__main__':
    main()
