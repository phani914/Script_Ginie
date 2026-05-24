export const creditPacks = [
  {
    id: "starter",
    name: "Starter",
    amount: 49,
    credits: 20
  },
  {
    id: "creator",
    name: "Creator",
    amount: 99,
    credits: 60
  },
  {
    id: "pro",
    name: "Pro",
    amount: 199,
    credits: 150
  }
] as const;

export type CreditPackId = (typeof creditPacks)[number]["id"];

export function getCreditPack(id: string) {
  return creditPacks.find((pack) => pack.id === id);
}
