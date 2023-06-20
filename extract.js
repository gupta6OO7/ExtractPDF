const PDFServicesSdk = require('@adobe/pdfservices-node-sdk');
const fs = require('fs');
const AdmZip = require('adm-zip');

//this function works as timeout
function waitforme(millisec) {
    return new Promise(resolve => {
        setTimeout(() => { resolve('') }, millisec);
    })
}

(async () => {
    for (let ind = 0; ind < 100; ind++) {

        // IMPORTANT
        ///
        //the parameter here is for number of milliseconds one need to wait
        //this value must be large because api has a request limit
        ///
        await waitforme(20000);

        let OUTPUT_ZIP = './myout/output' + ind + '.zip';

        //Remove if the output already exists.
        if (fs.existsSync(OUTPUT_ZIP)) fs.unlinkSync(OUTPUT_ZIP);

        let INPUT_PDF = './TestDataSet/output' + ind + '.pdf';

        let credentials = PDFServicesSdk.Credentials
            .serviceAccountCredentialsBuilder()
            .fromFile('pdfservices-api-credentials.json')
            .build();

        // Create an ExecutionContext using credentials
        let executionContext = PDFServicesSdk.ExecutionContext.create(credentials);

        // Create a new operation instance.
        let extractPDFOperation = PDFServicesSdk.ExtractPDF.Operation.createNew(),
            input = PDFServicesSdk.FileRef.createFromLocalFile(
                INPUT_PDF,
                PDFServicesSdk.ExtractPDF.SupportedSourceFormat.pdf
            );

        // Build extractPDF options
        // Here type of renditions is TABLE
        // type of file is CSV
        let options = new PDFServicesSdk.ExtractPDF.options.ExtractPdfOptions.Builder()
            .addElementsToExtract(PDFServicesSdk.ExtractPDF.options.ExtractElementType.TEXT, PDFServicesSdk.ExtractPDF.options.ExtractElementType.TABLES)
            .addElementsToExtractRenditions(PDFServicesSdk.ExtractPDF.options.ExtractRenditionsElementType.TABLES)
            .addTableStructureFormat(PDFServicesSdk.ExtractPDF.options.TableStructureType.CSV)
            .build()


        extractPDFOperation.setInput(input);
        extractPDFOperation.setOptions(options);

        // Execute the operation
        extractPDFOperation.execute(executionContext)
            .then(result => result.saveAsFile(OUTPUT_ZIP))
            .then(() => {
                console.log('Successfully extracted information from PDF.');
            })
            .catch(err => console.log(err));

    }
})();