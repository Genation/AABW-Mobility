import { assertEquals } from "@std/assert";
import {
  generateSuggestions,
  generateBrandSuggestions,
  generateNavigationSuggestions,
  generateAddressSuggestion,
} from "../../builder/templates.ts";

Deno.test("templates: cafe + wifi", () => {
  const results = generateSuggestions("cafe", "wifi");
  assertEquals(results.includes("Quán cà phê có Wi-Fi"), true);
  assertEquals(results.includes("Cà phê có Wi-Fi"), true);
  assertEquals(results.includes("Quán cà phê gần đây"), true);
  assertEquals(results.includes("Cà phê gần đây"), true);
  assertEquals(results.length >= 4, true);
});

Deno.test("templates: quan an + khu", () => {
  const results = generateSuggestions("quan an", "khu");
  assertEquals(results, [
    "Quán ăn mở cửa khuya",
    "Nhà hàng mở cửa khuya",
    "Quán ăn gần đây",
    "Nhà hàng gần đây",
  ]);
});

Deno.test("templates: cafe + song ao", () => {
  const results = generateSuggestions("cafe", "song ao");
  assertEquals(results[0], "Quán cà phê đẹp để check-in");
  assertEquals(results[1], "Cà phê đẹp để check-in");
  assertEquals(results[2], "Quán cà phê gần đây");
  assertEquals(results[3], "Cà phê gần đây");
});

Deno.test("templates: an + location ha noi", () => {
  const results = generateSuggestions("an", undefined, "ha noi");
  assertEquals(results, [
    "Quán ăn gần đây",
    "Quán ăn ha noi",
    "ha noi Quán ăn",
  ]);
});

Deno.test("templates: unknown category used as-is", () => {
  const results = generateSuggestions("unknown-cat", "wifi");
  assertEquals(results.includes("unknown-cat có Wi-Fi"), true);
  assertEquals(results.includes("unknown-cat gần đây"), true);
  assertEquals(results.length >= 2, true);
});

Deno.test("templates: unknown attribute used as-is", () => {
  const results = generateSuggestions("cafe", "unknown-attr");
  assertEquals(results, [
    "Quán cà phê unknown-attr",
    "Cà phê unknown-attr",
    "Quán cà phê gần đây",
    "Cà phê gần đây",
  ]);
});

Deno.test("templates: both undefined returns empty array", () => {
  const results = generateSuggestions();
  assertEquals(results, []);
});

Deno.test("templates: only category returns category + gan day", () => {
  const results = generateSuggestions("cafe");
  assertEquals(results, [
    "Quán cà phê gần đây",
    "Cà phê gần đây",
  ]);
});

Deno.test("templates: brand Phúc Long", () => {
  const results = generateBrandSuggestions("Phúc Long");
  assertEquals(results, [
    "Phúc Long gần đây",
    "Phúc Long gần nhất",
    "Phúc Long",
  ]);
});

Deno.test("templates: navigation target sân bay Nội Bài", () => {
  const results = generateNavigationSuggestions("sân bay Nội Bài");
  assertEquals(results, [
    "Chỉ đường đến sân bay Nội Bài",
    "Đường đến sân bay Nội Bài",
  ]);
});

Deno.test("templates: address suggestion formats correctly", () => {
  const result = generateAddressSuggestion("Nguyễn Huệ", "Quận 1", "TP. Hồ Chí Minh");
  assertEquals(result, "Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh");
});
