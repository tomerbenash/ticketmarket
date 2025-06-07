import React, { useEffect, useState } from 'react';
import axios from 'axios';

function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/transactions')
      .then(response => {
        setTransactions(response.data);
      })
      .catch(error => {
        console.error('Error fetching transactions:', error);
      });
  }, []);

  return (
    <div>
      <h1>All Transactions</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Buyer ID</th>
            <th>Seller ID</th>
            <th>Ticket ID</th>
            <th>Name</th>
            <th>Price</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(tx => (
            <tr key={tx.id}>
              <td>{tx.transaction_id}</td>
              <td>{tx.buyer_id}</td>
              <td>{tx.seller_id}</td>
              <td>{tx.ticket_id}</td>
              <td>{tx.event_name}</td>

              <td>{tx.price}</td>
              <td>{new Date(tx.transaction_date).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TransactionsPage;