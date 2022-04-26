const mongoose = require('mongoose');
const logEvents = require('../helpers/logEvents');
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL, {
            autoIndex: false,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000
        });
        console.log('Connect DB successfully!!');
    } catch (error) {
        console.log(error.message);
        await logEvents(error.message, module.filename);
        console.log("Connect DB falied!!");
        process.exit(0);
    }    
}
mongoose.connection.on('connected', () => {
    console.log("Connected MongoDB..........");
})
mongoose.connection.on('connecting', () => {
    console.log("Connecting MongoDB..........");
})
mongoose.connection.on('disconnecting', () => {
    console.log("Disconnecting MongoDB..........");
})
mongoose.connection.on('disconnected', () => {
    console.log("Disconnected MongoDB..........");
})
mongoose.connection.on('reconnectFailed', async (error) => {
    console.log(error.message);
    console.log("ReconnectFailed MongoDB..........");
    await logEvents(error.message, module.filename);
    process.exit(1);
})
mongoose.connection.on('reconnected', () => {
    console.log("Reconnected MongoDB..........");
})
mongoose.connection.on('error', async (error) => {
    console.log(error.message);
    console.log("Connected MongoDB error..........");
    await logEvents(error.message, module.filename);
    process.exit(1);
})
process.on('SIGINT', async () => {
    console.log("You are performing a server shutdown!")
    await mongoose.connection.close();
    process.exit(0);
})
module.exports = connectDB;