/**
 * 
 * Easily query users that match certain filters
 * 
 * Written 11/4/2018 by Kwuang Tang
 * 
 */

const DB_DUMP_FILE = '../dbdump-10-24.json'; // mongo db JSON dump
const APP_QUESTIONS_FILE = '../appquestions-10-24.json' // application questions
const OUTPUT_FILE = 'accepted.csv';
let { convertMongoDumpToArray, writeUsersToFile, associateResponsesWithUser } = require('./queryUtils.js');

// Define to JSON type
const users = convertMongoDumpToArray(DB_DUMP_FILE);
const apps = convertMongoDumpToArray(APP_QUESTIONS_FILE);
console.log('current time: ' + (new Date()))

const STATUS = {
    Created: 'CREATED',
    Verified: 'VERIFIED',
    Started: 'STARTED',
    Submitted: 'SUBMITTED',
    Accepted: 'ACCEPTED',
    Confirmed: 'CONFIRMED',
    Rejected: 'REJECTED'
}

// status filters
const CREATED = e => e.status === STATUS.Created;
const STARTED = e => e.status === STATUS.Started;
const SUBMITTED = e => e.status === STATUS.Submitted;
const ADMITTED = e => e.status === STATUS.Accepted;
const CONFIRMED = e => e.status === STATUS.Confirmed;

const HAS_SUBMITTED = e => e.status === STATUS.Submitted
    || e.status === STATUS.Accepted
    || e.status === STATUS.Confirmed

// for sending reminder emails:
// const VERIFIED_NOT_SUBMITTED = e => e.verified && !e.status.completedProfile;
// const ADMITTED_NOT_CONFIRMED = e => e.status.admitted && !e.status.confirmed;

// associate app questions with users





// returns a lambda that filters by school emails
const schoolFilter = (schoolEmailEndings) => {
    return e => {
        let atTargetSchool = false;
        schoolEmailEndings.forEach(b => {
            if (e.email.toLowerCase().trim().endsWith(b)) {
                atTargetSchool = true;
            }
        })
        return atTargetSchool;
    }
}

let newUsers = associateResponsesWithUser(apps, users);
console.log(newUsers[0])

// chain filters
let results = users
    .filter(HAS_SUBMITTED)
    // .filter(schoolFilter(['wustl.edu']))
    // .filter(schoolFilter(['duke.edu', 'wfu.edu', 'unc.edu']))
    /*.filter(schoolFilter(['hawk.iit.edu', 'loyola.edu', 'northwestern.edu', 'uchicago.edu', 'illinois.edu', 'uic.edu',
'purdue.edu', 'gatech.edu', 'ufl.edu', 'knights.ucf.edu', 'mst.edu', 'wustl.edu', 'emory.edu', 'uga.edu', 'fsu.edu']))*/
    .filter(e => {

        /* for custom filters */

        // for sending out emails to eventbrite for bus rsvp 
        // return e.email.endsWith('.edu') && !e.email.endsWith('vanderbilt.edu');

        // Get admitted on LATEST ROUND
        // change the date (unix millis, each time)
        // return new Date(e.status.admittedOn) > new Date(1540904400000) //https://currentmillis.com/

        // get longest essays
        // return e.profile.essay && e.profile.essay.length > 2000;

        // ppl that need travel reimburse
        // return e.confirmation.needsReimbursement;

        // volunteers
        // return e.profile.volunteer

        // lightning talks
        // return e.confirmation.lightningTalker;
        // return e.profile.mentor_accepted;
        // return e.status.hasBusTicket
        return true;
    })

results = []

let cnt = 0
// What info to get from each user
results = results.map(u => {
    // return [u.profile.name, u.email, u.confirmation.phoneNumber, u.profile.school]
    // return u.email
    // return [u.email, u.profile.essay]
    /*let name = u.profile.name.split(' ');
    if (name.length === 2) {
        name = name[0];
        cnt += 1
    }
    else
        name = u.profile.name;
    return [u.email, name];*/
    // return [u.email, u.profile.name, u.profile.lastResumeName, u.status.confirmed ? 'YES' : 'NO'];
    // return [u.profile.school, u.confirmation.phoneNumber || '']
    return [u.email]
});

console.log(results.length + ' filtered users.')
console.log(results);
console.log(cnt)

writeUsersToFile(results, OUTPUT_FILE);

// NOTE: if needed, dedupe new list w/ prev list using http://www.listdiff.com/index 
