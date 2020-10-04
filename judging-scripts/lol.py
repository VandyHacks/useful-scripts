import csv

id = 0
projects = []
with open("submissions.csv") as f:
  r = csv.reader(f)
  for row in r:
    if id != 0:
      projects.append({
        'title': row[0],
        'url': row[1]
      })
    id += 1

res = 'y'
judges = []
jn = int(input("Enter number of judges: "))
for j in range(jn):
  judges.append("")
for j in range(jn):
  plist = input("Copy paste their project list ids: ")
  pids = plist.split(", ")
  judges[j] += "Judge 1: \n"
  for pid in pids:
    i = int(pid)
    judges[j] += f"- {projects[i]['url']}\n"
  judges[j] += "\n"

f2 = open("out.txt", "w")
f2.write("\n".join(judges))
    