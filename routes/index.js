var express = require('express');
var router = express.Router();
const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();
const { ethers } = require("ethers");



const DB_FILE_PATH = 'eza_test.db';

const IntaSend = require('intasend-node');

let intasend = new IntaSend(
  process.env.IntasendPub,
  process.env.IntasendSecret,
  false,
);


const db = new sqlite3.Database(DB_FILE_PATH, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database');
   
  }
});

const { initiateDeveloperControlledWalletsClient } = require('@circle-fin/developer-controlled-wallets')

const client = initiateDeveloperControlledWalletsClient({
  apiKey: 'TEST_API_KEY:f10d3e86f84f97d6f5ce8fd7bbbadc60:a26b3cd80d6f45c67472dcce52f9152e',
  entitySecret: 'c8e1e16985324fadc333b3213934678d21607a7d48b2a395b0ee2f78fa5e206a',
})

function getAllLiquidatorsFromDB() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM liquiditor', (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

function getAllOneLiquidatorFromDB(id) {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM liquiditor where id=? Limit 1', [id],(err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

function getOneLoanFromDB(id){
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM loans where id=? Limit 1', [id],(err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

function getAllLoansFromDB() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM loans', (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

/* GET home page. */
router.get('/', async function(req, res, next) {
  try {
    let usdcAmount = 0;


    const saccos = await getAllSaccosFromDB();
  
    const daos = await getAllDaosFromDB();
  
    const loans = await getAllLoansFromDB();
  
    const liquidators = await getAllLiquidatorsFromDB();
  
    let wallets = await intasend.wallets().get(walletId=process.env.EzaIntasendID)
  
    res.render('index', { title: 'Express',usdcAmount:usdcAmount ,saccos:saccos,daos:daos,loans:loans,liquidators:liquidators,eza_balance:wallets.available_balance});
  } catch (error) {
    console.log(error)
  }

});



function getAllSaccosFromDB() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM saccos inner join users u On u.id=saccos.user_id', (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}
function getDaoLoansFromDB(id) {
  return new Promise((resolve, reject) => {
    db.all('SELECT l.*,d.id as dao_id, du.name as dao_name,s.id as sacco_id ,su.name as sacco_name FROM loans l inner join dao d On d.id =l.dao inner join saccos s On s.id=l.sacco inner join users su On su.id=s.user_id inner join users du On du.id=d.user_id where l.dao  = ? AND l.loan_status != "inactive" ORDER BY  l.id desc',[id], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

function getSaccoLoansFromDB(id) {
  return new Promise((resolve, reject) => {
    db.all('SELECT l.*,d.id as dao_id, du.name as dao_name,s.id as sacco_id ,su.name as sacco_name FROM loans l inner join dao d On d.id =l.dao inner join saccos s On s.id=l.sacco inner join users su On su.id=s.user_id inner join users du On du.id=d.user_id where l.sacco  = ? ORDER BY  l.id desc',[id], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

function getAllSaccoLoansFromDB() {
  return new Promise((resolve, reject) => {
    db.all('SELECT l.*,d.id as dao_id, du.name as dao_name,s.id as sacco_id ,su.name as sacco_name FROM loans l inner join dao d On d.id =l.dao inner join saccos s On s.id=l.sacco inner join users su On su.id=s.user_id inner join users du On du.id=d.user_id ORDER BY  l.loan_status desc', (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

function getAllDaosFromDB() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM dao inner join users u On u.id=dao.user_id', (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

function getDaoDepositsFromDB() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM dao_deposits', (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

function getAllSaccoDeposits() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM sacco_deposits', (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// SACCO FUNCTIONS

router.get('/sacco_dashboard', async function(req, res, next) {

  //sacco details
  let sacco_details = await getAllSaccosFromDB();

  //sacco loans
  let sacco_loans = await getSaccoLoansFromDB(1);

  //dao details
  let daos  = await getAllDaosFromDB();


  res.render('sacco_dashboard', { title: 'Express' ,sacco_details:sacco_details[0],sacco_loans:sacco_loans,daos:daos});
});

router.post('/sacco_loan_request', async function(req, res, next) {
  try {
    const {dao_name,sacco_name,amount} =  req.body

    console.log(req.body)

    await db.run('INSERT INTO loans (dao,sacco,amount,is_given_fulfilled,is_repaid_fulfilled,repayment_amount,interest_rate) VALUES (?,?,?,?,?,?,?)', [dao_name,sacco_name, amount,'false','false',0,0]);

    res.json({"message":'Loan Request Sent'})
  }catch(error){
    console.log(error)
    res.json({"message":'Error:Loan Request not sent'})

  }
});


// ADMIN FUNCTIONS

router.get('/admin_dashboard', async function(req, res, next) {
  try {
    let wallet_balance = await client.getWalletTokenBalance({
      id:process.env.EzaCircleID,
      tokenAddresses:[process.env.USDCtokenAddress]
    })
    let usdcAmount = wallet_balance.data.tokenBalances[0].amount
  
    const saccos = await getAllSaccosFromDB();
  
    const daos = await getAllDaosFromDB();
  
    const loans = await getAllLoansFromDB();
  
    const liquidators = await getAllLiquidatorsFromDB();
  
    // let wallets = await intasend.wallets().get(walletId=process.env.EzaIntasendID)
    // wallets.available_balance
      
    const sacco_loans = await getAllSaccoLoansFromDB();
  
  
    res.render('admin_dashboard', { title: 'Express',usdcAmount:usdcAmount ,saccos:saccos,daos:daos,loans:loans,liquidators:liquidators,eza_balance:0,sacco_loans:sacco_loans});
  } catch (error) {
    console.log(error)
  }

});

router.patch('/sacco_first_loan_approve/:id', async function(req, res, next) {


    try {
      const {interest_rate,credit_score} =  req.body
 
    
      let loan = await getOneLoanFromDB(req.params.id)
      console.log(loan)
      let repayment_amount =  parseFloat(loan[0].amount) + parseFloat(loan[0].amount)* parseFloat(interest_rate);
  
      await db.run('UPDATE loans SET is_approved = ?,repayment_amount=?,interest_rate=?,loan_status=?,credit_score=? where id = ?', ['true',repayment_amount,interest_rate,'PENDING',credit_score,req.params.id]);
      
      res.json({"message":'Loan Sent to DAO'})
    }catch(error){
      console.log(error)
      res.json({"message":'Error:Loan Request not sent'})
  
    }

})


// DAO FUNCTIONS

router.get('/dao_dashboard', async function(req, res, next) {

  //sacco loans
  let sacco_loans = await getDaoLoansFromDB(1);

  //dao details
  let dao_details  = await getAllDaosFromDB();

  res.render('dao_dashboard', { title: 'Express' ,dao_details:dao_details[0],sacco_loans:sacco_loans});
});

router.patch('/sacco_second_loan_approve/:id', async function(req, res, next) {


  try {

    await db.run('UPDATE loans SET is_approved = ?,loan_status=? where id = ?', ['true','APPROVED',req.params.id]);
    
    res.json({"message":'Loan fully Approved'})
  }catch(error){
    console.log(error)
    res.json({"message":'Error:Loan Request not approved'})

  }

})


// LP Functions
router.get('/lp_dashboard', async function(req, res, next) {

  //dao usdc
  let dao_deposits = await getDaoDepositsFromDB();

  //LP details
  let lp_details  = await getAllLiquidatorsFromDB();

  //dao usdc
  let sacco_deposits = await getAllSaccoDeposits();


  res.render('lp_dashboard', { title: 'Express' ,lp_details:lp_details[0],dao_deposits:dao_deposits,sacco_deposits:sacco_deposits});
});

router.post('/liquiditor_pay', async function(req, res, next) {
  try {
    console.log(req.body)
    const {liquidator_name,usdc_amount} =  req.body

    let amount  =  usdc_amount*130;

    liquidator = await getAllOneLiquidatorFromDB(liquidator_name)



    db.run("INSERT INTO liquiditor_deposits (liquidator,usdc_to_transfer,amount,is_fulfilled) VALUES (?,?,?,?) RETURNING *",[liquidator[0].id,usdc_amount,amount,'false'], function(err) {
      if(null == err){
          // row inserted successfully
          console.log(this.lastID);
          api_ref = 'liquidatordeposit '+this.lastID
          console.log(api_ref)
          console.log(amount)
           let collection = intasend.collection();
          collection
            .charge({
              first_name: liquidator[0].name,
              last_name: liquidator[0].name,
              email: liquidator[0].email,
              host: process.env.callbackURL,
              amount: parseFloat(amount.toFixed(2)),
              currency: 'KES',
              api_ref: api_ref,
              redirect_url:process.env.callbackURL,
              wallet_id: process.env.EzaIntasendID,
            })
            .then((resp) => {
              // Redirect user to URL to complete payment
              console.log(`Charge Resp:`, resp);


              res.json(resp)
            })
            .catch((err) => {
              console.error(`Charge error:`, err.toString());
              res.json({"message":'error'})
            });

      } else {
          //Oops something went wrong
          console.log(err);
      }
  });
 


    //on callback update Eza rafiki wallet balance


  } catch (error) {
    console.error('Error querying saccos:', error.message);
    // res.status(500).send('Internal Server Error');
    res.json({"message":error.message})

  }
});


router.post('/circle_callback', async function(req, res, next) {

  if(req.body.notificationType == 'transactions.inbound' &&  req.body.notification.destinationAddress ==process.env.EzaCircleAddress && req.body.notification.state=='COMPLETE'){
    
  }

  res.json({"message":'success'})

});


router.get('/metamorpho_factory', async function(req, res, next) {


  // Provider
  const alchemyProvider = new ethers.providers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/OyViYd4DHAYThQgB_aJ4gBpp3si7pgf_");

  // Signer
  const signer = new ethers.Wallet("930e8bbc8e758432acc90071e4c042d4aa152762cd22f1ad8257449c013c7230", alchemyProvider);
  // console.log(signer.address)


  // You can also use an ENS name for the contract address
  const metamorpho_sepolia_address = "0x03ec6F153E3a75BA5e35B12D5b958Fb68bf4444C";

  // The ERC-20 Contract ABI, which is a common contract interface
  // for tokens (this is the Human-Readable ABI format)
  const metamorpho_factory_ABI =[{"inputs":[{"internalType":"address","name":"morpho","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"ZeroAddress","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"metaMorpho","type":"address"},{"indexed":true,"internalType":"address","name":"caller","type":"address"},{"indexed":false,"internalType":"address","name":"initialOwner","type":"address"},{"indexed":false,"internalType":"uint256","name":"initialTimelock","type":"uint256"},{"indexed":true,"internalType":"address","name":"asset","type":"address"},{"indexed":false,"internalType":"string","name":"name","type":"string"},{"indexed":false,"internalType":"string","name":"symbol","type":"string"},{"indexed":false,"internalType":"bytes32","name":"salt","type":"bytes32"}],"name":"CreateMetaMorpho","type":"event"},{"inputs":[],"name":"MORPHO","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"initialOwner","type":"address"},{"internalType":"uint256","name":"initialTimelock","type":"uint256"},{"internalType":"address","name":"asset","type":"address"},{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"symbol","type":"string"},{"internalType":"bytes32","name":"salt","type":"bytes32"}],"name":"createMetaMorpho","outputs":[{"internalType":"contract IMetaMorpho","name":"metaMorpho","type":"address"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"isMetaMorpho","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"}]

  // const signer = provider.getSigner();
  const metamorphoFactoryContract = new ethers.Contract(metamorpho_sepolia_address, metamorpho_factory_ABI, signer);

  const initialOwner = "0x71538E7717aD4a9A2eF3dEAEb7F86EE1BaAc68f0";
  const initialTimelock = 86400; // Set to minimum value as mentioned
  const asset = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"; // The address of the ERC20 token
  const name = "EZA_SEPOLIA_VAULT_1";
  const symbol = "EZSV1";
  const salt = ethers.utils.randomBytes(32); // Generate a random salt

  try {
    // const tx = await metamorphoFactoryContract.createMetaMorpho(initialOwner, initialTimelock, asset, name, symbol, salt);
    // console.log(tx)
    // // await tx.wait();
    // console.log(await tx.wait())

    // logs: [
    //   {
    //     transactionIndex: 6,
    //     blockNumber: 5767900,
    //     transactionHash: '0x4abce275c95b328840ff77966819702353708aa26b11e1880478518ad818ca57',
    //     address: '0x6E95aD25C772f1a6CBA55b71572410a0dCB77fE5', //vault address
    //     topics: [Array],
    //     data: '0x',
    //     logIndex: 3,
    //     blockHash: '0x0a95164e8d443c0a18d484f3fbc69b35801c9257029cda87e1181cc0970b4530'
    //   },
    //  ]

      await metamorphoFactoryContract.isMetaMorpho('0x6E95aD25C772f1a6CBA55b71572410a0dCB77fE5')

    console.log("Transaction successful!");
  } catch (error) {
    console.error("Transaction failed:", error);
  }



  res.json({"message":'success'})

});


router.get('/metamorpho_contract', async function(req, res, next) {
  // Provider
  const alchemyProvider = new ethers.providers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/OyViYd4DHAYThQgB_aJ4gBpp3si7pgf_");

  // Signer
  const signer = new ethers.Wallet("930e8bbc8e758432acc90071e4c042d4aa152762cd22f1ad8257449c013c7230", alchemyProvider);
  // console.log(signer.address)


  // You can also use an ENS name for the contract address
  const metamorpho_sepolia_address = "0x2c7fbc27dedeabb098074387567a8555ba5c7a0e";

  // The ERC-20 Contract ABI, which is a common contract interface
  // for tokens (this is the Human-Readable ABI format)
  const metamorpho_factory_ABI = require("../abi.json");

  // const signer = provider.getSigner();
  const metamorphoFactoryContract = new ethers.Contract(metamorpho_sepolia_address, metamorpho_factory_ABI, signer);

  try {
    // 0x6E95aD25C772f1a6CBA55b71572410a0dCB77fE5

    console.log(await metamorphoFactoryContract.owner())

    console.log("Transaction successful!");
  } catch (error) {
    console.error("Transaction failed:", error);
  }


  res.json({"message":'success'})

});


module.exports = router;



//CALLBACKS

// //callback
// router.post('/callback', async function(req, res, next) {
//   try {
//     console.log("On callback")
//     console.log(req.body)
//     console.log(req.body.api_ref)
//     console.log(req.body.api_ref.includes('saccoloanrepay'))
//     if(req.body.api_ref.includes('liquidatordeposit')){
//       //handle deposit by checkingn status then if check our new wallet balance
//       //update this as fulfilled
  
//       if(req.body.state =='COMPLETE'){
//         await db.run('UPDATE liquiditor_deposits SET is_fulfilled = ? where id = ?', ['true',req.body.api_ref.match(/\d+/)[0]]);
  
//         let rows = await getLiquiditorData(req.body.api_ref.match(/\d+/)[0]);
//         console.log(rows)
      
//         const response = await client.createTransaction({
//           walletId: '7d0ae3fc-d2aa-51a1-8759-7ebea1d20857',
//           tokenId: '7adb2b7d-c9cd-5164-b2d4-b73b088274dc',
//           destinationAddress: rows[0].wallet_address,
//           amounts: [rows[0].usdc_to_transfer],
//           fee: {
//             type: 'level',
//             config: {
//               feeLevel: 'MEDIUM'
//             }
//           }
//         });
      
//         console.log(response)
        
    
//       }else if(req.body.state =='FAILED'){
//         await db.run('DELETE liquiditor_deposits where id = ?', [req.body.api_ref.match(/\d+/)[0]]);
//       }
  
  
//     }else if(req.body.api_ref.includes('saccoloanrepay')){
//       console.log("Sacco Repay")
//       // console.log(req.body)
//       if(req.body.state =='COMPLETE'){
//         let loan = await getOneLoanFromDB(req.body.api_ref.match(/\d+/g)[0])
//         let sacco = await getOneSaccosFromDB(req.body.api_ref.match(/\d+/g)[1])

//         console.log(loan)
//         console.log(sacco)
    

      

//       console.log("RECEIVER CREATION INITIATED")
//     const receivermutation = `
//         mutation CreateReceiver($input: CreateReceiverInput!) {
//           createReceiver(input: $input) {
//             code
//             message
//             receiver {
//               completed
//               createdAt
//               expiresAt
//               metadata
//               id
//               incomingAmount {
//                 assetCode
//                 assetScale
//                 value
//               }
//               walletAddressUrl
//               receivedAmount {
//                 assetCode
//                 assetScale
//                 value
//               }
//               updatedAt
//             }
//             success
//           }
//         }
//       `;

//       // Make a POST request to your GraphQL endpoint with the mutation payload
//       const receiverresponse = await axios.post('http://localhost:3001/graphql', {
//       query: receivermutation,
//       variables: {
//           "input": {
//             "metadata": {
//               "description": "Loan repayemnt receiver f"
//             },
//             "incomingAmount": {
//               "assetCode": "KES",
//               "assetScale": 0,
//               "value": parseFloat(req.body.value)
//             },
//             "walletAddressUrl": 'https://cloud-nine-wallet-backend/eza_kenya'
//           }
//       }
//       });
//       console.log(receiverresponse.data)
//       console.log(receiverresponse.data.data.createReceiver.receiver)

//       if(receiverresponse.data.data.createReceiver.code==200){
//         // await db.run('UPDATE loans SET is_given_fulfilled = ?,loan_status=? where id = ?', ['true','IN_PROGRESS',req.params.id]);
//         //create a quote
//         console.log("QUOTE CREATION INITIATED")
//       const quotemutation = `
//           mutation CreateQuote($input: CreateQuoteInput!) {
//             createQuote(input: $input) {
//               code
//               message
//               quote {
//                 createdAt
//                 expiresAt
//                 highEstimatedExchangeRate
//                 id
//                 lowEstimatedExchangeRate
//                 maxPacketAmount
//                 minExchangeRate
//                 walletAddressId
//                 receiveAmount {
//                   assetCode
//                   assetScale
//                   value
//                 }
//                 receiver
//                 debitAmount {
//                   assetCode
//                   assetScale
//                   value
//                 }
//               }
//             }
//           }
//         `;
    
//         // Make a POST request to your GraphQL endpoint with the mutation payload
//         const quoteresponse = await axios.post('http://localhost:3001/graphql', {
//         query: quotemutation,
//         variables: {
//           "input": {
//             "walletAddressId": sacco[0].wallet_rafiki_id, //sacco rafiki wallet
//             "receiver": receiverresponse.data.data.createReceiver.receiver.id
//           }
//         }
//         });
//         console.log(quoteresponse.data)

//         if(quoteresponse.data.data.createQuote.code==200){
//           //create a Outgoing
//           console.log("OUTGOING PAYMENT INITIATED")
//         const outgoingmutation = `
//               mutation CreateOutgoingPayment($input: CreateOutgoingPaymentInput!) {
//                 createOutgoingPayment(input: $input) {
//                   code
//                   message
//                   payment {
//                     createdAt
//                     error
//                     metadata
//                     id
//                     walletAddressId
//                     receiveAmount {
//                       assetCode
//                       assetScale
//                       value
//                     }
//                     receiver
//                     debitAmount {
//                       assetCode
//                       assetScale
//                       value
//                     }
//                     sentAmount {
//                       assetCode
//                       assetScale
//                       value
//                     }
//                     state
//                     stateAttempts
//                   }
//                   success
//                 }
//               }
//           `;
      
//           // Make a POST request to your GraphQL endpoint with the mutation payload
//           const outgoingresponse = await axios.post('http://localhost:3001/graphql', {
//           query: outgoingmutation,
//           variables: {
//             "input": {
//               "walletAddressId": sacco[0].wallet_rafiki_id,
//               "quoteId":  quoteresponse.data.data.createQuote.quote.id
//             }
//           }
//           });
//           console.log(outgoingresponse.data)

//           if(outgoingresponse.data.data.createOutgoingPayment.code==200){
//             // await db.run('UPDATE loans SET is_given_fulfilled = ?,loan_status=? where id = ?', ['true','COMPLETE',req.params.id]);
//             //deposit Outgoing
//             console.log("DEPOSIT OUTGOING PAYMENT INITIATED")
//           const outgoingDepositmutation = `
//               mutation DepositOutgoingPaymentLiquidity($input: DepositOutgoingPaymentLiquidityInput!) {
//                 depositOutgoingPaymentLiquidity(input: $input) {
//                   code
//                   error
//                   message
//                   success
//                 }
//               }
          
//             `;
        
//             // Make a POST request to your GraphQL endpoint with the mutation payload
//             const outgoingDepositresponse = await axios.post('http://localhost:3001/graphql', {
//             query: outgoingDepositmutation,
//             variables: {
//               "input": {
//                 "outgoingPaymentId": outgoingresponse.data.data.createOutgoingPayment.payment.id,
//                 "idempotencyKey":""
//             }
//             }
//             });
//             console.log(outgoingDepositresponse.data)

//             if(outgoingDepositresponse.data.data.depositOutgoingPaymentLiquidity.code==200){
              
           
//                 console.log("UPDATE OF LOAN STATUS  INITIATED")
//                 // let updated_amount = parseFloat(sacco[0].current_wallet_balance) + parseFloat(loan[0].amount)
                
//                 // updateSaccoRafikiWallet(loan[0].sacco,updated_amount)

//                 // await db.run('UPDATE loans SET is_given_fulfilled = ?,loan_status=? where id = ?', ['true','ACTIVE',loan[0].id]);

//                 if(req.body.value == loan[0].repayment_amount ){
//                   await db.run('UPDATE loans SET is_repaid_fulfilled = ?,loan_status=?,repaid_amount=? where id = ?', ['true','PAID',req.body.value,req.body.api_ref.match(/\d+/g)[0]]);
          
//                 }else{
//                   await db.run('UPDATE loans SET is_repaid_fulfilled = ?,loan_status=?,repaid_amount=? where id = ?', ['false','PARTIAL_PAID',req.body.value,req.body.api_ref.match(/\d+/g)[0]]);
        
//                 }

//                 console.log("TRANSACTIONS COMPLETE")

        
//             }

//           }

//         }

//       }

    
    
//       }else if(req.body.state =='FAILED'){
//         // await db.run('DELETE liquiditor_deposits where id = ?', [req.body.api_ref.match(/\d+/)[0]]);
//       }
//     }else if(req.body.status =='Completed'){
//         if(req.body.transactions[0].narrative.includes('saccowithdraw')){

//         let sacco = await getOneSaccosFromDB(req.body.transactions[0].narrative.match(/\d+/)[0])
//         let updated_amount = parseFloat(sacco[0].current_wallet_balance) - parseFloat(req.body.transactions[0].amount)
                  
                
//         updateSaccoRafikiWallet(sacco[0].id,updated_amount)
//         }else{
//           res.json({"message":'success'})
//         }
//       }
   
//     res.json({"message":'success'})
//   } catch (error) {
//     console.log(error)
    
//     // if(req.body.status == 'Completed'){
      
//     //   let sacco = await getOneSaccosFromDB(req.body.transactions[0].narrative)
    
//     //   let updated_amount = sacco[0].current_wallet_balance - req.body.transactions[0].amount
//     //   updateSaccoRafikiWallet(sacco[0].id,updated_amount)

//     // }
//     // res.json({"message":'success'})
//   }

// });

