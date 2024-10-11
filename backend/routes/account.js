const express = require("express");
const { Account } = require("../db");
const { authMiddleware } = require("../middleware");
const mongoose = require("mongoose");
const router = express.Router();

router.get("/balance", authMiddleware, async (req, res) => {
  try {
    const account = await Account.findOne({ userId: req.userId });
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }
    res.json({ balance: account.balance });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// router.post("/transfer", authMiddleware, async (req, res) => {
//   console.log("hii")
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const { amount, to } = req.body;

//     if (amount <= 0) {
//       return res.status(400).json({ message: "Amount must be greater than zero" });
//     }

//     // Fetch the sender's account
//     const fromAccount = await Account.findOne({ userId: req.userId }).session(session);
//     if (!fromAccount || fromAccount.balance < amount) {
//       await session.abortTransaction();
//       return res.status(400).json({ message: "Insufficient balance" });
//     }

//     // Fetch the recipient's account
//     const toAccount = await Account.findOne({ userId: to }).session(session);
//     if (!toAccount) {
//       await session.abortTransaction();
//       return res.status(400).json({ message: "Invalid recipient account" });
//     }

//     // Perform the transfer
//     await Account.updateOne({ userId: req.userId }, { $inc: { balance: -amount } }).session(session);
//     await Account.updateOne({ userId: to }, { $inc: { balance: amount } }).session(session);

//     // Commit the transaction
//     await session.commitTransaction();
//     res.json({ message: "Transfer successful" });

//   } catch (error) {
//     // Rollback transaction in case of any failure
//     await session.abortTransaction();
//     res.status(500).json({ message: "Transaction failed", error });
//   } finally {
//     session.endSession(); // Ensure the session is always closed
//   }
// });
router.post("/transfer", authMiddleware, async (req, res) => {
  try {
    const { amount, to } = req.body;

    if (amount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than zero" });
    }

    // Fetch the sender's account
    const fromAccount = await Account.findOne({ userId: req.userId });
    if (!fromAccount || fromAccount.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Fetch the recipient's account
    const toAccount = await Account.findOne({ userId: to });
    if (!toAccount) {
      return res.status(400).json({ message: "Invalid recipient account" });
    }

    // Perform the transfer
    await Account.updateOne({ userId: req.userId }, { $inc: { balance: -amount } });
    await Account.updateOne({ userId: to }, { $inc: { balance: amount } });

    res.json({ message: "Transfer successful" });

  } catch (error) {
    res.status(500).json({ message: "Transaction failed", error });
  }
});

module.exports = router;
