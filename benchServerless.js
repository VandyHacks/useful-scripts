/*
 * Benchmarking code for SERVERLESS implementation
 */
const fs = require('fs');
const fetch = require('node-fetch');
const DB_DUMP_FILE = './dbdump-testdb-12-12.json'; // mongo db JSON dump
const EVENTS_FILE = './dbdump-testdb-events-12-12.json';
const USER_OFFSET = 0;
const EVENT_OFFSET = 8;
const BASE_URL =
  'https://eh6irst8v7.execute-api.us-east-1.amazonaws.com/dev/hackers';
let { convertMongoDumpToArray } = require('./queryUtils.js');

// Define to JSON type
const users = convertMongoDumpToArray(DB_DUMP_FILE);
const apps = convertMongoDumpToArray(APP_QUESTIONS_FILE);
const events = JSON.parse(fs.readFileSync(EVENTS_FILE, 'utf8'));

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
    const res = await fetch(BASE_URL);

    if (!res.ok) console.error(res.error);
    else console.log('Successfully hit');
    arr.push(Date.now() - startTime);
  }
}

// Bench first cold implementation
benchSerial(latencies, 0).then(() => {
  writeFile(latencies, 'latenciesCold.csv');

  // Benchmark 100 requests in parallel
  (async function(arr) {
    const startTime = new Date();
    const promises = [];
    for (let i = USER_OFFSET; i < users.length && i < USER_OFFSET + 100; ++i) {
      promises.push(
        (async function() {
          const res = await fetch(BASE_URL);

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
