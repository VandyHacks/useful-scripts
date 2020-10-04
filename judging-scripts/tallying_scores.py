import csv
from collections import OrderedDict

project_num = 51
t_w = 1
c_w = 1
top = 10
p_w = 1
u_w = 1
i_w = 1
scores = {}
idk = {}
for project in range(project_num):
  scores[project + 1] = []

with open('responses.csv', encoding='utf-8') as csv_file:
  csv_reader = csv.reader(csv_file)
  line_count = 0
  for row in csv_reader:
    if line_count != 0 and row[2] != '' and row[4] != '' and row[3] != '' and row[5] != '' and row[6] != '' and row[7] != '':
      table = int(row[2])
      technical = int(row[3])
      creativity = int(row[4])
      utility = int(row[5])
      presentation = int(row[6])
      impression = int(row[7])
      final_score = (t_w * technical) + (u_w * utility) + (c_w * creativity) + (p_w * presentation) + (impression * i_w)
      scores[table] = scores[table] + [final_score]
    line_count += 1
  for tnum in range(1, len(scores) + 1):
    scores[tnum] = sum(scores[tnum])/len(scores[tnum])
  # print(scores)
  lol = {k: v for k, v in sorted(scores.items(), key=lambda item: item[1], reverse=True)}
  for k, v in lol.items():
    print(f"Project {k}: {v}")
    top -= 1
    if top <= 0:
      break