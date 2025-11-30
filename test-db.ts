import sqlite3 from "sqlite3";
import { open } from "sqlite";

async function test() {
  const db = await open({
    filename: "./sportsive.db",  // DB 파일 경로
    driver: sqlite3.Database,
  });

  const rows = await db.all("SELECT name FROM sqlite_master WHERE type='table';");
  console.log(rows);

  await db.close();
}

test();
