// import { stripe } from "./utils/constants.js";

// async function createTestConnectAccount() {
//   try {
//     // Create a Custom account (for most flexibility in testing)
//     const account = await stripe.accounts.create({
//       type: "custom",
//       country: "US",
//       email: "jenny.rosen@example.com",
//       capabilities: {
//         card_payments: { requested: true },
//         transfers: { requested: true },
//       },
//       business_type: "individual",
//       individual: {
//         first_name: "Jenny",
//         last_name: "Rosen",
//         email: "jenny.rosen@example.com",
//         dob: {
//           day: 1,
//           month: 1,
//           year: 1990,
//         },
//         address: {
//           line1: "address_full_match",
//           city: "San Francisco",
//           state: "CA",
//           postal_code: "94111",
//           country: "US",
//         },
//         phone: "0000000000",
//         ssn_last_4: "0000",
//       },
//       business_profile: {
//         mcc: "5734", // Computer Software Stores
//         url: "https://accessible.stripe.com",
//       },
//       tos_acceptance: {
//         date: Math.floor(Date.now() / 1000),
//         ip: "8.8.8.8", // Replace with actual IP if possible
//       },
//     });

//     console.log("Test Connect account created:", account.id);

//     // Add an external account (bank account) to the Connect account
//     const bankAccount = await stripe.accounts.createExternalAccount(
//       account.id,
//       {
//         external_account: {
//           object: "bank_account",
//           country: "US",
//           currency: "usd",
//           account_holder_name: "Jenny Rosen",
//           account_holder_type: "individual",
//           routing_number: "110000000", // Test routing number
//           account_number: "000123456789", // Test account number
//         },
//       }
//     );

//     console.log("Bank account added:", bankAccount.id);

//     return { account, bankAccount };
//   } catch (error) {
//     console.error("Error creating test Connect account:", error);
//     throw error;
//   }
// }

// // Usage
// createTestConnectAccount()
//   .then((result) => {
//     console.log("Account created:", result.account.id);
//     console.log("Bank account added:", result.bankAccount.id);
//   })
//   .catch((error) => console.error("Failed to create account:", error));
