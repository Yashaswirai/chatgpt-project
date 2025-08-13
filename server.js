require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const connectDb = require('./src/db/db')
const connectSocket = require('./src/socket/server.socket');
const PORT = process.env.PORT || 3000;

const httpServer = http.createServer(app);

connectSocket(httpServer);

connectDb();

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
