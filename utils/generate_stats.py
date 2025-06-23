import json
from pathlib import Path

import requests

url = "https://api.minecraftservices.com/minecraft/profile/lookup/"

directory = Path("utils/raw")
uuids = [file.stem for file in directory.iterdir() if file.is_file()]

stats = []
for uuid in uuids:
    username_url = url + uuid
    response = requests.get(username_url)

    username = "Herobrine"
    total_deaths = 0
    total_playtime = 0

    if response.status_code == 200:
        username_obj = json.loads(response.text)
        username = username_obj["name"]
    else:
        print(f"Error: {response.status_code}")

    json_path = Path(f"utils/raw/{uuid}.json")

    with open(json_path, "r") as file:
        data = json.load(file)

    if "stats" in data and "minecraft:custom" in data["stats"]:
        if "minecraft:play_time" in data["stats"]["minecraft:custom"]:
            total_playtime = data["stats"]["minecraft:custom"]["minecraft:play_time"]

        if "minecraft:deaths" in data["stats"]["minecraft:custom"]:
            total_deaths = data["stats"]["minecraft:custom"]["minecraft:deaths"]

    stats.append(
        {
            "username": username,
            "total_deaths": total_deaths,
            "total_playtime": total_playtime,
        }
    )

print(stats)
