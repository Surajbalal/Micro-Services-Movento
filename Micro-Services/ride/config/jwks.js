const jwksClient = require('jwks-rsa');

const client = jwksClient({
    jwksUri: "http://localhost:3000/auth/.well-known/jwks.json",
    cache: true,
    cacheMaxEntries: 5,
    cacheMaxAge: 10 * 60 * 1000,
});

module.exports = client;
