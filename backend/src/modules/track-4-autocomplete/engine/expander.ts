import { normalize } from "../core/nlp.ts";

export const EN_VI_MAP: Record<string, string> = {
  "coffee": "cà phê",
  "hotel": "khách sạn",
  "near": "gần",
  "beach": "biển",
  "danang": "đà nẵng",
  "halal": "halal",
  "rooftop": "rooftop",
  "restaurant": "nhà hàng",
  "vegan": "chay",
  "atm": "ATM",
  "bar": "bar",
  "cinema": "rạp chiếu phim",
  "hospital": "bệnh viện",
  "pharmacy": "nhà thuốc",
  "mall": "trung tâm thương mại",
  "spa": "spa",
  "gym": "phòng gym",
};

export function translateToVI(input: string): string {
  const words = input.toLowerCase().split(/\s+/);
  return words.map((w) => EN_VI_MAP[w] || w).join(" ");
}

export { normalize };
