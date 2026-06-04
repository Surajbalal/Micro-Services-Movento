const jwksClient = require('jwks-rsa');

const client = jwksClient({
    // jwksUri:"http://localhost:3000/auth/.well-known/jwks.json",
  jwksUri: "http://auth:3004/.well-known/jwks.json",
    cacheMaxEntries: 5,
    cacheMaxTime: 10 * 60 * 1000,
})

module.exports = client;