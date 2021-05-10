import fs from 'fs'
import Filter from 'stream-json/filters/Filter'
import Asm from 'stream-json/Assembler'
import { CveInfo } from './types/CveInfo'
import { StorageType } from './types/StorageType'
import { makePathToCsvStorage } from './utils'

/* 
    in json:
    configurations
    cve.CVE_data_metaproblemtype.problemtype_data[0].description[0].value
    cve.CVE_data_metadescription.description_data[0].value
*/
const regexCveItems = new RegExp(
    'CVE_Items.[\\d]+.(configurations|cve.(CVE_data_meta|problemtype|description.description_data.0))'
)

function pushTo(
    data: CveInfo,
    storageType: StorageType,
    pathToStorage: string | null = null
) {
    if (storageType === StorageType.Csv) {
        const csvLine = `"${data.cveName}";"${data.cweType}";"${data.description}";"${data.cpe23Uri}"\n`
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

    asm.on('done', asm => {
        const cveItems = asm.current['CVE_Items']
        console.log(
            'load .json to storage ' + makePathToCsvStorage(pathToJsonFile)
        )

        cveItems.forEach((cveItem: any) => {
            // todo: typing
            try {
                const cveName = cveItem.cve.CVE_data_meta.ID
                const cweType =
                    cveItem.cve.problemtype.problemtype_data[0].description[0]
                        ?.value || 'nothing'
                const description =
                    cveItem.cve.description.description_data[0].value
                const cpe23Uri =
                    cveItem.configurations.nodes[0]?.['cpe_match']?.[0]?.[
                        'cpe23Uri'
                    ] || 'nothing'
                const cveInfo: CveInfo = {
                    cveName,
                    cweType,
                    description,
                    cpe23Uri,
                }
                const pathToCsvStorage = makePathToCsvStorage(
                    pathToJsonFile as string
                )
                pushTo(cveInfo, StorageType.Csv, pathToCsvStorage)
            } catch (e) {
                console.log(cveItem.cve)
                console.error(e)
            }
        })
    })
}

export default pushJsonToStorage
