#!./venv/bin/python

import os
import glob
import geojson

json_dir_name = './'
json_pattern = os.path.join(json_dir_name,'*.geojson')
file_list = glob.glob(json_pattern)

collection = []

for file in file_list:
    with open(file) as f:
        layer = geojson.load(f)
        collection.append(layer)

geo_collection = geojson.GeometryCollection(collection)

with open('collection.geojson', 'w') as f:
    geojson.dump(geo_collection, f, ensure_ascii=False, indent=4)
