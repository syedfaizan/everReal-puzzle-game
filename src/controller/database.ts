import lowdb from "lowdb"
import FileAsync from "lowdb/adapters/FileAsync.js"
const adapter = new FileAsync("data.json");
const database = lowdb(adapter);


export async function init() {
    const db = await database;
    await db.defaults({ // initialize the database
        games: []
    }).write();
    return db;
}