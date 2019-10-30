/**
 * 
 * Easily query users that match certain filters
 * 
 * Written 11/4/2018 by Kwuang Tang
 * 
 */

const DB_DUMP_FILE = '../dbdump-10-28.json'; // mongo db JSON dump
const APP_QUESTIONS_FILE = '../appquestions-10-28.json' // application questions
const OUTPUT_FILE = 'out.csv';
let { convertMongoDumpToArray, writeUsersToFile, associateResponsesWithUser } = require('./queryUtils.js');

// Define to JSON type
const users = convertMongoDumpToArray(DB_DUMP_FILE);
const apps = convertMongoDumpToArray(APP_QUESTIONS_FILE);
console.log('current time: ' + (new Date()))

const STATUS = {
    Created: 'CREATED',
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

const ACCEPTED_OR_CONFIRMED = e => e.status === STATUS.Accepted || e.status === STATUS.Confirmed

// for sending reminder emails:
// const VERIFIED_NOT_SUBMITTED = e => e.verified && !e.status.completedProfile;
// const ADMITTED_NOT_CONFIRMED = e => e.status.admitted && !e.status.confirmed;

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

// associate app questions with users
let newUsers = associateResponsesWithUser(apps, users);
// console.log(newUsers[0])

// chain filters
let results = newUsers
    // .filter(HAS_SUBMITTED)
    // .filter(schoolFilter(['wustl.edu']))
    // .filter(schoolFilter(['duke.edu', 'wfu.edu', 'unc.edu']))
    /*.filter(schoolFilter(['hawk.iit.edu', 'loyola.edu', 'northwestern.edu', 'uchicago.edu', 'illinois.edu', 'uic.edu',
'purdue.edu', 'gatech.edu', 'ufl.edu', 'knights.ucf.edu', 'mst.edu', 'wustl.edu', 'emory.edu', 'uga.edu', 'fsu.edu']))*/
    // .filter(e => e.app.volunteer === 'Yes')
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

        // lightning talks
        // return e.confirmation.lightningTalker;
        // return e.profile.mentor_accepted;
        // return e.app.travelInfoSharingConsent === 'Yes'
        // if (e.school && e.school !== 'Vanderbilt University')
        //     console.log(e.email)
        // return e.school && e.school !== 'Vanderbilt University'
        // return e.app.dietaryRestrictions && e.app.dietaryRestrictions.toLowerCase().indexOf('glut') > -1
        return true;
    })

// results = []

// Some sorting...
// results.sort((a, b) => a.school.toLowerCase().localeCompare(b.school.toLowerCase()))
// console.log(results)
// Extract info from each user

var fs = require('fs');
results = results.map(u => {
    // return [u.app.dietaryRestrictions]
    if (!u.firstName || !u.lastName || !u.school)
        return
    fs.rename(`../resumes/${u._id.$oid}`, `../resumes/${u.firstName + ' ' + u.lastName + ' ' + u.school}.pdf`, function (err) {
        if (err) console.log('ERROR: ' + err);
    });

    return [u.firstName, u.lastName, u.app && u.app.resume, JSON.stringify(u._id)]
    // return [u.email]
    // return [u.firstName, u.lastName, u.school, u.phoneNumber, u.email]
});


console.log(results)


console.log(results.length + ' filtered users.')
// console.log(results);

writeUsersToFile(results, OUTPUT_FILE);

// NOTE: if needed, dedupe new list w/ prev list using http://www.listdiff.com/index 
