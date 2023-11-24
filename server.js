const express = require('express');
const xlsx = require('xlsx');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Destination folder for file uploads

const app = express();
const port = 8000;

// Set up a simple route
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Route to handle file uploads
app.post('/upload', upload.single('file'), async (req, res) => {
    // Check if a file was uploaded
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;

    // Read the uploaded XLSX file
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Get column names
    const columnNames = Object.keys(sheet);
    const secondColumnName = columnNames.find(name => name !== 'A1' && name.includes('2'));

    // Add a new column "result" based on the first letter of the "description" column
    xlsx.utils.sheet_add_aoa(sheet, [['result']]);
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    for (let i = 1; i < data.length; i++) {
        const description = data[i][columnNames.indexOf(secondColumnName)];
        data[i].push(description.charAt(0));
    }
    xlsx.utils.sheet_set_array(sheet, data);

    // Save the updated workbook to a new XLSX file
    const updatedFilePath = 'uploads/updatedFile.xlsx';
    xlsx.writeFile(workbook, updatedFilePath);

    res.json({ message: 'File updated successfully', updatedFilePath });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
