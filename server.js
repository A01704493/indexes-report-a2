const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('./'));

// API endpoint for PDF generation
app.post('/generate-pdf', (req, res) => {
    console.log('Received PDF generation request');
    
    // Spawn the Python process
    const pythonProcess = spawn('python', ['python/pdf_generator.py']);
    
    let outputData = '';
    let errorData = '';
    
    // Collect output data
    pythonProcess.stdout.on('data', (data) => {
        console.log(`Python stdout: ${data}`);
        outputData += data.toString();
    });
    
    // Collect error data
    pythonProcess.stderr.on('data', (data) => {
        console.error(`Python stderr: ${data}`);
        errorData += data.toString();
    });
    
    // Handle process completion
    pythonProcess.on('close', (code) => {
        console.log(`Python process exited with code ${code}`);
        
        if (code === 0) {
            // PDF was successfully generated
            res.json({
                success: true,
                message: 'PDF generated successfully',
                pdfUrl: 'Stock_Market_Indices_Report.pdf'
            });
        } else {
            // Error generating PDF
            res.status(500).json({
                success: false,
                message: 'Error generating PDF',
                error: errorData
            });
        }
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} in your browser`);
}); 