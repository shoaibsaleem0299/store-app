export function formatCurrency(amount: number, currency = "PKR") {
  return new Intl.NumberFormat("en-PK", { style: "currency", currency }).format(amount);
}
