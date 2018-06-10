/**
 * This is a Node script that fetches all 
 */

import axios from 'axios';
import fs from 'fs';

const Urls = {
    formoffices: (form: string) => `https://egov.uscis.gov/processing-times/api/formoffices/${form}`,
    processingtime: (form: string, office: string) => `https://egov.uscis.gov/processing-times/api/processingtime/${form}/${office}`,
}

const FORMS = ['I-102', 'I-129', 'I-129F', 'I-130', 'I-131', 'I-140', 'I-212', 'I-360', 'I-485', 'I-526', 'I-539', 'I-600', 'I-600A', 'I-601', 'I-601A', 'I-612', 'I-730', 'I-751', 'I-765', 'I-817', 'I-821', 'I-821D', 'I-824', 'I-829', 'I-90', 'I-914', 'I-918', 'I-924', 'N-400', 'N-565', 'N-600']

async function fetchForms() {
    for (let form of FORMS) {
        let {data: formoffices} = await axios(Urls.formoffices(form));

        fs.writeFileSync(`data/uscis/formoffices/${form}.json`, JSON.stringify(formoffices));
        console.log('Saved offices associated with form ', form);

        await sleep(800);

        // create directory for processing time if it doesn't exists
        const directoryName = `data/uscis/processingtime/${form}`;
        if(!fs.existsSync(directoryName)) {
            fs.mkdirSync(directoryName);
        }

        // query each one of the offices
        let offices = formoffices.data.form_offices.offices;
        for (let office of offices) {
            let officeCode = office.office_code;
            let processingTimeUrl = Urls.processingtime(form, officeCode);
            
            console.log('Fetching ', processingTimeUrl)
            
            let {data: processingTime} = await axios(processingTimeUrl);
            fs.writeFileSync(`${directoryName}/${officeCode}.json`, JSON.stringify(processingTime));

            console.log('Saved office data for form ', form, ' office ', officeCode);

            await sleep(200);
        }
    
        console.log(`formoffices: Completed saving offices for form ${form}`);
    }
}


fetchForms();


async function sleep(ms: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

