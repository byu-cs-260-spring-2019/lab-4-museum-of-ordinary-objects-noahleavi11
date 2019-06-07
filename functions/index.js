const functions = require('firebase-functions');
const firebase = require('firebase-admin');
const express = require('express');

const firebaseApp = firebase.initializeApp(
    functions.config().firebase
);

const app = express();


// Create a new item in the museum: takes a title and a path to an image.
var db = firebase.firestore();
var itemsRef = db.collection('items');

app.get('/api/items', async (req, res) => {
    try{
        let querySnapshot = await itemsRef.get();
        res.send(querySnapshot.docs.map(doc => doc.data()));
    }catch(err){
        res.sendStatus(500);
    }
});

app.post('/api/items', async (req, res) => {
    try {
        let querySnapshot = await itemsRef.get();
        let numRecords = querySnapshot.docs.length;
        let item = {
            id: numRecords + 1,
            title: req.body.title,
            path: req.body.path,
            description: req.body.description
        };
        itemsRef.doc(item.id.toString()).set(item);
        res.send(item);
      } catch (error) {
        console.log(error);
        res.sendStatus(500);
      }
});

app.put('/api/items/:id', async (req, res) => {
  let id = req.params.id.toString();
  try{
    itemsRef.doc(id).update({
      title:req.body.title,
      path: req.body.path,
      description: req.body.description
    });
    console.log("Document successfully updated");

  } catch {
    res.status(500).send("Error editing document");
  }
})

app.delete('/api/items/:id', async (req, res) => {
  let id = req.params.id.toString();
  console.log(id);
  var documentToDelete = itemsRef.doc(id);
  try{
    var doc = await documentToDelete.get();
    if(!doc.exists){
      res.status(404).send("The item you selected does not exist");
      return;
    } else {
      documentToDelete.delete();
      res.sendStatus(200);
      return;
    }
  }catch{
    res.status(500).send("Error deleting document: ",err);
  }
})


exports.app = functions.https.onRequest(app);
