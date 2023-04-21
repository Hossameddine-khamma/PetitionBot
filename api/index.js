const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require("body-parser");
const ObjectId = require("mongodb").ObjectId;

app.use(bodyParser.json());
var MongoClient = require("mongodb").MongoClient;
const url = process.env.MONGO_URL || "mongodb://root:root@127.0.0.1:27017/";
var client = new MongoClient(url, { useNewUrlParser: true });

app.get("/health", async (req, res) => {
  try {
    await client.connect();
    if (client) {
      res.status(200).send("OK");
    }
    client.close();
  } catch (err) {
    res.status(500).send("Error");
  }
});

app.post("/petition", async (req, res) => {
  // Document petition => user_create, sujet, date_create, date_close, id
  if (req.body.username && req.body.sujet) {
    var date = new Date();
    const petition = {
      user_create: req.body.username,
      sujet: req.body.sujet,
      date_create: new Date(),
      date_close: new Date(date.setDate(date.getDate() + 7)),
      _id: new ObjectId(),
    };

    try {
      await client.connect();
      const db = client.db("petition");
      const collection = db.collection("petition");
      const result = await collection.insertOne(petition);
      client.close();
      return res.status(200).send(result);
    } catch (err) {
      console.log(err);
      return res.status(500).send("Catch", err);
    }
  } else {
    return res.status(400).send("Bad request");
  }
});

app.post("/petition/:id", async (req, res) => {
  if (req.params.id) {
    try {
      await client.connect();
      const db = client.db("petition");
      // console.log("====================================");
      // console.log("here1");
      // console.log("====================================");
      const collection = db.collection("petition");
      console.log("====================================");
      console.log(collection);
      console.log("====================================");
      const query = { _id: new ObjectId(req.params.id) };
      const petition = await collection.findOne(query);
      if (petition) {
        if (req.body.yes && req.body.no) {
          var data = { $set: { yes: req.body.yes, no: req.body.no } };
          const result = await collection.updateOne(
            query,
            data,
            (err, collection) => {
              if (err) console.log(err);
              console.log("Record updated successfully");
            }
          );
          client.close();
          return res.status(200).send(result);
        } else {
          return res.status(400).send("Bad request");
        }
      } else {
        return res.status(404).send("Not found petition");
      }
    } catch (err) {
      console.log(err);
      return res.status(500).send("Catch", err);
    }
  } else {
    return res.status(400).send("Bad request");
  }
});

app.get("/petitions", async (req, res) => {
  try {
    await client.connect();
    const db = client.db("petition");
    const collection = await db.collection("petition");
    const result = await collection.find({}).toArray();
    client.close();
    return res.status(200).send(result);
  } catch (err) {
    console.log(err);
    return res.status(200).send({ message: "Petitions not found" });
  }
});

app.listen(port, () => {
  console.log(`Start on port => ${port}`);
});
