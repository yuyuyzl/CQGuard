const CQHttp = require('cqhttp');
const _ = require('lodash');
const log = require('./log');
const bot = function(credentials){
    return new CQHttp({
    apiRoot: credentials.apiRoot,
    accessToken: credentials.accessToken,
    secret: credentials.secret
})
};
module.exports = bot;