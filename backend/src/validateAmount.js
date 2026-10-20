export function validateAmount(amount) {
  const value = Number(amount);

  return (
    amount !== null &&
    amount !== undefined &&
    amount !== "" &&
    typeof amount !== "boolean" &&
    Number.isSafeInteger(value) &&
    value > 0
  );
}
