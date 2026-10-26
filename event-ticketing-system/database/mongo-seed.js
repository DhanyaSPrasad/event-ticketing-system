// Optional MongoDB seed. Run with mongosh after selecting the event_ticketing database:
// mongosh "mongodb://127.0.0.1:27017/event_ticketing" database/mongo-seed.js
db.event_metadata.createIndex({ search_keywords: "text", description: "text", tags: "text" });

db.event_metadata.updateOne(
  { event_id: 101 },
  { $set: {
      event_id: 101,
      description: "A live outdoor music concert for friends and families.",
      tags: ["music", "outdoor", "family-friendly"],
      amenities: ["parking", "food stalls"],
      search_keywords: ["concert", "live music", "weekend"]
  }},
  { upsert: true }
);

db.event_metadata.updateOne(
  { event_id: 102 },
  { $set: {
      event_id: 102,
      description: "A student technology meetup with talks and networking.",
      tags: ["technology", "students", "networking"],
      amenities: ["refreshments", "wifi"],
      search_keywords: ["technology", "meetup", "coding"]
  }},
  { upsert: true }
);
