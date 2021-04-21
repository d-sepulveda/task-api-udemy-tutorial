const { CalculateTips } = require("../src/utils/math");

test("Mi primera prueba correcta con jest", () => {});

test("CalculateTips function test", () => {
  const total = CalculateTips(10, 0.30)
  expect(total).toBe(13)
  const total2 = CalculateTips(10, 0.40)
  expect(total2).toBe(14.0)
});
