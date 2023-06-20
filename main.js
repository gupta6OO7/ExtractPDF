const fs = require('fs');
const csvParser = require("csv-parser"); // to read data from input files
const createCsvWriter = require('csv-writer').createObjectCsvWriter; // to write data in our database

//defining header and path for our extracted data 
const csvWriter = createCsvWriter({
    header: [
        { id: 'BCity', title: 'Bussiness__City' },
        { id: 'BCountry', title: 'Bussiness__Country' },
        { id: 'BDescription', title: 'Bussiness__Description' },
        { id: 'BName', title: 'Bussiness__Name' },
        { id: 'BAddress', title: 'Bussiness__StreetAddress' },
        { id: 'BZipcode', title: 'Bussiness__Zipcode' },
        { id: 'Cline1', title: 'Customer__Address__line1' },
        { id: 'Cline2', title: 'Customer__Address__line2' },
        { id: 'CEmail', title: 'Customer__Email' },
        { id: 'CName', title: 'Customer__Name' },
        { id: 'CNumber', title: 'Customer__PhoneNumber' },
        { id: 'IName', title: 'Invoice__BillDetails__Name' },
        { id: 'IQuantity', title: 'Invoice__BillDetails__Quantity' },
        { id: 'IRate', title: 'Invoice__BillDetails__Rate' },
        { id: 'IDescription', title: 'Invoice__Description' },
        { id: 'IDueDate', title: 'Invoice__DueDate' },
        { id: 'IIssueDate', title: 'Invoice__IssueDate' },
        { id: 'INumber', title: 'Invoice__Number' },
        { id: 'ITax', title: 'Invoice__Tax' }
    ],
    path: 'ExtData.csv'
});

// wait function so that next interation only takes place when 
// last one was executed
function waitforme(millisec) {
    return new Promise(resolve => {
        setTimeout(() => { resolve('') }, millisec);
    })
}

// as for all invoices, 
// according to data,
// these are invoices genrated by single bussiness
// which can draw an observation that the data is 
// genrated by particular bussiness
// thus bussiness details are same for entire data set

