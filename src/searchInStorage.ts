import fs from 'fs'
import path from 'path'
import readline from 'readline'

const __dirname = path.resolve()
const dirForData = path.resolve(__dirname, './cve')
const pathToStorage = dirForData + path.sep + 'cveStorage.csv'

async function searchInStorage(keyword: string): Promise<Array<string>> {
    return new Promise(resolve => {
        const regex = new RegExp(keyword.toLowerCase())
        const rs = fs.createReadStream(pathToStorage)
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

export default searchInStorage
