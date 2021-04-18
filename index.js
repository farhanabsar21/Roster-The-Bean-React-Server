const express = require('express')
const bodyParser = require("body-parser");
const cors = require("cors");
const MongoClient = require('mongodb').MongoClient;
require("dotenv").config();
require('base-64');
const fileUpload = require('express-fileupload');
const fs = require("fs-extra");
const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(cors());
app.use(fileUpload());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ihxuz.mongodb.net/roasterBean?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const orderCollection = client.db("roasterBean").collection("order");
  const serviceCollection = client.db("roasterBean").collection("services");
  const reviewCollection = client.db("roasterBean").collection("reviews");
  const ordersCollection = client.db("roasterBean").collection("orders");
  const adminCollection = client.db("roasterBean").collection("adminMail");

  app.get("/services", (req, res)=>{
      serviceCollection.find({})
        .toArray((error, docs)=>{
            res.send(docs)
        })
  })

  // insert new review 
  app.post('/addReview', (req, res) => {

    let name = req.body.name;
    let designation = req.body.designation;
    let message = req.body.message;
    let file = req.files.file;
    const newImg = file.data;
    const encImg = newImg.toString('base64');
    let image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, 'base64')
    }

    reviewCollection.insertOne({ name, designation, message, image })
      .then((result) => {
        res.send(result.insertedCount > 0)
      })
  })

  // insert new service 
  app.post('/addService', (req, res) => {

    let name = req.body.name;
    let designation = req.body.designation;
    let file = req.files.file;

    const newImg = file.data;
    const encImg = newImg.toString('base64');
    
    let image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, 'base64')
    }

    reviewCollection.insertOne({ name, designation, image })
      .then((result) => {
        res.send(result.insertedCount > 0)
      })
  })
  
  // single service payment
  app.get("/user/payment/:serviceId", (req, res)=>{
    serviceCollection.find({key: req.params.key})
      .toArray((err, docs) => {
          res.send(docs[0]);
      })
  })

  // get all reviews
  app.get('/review', (req, res) => {
    reviewCollection.find({})
      .toArray((error, docs) => {
        res.send(docs);
      })
  });

  // user orders
  app.post("/userOrders", (req, res) => {
    const selectedItem = req.body;
    ordersCollection.insertMany(selectedItem)
      .then(result => {
        res.send(result);
      })
  })
  app.get('/userOrders', (req, res) => {
    ordersCollection.find({})
      .toArray((error, docs) => {
        res.send(docs);
      })
  });

  // add admin mail
  app.post('/addAdminEmail', (req, res) => {
    const admin = req.body;
    adminCollection.insertOne(admin)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  })

  // isAdmin
  app.post('/isAdmin', (req, res) => {
    const email = req.body.email;
    console.log('email', email);
    adminCollection.find({ email: email })
      .toArray((err, admin) => {
        res.send(admin);

      })
  })
  
  // deleting a particular service
  app.delete("/delete/:id", (req, res) => {
    adminData.deleteOne(req.params.key)
      .then(doc => {
        res.send(doc.deletedCount > 0);
      })
  }) 
  
});


app.get('/', (req, res) => {
  res.send('Welcome to Roast The Bean Server')
})

app.listen(process.env.PORT || port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