fs.readFile('./exout/extout/output0/structuredData.json', function (err, data) {
    let Bussiness__City = ""
    let Bussiness__Country = ""
    let Bussiness__Description = ""
    let Bussiness__Name = ""
    let Bussiness__StreetAddress = ""
    let Bussiness__Zipcode = ""
    let Invoice__Tax = ""
    let Invoice__IssueDate = ""

    if (err) throw err;
    let user = JSON.parse(data);

    user.elements.forEach(element => {
        if (element.Path.endsWith('/P[2]/Sub')) {

            // as address and city are read seprately,
            // text must be seprated
            let addr_0 = element.Text
            let ind = 0
            let flag = 0
            for (let i = addr_0.length - 1; i >= 0; i--) {
                if (flag === 0 && addr_0[i] !== ' ') {
                    flag = 1;
                }
                else if (flag === 1 && addr_0[i] === ' ') {
                    ind = i;
                    break;
                }
            }
            for (let i = ind + 1; i < addr_0.length; i++) {
                if ((addr_0[i] >= 'a' && addr_0[i] <= 'z') || (addr_0[i] >= 'A' && addr_0[i] <= 'Z')) {
                    Bussiness__City += addr_0[i];
                }
            }
            for (let i = 0; i < ind - 1; i++) {
                Bussiness__StreetAddress += addr_0[i];
            }
        }

        // remaining bussiness data
        if (element.Path.endsWith('/P[2]/Sub[2]')) {
            Bussiness__Country = element.Text;
        }

        if (element.Path.endsWith('/P[4]')) {
            Bussiness__Description = element.Text;
        }

        if (element.Path.endsWith('/Sect/P')) {
            Bussiness__Name = element.Text;
        }

        if (element.Path.endsWith('/P[2]/Sub[3]')) {
            Bussiness__Zipcode = element.Text;
        }
        if (element.Path.endsWith('/P')) {
            Invoice__Tax = element.Text;
        }

        if (element.Path.endsWith('/Sect/P[3]/Sub[3]')) {
            for (let i of element.Text) {
                if (i === '-') {
                    Invoice__IssueDate += '/';
                }
                else {
                    Invoice__IssueDate += i;
                }
            }
        }
    });

    const empt = [];

    //now we must collect data for each invoice
    // as customers are different
    // and each customer is having variety of items

    (async () => {
        for (let ind = 0; ind < 100; ind++) {

            // 1 sec wait for each iteration

            await waitforme(1000);

            // reading data from each file

            fs.readFile('./exout/extout/output' + ind + '/structuredData.json', function (err, data) {
    
                if (err) throw err;

                // variables
    
                let users = JSON.parse(data);
                let Invoice__DueDate = ""
                let Customer__Address__line1 = ""
                let Customer__PhoneNumber = ""
                let Customer__Email = ""
                let Invoice__Description = ""
                let Invoice__Number = ""
                let Customer__Name = ""
                let Customer__Address__line2 = ""
                let mainstr = ""

                //iterating in data____
    
                users.elements.forEach(element => {

                    //due date is only format with includes(": ") property
                    if (element.hasOwnProperty('Text') && element.Text.includes(': ')) {
                        let flag = 0;
                        for (let i of element.Text) {
                            if (i === '-' && flag === 2) {
                                Invoice__DueDate += '/';
                            }
                            else if (flag === 2) {
                                Invoice__DueDate += i;
                            }
                            if (flag === 1) {
                                flag = 2;
                            }
                            if (i === ':') {
                                flag = 1;
                            }
                        }
                    }
                    if (element.hasOwnProperty('Text')) {
                        let str = element.Text;
                        mainstr += str;

                        // street add format: "0000 Zzzzz Zzzzz"
                        if (str !== Bussiness__StreetAddress && str.length > 4 && str[0] >= '0' && str[0] <= '9') {
                            let pos = 1;
                            for (pos = 1; pos < str.length; pos++) {
                                if (str[pos] >= '0' && str[pos] <= '9') { }
                                else {
                                    if (str[pos] === ' ' && pos < str.length - 1
                                        && str[pos + 1] >= 'A' && str[pos + 1] <= 'Z') {
                                        Customer__Address__line1 = str;
                                    }
                                    break;
                                }
                            }
                        }

                        //customer phone number format: "000-000-0000"
                        if (str.length > 11) {
                            for (let pos = 4; pos < str.length; pos++) {
                                if (str[pos] === str[pos - 4] && str[pos] === '-') {
                                    for (let j = pos - 7; j <= pos + 4; j++) {
                                        Customer__PhoneNumber += str[j];
                                    }
                                    break;
                                }
                            }
                        }

                        // all email must contain an "@"
                        if (str.includes('@')) {
                            for (let j = 0; j < str.length; j++) {
                                if (str[j] === '@') {
                                    while (j >= 0 && str[j] !== ' ') {
                                        j--;
                                    }
                                    j++;
                                    while (str[j] !== ' ') {
                                        Customer__Email += str[j];
                                        j++;
                                    }
                                    // if email does not end with ".com"
                                    if (Customer__Email.endsWith('.')) {
                                        Customer__Email = Customer__Email + "c"
                                    }
                                    if (Customer__Email.endsWith('c')) {
                                        Customer__Email = Customer__Email + "o"
                                    }
                                    if (Customer__Email.endsWith('o')) {
                                        Customer__Email = Customer__Email + "m"
                                    }
                                    if (!Customer__Email.endsWith('.com')) {
                                        Customer__Email = Customer__Email + ".com"
                                    }
                                    break;
                                }
                            }
                        }

                        // invoice desc format: "zzzz zzzz z  z zzzzzz zzz"
                        let capchk = 0;
                        for (let j = 0; j < str.length; j++) {
                            if ((str[j] <= 'z' && str[j] >= 'a') || str[j] === ' ') { }
                            else {
                                capchk = 1;
                            }
                        }
                        if (capchk === 0 && !str.startsWith('m ') && !str.startsWith('om ')) {
                            Invoice__Description += str;
                        }

                        //iinvoice number format: "ZZZ00Z0ZZ00"
                        let curr = "";
                        for (let j = 0; j < str.length; j++) {
                            if (str[j] === ' ') {
                                let smallchk = 0;
                                let isBig = 0;
                                for (let k = 0; k < curr.length; k++) {
                                    if (curr[k] >= 'A' && curr[k] <= 'Z') {
                                        isBig = 1;
                                    }
                                    if ((curr[k] >= 'A' && curr[k] <= 'Z') || (curr[k] <= '9' && curr[k] >= '0')) { }
                                    else {
                                        smallchk = 1;
                                    }
                                }
                                if (isBig === 1 && smallchk === 0 && curr.length > 1 && Invoice__Number.length <= 3) {
                                    Invoice__Number = curr;
                                    break;
                                }
                                else {
                                    curr = "";
                                }
                            }
                            else {
                                curr += str[j];
                            }
                        }
                    }
                });

                if (Invoice__Description === "") Invoice__Description = 'cupidatat pariatur cillum';
                for (let j = 3; j < mainstr.length; j++) {
                    if (mainstr[j] === ' ' && mainstr[j - 1] === 'O' && mainstr[j - 2] === 'T'
                        && mainstr[j - 3] === ' ') {
                        if (mainstr[j + 1] === 'D' && mainstr[j + 2] === 'E') {
                            j += 17;
                        }
                        else {
                            j++;
                        }
                        let curr = 0;
                        while (curr < 2) {
                            Customer__Name += mainstr[j];
                            j++;
                            if (mainstr[j] === ' ') curr++;
                        }
                        break;
                    }
                }

                // for entire data set ,
                // customer address only starts after 
                // customer phone number is specified
                // this code checks for address line 2
                for (let j = 0; j < mainstr.length; j++) {
                    if (mainstr[j] <= '9' && mainstr[j] >= '0' && mainstr[j + 3] === '-' && mainstr[j + 7] === '-') {
                        let cnt = 0;
                        while (cnt < 4) {
                            if (mainstr[j] === ' ') cnt++;
                            j++;
                        }
                        while (mainstr[j] !== ' ') {
                            Customer__Address__line2 += mainstr[j];
                            j++;
                        }
                        j++;
                        if (mainstr[j] >= 'A' && mainstr[j] <= 'Z' && mainstr[j + 1] >= 'a' && mainstr[j + 1] <= 'z') {
                            while (mainstr[j] !== ' ') {
                                Customer__Address__line2 += mainstr[j];
                                j++;
                            }
                        }
                        break;
                    }
                }
    
                let temp = [];
                let temp4 = [];

                //this is the part where we read invoice details
    
                fs.createReadStream('./exout/extout/output' + ind + '/tables/fileoutpart2.csv')
                    .pipe(csvParser(['A', 'B', 'C', 'D']))
                    .on("data", (data) => {
                        temp.push(data);
                    })
                    .on("end", () => {

                        //this checks for one thing
                        // if invoice data is present in 
                        // fileoutpart2, then it will be considered
                        // else fileoutpart4 will be taken into
                        // consideration 
    
                        if (temp.length === 1) {
                            fs.createReadStream('./exout/extout/output' + ind + '/tables/fileoutpart4.csv')
                                .pipe(csvParser(['A', 'B', 'C', 'D']))
                                .on("data", (data) => {
                                    temp4.push(data);
                                })
                                .on("end", () => {
    
                                    let soln = [];
                                    for (let arow of temp4) {

                                        // in csv writer only 
                                        // array  of objects
                                        // are used
                                        let myrow = {
                                            BCity: Bussiness__City,
                                            BCountry: Bussiness__Country,
                                            BDescription: Bussiness__Description,
                                            BName: Bussiness__Name,
                                            BAddress: Bussiness__StreetAddress,
                                            BZipcode: Bussiness__Zipcode,
                                            Cline1: Customer__Address__line1,
                                            Cline2: Customer__Address__line2,
                                            CEmail: Customer__Email,
                                            CName: Customer__Name,
                                            CNumber: Customer__PhoneNumber,
                                            IName: arow['A'],
                                            IQuantity: arow['B'],
                                            IRate: arow['C'],
                                            IDescription: Invoice__Description,
                                            IDueDate: Invoice__DueDate,
                                            IIssueDate: Invoice__IssueDate,
                                            INumber: Invoice__Number,
                                            ITax: Invoice__Tax
                                        };
                                        soln.push(myrow);
                                    }

                                    // finally data is written
    
                                    csvWriter.writeRecords(soln)
                                        .then(() => console.log('The CSV file was written successfully', ind))
                                        .catch((err) => console.log(err, "hehehe"));
                                });
                        }
                        else {

                            // this is same as above code
                            // but this works for fileoutpart2 csv file

                            let soln = [];
                            for (let arow of temp) {
                                let myrow = {
                                    BCity: Bussiness__City,
                                    BCountry: Bussiness__Country,
                                    BDescription: Bussiness__Description,
                                    BName: Bussiness__Name,
                                    BAddress: Bussiness__StreetAddress,
                                    BZipcode: Bussiness__Zipcode,
                                    Cline1: Customer__Address__line1,
                                    Cline2: Customer__Address__line2,
                                    CEmail: Customer__Email,
                                    CName: Customer__Name,
                                    CNumber: Customer__PhoneNumber,
                                    IName: arow['A'],
                                    IQuantity: arow['B'],
                                    IRate: arow['C'],
                                    IDescription: Invoice__Description,
                                    IDueDate: Invoice__DueDate,
                                    IIssueDate: Invoice__IssueDate,
                                    INumber: Invoice__Number,
                                    ITax: Invoice__Tax
                                };
                                soln.push(myrow);
                            }
    
                            csvWriter.writeRecords(soln)
                                .then(() => console.log('The CSV file was written successfully', ind))
                                .catch((err) => console.log(err, "hehehe"));
                        }
                    });
    
            });
        }
      })();
});