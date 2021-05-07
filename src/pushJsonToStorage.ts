import fs from 'fs'
import path from 'path'
import Filter from 'stream-json/filters/Filter'
import Asm from 'stream-json/Assembler'

const regexCveItems = new RegExp(
    'CVE_Items.[\\d]+.cve.(CVE_data_meta|problemtype|description.description_data.0)'
)
const __dirname = path.resolve()
const dirForData = path.resolve(__dirname, './cve')
const pathToStorage = dirForData + path.sep + 'cveStorage.csv'

function pushJsonToStorage(pathToJsonFile: string) {
    const json = fs.createReadStream(pathToJsonFile)

    const pl = json.pipe(Filter.withParser({ filter: regexCveItems }))
    const asm = Asm.connectTo(pl)

    /* in json:
    cve.CVE_data_meta
    problemtype.problemtype_data[0].description[0].value
    description.description_data[0].value
     */
    asm.on('done', asm => {
        const cveItems = asm.current['CVE_Items']
        console.log('load .json to storage ' + pathToStorage)

        cveItems.forEach((cveItem: any) => {
            // todo: typing
            const cveName = `"${cveItem.cve.CVE_data_meta.ID}"`
            const cweType =
                `"${cveItem.cve.problemtype.problemtype_data[0].description[0]?.value}"` ||
                '"nothing"'
            const description = `"${cveItem.cve.description.description_data[0].value}"`
            const csv = cveName + ';' + cweType + ';' + description + '\n'

            fs.appendFile(pathToStorage, csv, err => err && console.error(err))
        })
    })
}

export default pushJsonToStorage
