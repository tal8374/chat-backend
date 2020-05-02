const { DEVELOPMENT, PRODUCTION } = require('./const')

module.exports = {
    ENV: process.env.ENV == DEVELOPMENT ? DEVELOPMENT : PRODUCTION,
    mongo_url: process.env.ENV == DEVELOPMENT ? 'mongodb://localhost:27017/form' : 'mongodb://form:somepassword1@ds263656.mlab.com:63656/form'
}
