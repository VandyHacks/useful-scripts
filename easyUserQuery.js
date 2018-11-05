/**
 * 
 * Easily query users that match certain filters
 * 
 * Written 11/4/2018 by Kwuang Tang
 * 
 */

const DB_DUMP_FILE = './2018-11-02_users.json'; // mongo db JSON dump
const OUTPUT_FILE = 'bus.csv';
let { convertMongoDumpToArray, writeUsersToFile } = require('./queryUtils.js');

// Define to JSON type
const users = convertMongoDumpToArray(DB_DUMP_FILE);
console.log('current time: ' + (new Date()))

// status filters
const NOT_DECLINED = e => !e.status.declined;
const SUBMITTED = e => e.status.completedProfile;
const ADMITTED = e => e.status.admitted;
const CONFIRMED = e => e.status.confirmed;

// for sending reminder emails:
const VERIFIED_NOT_SUBMITTED = e => e.verified && !e.status.completedProfile;
const ADMITTED_NOT_CONFIRMED = e => e.status.admitted && !e.status.confirmed;

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

// chain filters
let results = users
    .filter(NOT_DECLINED) // always filter by ppl that didn't decline
    // .filter(VERIFIED_NOT_SUBMITTED) // all verified + not submitted
    // .filter(ADMITTED_NOT_CONFIRMED) // all admitted + not confirmed
    .filter(SUBMITTED)
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
    return e.status.hasBusTicket
    return true;
})

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
    return [u.profile.school, u.confirmation.phoneNumber || '']
});

console.log(results.length + ' filtered users.')
console.log(results);
console.log(cnt)

writeUsersToFile(results, OUTPUT_FILE);

// NOTE: if needed, dedupe new list w/ prev list using http://www.listdiff.com/index 
