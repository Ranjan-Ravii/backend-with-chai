// // src/script/migrate.views.mjs
// import mongoose from "mongoose";
// import "dotenv/config";

// async function run() {
//   try {
//     const uri = process.env.MONGODB_URI;
//     if (!uri) {
//       console.error("❌ MONGODB_URI not found in .env");
//       process.exit(1);
//     }

//     console.log("⏳ Connecting to MongoDB...");
//     await mongoose.connect(uri, { dbName: "videoTube" }); // ensure correct DB

//     const coll = mongoose.connection.collection("videos"); // your collection

//     console.log("🔎 Migrating documents...");
//     const result = await coll.updateMany(
//       { views: { $exists: true } }, // match docs that have the old numeric field
//       [
//         { $set: { viewedBy: [] } },  // add new field as empty array
//         { $unset: "views" }          // remove the old numeric field
//       ]
//     );

//     console.log(`✅ Migration done. Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);

//     await mongoose.disconnect();
//     console.log("🔌 Disconnected. All good 🚀");
//   } catch (err) {
//     console.error("❌ Migration failed:", err);
//     process.exit(1);
//   }
// }

// run();



// src/script/migrate.views.mjs
import mongoose from "mongoose";
import "dotenv/config";

async function run() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error("❌ MONGODB_URI not found in .env");
      process.exit(1);
    }

    console.log("⏳ Connecting to MongoDB...");
    await mongoose.connect(uri, { dbName: "videoTube" }); // ensure correct DB

    const coll = mongoose.connection.collection("subscriptions"); // your collection

    console.log("🔎 Migrating documents...");
    const result = await coll.updateMany(
      { subscriber : { $exists: true } }, // match docs that have the old numeric field
      [
        { $set: { required: true } },  // add new field as empty array
        { $unset: "require" }          // remove the old numeric field
      ]
    );

    console.log(`✅ Migration done. Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);

    await mongoose.disconnect();
    console.log("🔌 Disconnected. All good 🚀");
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  }
}

run();
