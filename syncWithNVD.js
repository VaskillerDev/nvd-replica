const path = require('path');
const fs = require("fs");
const https = require('https');
const zlib = require('zlib');

const startYear = 2002;
const endYear = 2005;//new Date().getFullYear();
const recent = "recent";
const modified = "modified";
const dirForData = path.resolve(__dirname,"./cve")

function tryCreateDirForData() {
    fs.existsSync(dirForData) ||  fs.mkdirSync(dirForData);
}

function makeLinkToCveDownload(year) {
    return `https://nvd.nist.gov/feeds/json/cve/1.1/nvdcve-1.1-${year}.json.gz`
}

function makePathToJsonGz(year) {
    return path.resolve(dirForData,`nvdcve-1.1-${year}.json.gz`)
}

async function downloadJsonGz (link) {
    return new Promise(async resolve => {
    const downloadedFileName = path.basename(link);
    const pathToJsonGz = path.resolve(dirForData, downloadedFileName);
    const jsonGz = fs.createWriteStream(pathToJsonGz);
    jsonGz.on('finish', ()=> resolve(true));
    await https.get(link, res => res.pipe(jsonGz));
    });
}

async function downloadByYear(year) {
    const link = makeLinkToCveDownload(year);
    await downloadJsonGz(link);
    await console.log("download by " + link);
}

function trimExt(fileName) {
    return fileName.split('.').slice(0, -1).join('.');
}

async function unzipJsonGz(year) {
    new Promise( resolve => {
        const pathToFile = makePathToJsonGz(year);
        const jsonPathToFile = trimExt(pathToFile);

        const jsonGz = fs.createReadStream(pathToFile);
        const json = fs.createWriteStream(jsonPathToFile)
        const gunzip = zlib.createGunzip();

        json.on('finish',()=> fs.unlinkSync(pathToFile) && resolve(true));
        jsonGz.pipe(gunzip).pipe(json);
    });
}


async function downloadAllCve() {
    return new Promise(async resolve => {
        tryCreateDirForData()
        for (let year = startYear; year <= endYear; year++) {
            await downloadByYear(year);
        }
        await downloadByYear(recent);
        await downloadByYear(modified);
        resolve(true);
    });
}

async function unzipAllCve() {
    return new Promise(async resolve => {
        for (let year = startYear; year <= endYear; year++) {
            await unzipJsonGz(year);
        }
        await unzipJsonGz(recent);
        await unzipJsonGz(modified);
        resolve(true);
    });
}

async function syncWithNVD() {
    await downloadAllCve();
    await unzipAllCve();
}

async function s() {
    await unzipAllCve()
}

//s();

module.exports = {
    syncWithNVD: syncWithNVD
}