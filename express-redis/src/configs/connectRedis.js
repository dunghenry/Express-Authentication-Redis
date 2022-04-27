const redis = require('redis');
const logEvents = require('../helpers/logEvents');
const client = redis.createClient({
  port: 6379,
  host: '127.0.0.1'
});
client.ping((err, pong) => {
  console.log(pong);
})
client.on('error', async function (err) {
  console.log(err);
  await logEvents(err.message, module.filename);
  process.exit(1);
})
client.on('connect', function () {
  console.log("Connect Redis");
})
client.on('ready', function () {
  console.log("Redis to ready");
})
module.exports = client;