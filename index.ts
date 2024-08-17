interface User {
    username: string;
    password: string;
    loginStatus?: boolean;      
}

interface Wallet {
    tag: number;
    wallet_type: "Naira" | "Dollar";
    naira_balance: number;
    dollar_balance?: number;
    user: User
}

const db: Array<User> = []
const walletDb: Array<Wallet> = []

const signUp = (username: string, password: string): User => {
    const user: User = { username, password }

    db.push(user);
    return user
}

const login = (user: User) => {
    try {
        
        const result = db.find(userObj => userObj.username === user.username && userObj.password === user.password)
        if (!result) {
            return ("User not found: Please enter a valid username and password");
        }
        const userIndex = db.findIndex(userObj => userObj.username === user.username && userObj.password === user.password)
        db[userIndex].loginStatus = true;

        return result;
    } catch(err) {
        return(`Error: , ${err}`);
    }
}

const createWallet = (tag: number, wallet_type: "Naira" | "Dollar", user: User) => {
    if (!user.loginStatus) {
        throw "Anauthorized: User must be logged in"
    }

    const wallet: Wallet = {
        tag,
        wallet_type,
        naira_balance: 0,
        user
    }

    if (wallet_type === "Dollar") {
        wallet.dollar_balance = 0;
    }

    walletDb.push(wallet);

    return wallet;
}

const deleteWallet = (wallet: Wallet) => {
    if (!wallet.user.loginStatus) {
        throw "Anauthorized: User must be logged in"
    }
    const walletIndex: number = walletDb.findIndex(walletObj => walletObj.tag === wallet.tag);
    walletDb.splice(walletIndex, 1);
    return walletDb;
}

const convertToDollar = (amount: number) => {
    const rate: number = 1650;
    const dollarEquivalent: number = amount / rate;
    return dollarEquivalent;
}

const convertToNaira = (amount: number) => {
    const rate: number = 1650;
    const nairaEquivalent: number = amount * rate;
    return nairaEquivalent;
}

const deposit_to_wallet = (amount: number, wallet: Wallet, wallet_type: "Naira" | "Dollar") => {
    if (!wallet.user.loginStatus) {
        throw "Anauthorized: User must be logged in"
    }
    try {
        // Verify that amount should be greater than 0
        if (amount <= 0)
            return "Amount deposited must be greater than 0";

        // find wallet in db
        const verified_wallet = walletDb.find(walletObj => walletObj.tag === wallet.tag )
        
        // Add amount to wallet
        if ( verified_wallet && amount > 0 && wallet_type === "Naira") {
            verified_wallet.naira_balance += amount;
        } else if ( wallet_type === "Dollar" && verified_wallet?.dollar_balance !== undefined && amount > 0 ) {
            verified_wallet.dollar_balance += amount;
        }

        // Update the walletdb array
        const walletIndex: number = walletDb.findIndex(walletObj => walletObj.tag === wallet.tag);
        if (walletIndex && verified_wallet) { 
            walletDb[walletIndex] = verified_wallet;
        }
        return verified_wallet;
    } catch(err) {
        return err;
    }
}

const makeTransfer = (amount: number, accountToTransferFrom: Wallet, accountToTransferTo: Wallet) => {
    if (!accountToTransferFrom.user.loginStatus) {
        throw "Anauthorized: User must be logged in"
    }
    try {
        // Get the account details from the db
        let accountFrom = walletDb.find(walletObj => walletObj.tag === accountToTransferFrom.tag );
        let accountTo = walletDb.find(walletObj => walletObj.tag === accountToTransferTo.tag );

        // Complete the transfer for naira-naira acount
        if (amount > 0 && accountFrom !== undefined && accountTo !== undefined && accountFrom.wallet_type === "Naira" && accountTo.wallet_type === "Naira") {
            accountFrom.naira_balance -= amount;
            accountTo.naira_balance += amount
        }

        // Complete the transfer for the dollar-dollar account
        if (amount > 0 && accountFrom?.dollar_balance !== undefined && accountTo?.dollar_balance !== undefined && accountFrom.wallet_type === "Dollar" && accountTo.wallet_type === "Dollar") {
            accountFrom.dollar_balance -= amount;
            accountTo.dollar_balance += amount
        }

        // Complete the transfer for naira-dollar acount
        if (amount > 0 && accountFrom !== undefined && accountTo?.dollar_balance !== undefined && accountFrom.wallet_type === "Naira" && accountTo.wallet_type === "Dollar") {
            const dollarEquivalent = convertToDollar(amount)
            accountFrom.naira_balance -= amount;
            accountTo.dollar_balance += dollarEquivalent;
        }

        // Complete the transfer for dollar-naira acount
        if (amount > 0 && accountFrom?.dollar_balance !== undefined && accountTo !== undefined && accountFrom.wallet_type === "Dollar" && accountTo.wallet_type === "Naira") {
            const nairaEquivalent = convertToNaira(amount)
            accountFrom.dollar_balance -= amount;
            accountTo.naira_balance += nairaEquivalent;
        }

        // Update the database
        // Update the walletdb array
        const accountFromIndex: number = walletDb.findIndex(walletObj => walletObj.tag === accountToTransferFrom.tag);
        const accounttoIndex: number = walletDb.findIndex(walletObj => walletObj.tag === accountToTransferTo.tag);
        if (accountFromIndex && accounttoIndex && accountFrom && accountTo) { 
            walletDb[accountFromIndex] = accountFrom;
            walletDb[accounttoIndex] = accountTo
        }

        return (walletDb);
    } catch (err) {
        return err;
    }
}


const user = signUp("firstuser", "pwd")
const secondUser = signUp("seconduser", "pwd")

login(user);
login(secondUser);

const firstWallet = createWallet(1, 'Dollar', user);
const secondWallet = createWallet(2, 'Naira', secondUser);



// console.log(user);  
// console.log(login(user));
// console.log(nairaWallet.naira_balance);
//console.log(deposit_to_wallet(2500, nairaWallet, "Naira"));
// console.log(dollarWallet.dollar_balance);
console.log(deposit_to_wallet(250, secondWallet, "Naira"));
console.log(makeTransfer(50, secondWallet, firstWallet));
console.log(deleteWallet(secondWallet));

console.log(walletDb);
