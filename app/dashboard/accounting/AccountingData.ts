export const monthlyIncomeData = [
  { month: "Jan", income: 4850, expenses: 1240, net: 3610 },
  { month: "Feb", income: 4850, expenses: 980, net: 3870 },
  { month: "Mar", income: 5200, expenses: 1560, net: 3640 },
  { month: "Apr", income: 5200, expenses: 1100, net: 4100 },
  { month: "May", income: 5200, expenses: 1350, net: 3850 },
  { month: "Jun", income: 5600, expenses: 1890, net: 3710 },
  { month: "Jul", income: 5600, expenses: 1020, net: 4580 },
  { month: "Aug", income: 5600, expenses: 1450, net: 4150 },
  { month: "Sep", income: 5600, expenses: 1680, net: 3920 },
  { month: "Oct", income: 5600, expenses: 920, net: 4680 },
  { month: "Nov", income: 5600, expenses: 1340, net: 4260 },
  { month: "Dec", income: 5600, expenses: 2100, net: 3500 },
];

export const propertyIncomeData = [
  { property: "12 Rose Avenue", income: 16800, expenses: 4200, net: 12600, occupancy: 100 },
  { property: "45 Baker Street", income: 15600, expenses: 3800, net: 11800, occupancy: 100 },
  { property: "Flat 4B Oak Street", income: 14400, expenses: 5100, net: 9300, occupancy: 92 },
  { property: "8 The Crescent", income: 19200, expenses: 4600, net: 14600, occupancy: 100 },
  { property: "Unit 3 Riverside", income: 13200, expenses: 2900, net: 10300, occupancy: 88 },
  { property: "21 High Street", income: 10800, expenses: 2100, net: 8700, occupancy: 100 },
  { property: "Flat 7 Park View", income: 7200, expenses: 1800, net: 5400, occupancy: 100 },
  { property: "15 Elm Road", income: 9600, expenses: 3200, net: 6400, occupancy: 75 },
];

export const expenseBreakdown = [
  { category: "Maintenance & Repairs", amount: 8450, percent: 28 },
  { category: "Insurance", amount: 4200, percent: 14 },
  { category: "Property Management", amount: 3600, percent: 12 },
  { category: "Utilities", amount: 3100, percent: 10 },
  { category: "Compliance & Safety", amount: 2400, percent: 8 },
  { category: "Marketing & Letting", amount: 1800, percent: 6 },
  { category: "Council Tax (void)", amount: 1500, percent: 5 },
  { category: "Legal & Professional", amount: 1200, percent: 4 },
  { category: "Cleaning & Gardening", amount: 2100, percent: 7 },
  { category: "Miscellaneous", amount: 1800, percent: 6 },
];

export const rentalIncomeRows = [
  { id: 1, property: "12 Rose Avenue", tenant: "Sarah Jenkins", rent: 1400, received: 1400, date: "01 Jun 2026", method: "Direct Debit", status: "Paid" },
  { id: 2, property: "45 Baker Street", tenant: "James Miller", rent: 1300, received: 1300, date: "01 Jun 2026", method: "Bank Transfer", status: "Paid" },
  { id: 3, property: "Flat 4B Oak Street", tenant: "Emily Chen", rent: 1200, received: 1200, date: "03 Jun 2026", method: "Standing Order", status: "Paid" },
  { id: 4, property: "8 The Crescent", tenant: "David Patel", rent: 1600, received: 1600, date: "01 Jun 2026", method: "Direct Debit", status: "Paid" },
  { id: 5, property: "Unit 3 Riverside", tenant: "Lisa Brown", rent: 1100, received: 900, date: "05 Jun 2026", method: "Bank Transfer", status: "Partial" },
  { id: 6, property: "21 High Street", tenant: "Michael Fox", rent: 900, received: 900, date: "01 Jun 2026", method: "Standing Order", status: "Paid" },
  { id: 7, property: "Flat 7 Park View", tenant: "Rachel Adams", rent: 600, received: 600, date: "02 Jun 2026", method: "Direct Debit", status: "Paid" },
  { id: 8, property: "15 Elm Road", tenant: "Tom Wilson", rent: 800, received: 0, date: "—", method: "—", status: "Overdue" },
];

