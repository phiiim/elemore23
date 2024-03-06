const express = require('express');
const bcrypt = require('bcryptjs');
const path = require('path');
const mongodb = require('mongodb');
const mongoose = require('mongoose');
const bodyParser = require('body-parser').urlencoded({extended:true});
const { connectToDb, getDb } = require('./db')
const { ObjectId } = require('mongodb');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const app = express();
app.use(express.static('main'));
app.use(express.static('pages'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json())

let db;

connectToDb((err) => {
  if (!err) {
    db = getDb();
  }
});


app.get('/getsteps', (req, res) => {
  let data = []
  db.collection('steps')
    .find()
    .sort({subject: 1, studentID: 1})
    .forEach(row => data.push(row))
    .then(() => {
      res.status(200).json(data)
    })
    .catch(() => {
      res.status(500).json({error: "Could not fetch the documents"})
    })
})


app.get('/getlit/num', (req, res) => {
  db.collection('lit/num')
    .find()
    .toArray()
    .then(data => {
      res.status(200).json(data);
    })
    .catch(() => {
      res.status(500).json({ error: "Could not fetch the documents" });
    });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'main', 'login.html')); // Adjust path as necessary
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log("Login Request:", req.body);
  
  try {
    console.log("Attempting to find user:", username.toLowerCase().trim());
    const user = await db.collection('login').findOne({ username: username.toLowerCase().trim() });
    console.log(req.body);
    console.log(user);

    if (!user) {
      return res.status(401).json({ message: 'Login failed: User does not exist' });
    }
    const result = req.body.password === user.password;
    if (result) {
      // Login successful
      res.json({ success: true, redirectUrl: '/stepTrack/stepTrack.html' });
    } else {
      // Password does not match
      res.status(401).json({ message: 'Login failed: Incorrect password' });
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
});


/* step tracker */
app.patch('/updateGrade', async (req, res) => {
  try {
    const { _id, subStepUpdates, overallGrade } = req.body;
    
    // Validate input
    if (!ObjectId.isValid(_id)) {
      return res.status(400).json({ error: 'Invalid _id provided' });
    }
    if (!Array.isArray(subStepUpdates)) {
      return res.status(400).json({ error: 'Invalid subStepUpdates provided' });
    }

    const db = await getDb();
    const collection = db.collection('steps');

    // Update each sub-step grade
    const updateOperations = subStepUpdates.map(subStep => ({
      updateOne: {
        filter: { "_id": new ObjectId(_id), "subStep.description": subStep.description },
        update: { $set: { "subStep.$.grade": subStep.grade } }
      }
    }));

    // If overallGrade is provided, add it to the update operations
    if (overallGrade !== undefined) {
      updateOperations.push({
        updateOne: {
          filter: { "_id": new ObjectId(_id) },
          update: { $set: { "overallGrade": overallGrade } }
        }
      });
    }
    // Execute all update operations
    const result = await collection.bulkWrite(updateOperations);

    console.log('Documents updated successfully', result);
    res.json({ success: true, result: result });
  } catch (error) {
    console.error('Error updating documents:', error);
    res.status(500).json({ error: 'Failed to update documents' }); 
  }
});


app.patch('/updateEvidence', upload.single('evidenceFile'), async (req, res) => {
  try {
    const db = await getDb();
    const collection = db.collection('steps');

    // Extract the information from the form data
    const objectId = req.body._id; // Corrected the variable name to use later in the code
    const evidenceType = req.body.evidenceType;
    const comment = req.body.comment;
    const date = req.body.date;
    const evidenceFile = req.file; // the uploaded file information
    const subject = req.body.subject;

    console.log('Received update request:', req.body);

    // Validate input
    if (!ObjectId.isValid(objectId)) { // Corrected the variable name here
      console.error('Invalid ID provided');
      return res.status(400).json({ success: false, message: 'Invalid ID provided.' });
    }

    // The path to the uploaded file on the server
    const evidenceFilePath = evidenceFile ? evidenceFile.path : '';

    const newEvidence = {
      type: evidenceType,
      comment: comment,
      date: date,
      file: evidenceFilePath, // Store the file path in the document
    };

    const result = await collection.updateOne(
      { "_id": new ObjectId(objectId), "subject": subject},
      { $push: { "evidence": newEvidence } } // Use $push to add to the evidence array
    );

    console.log('New Documents updated successfully', result);

    // Respond to the client
    if (result.modifiedCount === 1) {
      res.json({ success: true, message: 'Evidence updated successfully' });
    } else {
      res.json({ success: false, message: 'No document found with the given _id' });
    }
  } catch (error) {
    console.error('Error updating evidence:', error);
    res.status(500).json({ error: error.message });
  }
});


app.patch('/updateEvi', async (req, res) => {
  try {
    const { _id, date, studentName, term, evidencetype, comment, evidenceFile } = req.body;
    console.log('Received update request:', req.body);

    if (!ObjectId.isValid(_id)) {
      console.error('Invalid ID provided');
      return res.status(400).json({ success: false, message: 'Invalid ID.' });
    }

    const db = await getDb();
    const collection = db.collection('steps');

    // Find the document by ObjectId
    const document = await collection.findOne({ "_id": new ObjectId(_id) });
    if (!document) {
      return res.status(404).json({ success: false, message: 'No document found with the provided ID.' });
    }

    // Find the index of the evidence to update
    const evidenceIndex = document.evidence.findIndex(ev => ev.file === evidenceFile);
    if (evidenceIndex === -1) {
      return res.status(404).json({ success: false, message: 'No evidence found with the provided file ID.' });
    }

    // Build the update query using the index
    const updateQuery = { $set: {} };
    updateQuery.$set[`evidence.${evidenceIndex}.type`] = evidencetype;
    updateQuery.$set[`evidence.${evidenceIndex}.comment`] = comment;
    updateQuery.$set[`evidence.${evidenceIndex}.date`] = date;

    // Update the document
    const updateResult = await collection.updateOne({ "_id": new ObjectId(_id) }, updateQuery);

    // Here we check the result of the update operation
    if (updateResult.matchedCount === 0) {
      console.error('No document found with the provided ID and evidence file');
      return res.status(404).json({ success: false, message: 'Document not found.' });
    } else if (updateResult.modifiedCount === 0) {
      console.error('Document found but no changes were made');
      return res.status(200).json({ success: false, message: 'No changes made to the document.' });
    }

    res.json({ success: true, message: 'Evidence updated successfully.' });

  } catch (error) {
    console.error('Error during database operation:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});


app.patch('/updateData', async (req, res) => {
  try {
    const { updatedData } = req.body;

    // Check if the required data is provided and is in the correct format
    if (!updatedData || !Array.isArray(updatedData)) {
      return res.status(400).json({ error: 'Invalid data provided' });
    }

    // Connect to the database and get the collection
    const db = getDb();
    if (!db) {
      throw new Error('Database connection not established');
    }

    const collection = db.collection('lit/num');

    // Iterate over the updatedData array and update documents in the collection
    for (let i = 0; i < updatedData.length; i++) {
      const document = updatedData[i];
      const filter = { "_id": new ObjectId(document._id)}; 


      const updatedFields = { ...document };
      delete updatedFields._id;

      const result = await collection.updateOne(filter, { $set: updatedFields });

      if (result.modifiedCount === 0) {
        console.log(`Document with _id ${document._id} not found or not modified`);
      }
    }

    console.log('Documents updated successfully');
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating documents:', error);
    res.status(500).json({ error: 'Failed to update documents' }); 
  }
});


module.exports = app;