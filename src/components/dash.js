import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { doc, collection, onSnapshot } from "firebase/firestore";
import { Pie } from "react-chartjs-2";
import "chart.js/auto"; 
import "../styles/Dashboard.css";

const Dashboard = () => {
  const [date, setDate] = useState("")
  const [nickname, setNickname] = useState("User");
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalFixedExpenses, setTotalFixedExpenses] = useState(0);
  const [totalNonFixedExpenses, setTotalNonFixedExpenses] = useState(0);
  const [categoryData, setCategoryData] = useState({});
  const [savings, setTotalSavings] = useState(0);
  const [totalTarget, setTotalTarget] = useState(0);
  const [remainingTarget, setRemainingTarget] = useState(0);
  
  useEffect(() => {
    const today = new Date();
    setDate(
      today.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    );

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) return;
      const userRef = doc(db, "users", user.uid);
      
      const unsubscribeUser = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          setNickname(docSnap.data().nickname || "User");
        }
      });

      const unsubscribeIncome = onSnapshot(collection(userRef, "income"), (snapshot) => {
        let incomeTotal = 0;
        snapshot.forEach((doc) => {
          incomeTotal += Number(doc.data().actual || 0);
        });
        setTotalIncome(incomeTotal);
      });

      const unsubscribeFixed = onSnapshot(collection(userRef, "fixedExpenses"), (fixedSnapshot) => {
        const unsubscribeNonFixed = onSnapshot(collection(userRef, "nonFixedExpenses"), (nonFixedSnapshot) => {
          let fixedTotal = 0;
          let nonFixedTotal = 0;
          let categories = {};

          fixedSnapshot.forEach((doc) => {
            let data = doc.data();
            fixedTotal += Number(data.actual || 0);
            if (data.category) {
              categories[data.category] = (categories[data.category] || 0) + Number(data.actual);
            }
          });

          nonFixedSnapshot.forEach((doc) => {
            let data = doc.data();
            nonFixedTotal += Number(data.actual || 0);
            if (data.category) {
              categories[data.category] = (categories[data.category] || 0) + Number(data.actual);
            }
          });

          setTotalFixedExpenses(fixedTotal);
          setTotalNonFixedExpenses(nonFixedTotal);
          setCategoryData(categories);
        });
      });

      const unsubscribeSavings = onSnapshot(collection(userRef, "savings"), (snapshot) => {
        let savingsTotal = 0;
        let targetTotal = 0;
        snapshot.forEach((doc) => {
          savingsTotal += Number(doc.data().currentAmount || 0);
          targetTotal += Number(doc.data().targetAmount || 0);
        });
        setTotalSavings(savingsTotal);
        setTotalTarget(targetTotal);
        setRemainingTarget(targetTotal - savingsTotal);
      });

      return () => {
        unsubscribeUser();
        unsubscribeIncome();
        unsubscribeFixed();
        unsubscribeSavings();
      };
    });

    return () => unsubscribeAuth();
  }, []);

  const totalExpenses = totalFixedExpenses + totalNonFixedExpenses;
  const remainingBudget = totalIncome - totalExpenses;

  return (
    <div className="dashboard-container">
      <p className="date-display">Today is {date}</p>
      <h2 className="greeting">Hey, {nickname}!</h2>
      <p className="overview-text">Here’s your financial overview.</p>
      <div className="dashboard-grid">
        <div className="left-section">
          <div className="budget-overview">
            <h3>📊 Budget Overview</h3>
            <p>💰 Total Income: € {totalIncome.toFixed(2)}</p>
            <p>💸 Total Expenses: € {totalExpenses.toFixed(2)}</p>
            <p>🔵 Remaining Budget: € {remainingBudget.toFixed(2)}</p>
          </div>
          <div className="savings-overview">
            <h3>📊 Savings Overview</h3>
            <p>🏦 Total Savings: € {savings.toFixed(2)}</p>
            <p>🎯 Total Target: € {totalTarget.toFixed(2)}</p>
            <p>🟡 Remaining Target: € {remainingTarget.toFixed(2)}</p>
          </div>
        </div>
        <div className="right-section">
          <div className="expense-breakdown">
            <h3 className="expense-title">📊 Expense Breakdown</h3>
            {Object.keys(categoryData).length > 0 ? (
              <Pie
                data={{
                  labels: Object.keys(categoryData),
                  datasets: [
                    {
                      data: Object.values(categoryData),
                      backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4CAF50", "#FFA07A"],
                      hoverBackgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4CAF50", "#FFA07A"],
                    },
                  ],
                }}
              />
            ) : (
              <p>Loading chart...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;







  






  