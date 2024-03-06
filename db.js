const { MongoClient } = require("mongodb")
// const functions = require('firebase-functions');
// const { connectToDb, getDb } = require('./path/to/your/dbModule'); // Adjust the path as necessary
// // const functions = require('firebase-functions');


let dbConnection
let uri = 'mongodb+srv://oscar42630:oscar42630@elemore.hnigz2m.mongodb.net/?retryWrites=true&w=majority'

module.exports = {
    connectToDb: (cb) => {
        MongoClient.connect(uri)
        .then((client) => {
            dbConnection = client.db()
            return cb()
        })
        .catch(err => {
            console.log(err)
            return cb(err)
        })
    },
    getDb: () => dbConnection
}

