﻿import path from 'path'
import fs from 'fs'
import https from 'https'
import zlib from 'zlib'
import pushJsonToStorage from './pushJsonToStorage'

const startYear = 2002
const endYear = new Date().getFullYear()
const recent = 'recent'
const modified = 'modified'
const __dirname = path.resolve()
const cveDirName = 'cve'
const dirForData = path.resolve(__dirname, `./${cveDirName}`)

type Year = Date | number | string

function tryCreateDirForData() {
    fs.existsSync(dirForData) || fs.mkdirSync(dirForData)
}

function makeLinkToCveDownload(year: Year) {
    return `https://nvd.nist.gov/feeds/json/cve/1.1/nvdcve-1.1-${year}.json.gz`
}

function makePathToJsonGz(year: Year) {
    return path.resolve(dirForData, `nvdcve-1.1-${year}.json.gz`)
}

function makePathToJson(year: Year) {
    return path.resolve(dirForData, `nvdcve-1.1-${year}.json`)
}

async function writeMetaData() {
    const ws = fs.createWriteStream(dirForData + path.sep + 'cve.meta')
    const date = new Date()

    const mm = date.getMinutes()
    const hh = date.getHours()
    const dd = date.getDay()
    //todo: continue
}

async function downloadJsonGz(link: string) {
    return new Promise(async resolve => {
        const downloadedFileName = path.basename(link)
        const pathToJsonGz = path.resolve(dirForData, downloadedFileName)
        const jsonGz = fs.createWriteStream(pathToJsonGz)
        jsonGz.on('finish', () => resolve(true))
        await https.get(link, res => res.pipe(jsonGz))
    })
}

async function downloadByYear(year: Year) {
    const link = makeLinkToCveDownload(year)
    await downloadJsonGz(link)
    await console.log('download by ' + link)
}

function trimExt(fileName: string) {
    return fileName.split('.').slice(0, -1).join('.')
}

async function unzipJsonGz(year: Year) {
    return new Promise(resolve => {
        const pathToFile = makePathToJsonGz(year)
        const jsonPathToFile = trimExt(pathToFile)

        const jsonGz = fs.createReadStream(pathToFile)
        const json = fs.createWriteStream(jsonPathToFile)
        const gunzip = zlib.createGunzip()

        json.on('finish', () => {
            fs.unlinkSync(pathToFile)
            resolve(true)
        })
        jsonGz.pipe(gunzip).pipe(json)
    })
}

async function downloadAllCve() {
    return new Promise(async resolve => {
        tryCreateDirForData()
        for (let year = startYear; year <= endYear; year++) {
            await downloadByYear(year)
        }
        await downloadByYear(recent)
        await downloadByYear(modified)
        resolve(true)
    })
}

async function unzipAllCve() {
    return new Promise(async resolve => {
        for (let year = startYear; year <= endYear; year++) {
            await unzipJsonGz(year)
        }
        await unzipJsonGz(recent)
        await unzipJsonGz(modified)
        resolve(true)
    })
}

async function pushJsonCveToStorage(year: Year) {
    const pathToJsonFile = makePathToJson(year)
    pushJsonToStorage(pathToJsonFile)
}

async function pushAllCveToStorage() {
    return new Promise(async resolve => {
        for (let year = startYear; year <= endYear; year++) {
            pushJsonCveToStorage(year).catch(e => console.error(e))
        }
        pushJsonCveToStorage(recent).catch(e => console.error(e))
        pushJsonCveToStorage(modified).catch(e => console.error(e))
        resolve(true)
    })
}

async function syncWithNVD() {
    await downloadAllCve()
    await unzipAllCve()
    await pushAllCveToStorage()
}

export default syncWithNVD
