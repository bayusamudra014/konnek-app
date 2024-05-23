import "client-only";
import Dexie, { Table } from "dexie";

export interface Message {
  id?: number;
  content: string;
  sender_id: string;
  receiver_id: string;
}

export interface Friend {
  id: string;
  name: string;
  pubkey: string;
}

export class Database extends Dexie {
  messages: Table<Message>;
  friends: Table<Friend>;

  constructor() {
    super("AppDatabase");
    this.version(1).stores({
      message: "id, timestamp, from, to",
      friends: "id, userid, certificate",
    });
    this.messages = this.table("messages");
    this.friends = this.table("friends");
  }
}

export const db = new Database();
