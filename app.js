const scheduler = require('node-schedule');
const {syncWithNVD} = require("./syncWithNVD");

const time = [];
time["00:00:30"] = '30 * * * * *';
time["04:00:30"] = '30 * 4 * * *';

//scheduler.scheduleJob(time["00:00:30"], () => syncWithNVD()); // download cve archives in this time

syncWithNVD()