import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DATABASE ?? "event_ticketing";
let clientPromise: Promise<MongoClient> | null = null;

export async function getMongoDb() {
  if (!uri) return null;
  if (!clientPromise) {
    const client = new MongoClient(uri);
    clientPromise = client.connect();
  }
  const client = await clientPromise;
  return client.db(dbName);
}
