const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

var MongoClient = require("mongodb").MongoClient;
const url = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/";
var client = new MongoClient(url, { useNewUrlParser: true });

app.get("/health", async (req, res) => {
  try {
    await client.connect();
    if (client) {
      res.status(200).send("OK");
    }
  } catch (err) {
    res.status(500).send("Error");
  } finally {
    await client.close();
  }
});

app.get("/", (req, res) => {});

app.listen(port, () => {
  console.log(`Start on port => ${port}`);
});
