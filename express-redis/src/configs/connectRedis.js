const redis = require('redis');
const client = redis.createClient({
  port: 6379,
  host: '127.0.0.1'
});
const connectRedis = async (key, value) => {
  client.on('error', (err) => console.log('Redis Client Error', err));
  client.on('connect', () => console.log('Redis connect successfully'));
  client.on('ready', () => console.log('Redis ready....'));
  await client.connect();
  await client.set(`${key}`, `${value}`);
}
module.exports = {connectRedis, client};


