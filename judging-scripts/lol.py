import csv

id = 0
projects = []
with open("submissions.csv") as f:
  r = csv.reader(f)
  for row in r:
    if id != 0 and row[0] != "Vandyhacks":
      projects.append({
        'title': row[0],
        'url': row[1]
      })
    id += 1
print(id)

res = 'y'
judges = []
jnames = ["Shalini Gupta", "Tim Eccleston", "Prof. Julie Johnson", "Prof. Catie Chang", "Eliott Fernando", "Michael Copeland", "Krish Munot", "Lucas Remedios", "Aleksandr Zakharov", "Arjun Sharma", "Irfaan", "Matt", "Dr. Molvig"]
print(len(jnames))
jn = len(jnames)
# jn = int(input("Enter number of judges: "))
for j in range(jn):
  judges.append("")
for j in range(jn):
  plist = input("Copy paste their project list ids: ")
  pids = plist.split(", ")
  judges[j] += f"{jnames[j]}: \n"
  for pid in pids:
    i = int(pid) - 1
    print(i)
    judges[j] += f"- {projects[i]['url']}\n"
  judges[j] += "\n"

f2 = open("out.txt", "w")
f2.write("\n".join(judges))
    