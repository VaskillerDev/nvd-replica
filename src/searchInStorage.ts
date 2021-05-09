import fs from 'fs'
import path from 'path'
import readline from 'readline'
import { StorageType } from './types/StorageType'

const startYear = 2002
const endYear = new Date().getFullYear()
const __dirname = path.resolve()
const dirForData = path.resolve(__dirname, './cve')
const recent = 'recent'
const modified = 'modified'

type Year = Date | number | string

function makePathToStorageCsv(year: Year) {
    return path.resolve(dirForData, `nvdcve-1.1-${year}.storage.csv`)
}

async function collectDataFromStorageCsv(
    pathToStorageCsv: string,
    keyword: string
): Promise<Array<string>> {
    return new Promise(resolve => {
        const regex = new RegExp(keyword.toLowerCase())
        const rs = fs.createReadStream(pathToStorageCsv as string)
        const rl = readline.createInterface({
            input: rs,
            crlfDelay: Infinity,
        })
        const storage: Array<string> = []

        rl.on('line', function (line) {
            let lwr = line.toLowerCase()
            if (regex.test(lwr)) storage.push(line)
        })

        rl.on('close', function () {
            resolve(storage)
        })
    })
}

async function collectDataFromStorageCsvByYear(
    year: Year,
    keyword: string
): Promise<Array<string>> {
    return new Promise(async resolve => {
        const pathToStorageCsv = makePathToStorageCsv(year)
        const dataFromStorageCsv = await collectDataFromStorageCsv(
            pathToStorageCsv,
            keyword
        )
        resolve(dataFromStorageCsv)
    })
}

async function searchInStorage(
    storageType: StorageType,
    keyword: string
): Promise<Array<string>> {
    return new Promise(async resolve => {
        let storage: Array<string> = []
        for (let year = startYear; year <= endYear; year++) {
            storage = storage.concat(
                await collectDataFromStorageCsvByYear(year, keyword)
            )
        }
        storage = storage.concat(
            await collectDataFromStorageCsvByYear(recent, keyword)
        )
        storage = storage.concat(
            await collectDataFromStorageCsvByYear(modified, keyword)
        )
        console.log(storage)
        resolve(storage)
    })
}

export default searchInStorage
