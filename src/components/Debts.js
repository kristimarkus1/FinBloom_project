import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc, deleteDoc, doc, updateDoc, onSnapshot } from "firebase/firestore";
import "../styles/Debts.css";

const Debts = () => {
  const [debts, setDebts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) return;

      setUser(user); 

      const debtsCollectionRef = collection(db, "users", user.uid, "debts");

      const debtsListener = onSnapshot(debtsCollectionRef, (snapshot) => {
        const debtsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setDebts(debtsData);
      });

      return () => debtsListener();
    });

    return () => unsubscribe();
  }, []);
  
  const addDebt = async () => {
    if (!user) return;

    const newDebt = {
      name: "New Debt",
      amount: 0,
      interestRate: 0,
      minPayment: 0,
      startBalance: 0,
      currentBalance: 0,
      fullyPaid: false,
    };

    await addDoc(collection(db, "users", user.uid, "debts"), newDebt);
  };

  const deleteDebt = async (id) => {
    if (!user) return;
    await deleteDoc(doc(db, "users", user.uid, "debts", id));
  };

  const startEditing = (debt) => {
    setEditingId(debt.id);
    setEditData(debt);
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const saveEdit = async () => {
    if (!user || !editingId) return;
    await updateDoc(doc(db, "users", user.uid, "debts", editingId), editData);
    setEditingId(null);
  };

  const logPayment = async (id, paymentAmount) => {
    if (!user) return;

    const debtRef = doc(db, "users", user.uid, "debts", id);
    const debt = debts.find((d) => d.id === id);
    if (!debt) return;

    const newBalance = Math.min(debt.currentBalance + paymentAmount, debt.amount);
    const fullyPaid = newBalance === debt.amount;

    const updateData = {
        currentBalance: newBalance,
        fullyPaid: fullyPaid, 
    };

    await updateDoc(debtRef, updateData);
};

  return (
    <div className="debts-box">
      <h2>💳 Debts</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Total Amount</th>
            <th>Interest %</th>
            <th>Min Payment</th>
            <th>Start Balance</th>
            <th>Current Balance</th>
            <th>Progress</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {debts.map((debt) => (
            <tr key={debt.id}>
              <td>
                {editingId === debt.id ? (
                  <input type="text" className="edit-input" name="name" value={editData.name} onChange={handleEditChange} />
                ) : (
                  debt.name
                )}
              </td>
              <td>
                {editingId === debt.id ? (
                  <input type="number" className="edit-input" name="amount" value={editData.amount} onChange={handleEditChange} />
                ) : (
                  `€${debt.amount}`
                )}
              </td>
              <td>
                {editingId === debt.id ? (
                  <input type="number" className="edit-input" name="interestRate" value={editData.interestRate} onChange={handleEditChange} />
                ) : (
                  `${debt.interestRate}%`
                )}
              </td>
              <td>
                {editingId === debt.id ? (
                  <input type="number" className="edit-input" name="minPayment" value={editData.minPayment} onChange={handleEditChange} />
                ) : (
                  `€${debt.minPayment}`
                )}
              </td>
              <td>
                {editingId === debt.id ? (
                  <input type="number" className="edit-input" name="startBalance" value={editData.startBalance} onChange={handleEditChange} />
                ) : (
                  `€${debt.startBalance}`
                )}
              </td>
              <td>
                {editingId === debt.id ? (
                  <input type="number" className="edit-input" name="currentBalance" value={editData.currentBalance} onChange={handleEditChange} />
                ) : (
                  `€${debt.currentBalance}`
                )}
              </td>
              <td>
                <div className="progress-container">
                  <progress value={debt.currentBalance} max={debt.amount}></progress>
                  <span>
                    &nbsp;
                    &nbsp;
                    {debt.amount > 0 ? ((debt.currentBalance / debt.amount) * 100).toFixed(1) : "0.0"}%
                  </span>
                </div>
              </td>
              <td>
                {editingId === debt.id ? (
                  <button onClick={saveEdit}>Save</button>
                ) : (
                  <button onClick={() => startEditing(debt)}>Edit</button>
                )}
                <button className="delete-btn" onClick={() => deleteDebt(debt.id)}>Delete</button>
                {debt.fullyPaid && <span>✅ Fully Paid!📣</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={addDebt}>+ Add Debt</button>
    </div>
  );
};

export default Debts;


