// Optional MongoDB seed. Run with mongosh after selecting the event_ticketing database:
// mongosh "mongodb://127.0.0.1:27017/event_ticketing" database/mongo-seed.js

// Ensure each event has only one metadata document.
db.event_metadata.createIndex(
  { event_id: 1 },
  { unique: true }
);

// Enforce MongoDB document structure and data types.
db.runCommand({
  collMod: "event_metadata",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "event_id",
        "description",
        "tags",
        "amenities",
        "search_keywords"
      ],
      properties: {
        event_id: {
          bsonType: ["int", "long"],
          minimum: 1
        },
        description: {
          bsonType: "string"
        },
        tags: {
          bsonType: "array",
          items: { bsonType: "string" }
        },
        amenities: {
          bsonType: "array",
          items: { bsonType: "string" }
        },
        search_keywords: {
          bsonType: "array",
          items: { bsonType: "string" }
        }
      }
    }
  },
  validationLevel: "strict",
  validationAction: "error"
});

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
