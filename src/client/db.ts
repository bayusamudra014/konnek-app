import "client-only";
import Dexie, { Table } from "dexie";

export interface StoredMessage {
  to: string;
  from: string;
  timestamp: number;
  signature: string | null;
  message: string;
}

export class Database extends Dexie {
  messages: Table<StoredMessage>;

  constructor() {
    super("AppDatabase");
    this.version(1).stores({
      messages: "++id, timestamp, from, to",
    });
    this.messages = this.table("messages");
  }
}

export const db = new Database();
