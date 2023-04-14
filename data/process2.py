import json

f = open('./data2.json')
data = json.load(f);

new_data = {'button_data': {}, 'click_data': {}, 'settings': {}}

for key in ['button_data', 'click_data']:
    for domain in data[key]:
        domain_data = data[key][domain]

        if domain not in new_data['settings']:
            new_data['settings'][domain] = {'active': True}

        for hash in domain_data:
            if domain not in new_data[key]:
                new_data[key][domain] = {}
            new_data[key][domain][hash] = {'clicks': domain_data[hash]['clicks'], 'mode': 1}


f.close()
with open("new_data2.json", "w") as write_file:
    json.dump(new_data, write_file, indent=4)