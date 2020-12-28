import csv
import json
'''
Example in this case extracts columns form hackers.json to hackers.csv. hackers.json is extracted from Vaken.
'''

# CSV column names
csvColumns = ['Email', 'First Name', 'Last Name']
jsonFields = ['email', 'firstName', 'lastName']

# writing to csv file
with open('hackers.csv', 'w') as csvfile:
    # creating a csv writer object
    csvwriter = csv.writer(csvfile)

    # writing the fields
    csvwriter.writerow(csvColumns)
    with open('hackers.json') as json_file:
        data = json.load(json_file)
        for user in data:
            hacker = []
            for i in jsonFields:
                if i in user:
                    hacker.append(user[i])
                else:
                    hacker.append('')
            csvwriter.writerow(hacker)