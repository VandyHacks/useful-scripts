import csv
from collections import OrderedDict

project_num = 15
t_w = 3
c_w = 2
top = 5
p_w = 2
u_w = 1
i_w = 1
scores = {}
idk = {}
for project in range(project_num):
  scores[project + 1] = []

# https://forms.gle/2xqQgfFYmA8ryH1U6 form
with open('./responses.csv') as csv_file:
  csv_reader = csv.reader(csv_file, delimiter=',')
  line_count = 0
  for row in csv_reader:
    if line_count != 0:
      table = int(row[2])
      technical = int(row[3])
      creativity = int(row[4])
      utility = int(row[5])
      presentation = int(row[6])
      impression = int(row[7])
      final_score = (t_w * technical) + (u_w * utility) + (c_w * creativity) + (p_w * presentation) + (impression * i_w)
      scores[table] = scores[table] + [final_score]
    line_count += 1
  for table in scores:
    scores[table] = sum(scores[table])/len(scores[table])
    if scores[table] in idk:
      idk[scores[table]] = idk[scores[table]] + [table]
    else:
      idk[scores[table]] = [table]
  i = 1
  idk_o = OrderedDict(sorted(idk.items(), reverse=True))
  for k, v in idk_o.items():
    if i > top:
      break
    else:
      print(f'score {k} was achieved by projects: {v}')
    i += 1


