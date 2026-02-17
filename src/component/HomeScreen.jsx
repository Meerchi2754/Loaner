import React from "react";
import { useSelector, useDispatch } from "react-redux";

/*
name: "Chai",
    amount: 0,
    category: "Food",
    paymentMethod: "GPAY UPI",
    typeTransaction: "debit",
*/

const HomeScreen = () => {
  const transactionData = useSelector((state) => state.transaction.transaction);
  return (
    <>
      <h1>Home Screen</h1>
      <h3>Trasaction Details:</h3>
      <p>{`Name:${transactionData.name}`}</p>
      <p>{`Amount:${transactionData.amount}`}</p>
      <p>{`Category:${transactionData.category}`}</p>
      <p>{`Payment Method:${transactionData.paymentMethod}`}</p>
      <p>{`typeTransaction:${transactionData.typeTransaction}`}</p>
      <p></p>
    </>
  );
};

export default HomeScreen;
