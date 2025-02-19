import React, { useMemo } from "react";
import "../styles/Dashboard.css";

const BudgetOverview = ({ income, expenses, savings }) => {
  const totalIncome = useMemo(() => income.reduce((acc, entry) => acc + Number(entry.amount || 0), 0), [income]);
  const totalExpenses = useMemo(() => expenses.reduce((acc, entry) => acc + Number(entry.amount || 0), 0), [expenses]);
  const remainingBudget = totalIncome - totalExpenses;
  const totalSavings = useMemo(() => savings.reduce((acc, entry) => acc + Number(entry.currentAmount || 0), 0), [savings]);

  return (
    <div className="budget-overview">
      <h2>📊 Budget Overview</h2>
      <div className="overview-box">
        <p><strong>💰 Total Income:</strong> ${totalIncome.toFixed(2)}</p>
        <p><strong>💸 Total Expenses:</strong> ${totalExpenses.toFixed(2)}</p>
        <p><strong>🟡 Remaining Budget:</strong> ${remainingBudget.toFixed(2)}</p>
      </div>
      <h2>🏦 Savings Overview</h2>
      <div className="savings-overview-box">
        <p><strong>👛 Total Savings:</strong> ${totalSavings.toFixed(2)}</p>
        
      </div>
    </div>
  );
};

export default BudgetOverview;
