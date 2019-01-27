module.exports = {
  assert_throw: async promise => {
    try {
      promise
    } catch (error) {

      const invalidJump = error.message.search('invalid JUMP') >= 0
      const invalidOpcode = error.message.search('invalid opcode') >= 0
      const outOfGas = error.message.search('out of gas') >= 0
      const revert = error.message.search('VM Exception while processing transaction: revert') >= 0
      assert(invalidJump || invalidOpcode || outOfGas || revert, "Expected throw, got '" + error + "' instead")
      return
    }
    // assert.fail('Expected throw not received')
  },
  assertRevert: async function(promise, invariants = () => {}) {
    try {
      await promise;
      assert.fail('Expected revert not received');
    } catch (error) {
      const revertFound = error.message.search('revert') >= 0;
      const invalidOpcode = error.message.search('invalid opcode') >= 0
      assert(revertFound || invalidOpcode, `Expected "revert", got ${error} instead`);
      invariants.call()
    }
  }

};



var promisify = (inner) =>
  new Promise((resolve, reject) =>
    inner((err, res) => {
      if (err) { reject(err) }
      resolve(res);
    })
);
module.exports.promisify = promisify;

var getBalance = (account, at) => promisify(cb => web3.eth.getBalance(account, at, cb));
module.exports.getBalance = getBalance;

var makeNumber = (number) => {return parseInt(number * 10 ** -18)};     
module.exports.makeNumber = makeNumber;




var toFixed = (x) => {
 if (Math.abs(x) < 1.0) {
   var e = parseInt(x.toString().split('e-')[1]);
   if (e) {
       x *= Math.pow(10,e-1);
       x = '0.' + (new Array(e)).join('0') + x.toString().substring(2);
   }
 } else {
   var e = parseInt(x.toString().split('+')[1]);
   if (e > 20) {
       e -= 20;
       x /= Math.pow(10,e);
       x += (new Array(e+1)).join('0');
   }
 }
 return x;
}
module.exports.toFixed = toFixed;

var approxEqual = (num1 , num2) => {
  if(num1 == num2) {
    return true;
  }
  
    var change = ((num1 - num2) / num1) * 100;
    if(change <= 1) {
     return true;
    } else {
     return false;
    }
}
module.exports.approxEqual = approxEqual;

var approxVeryEqual = (num1 , num2) => {
  if(num1 == num2) {
    return true;
  }
  
    var change = ((num1 - num2) / num1) * 100;
    console.log('approxVeryEqual' , num1 , num2 , Math.abs(change));
    if(Math.abs(change) <= 0.0000001) {
     return true;
    } else {
     return false;
    }
}
module.exports.approxVeryEqual = approxVeryEqual;

var addressToBytes = (address) => {
  return address.replace("0x", "");
}
module.exports.addressToBytes = addressToBytes;