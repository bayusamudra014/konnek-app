import "client-only";
import Dexie, { Table } from "dexie";
import { Message } from "@/client/api/message";

export class Database extends Dexie {
  messages: Table<Message>;

  constructor() {
    super("AppDatabase");
    this.version(1).stores({
      message: "id, timestamp, from, to, message, signature",
    });
    this.messages = this.table("messages");
  }
}

export const db = new Database();
