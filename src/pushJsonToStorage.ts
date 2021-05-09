import fs from 'fs'
import Filter from 'stream-json/filters/Filter'
import Asm from 'stream-json/Assembler'
import { CveInfo } from './types/CveInfo'
import { StorageType } from './types/StorageType'
import { makePathToCsvStorage } from './utils'

const regexCveItems = new RegExp(
    'CVE_Items.[\\d]+.cve.(CVE_data_meta|problemtype|description.description_data.0)'
)
//const __dirname = path.resolve()
//const dirForData = path.resolve(__dirname, './cve')
//const pathToStorage = dirForData + path.sep + 'cveStorage.csv'

function pushTo(
    data: CveInfo,
    storageType: StorageType,
    pathToStorage: string | null = null
) {
    if (storageType === StorageType.Csv) {
        const csvLine = `"${data.cveName}";"${data.cweType}";"${data.description}"\n`
        fs.appendFile(
            pathToStorage as string,
            csvLine,
            err => err && console.error(err)
        )
    } else if (storageType === StorageType.Mongo) {
        // todo: continue
    }
}

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
        console.log(
            'load .json to storage ' + makePathToCsvStorage(pathToJsonFile)
        )

        cveItems.forEach((cveItem: any) => {
            // todo: typing
            const cveName = cveItem.cve.CVE_data_meta.ID
            const cweType =
                cveItem.cve.problemtype.problemtype_data[0].description[0]
                    ?.value || 'nothing'
            const description =
                cveItem.cve.description.description_data[0].value

            const cveInfo: CveInfo = { cveName, cweType, description }
            const pathToCsvStorage = makePathToCsvStorage(
                pathToJsonFile as string
            )
            pushTo(cveInfo, StorageType.Csv, pathToCsvStorage)
        })
    })
}

export default pushJsonToStorage
