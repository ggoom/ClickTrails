import json

f = open('./data3.json')
data = json.load(f);

# new_data = {'button_data': {}, 'click_data': {}, 'settings': {}}

for key in ['button_data', 'click_data']:
    for domain in data[key]:
        domain_data = data[key][domain]

        if domain not in data['settings']:
            data['settings'][domain] = {'active': True, 'mode': 1}
        data['settings'][domain]['mode'] = 1



        for hash in domain_data:
            data[key][domain][hash] = {'clicks': domain_data[hash]['clicks']}



f.close()
with open("new_data3.json", "w") as write_file:
    json.dump(data, write_file, indent=4)