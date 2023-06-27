const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require("cors");
const bodyParser = require("body-parser");
require('dotenv').config();

const app = express();

app.use(bodyParser.json());
app.use(cors());

const port = 5000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.b3fdbfh.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

app.get('/', (req, res)=>{
    res.send("Hello")
});

async function run() {
  try {
    await client.connect();
    const database = client.db("emaJohnStore");
    const collection = database.collection("products");
    const ordersCollection = database.collection("orders");
    
    app.post('/addProduct',async(req,res)=>{
      const products = req.body;
      const result = await collection.insertOne(products);
      console.log(result.insertedCount);
    })

    app.get('/products', async(req,res)=>{
      const search = req.query.search;
      const querys = {name: {$regex: search}};
      const cursor = collection.find(querys);
      const documents = await cursor.toArray();
      res.send(documents);
    })

    app.get('/product/:key', async(req,res)=>{
      const key = req.params.key;
      const query = {key: key};
      const cursor = collection.find(query);
      const documents = await cursor.toArray();
      res.send(documents[0]);
    })
    
    app.post('/productByKeys', async(req,res) => {
      const productKeys = req.body;
      const query = {key: { $in: productKeys}};
      const cursor = collection.find(query);
      const documents = await cursor.toArray();
      res.send(documents);
    })

    app.post('/addOrder',async(req,res)=>{
      const order = req.body;
      const result = await ordersCollection.insertOne(order);
      res.send(result.insertedCount > 0);
    })


  } finally {
    //await client.close();
  }
}
run().catch(console.dir);

app.listen(process.env.PORT || port);