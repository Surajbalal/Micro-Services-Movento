const jwksClient = require('jwks-rsa');

const client = jwksClient({
    jwksUri:"http://localhost:3000/auth/.well-known/jwks.json",
    casha: true,
    casheMaxEntry: 5,
    cashaMaxTime: 10 * 60 * 1000,
})

module.exports = client;