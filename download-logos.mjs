import fs from "fs";
import fetch from "node-fetch";

const teams = [
  { id: 57, name: "arsenal" },
  { id: 58, name: "astonvilla" },
  { id: 61, name: "chelsea" },
  { id: 62, name: "everton" },
  { id: 63, name: "fulham" },
  { id: 64, name: "liverpool" },
  { id: 65, name: "mancity" },
  { id: 66, name: "manutd" },
  { id: 67, name: "newcastle" },
  { id: 71, name: "sunderland" },
  { id: 73, name: "tottenham" },
  { id: 76, name: "wolves" },
  { id: 328, name: "burnley" },
  { id: 341, name: "leeds" },
  { id: 351, name: "nottingham" },
  { id: 354, name: "crystalpalace" },
  { id: 397, name: "brighton" },
  { id: 402, name: "brentford" },
  { id: 563, name: "westham" },

  // Bournemouth 추가하지만 다운로드는 안 함
  { id: 1044, name: "bournemouth" },
];

async function downloadAll() {
  if (!fs.existsSync("./public/logos")) {
    fs.mkdirSync("./public/logos", { recursive: true });
  }

  for (let t of teams) {
    // 🔥 Bournemouth는 PNG이므로 다운로드 스킵!
    if (t.id === 1044) {
      console.log("⏩ Skipping Bournemouth (PNG manually stored)");
      continue;
    }

    const url = `https://crests.football-data.org/${t.id}.svg`;

    console.log("Downloading:", url);

    const res = await fetch(url);

    if (!res.ok) {
      console.error(`❌ Failed: ${t.name} (${url})`);
      continue;
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(`./public/logos/${t.name}.svg`, buffer);

    console.log("✅ Saved:", t.name);
  }

  console.log("🎉 All done!");
}

downloadAll();
