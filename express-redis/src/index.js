const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const logEvents = require('./helpers/logEvents');
const routes = require('./routes');
const corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200
}
const connectDB = require('./configs/connectDB');
dotenv.config();
const app = express();
const port = process.env.PORT || 4000;
const {connectRedis, client} = require('./configs/connectRedis');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use(helmet());
app.use(morgan("dev"));
//connectDB
connectDB();
app.use('/api/v1', routes);
//Test redis
// connectRedis('d', 1);
// (async function () {
//     const data = await client.get('d');
//     console.log(data);
// })();
app.listen(port, () => console.log(`App started on http://localhost:${port}`));