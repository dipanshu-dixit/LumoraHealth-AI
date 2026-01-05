import https from 'https';
import fs from 'fs';
import app from './server.js';

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV === 'development') {
  const options = {
    key: fs.readFileSync('../frontend/localhost-key.pem'),
    cert: fs.readFileSync('../frontend/localhost.pem')
  };
  
  https.createServer(options, app).listen(PORT, () => {
    console.log(`HTTPS Server running on port ${PORT}`);
  });
} else {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}