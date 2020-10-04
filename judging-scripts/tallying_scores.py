import csv

project_num = 73
t_w = 1
c_w = 1
top = 10
p_w = 1
u_w = 1
i_w = 1
scores = {}
# idk = {}
# for project in range(1, project_num + 1):
#     scores[project] = []

with open("responses.csv", encoding="utf-8") as csv_file:
    csv_reader = csv.reader(csv_file)
    line_count = 0
    for row in csv_reader:
        # print(row)
        if (
            line_count != 0
            and (table := (row[2]))
            and (technical := (row[3]))
            and (creativity := (row[4]))
            and (utility := (row[5]))
            and (presentation := (row[6]))
            and (impression := (row[7]))
        ):
            final_score = (
                (t_w * int(technical))
                + (u_w * int(utility))
                + (c_w * int(creativity))
                + (p_w * int(presentation))
                + (int(impression) * i_w)
            )
            table = int(table)
            if table not in scores.keys():
                scores[table] = []
                # print(table)
            scores[table] = scores[table] + [final_score]
        line_count += 1
    # print(scores)
    for tnum in range(1, len(scores) + 1):
        scores[tnum] = sum(scores[tnum]) / len(scores[tnum])
    # print(scores)
    lol = {
        k: v for k, v in sorted(scores.items(), key=lambda item: item[1], reverse=True)
    }
    for k, v in lol.items():
        print(f"Project {k}: {v}")
        top -= 1
        if top <= 0:
            break
