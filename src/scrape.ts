/**
 * This is a Node script that fetches all 
 */

import axios from 'axios';
import fs from 'fs';
import { FORMS } from './constants';

const Urls = {
    formoffices: (form: string) => `https://egov.uscis.gov/processing-times/api/formoffices/${form}`,
    processingtime: (form: string, office: string) => `https://egov.uscis.gov/processing-times/api/processingtime/${form}/${office}`,
}

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

