module.exports = userInit;

function userInit(payload, callback)
{
console.log('\n\n\n --- user init --- \n', payload, '\n++++++\n\n\n');


  callback(null, payload);
}
