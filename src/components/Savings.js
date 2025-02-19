import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase"; // Ensure correct Firebase import
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import "../styles/Savings.css";

const savingsCategories = [
  "", "💰 Emergency Fund", "🏡 Home Purchase", "🚗 Car Fund", 
  "🎓 Education", "✈️ Travel", "🛍️ Big Purchase", "💳 Debt Repayment",
  "🎁 Gifts & Donations", "📈 Investments", "❓ Other"
];

const Savings = () => {

  const [savings, setSavings] = useState([]);
  const [newSavings, setNewSavings] = useState({
    name: "",
    targetAmount: 0,
    currentAmount: 0,
    category: "",
    description: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({
    name: "",
    targetAmount: 0,
    currentAmount: 0,
    category: "",
    description: "",
  });
  const [expandedDescriptions, setExpandedDescriptions] = useState({});

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) return;

      const savingsCollectionRef = collection(db, "users", user.uid, "savings");
      
      const savingsListener = onSnapshot(savingsCollectionRef, (snapshot) => {
        const savingsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("Fetched savings:", savingsData); 
        setSavings(savingsData);
      });

      return () => savingsListener();
    });

    return () => unsubscribe();
  }, []);

  const handleInputChange = (e) => {
    setNewSavings({ ...newSavings, [e.target.name]: e.target.value });
  };

  const addSavingsGoal = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const savingsCollectionRef = collection(db, "users", user.uid, "savings");
    await addDoc(savingsCollectionRef, newSavings);

    setNewSavings({ name: "", targetAmount: 0, currentAmount: 0, category: "", description: "" });
  };

  const startEditing = (goal) => {
    setEditingId(goal.id);
    setEditData({
        name: goal.name,
        targetAmount: goal.targetAmount || 0,
        currentAmount: goal.currentAmount || 0,
        category: goal.category || "",
        description: goal.description || "",
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prevState => ({
      ...prevState,
      [name]: name === "targetAmount" || name === "currentAmount" ? parseFloat(value) || 0 : value
    }));
  };  

  const saveEdit = async () => {
    if (!editingId) return;
    
    const user = auth.currentUser;
    if (!user) return;

    const updatedGoal = {
        name: editData.name || "",
        targetAmount: Number(editData.targetAmount) || 0,
        currentAmount: Number(editData.currentAmount) || 0,
        category: editData.category || "",
        description: editData.description || "",
    };

    try {
        await updateDoc(doc(db, "users", user.uid, "savings", editingId), updatedGoal);
        setEditingId(null);
        setEditData({
            name: "",
            targetAmount: 0,
            currentAmount: 0,
            category: "",
            description: "",
        });
    } catch (error) {
        console.error("Error updating savings goal:", error);
    }
  };

  const toggleExpand = (id) => {
    setExpandedDescriptions(prevState => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };

  const deleteGoal = async (id) => {
    const user = auth.currentUser;
    if (!user) return;

    await deleteDoc(doc(db, "users", user.uid, "savings", id));
  };

  return (
    <div className="savings-box">
      <h2>💰 Savings Goals</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Target</th>
            <th>Saved</th>
            <th>Category</th>
            <th>Description</th>
            <th>Progress</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {savings.map((goal) => (
            <tr key={goal.id}>
              <td>
                {editingId === goal.id ? (
                  <input type="text" name="name" value={editData.name} onChange={handleEditChange} />
                ) : (
                  goal.name
                )}
              </td>
              <td>
                {editingId === goal.id ? (
                  <input type="number" name="targetAmount" value={editData.targetAmount} onChange={handleEditChange} />
                ) : (
                  `€${goal.targetAmount ?? 0}`
                )}
              </td>
              <td>
                {editingId === goal.id ? (
                  <input type="number" name="currentAmount" value={editData.currentAmount} onChange={handleEditChange} />
                ) : (
                  `€${goal.currentAmount ?? 0}`
                )}
              </td>
              <td>
                {editingId === goal.id ? (
                  <select name="category" value={editData.category || ""} onChange={handleEditChange}>
                    {savingsCategories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                ) : (
                  goal.category || "N/A"
                )}
              </td>
              <td
                className={`description-cell ${expandedDescriptions[goal.id] ? "expanded" : ""}`}
                onClick={() => toggleExpand(goal.id)}
                title="Click to expand"
              >
                {expandedDescriptions[goal.id]
                  ? goal.description
                  : goal.description.length > 50
                  ? goal.description.substring(0, 50) + "..."
                  : goal.description}
              </td>
              <td>
                <div className="progress-container">
                  <progress value={goal.currentAmount || 0} max={goal.targetAmount || 1}></progress>
                  &nbsp;
                  &nbsp;
                  <span>{goal.targetAmount > 0 ? Math.round((goal.currentAmount / goal.targetAmount) * 100) : 0}%</span>
                </div>
              </td>
              <td>
                {editingId === goal.id ? (
                  <button onClick={saveEdit}>Save</button>
                ) : (
                  <button onClick={() => startEditing(goal)}>Edit</button>
                )}
                <button className="delete-btn" onClick={() => deleteGoal(goal.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={addSavingsGoal}>+ Add Savings Goal</button>
    </div>
  );
};

export default Savings;