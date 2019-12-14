/*
 * Benchmarking code for SERVER implementation
 */
const fs = require('fs');
const fetch = require('node-fetch');
const DB_DUMP_FILE = './dbdump-testdb-12-12.json'; // mongo db JSON dump
const EVENTS_FILE = './dbdump-testdb-events-12-12.json';
const USER_OFFSET = 0;
const EVENT_OFFSET = 8;
const BASE_URL = 'http://vaken-staging.herokuapp.com/graphql';
let { convertMongoDumpToArray } = require('./queryUtils.js');

// Define to JSON type
const users = convertMongoDumpToArray(DB_DUMP_FILE);
// const apps = convertMongoDumpToArray(APP_QUESTIONS_FILE);
const events = JSON.parse(fs.readFileSync(EVENTS_FILE, 'utf8'));

const post = (url, body) =>
  fetch(url, { method: 'POST', body: JSON.stringify(body) });

console.log('current time: ' + new Date());

// Function to print results to file
function writeFile(arr, file) {
  fs.writeFileSync(file, arr.join('\n'));
}

// Arrays to hold request times
const latencies = [],
  latencies1000 = [],
  latenciesWarm = [];

// Function to benchmark in serial
async function benchSerial(arr, offset) {
  for (let i = USER_OFFSET; i < users.length && i < USER_OFFSET + 100; ++i) {
    const startTime = Date.now();

    // const GETbody = {"operationName":null,"variables":{},"query":"{\n  hackers {\n    email\n  }\n}\n"}
    // const res = await post(BASE_URL, GETbody)

    const userEventPair = {
      user: users[i + USER_OFFSET]._id,
      event: events[i + EVENT_OFFSET + offset],
    };

    const POSTbody = {
      operationName: 'checkInUserToEvent',
      variables: { input: userEventPair },
      query:
        'mutation checkInUserToEvent($input: EventCheckInInput!) {\n  checkInUserToEvent(input: $input) {\n    id\n  }\n}\n',
    };
    const res = await post(BASE_URL, POSTbody);

    if (!res.ok) console.error(res.error);
    else console.log('Successfully hit');
    arr.push(Date.now() - startTime);
  }
}

// Bench first cold implementation
benchSerial(latencies, 0).then(() => {
  writeFile(latencies, 'latenciesCold.csv');
  (async function(arr) {
    const startTime = Date.now();
    const promises = [];
    for (let i = USER_OFFSET; i < users.length && i < USER_OFFSET + 100; ++i) {
      promises.push(
        // Benchmark 100 requests in parallel
        (async function() {
          // const GETbody = {"operationName":null,"variables":{},"query":"{\n  hackers {\n    email\n  }\n}\n"}
          // const res = await post(BASE_URL, GETbody)

          const userEventPair = {
            user: users[i + USER_OFFSET]._id,
            event: events[i + EVENT_OFFSET + 1],
          };

          const POSTbody = {
            operationName: 'checkInUserToEvent',
            variables: { input: userEventPair },
            query:
              'mutation checkInUserToEvent($input: EventCheckInInput!) {\n  checkInUserToEvent(input: $input) {\n    id\n  }\n}\n',
          };
          const res = await post(BASE_URL, POSTbody);

          if (!res.ok) console.error(`${res.status}`, res);
          else console.info('Success async!');
          arr.push(Date.now() - startTime);
        })()
      );
    }
    return Promise.all(promises);
  })(latencies1000).then(() => {
    writeFile(latencies1000, 'latenciesStress.csv');

    // Bench warm function
    benchSerial(latenciesWarm, 2).then(() => {
      writeFile(latenciesWarm, 'latenciesWarm.csv');
    });

    console.log(latencies);
  });
});
