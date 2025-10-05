// Frontend/src/components/BudgetDisplay.jsx
export const formatBudget = (budgetInPaise) => {
    const lakhs = budgetInPaise / 100000;
    return `₹${lakhs.toLocaleString('en-IN', { maximumFractionDigits: 2 })} Lakhs`;
};