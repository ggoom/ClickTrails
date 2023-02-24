import json

f = open('./data.json')
data = json.load(f);

new_data = {'button_data': {}, 'click_data': {}}

for key in new_data:
    for website in data[key]:
        site_data = data[key][website]
        for hash in site_data:
            if website not in new_data[key]:
                new_data[key][website] = {}
            new_data[key][website][hash] = {'clicks': site_data[hash], 'hide': False, 'highlight': True, 'increase': 0, 'decrease': 0}



print(new_data)
f.close()
with open("new_data.json", "w") as write_file:
    json.dump(new_data, write_file, indent=4)