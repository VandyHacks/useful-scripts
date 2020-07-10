import json

outfile = open("./assignments.txt", "w")

judge_file = open("./judges.json", "r")
judge_json = json.load(judge_file)
judge_per_hack = judge_json["judge_per_hack"]
judge_list = judge_json["list"]
hack_list = [(i+1) for i in range(judge_json["num_hacks"])] if len(judge_json["hack_list"]) == 0 else judge_json["hack_list"]

judge_assignments = {}
for judge in judge_list:
  judge_assignments[judge] = []

judge_i = 0
for hack in hack_list:
  # judge -> hack mapping
  _ = [judge_assignments[judge_list[i % len(judge_list)]].append(hack) for i in range(judge_i, judge_i + judge_per_hack)]
  # hack -> judge mapping
  # judges_assigned = [judge_list[i % len(judge_list)] for i in range(judge_i, judge_i + judge_per_hack)]  
  # print(f"judges assigned to table: {hack} are {', '.join(judges_assigned)}")

  judge_i = (judge_i + judge_per_hack) % len(judge_list)

outfile.write(json.dumps(judge_assignments))
judge_file.close()
outfile.close()
