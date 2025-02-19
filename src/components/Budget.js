import React, { useState, useEffect, useMemo } from "react";
import { db } from "../firebase";
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { auth } from "../firebase"; 
import { onAuthStateChanged } from "firebase/auth"; 
import "../styles/Budget.css";

const categories = [
  "","🏠 Housing", "🚗 Transportation", "🛒 Groceries", "🍽️ Dining Out", "📲 Bills & Insurance",
  "🎓 Education", "🎤 Entertainment", "🧖 Self-Care", "🛍️ Shopping",
  "💳 Debt Repayments", "✈️ Travel", "🎁 Gifts & Donations", "❓ Else"
];

const incomeCategories = [
  "","💼 Salary", "💰 Side Hustle", "🎉 Bonus", "📈 Investment", "🎁 Gift", "❓ Else"
];

const Budget = () => {  
  const [user, setUser] = useState(null);
  const [income, setIncome] = useState([]);
  const [fixedExpenses, setFixedExpenses] = useState([]);
  const [nonFixedExpenses, setNonFixedExpenses] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingType, setEditingType] = useState(null);
  const [editData, setEditData] = useState({ name: "", category: "", expected: "", actual: "" });
  const [savings, setSavings] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const incomeRef = collection(db, "users", user.uid, "income");
    const fixedExpensesRef = collection(db, "users", user.uid, "fixedExpenses");
    const nonFixedExpensesRef = collection(db, "users", user.uid, "nonFixedExpenses");
    const savingsRef = collection(db, "users", user.uid, "savings"); 

    const unsubscribeSavings = onSnapshot(savingsRef, (snapshot) => {
      setSavings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubscribeIncome = onSnapshot(incomeRef, (snapshot) => {
      setIncome(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubscribeFixed = onSnapshot(fixedExpensesRef, (snapshot) => {
      setFixedExpenses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubscribeNonFixed = onSnapshot(nonFixedExpensesRef, (snapshot) => {
      setNonFixedExpenses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribeIncome();
      unsubscribeFixed();
      unsubscribeNonFixed();
      unsubscribeSavings();
    };
  }, [user]);

  const addEntry = async (type) => {
    if (!user) return; 
  
    const newEntry = {
        userId: user.uid, 
        name: "New Entry",
        expected: 0,
        actual: 0,
        type: type === "income" ? "" : null,
    };

    if (type !== "income") {
        newEntry.category = ""; 
    }
  
    const collectionRef = collection(db, "users", user.uid, type === "income" ? "income" : type === "fixed" ? "fixedExpenses" : "nonFixedExpenses");
    await addDoc(collectionRef, newEntry);
  };

  const deleteEntry = async (id, type) => {
    if (!user) return;
    
    const docRef = doc(db, "users", user.uid, type === "income" ? "income" : type === "fixed" ? "fixedExpenses" : "nonFixedExpenses", id);
    await deleteDoc(docRef);
  };

  const startEditing = (entry, type) => {
    setEditingId(entry.id);
    setEditingType(type);
    setEditData({ 
      name: entry.name, 
      category: entry.category || "", 
      expected: entry.expected, 
      actual: entry.actual 
    });
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const saveEdit = async () => {
    if (!user || !editingId || !editingType) return;

    const docRef = doc(db, "users", user.uid, 
      editingType === "income" ? "income" : 
      editingType === "fixed" ? "fixedExpenses" : 
      "nonFixedExpenses", 
      editingId
    );

    await updateDoc(docRef, editData);

    setEditingId(null);
    setEditingType(null);
  };

  const filteredIncome = income.filter(entry => entry.id !== "default");
  const filteredFixed = fixedExpenses.filter(entry => entry.id !== "default");
  const filteredNonFixed = nonFixedExpenses.filter(entry => entry.id !== "default");

  const totalIncome = useMemo(() => 
    income.reduce((acc, entry) => acc + Number(entry.actual || 0), 0), [income]);

  const totalFixedExpenses = useMemo(() => 
    fixedExpenses.reduce((acc, entry) => acc + Number(entry.actual || 0), 0), [fixedExpenses]);

  const totalNonFixedExpenses = useMemo(() => 
    nonFixedExpenses.reduce((acc, entry) => acc + Number(entry.actual || 0), 0), [nonFixedExpenses]);

  const totalExpenses = totalFixedExpenses + totalNonFixedExpenses;
  const remainingBudget = totalIncome - totalExpenses;

  const totalSavings = useMemo(() => 
    savings.reduce((acc, entry) => acc + Number(entry.currentAmount || 0), 0), [savings]);

  return (
    <div className="budget-container">
  
      {/* Income Section */}
      <div className="income-box">
        <h2>Income</h2>
        <table>
          <thead>
            <tr>
              <th>Source</th>
              <th>Type</th>
              <th>Expected</th>
              <th>Actual</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredIncome.map((entry) => (
              <tr key={entry.id}>
                <td>
                  {editingId === entry.id ? (
                    <input type="text" name="name" value={editData.name} onChange={handleEditChange} />
                  ) : (
                    entry.name
                  )}
                </td>
                <td>
                  {editingId === entry.id ? (
                    <select name="type" value={editData.type} onChange={handleEditChange}>
                      {incomeCategories.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  ) : (
                    entry.type || "N/A"
                   )}
                </td>
                <td>
                  {editingId === entry.id ? (
                    <input type="number" name="expected" value={editData.expected} onChange={handleEditChange} />
                  ) : (
                    `€${entry.expected}`
                  )}
                </td>
                <td>
                  {editingId === entry.id ? (
                    <input type="number" name="actual" value={editData.actual} onChange={handleEditChange} />
                  ) : (
                    `€${entry.actual}`
                  )}
                </td>
                <td>
                  {editingId === entry.id ? (
                    <button onClick={saveEdit}>Save</button>
                  ) : (
                    <button onClick={() => startEditing(entry, "income")}>Edit</button>
                  )}
                  <button className="delete-btn" onClick={() => deleteEntry(entry.id, "income")}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={() => addEntry("income")}>+ Add Income Source</button>
      </div>
      {/* Expenses Container */}
      <div className="expenses-container">
        {/* Fixed Expenses */}
        <div className="fixed-expenses-box">
          <h2>Fixed Expenses</h2>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Expected</th>
                <th>Actual</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
            {filteredFixed.map((entry) => (
                <tr key={entry.id}>
                  <td>
                    {editingId === entry.id ? (
                      <input type="text" name="name" value={editData.name} onChange={handleEditChange} />
                    ) : (
                      entry.name
                    )}
                  </td>
                  <td>
                    {editingId === entry.id ? (
                      <select name="category" value={editData.category} onChange={handleEditChange}>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    ) : (
                      entry.category || "N/A"
                    )}
                  </td>
                  <td>
                    {editingId === entry.id ? (
                      <input type="number" name="expected" value={editData.expected} onChange={handleEditChange} />
                    ) : (
                      `€${entry.expected}`
                    )}
                  </td>
                  <td>
                    {editingId === entry.id ? (
                      <input type="number" name="actual" value={editData.actual} onChange={handleEditChange} />
                    ) : (
                      `€${entry.actual}`
                    )}
                  </td>
                  <td>
                    {editingId === entry.id ? (
                      <button onClick={saveEdit}>Save</button>
                    ) : (
                      <button onClick={() => startEditing(entry, "fixed")}>Edit</button>
                    )}
                    <button className="delete-btn" onClick={() => deleteEntry(entry.id, "fixed")}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={() => addEntry("fixed")}>+ Add Fixed Expense</button>
        </div>
        {/* Non-Fixed Expenses */}
        <div className="non-fixed-expenses-box">
          <h2>Non-Fixed Expenses</h2>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Expected</th>
                <th>Actual</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
            {filteredNonFixed.map((entry) => (
                <tr key={entry.id}>
                  <td>
                    {editingId === entry.id ? (
                      <input type="text" name="name" value={editData.name} onChange={handleEditChange} />
                    ) : (
                      entry.name
                    )}
                  </td>
                  <td>
                    {editingId === entry.id ? (
                      <select name="category" value={editData.category} onChange={handleEditChange}>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    ) : (
                      entry.category || "N/A"
                    )}
                  </td>
                  <td>
                    {editingId === entry.id ? (
                      <input type="number" name="expected" value={editData.expected} onChange={handleEditChange} />
                    ) : (
                      `€${entry.expected}`
                    )}
                  </td>
                  <td>
                    {editingId === entry.id ? (
                      <input type="number" name="actual" value={editData.actual} onChange={handleEditChange} />
                    ) : (
                      `€${entry.actual}`
                    )}
                  </td>
                  <td>
                    {editingId === entry.id ? (
                      <button onClick={saveEdit}>Save</button>
                    ) : (
                      <button onClick={() => startEditing(entry, "nonFixed")}>Edit</button>
                    )}
                    <button className="delete-btn" onClick={() => deleteEntry(entry.id, "nonFixed")}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={() => addEntry("nonFixed")}>+ Add Non-Fixed Expense</button>
        </div>
      </div> 
      {/* Budget Overview Section */}
      <div className="budget-overview">
        <h2>📊Budget Overview</h2>
        <div className="overview-box">
           <p><strong>💰Total Income:</strong> ${totalIncome.toFixed(2)}</p>
           <p><strong>💸Total Expenses:</strong> ${totalExpenses.toFixed(2)}</p>
           <p><strong>🪙Remaining Budget:</strong> ${remainingBudget.toFixed(2)}</p>
        </div>
        <h2>🏦 Savings Overview</h2>
        <div className="savings-overview-box">
           <p><strong>👛 Total Savings:</strong> ${totalSavings.toFixed(2)}</p>
        </div>
      </div>
      </div>
  );
};  

export default Budget;






