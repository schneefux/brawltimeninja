#!/usr/bin/env python
"""
Generate data JSON from APK CSV source.
"""

import copy
import csv
import os
try:
    import ujson as json
except ImportError:
    import json

basepath = "./brawlstars/assets"

def cleanup(value):
    if isinstance(value, str):
        # Typing
        if value.startswith('TID_'):
            i['raw' + j[0].upper() + j[1:]] = value.replace('TID_', '')

        elif '.' in value:
            try:
                value = float(value)
            except ValueError:
                pass
        else:
            try:
                value = int(value)
            except ValueError:
                pass

        if isinstance(value, str):
            if value.lower() == 'true':
                value = True
            elif value.lower() == 'false':
                value = False

    if value == '':
        value = None

    # Clean
    elif isinstance(value, str):
        value = value.strip()

    return value


if __name__ == '__main__':
    TID = {}
    for i in os.listdir(basepath + '/localization'):
        if i == 'texts_patch.csv':
            continue
        with open(basepath + f'/localization/{i}', encoding='utf-8') as f:
            reader = csv.DictReader(f)

            title = reader.fieldnames
            lang = i.replace('.csv', '')
            if lang == 'texts':
                lang = 'en'

            TID[lang] = {}
            for n, row in enumerate(reader):
                if n == 0:
                    continue
                TID[lang][row['TID']] = row[lang.upper()]

    all_data = {i: {} for i in TID}

    csv_files = [(basepath + '/csv_client/' + i, i) for i in os.listdir(basepath + '/csv_client') if i.endswith('.csv')] + \
                [(basepath + '/csv_logic/' + i, i) for i in os.listdir(basepath + '/csv_logic') if i.endswith('.csv')]

    for fp, fn in csv_files:
        with open(fp, encoding='utf-8') as f:
            reader = csv.DictReader(f)

            title = reader.fieldnames

            data = []
            for n, row in enumerate(reader):
                if n == 0:
                    continue
                data.append({title[i][:1].lower() + title[i][1:]: row[title[i]] for i in range(len(title))})

            sc_id_index = 0
            for n, i in enumerate(data):
                i_keys = list(i.keys())
                if not i.get('name', True):
                    for j in i_keys:
                        i[j] = cleanup(i[j])
                        if i[j]:
                            offset = 0
                            for k in range(1, n):
                                if data[n - k].get('name'):
                                    offset = k
                                    offset = n - k
                                    break
                            if isinstance(data[n - offset][j], list):
                                data[n - offset][j].append(i[j])
                            if isinstance(data[offset][j], list):
                                data[offset][j].append(i[j])
                            else:
                                data[n - offset][j] = [data[n - 1][j], i[j]]
                                data[offset][j] = [data[n - 1][j], i[j]]
                            i[j] = None
                    continue

                for j in i_keys:
                    i[j] = cleanup(i[j])

            if fn == 'maps.csv':
                # make maps look cool
                rp_data = {}
                for i in data:
                    if i['group']:
                        latest_grp = i['group']
                        rp_data[i['group']] = [i['data']]
                    else:
                        rp_data[latest_grp].append(i['data'])
                data = {i: rp_data[i] for i in sorted(rp_data.keys())}

            # languages
            if fn != 'maps.csv':
                for lang in TID:
                    change_data = copy.deepcopy(data)  # might be able to remove
                    for n, i in enumerate(change_data):
                        i_keys = list(i.keys())
                        for j in i_keys:
                            if isinstance(i[j], str) and i[j].startswith('TID_'):
                                try:
                                    i[j] = TID[lang]['TID_' + i[j][4:]]
                                except KeyError:
                                    pass

                    if not os.path.exists(f"json/{lang}"):
                        os.makedirs(f"json/{lang}")
                    with open(f"json/{lang}/{fn.replace('.csv', '.json')}", 'w+') as f:
                        json.dump(change_data, f, indent=4)

                    all_data[lang][fn.replace('.csv', '')] = copy.deepcopy(change_data)
            else:
                for lang in TID:
                    with open(f"json/{lang}/{fn.replace('.csv', '.json')}", 'w+') as f:
                        json.dump(data, f, indent=4)

                    all_data[lang][fn.replace('.csv', '')] = data

        print("converted to json: "+ fp)

    # tid.json
    for i in TID:
        with open(f'json/{i}/tid.json', 'w+') as f:
            print(f'json/{i}/tid.json')
            all_data[i]['tid'] = {j[4:]: TID[i][j] for j in TID[i]}
            json.dump(TID[i], f, indent=4)

    # all.json
    for i in TID:
        with open(f'json/{i}/all.json', 'w+') as f:
            print(f'json/{i}/all.json')
            json.dump(all_data[i], f, indent=4)
