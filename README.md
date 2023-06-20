
# Extract PDF

This project helps to extract data from multiple PDFs at same time and format it in a csv file.

For given TestDataSet, data is extracted for about 100 invoices with the help of Extract API offered by Adobe.




## Deployment

To deploy this project, following must be installed:

- adobe/pdfservices-node-sdk
- adm-zip
- csv-parser
- csv-writer

```bash
  npm install --save @adobe/pdfservices-node-sdk
  npm install --save adm-zip
  npm i csv-writer
  npm i csv-parser
```


## Usage

Two javascript files must be executed in order to extract data-

```bash
node extract.js
node main.js
```
The code is seperated to minimize number of API request and server error. It makes the code easier to debug and to make changes in format type.

The extracted data will be saved in ```ExtData.csv``` with specific format where Bussiness, Customer and Invoice details are stored.
### Note

The extraction process will take time because of API request limit.
If you want to change extraction speed, this parameter in ```extract.js``` could be altered:

```bash
await waitforme(yourInput_ms);
```

## 🔗 Links
[![linkedin](https://img.shields.io/badge/linkedin-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/om-gupta-71b289241/)


