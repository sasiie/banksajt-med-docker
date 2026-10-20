import { describe, it, expect } from "vitest";
import { validateAmount } from "./validateAmount.js";

describe("validateAmount", () => {
  it("godkänner positiva heltal", () => {
    expect(validateAmount(200)).toBe(true);
    expect(validateAmount(1)).toBe(true);
  });

  it("nekar beloppet 0", () => {
    expect(validateAmount(0)).toBe(false);
  });

  it("nekar negativa belopp", () => {
    expect(validateAmount(-100)).toBe(false);
  });

  it("nekar decimalbelopp", () => {
    expect(validateAmount(10.5)).toBe(false);
  });

  it("nekar NaN", () => {
    expect(validateAmount(NaN)).toBe(false);
  });

  it("nekar Infinity", () => {
    expect(validateAmount(Infinity)).toBe(false);
  });

  it("nekar tomma och ogiltiga värden", () => {
    expect(validateAmount("")).toBe(false);
    expect(validateAmount(null)).toBe(false);
    expect(validateAmount(undefined)).toBe(false);
    expect(validateAmount(true)).toBe(false);
  });
});
