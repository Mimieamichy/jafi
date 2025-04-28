const fs = require('fs');
const path = require('path');


exports.DocumentDownloader = async (req, res) => {
  try {
    const filename = path.basename(req.params.filename);
    const filepath = path.join(__dirname, "/../../uploads", filename);

    console.log(filename, filepath)
    
    // Check if file exists
    if (fs.existsSync(filepath)) {
      // Set headers for download
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      
      // Set appropriate content type based on file extension
      const ext = path.extname(filename).toLowerCase();
      if (ext === '.pdf') {
        res.setHeader('Content-Type', 'application/pdf');
      } else if (ext === '.docx') {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      }
      
      // Send the file
      return res.sendFile(filepath);
    } else {
      return res.status(404).json({ message: 'File not found' });
    }
  } catch (error) {
    console.error('Download error:', error);
    return res.status(500).json({ message: 'Error downloading file' });
  }
};
