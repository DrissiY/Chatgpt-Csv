import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState('');
  const [uploadedFilePath, setUploadedFilePath] = useState('');

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:8000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResult(response.data.message);
      setUploadedFilePath(response.data.updatedFilePath);
    } catch (error) {
      console.error('Error uploading file:', error.message);
      setResult('Error uploading file');
    }
  };

  return (
    <div>
      <h1>File Upload and Processing</h1>
      <form onSubmit={handleFormSubmit}>
        <label>
          Select an XLSX file:
          <input type="file" accept=".xlsx" onChange={handleFileChange} />
        </label>
        <br />
        <button type="submit">Upload File and Process</button>
      </form>
      <div>
        <h2>Result:</h2>
        <p>{result}</p>
        {uploadedFilePath && (
          <p>
            <strong>Updated File:</strong>{' '}
            <a href={uploadedFilePath} target="_blank" rel="noopener noreferrer">
              {uploadedFilePath}
            </a>
          </p>
        )}
      </div>
    </div>
  );
}

export default App;
