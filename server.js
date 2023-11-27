const express = require('express');
const multer = require('multer');
const fs = require('fs').promises; // Use fs.promises for async file writing
const axios = require('axios');
const cors = require('cors');
const XLSX = require('xlsx');
const app = express();
const port = 8000;
import { configDotenv } from 'dotenv';
app.use(cors());


const openaiApiKey = process.env.API_Key;
//*const openaiEndpoint = 'https://api.openai.com/v1/engines/davinci/completions';
const openaiEndpoint = 'https://api.openai.com/v1/completions';

const processExcel = async (excelPath) => {
  try {
    // Read the Excel file
    const workbook = XLSX.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Get the range of cells in the worksheet
    const range = XLSX.utils.decode_range(worksheet['!ref']);

    const requests = [];

    // Iterate through each row, starting from the second row (index 1)
    for (let row = 1; row <= range.e.r; row++) {
      const productName = worksheet[XLSX.utils.encode_cell({ r: row, c: 0 })]?.v?.trim();
      const productDescription = worksheet[XLSX.utils.encode_cell({ r: row, c: 1 })]?.v?.trim();

      if (productName && productDescription) {
        const prompt = `Classify the category for the product: "${productName}" with description: "${productDescription}". Options: Visage ... (your options here) ... Accessoires - barbe - ciseaux`;

        // Push the API request promise to the array
        requests.push(
          axios.post(
            openaiEndpoint,
            {
              prompt,
              max_tokens: 1,
            },
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openaiApiKey}`,
              },
            }
          ).then(response => ({
            productName,
            category: response.data.choices[0]?.text?.trim() || 'N/A',
          })).catch(error => {
            console.error(`Error calling OpenAI API for ${productName}:`, error.response ? error.response.data : error.message);
            throw new Error('Failed to process Excel');
          })
        );
      } else {
        console.error(`Invalid data in row: ${row}`);
        // Handle this case based on your requirements
      }
    }

    // Use Promise.all to concurrently execute the API requests
    const results = await Promise.all(requests);

    // Create a new Excel workbook with the results
    const newWorkbook = XLSX.utils.book_new();
    const newWorksheet = XLSX.utils.json_to_sheet(results);
    XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Sheet1');
    const newExcelPath = 'path/to/your/generated/file.xlsx';
    XLSX.writeFile(newWorkbook, newExcelPath);

    return results;
  } catch (error) {
    console.error('Error processing Excel:', error);
    throw new Error('Failed to process Excel');
  }
};


const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/upload', upload.single('file'), async (req, res) => {
  const csvData = req.file.buffer.toString('utf8');

  try {
    const processingResults = await processExcel(csvData);
    res.send('File processed successfully!');
  } catch (error) {
    console.error('Error processing CSV:', error);
    res.status(500).send('Internal server error');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
