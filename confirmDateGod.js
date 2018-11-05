/**
 * last resort: change confirm dates for a large amount of people
 * DANGEROUS
 * changes confirm dates for everyone
 * Written 11/4/2018 by Kwuang Tang
 */


var MongoClient = require('mongodb').MongoClient;
let DB_URL = ''; // replace w/ mongo url
let DB_NAME = '';
let NEW_CONFIRM_DATE = 1111111111111;
//console.error('STAY AWAY!!!')

// Connect to the db
MongoClient.connect(DB_URL, function (err, client) {
    if (err) {
        console.error(err)
    }
    let newvalues = 
    {
        $set: { // this set is VERY important, tells mongo to only update specific fields, keep all other fields
            "status.confirmBy": NEW_CONFIRM_DATE
        }
    };
    let query = 
    {
        "status.admitted": true,
        "status.confirmed": false,
        "status.declined": false/*,
        "status.admittedOn": {
            $gt: 1540904400000
        }*/
    }
    let db = client.db(DB_NAME);
    let collection = db.collection('users');
    collection.find(query).toArray((err, users) => { /*make sure you find before update to make sure correct ppl */
    // collection.update(query, newvalues, {multi: true}, (err, users) => { /* update dates */
        if (err) throw err;
        console.log('Total Rows: ' + users.length);
        console.log(users[10])
    })
});