export const maintenanceExpenditureRows = [
  { id: 1, property: "12 Rose Avenue", description: "Boiler service & repair", contractor: "GreenPlumb Ltd", category: "Heating", amount: 340, date: "15 May 2026", status: "Paid" },
  { id: 2, property: "45 Baker Street", description: "Electrical safety certificate", contractor: "SparkPro Electrics", category: "Electrical", amount: 180, date: "12 May 2026", status: "Paid" },
  { id: 3, property: "Flat 4B Oak Street", description: "Kitchen tap replacement", contractor: "GreenPlumb Ltd", category: "Plumbing", amount: 95, date: "18 May 2026", status: "Paid" },
  { id: 4, property: "8 The Crescent", description: "Roof gutter repair", contractor: "TopRoof Services", category: "Roofing", amount: 520, date: "10 May 2026", status: "Paid" },
  { id: 5, property: "Unit 3 Riverside", description: "Window lock replacement", contractor: "SecureFix", category: "Security", amount: 140, date: "22 May 2026", status: "Paid" },
  { id: 6, property: "21 High Street", description: "Garden fence repair", contractor: "GreenGardens", category: "General", amount: 280, date: "08 May 2026", status: "Paid" },
  { id: 7, property: "Flat 7 Park View", description: "Annual gas safety check", contractor: "GasSafe Pro", category: "Heating", amount: 85, date: "05 May 2026", status: "Paid" },
  { id: 8, property: "15 Elm Road", description: "Damp treatment & plastering", contractor: "DryFix Specialists", category: "General", amount: 1200, date: "01 Jun 2026", status: "Pending" },
  { id: 9, property: "12 Rose Avenue", description: "Appliance repair (fridge)", contractor: "FixIt Appliances", category: "Appliance", amount: 165, date: "28 May 2026", status: "Paid" },
  { id: 10, property: "45 Baker Street", description: "Exterior painting", contractor: "PaintPro", category: "General", amount: 650, date: "20 May 2026", status: "Paid" },
];

export const annualStatements = [
  { id: "stmt-2026", year: "2026", period: "01 Jan - 31 Dec", totalIncome: 67200, totalExpenses: 30170, netProfit: 37030, taxEstimate: 7406, status: "In Progress" },
  { id: "stmt-2025", year: "2025", period: "01 Jan - 31 Dec", totalIncome: 62400, totalExpenses: 28450, netProfit: 33950, taxEstimate: 6790, status: "Finalised" },
  { id: "stmt-2024", year: "2024", period: "01 Jan - 31 Dec", totalIncome: 58800, totalExpenses: 27100, netProfit: 31700, taxEstimate: 6340, status: "Finalised" },
  { id: "stmt-2023", year: "2023", period: "01 Jan - 31 Dec", totalIncome: 54000, totalExpenses: 24800, netProfit: 29200, taxEstimate: 5840, status: "Finalised" },
];

export const taxSummary = {
  taxYear: "2025/26",
  totalIncome: 67200,
  allowableExpenses: 30170,
  taxableProfit: 37030,
  personalAllowance: 12570,
  taxableAmount: 24460,
  basicRate: 0.20,
  taxLiability: 4892,
  paymentsOnAccount: 2446,
  balancingPayment: 2446,
  dueDate: "31 Jan 2027",
  previousPayments: 2200,
  amountOutstanding: 2692,
  capitalAllowances: 1200,
  mortgageInterest: 3200,
  mortgageTaxRelief: 640,
  finalTaxDue: 4252,
};

export const quarterlyBreakdown = [
  { quarter: "Q1 2026", income: 15250, expenses: 3780, profit: 11470, tax: 2294 },
  { quarter: "Q2 2026", income: 16000, expenses: 4340, profit: 11660, tax: 2332 },
  { quarter: "Q3 2026", income: 16800, expenses: 4150, profit: 12650, tax: 2530 },
  { quarter: "Q4 2026", income: 19150, expenses: 17900, profit: 1250, tax: 250 },
];

export const profitLossRows = [
  { category: "Rental Income", amount: 67200, type: "income" },
  { category: "Late Payment Fees", amount: 120, type: "income" },
  { category: "Deposit Retentions", amount: 480, type: "income" },
  { category: "Total Income", amount: 67800, type: "income_total" },
  { category: "Maintenance & Repairs", amount: 8450, type: "expense" },
  { category: "Insurance", amount: 4200, type: "expense" },
  { category: "Property Management", amount: 3600, type: "expense" },
  { category: "Utilities", amount: 3100, type: "expense" },
  { category: "Compliance & Safety", amount: 2400, type: "expense" },
  { category: "Marketing & Letting", amount: 1800, type: "expense" },
  { category: "Council Tax (void)", amount: 1500, type: "expense" },
  { category: "Legal & Professional", amount: 1200, type: "expense" },
  { category: "Cleaning & Gardening", amount: 2100, type: "expense" },
  { category: "Miscellaneous", amount: 1800, type: "expense" },
  { category: "Mortgage Interest", amount: 3200, type: "expense" },
  { category: "Total Expenses", amount: 30170, type: "expense_total" },
  { category: "Net Profit", amount: 37630, type: "net" },
  { category: "Tax Estimate", amount: 7406, type: "tax" },
  { category: "Profit After Tax", amount: 30224, type: "final" },
];