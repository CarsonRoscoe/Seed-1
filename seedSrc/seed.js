const moduleExporter = require("./module.js");

/**
 * Name: 
 *      Seed Module
 * 
 * Description:
 *      The cryptocurrency of the Seed ecosystem. This base implementation is inspired by the Ethereum ERC20 standard
 * 
 */

 let seedModule = null;

 let createSeedModule = function() {
    let newSeedModule = moduleExporter.createModule({
        module : "Seed", 
        version : "1",
        data : initialSeedState,
        initialUserData : initialUserState
    });

    return newSeedModule;
 }

module.exports = {
    getSeed : function() {
        if (seedModule == null) {
            seedModule = createSeedModule();
        }
        return seedModule;
    } 
 }

/*  ### Seed's Initial Variable State ### */
let initialSeedState = { 
    totalSupply : 0, // Total supply of SEED in circulation
    symbol : "SEED", // Symbol of SEED cryptocurrency for UI's
    decimals : 4 // Amount of decimals used when displaying the SEED cryptocurrency. Maximum divisible amount
}

/*  ### Each Seed User's Initial Variable State ### */
let initialUserState = {
    balance : 0, // A users SEED balance
    allowance : {} // How much SEED a given user allows other users to spend on their behalf
}

/*  
    ################################
    ### State Changing Functions ###
    ################################ 
*/

/**
 * Transfer funds from a user to another user
 * 
 * Changes:
 *      Decrease "sender" balance
 *      Increase "to" balance
 * 
 * @param {Container} container - Container object that holds read-only data.
 *      Used to grab the arguments regarding who is sending SEED, who to send to, and how much
 *      Used to access the user data to get balance
 * @param {ChangeContext} changeContext - Write-Only object to hold changes to module and userData state
 */
let transfer = function(container, changeContext) {
    // Gather readonly data
    let to = container.args.to;
    let value = container.args.value;
    let sender = container.args.sender;
    let fromBalance = container.getUserData("Seed", sender).balance;

    // Confirm adequate balance for the transaction
    if (fromBalance >= value && value > 0) {
         changeContext.subtract(value, {user : sender, key : "balance"});
         changeContext.add(to, "balance", add);
    }

    return changeContext;
}

/**
 * Transfer funds from user "from" to user "to" on the sender behalf based on "from" users given allowance to "sender" user
 * 
 * Changes:
 *      Decrease "from" balance
 *      Decrease "from"-"sender" allowance
 *      Increase "to" balance
 * 
 * @param {Container} container - Container object that holds read-only data.
 *      Used to grab the arguments regarding on who's behalf the sender is sending SEED, who to send to, and how much
 *      Used to access the user data to get balance and allowance amount
 * @param {ChangeContext} changeContext - Write-Only object to hold changes to module and userData state
 */
let transferFrom = function(container, changeContext) {
    // Gather readonly data
    let to = container.args.to;
    let from = container.args.from;
    let sender = container.args.sender;
    let value = container.args.value;
    let fromBalance = container.getUserData("Seed", from).balance;
    let senderAllowance = container.getUserData("Seed", from).allowance[sender];

    // Confirm adequate balance and allowance for the transaction
    if (fromBalance >= value && senderAllowance >= value && value > 0) {
         changeContext.subtract(from, "balance", value);
         changeContext.subtract(from, "allowance", sender, value);
         changeContext.add(to, "balance", add);
    }
    
    return changeContext;
}

// Read-Only Views

