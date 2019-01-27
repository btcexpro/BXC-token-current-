// Exports
const timeHelper = {};

async function increaseTime(time) {
    return new Promise((resolve, reject) => {
        web3.currentProvider.sendAsync({
            jsonrpc: "2.0",
            method: "evm_increaseTime",
            params: [time], // 86400 is number of seconds in one day
            id: new Date().getTime()
        }, (err, result) => {
            if (err) {
                return reject(err)
            }
            return resolve(result)
        });
    })
};

async function mineNewBlock() {
    return new Promise((resolve, reject) => {
        web3.currentProvider.sendAsync({jsonrpc: "2.0", method: "evm_mine", params: [], id: 0},
        (err, result) => {
            if (err) {
                return reject(err)
            }
            return resolve(result)
        });
    })
};

/**
 *  Get timestamp of the block including given transaction
 */
function getTxBlockTimestamp(txInfo){
    return web3.eth.getBlock(txInfo.receipt.blockNumber).timestamp;
}

/**
* Increases ether network time by mining new blocks
* Only sets future time, can't go back
*
* @param time - new network time in seconds
*/
timeHelper.setTestRPCTime = async function(newtime) {
    const currentTime = web3.eth.getBlock(web3.eth.blockNumber).timestamp;
    if (newtime > currentTime + 3600) {
        const timeDiff = newtime - currentTime;
        await increaseTime(timeDiff);
        await mineNewBlock();
    }
};

/**
* Increases ether network time by mining new blocks
* Only sets future time, can't go back
*
* @param time - new network time in seconds
*/
timeHelper.setBlockTime = async function(newtime) {
    const currentTime = web3.eth.getBlock(web3.eth.blockNumber).timestamp;
    if (newtime > currentTime) {
        const timeDiff = newtime - currentTime;
        await increaseTime(timeDiff);
        await mineNewBlock();
    }
};

/**
 *  Execute contract method and return relevant block timestamp
 *
 * @param fn contract method call
 * @returns block timestamp
 */
timeHelper.executeAndGetTimestamp = async function(fn){
    return await getTxBlockTimestamp(await fn());
};

timeHelper.getCurrentTime = function() {
    return web3.eth.getBlock(web3.eth.blockNumber).timestamp;
};

timeHelper.getBlockTime = function() {
    var blocktime = web3.eth.getBlock(web3.eth.blockNumber).timestamp;
    return blocktime;
};

timeHelper.duration = {
  seconds: function (val) { return val; },
  minutes: function (val) { return val * this.seconds(60); },
  hours: function (val) { return val * this.minutes(60); },
  days: function (val) { return val * this.hours(24); },
  weeks: function (val) { return val * this.days(7); },
  years: function (val) { return val * this.days(365); },
};


module.exports = timeHelper;
