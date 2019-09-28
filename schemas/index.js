const mongoose = require('mongoose');

const { MONGO_ID, MONGO_PASSWORD, NODE_ENV } = process.env;
const MONGO_URL= `mongodb://${MONGO_ID}:${MONGO_PASSWORD}@localhost:27017/admin`;

module.exports = () => {
    const connect = () => {
        if(NODE_ENV !== 'production') {
            mongoose.set('debug', true);
        }
        mongoose.connect(MONGO_URL, {
            dbName: 'gifchat',
        }, (error) => {
            if(error) {
                console.log('mongodb connection error ', error)
            } else {
                console.log('mongodb connection success')
            }
        })
    }
    connect();

    mongoose.connection.on('error', (error) => {
        console.error('mongodb connection error ', error)
    });
    mongoose.connection.on('disconnected', () => {
        console.error('mongodb connection is disconnected. Trying to reconnect...');
        connect()
    });

    require('./chat');
    require('./room');
}