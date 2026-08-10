export function generateSku(productName: string, options: Record<string, string>) {
  const base = productName.trim().toUpperCase().replace(/\s+/g, "-").slice(0, 15);
  const optionPart = Object.values(options).join("-").toUpperCase();
  return `${base}-${optionPart}`;
}
