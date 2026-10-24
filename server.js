const express = require("express");
const path = require("path");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
const PORT = Number(process.env.PORT || 3000);
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017";
const DB_NAME = process.env.DB_NAME || "mybuglab";

// Safety: this starter lab binds to localhost only.
app.use(express.json({ limit: "100kb" }));
app.use(express.static(path.join(__dirname, "public")));

let db;
let mongoClient;

app.get("/api/health", async (req, res) => {
  let database = "disconnected";
  try {
    if (db) {
      await db.command({ ping: 1 });
      database = "connected";
    }
  } catch (_) {}
  res.json({ app: "MyBugLab", status: "ok", database });
});

app.get("/api/lab-info", (req, res) => {
  res.json({
    name: "MyBugLab",
    purpose: "Local, authorized web-security practice",
    safety: "Bound to 127.0.0.1; use only with your own lab",
    modules: ["HTTP basics", "API inspection", "access-control concepts", "input validation"]
  });
});

// Demonstration dataset: fake records only. This endpoint is deliberately
// read-only and returns synthetic lab data, not real user information.
app.get("/api/demo/profiles", (req, res) => {
  res.json([
    { id: "user-1001", username: "alice_demo", role: "user", bio: "Learning web security" },
    { id: "user-1002", username: "bob_demo", role: "user", bio: "Practicing API testing" },
    { id: "user-1003", username: "admin_demo", role: "admin", bio: "Lab administrator account (fictional)" }
  ]);
});

// Simple safe input-validation exercise. It accepts a search term and returns
// matching fake lab posts; it does not execute user input as a database query.
app.get("/api/demo/search", (req, res) => {
  const q = String(req.query.q || "").slice(0, 80).toLowerCase();
  const posts = [
    { id: "post-1", title: "Welcome to MyBugLab", category: "announcements" },
    { id: "post-2", title: "Understanding HTTP requests", category: "learning" },
    { id: "post-3", title: "Access control practice", category: "security" }
  ];
  res.json({ query: q, results: posts.filter(p => (p.title + " " + p.category).toLowerCase().includes(q)) });
});

// MongoDB: list records from a lab collection.
app.get("/api/posts", async (req, res) => {
  if (!db) return res.status(503).json({ error: "MongoDB is not connected. Check setup instructions." });
  try {
    const posts = await db.collection("posts").find({}).sort({ createdAt: -1 }).limit(50).toArray();
    res.json(posts);
  } catch (err) {
    console.error("List posts failed:", err.message);
    res.status(500).json({ error: "Could not load posts." });
  }
});

// MongoDB: create a post with server-side validation.
app.post("/api/posts", async (req, res) => {
  if (!db) return res.status(503).json({ error: "MongoDB is not connected. Check setup instructions." });
  const title = typeof req.body.title === "string" ? req.body.title.trim() : "";
  const body = typeof req.body.body === "string" ? req.body.body.trim() : "";
  if (!title || title.length > 100 || !body || body.length > 1000) {
    return res.status(400).json({ error: "Title (1–100 chars) and body (1–1000 chars) are required." });
  }
  try {
    const doc = { title, body, createdAt: new Date(), labData: true };
    const result = await db.collection("posts").insertOne(doc);
    res.status(201).json({ ...doc, _id: result.insertedId });
  } catch (err) {
    console.error("Create post failed:", err.message);
    res.status(500).json({ error: "Could not save post." });
  }
});

app.get("/api/posts/:id", async (req, res) => {
  if (!db) return res.status(503).json({ error: "MongoDB is not connected. Check setup instructions." });
  if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: "Invalid post ID." });
  try {
    const post = await db.collection("posts").findOne({ _id: new ObjectId(req.params.id) });
    if (!post) return res.status(404).json({ error: "Post not found." });
    res.json(post);
  } catch (err) {
    console.error("Get post failed:", err.message);
    res.status(500).json({ error: "Could not load post." });
  }
});

app.use((req, res) => {
  if (req.path.startsWith("/api/")) return res.status(404).json({ error: "API route not found." });
  res.status(404).sendFile(path.join(__dirname, "public", "404.html"));
});

async function start() {
  try {
    mongoClient = new MongoClient(MONGO_URI, { serverSelectionTimeoutMS: 2500 });
    await mongoClient.connect();
    db = mongoClient.db(DB_NAME);
    await db.command({ ping: 1 });
    console.log(`MongoDB connected: ${DB_NAME}`);
  } catch (err) {
    console.warn("MongoDB not available yet:", err.message);
    console.warn("The homepage and demo APIs still work. Start MongoDB, then restart MyBugLab to enable saved posts.");
  }

  app.listen(PORT, "127.0.0.1", () => {
    console.log(`MyBugLab running at http://127.0.0.1:${PORT}`);
    console.log("Local-only mode: this server is bound to 127.0.0.1.");
  });
}

async function shutdown() {
  if (mongoClient) await mongoClient.close().catch(() => {});
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

start();
