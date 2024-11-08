// src/__tests__/JsCarbon.test.ts

import { JsCarbon } from "../index";

describe("JsCarbon", () => {
  let jsCarbon: JsCarbon;

  beforeEach(() => {
    jsCarbon = new JsCarbon();
  });

  test("now() should return a JsCarbon instance with the current date", () => {
    const now = JsCarbon.now().toDate();
    expect(now).toBeInstanceOf(Date);
  });

  test("addDays() should correctly add days to the date in JsCarbon instance", () => {
    const initialDate = new Date("2023-01-01");
    const daysToAdd = 5;

    // 初期日付でインスタンスを生成
    const jsCarbon = new JsCarbon(initialDate);

    // addDays を呼び出し、結果としてのインスタンスから日付を取得
    const result = jsCarbon.addDays(daysToAdd).toDate();

    // 期待する日付を計算
    const expectedDate = new Date(initialDate);
    expectedDate.setDate(expectedDate.getDate() + daysToAdd);

    expect(result.toDateString()).toBe(expectedDate.toDateString());
  });

  test("toDate() should return the correct Date object", () => {
    const initialDate = new Date("2023-01-01");
    jsCarbon = new JsCarbon(initialDate);

    const result = jsCarbon.toDate();
    expect(result).toBeInstanceOf(Date);
    expect(result.toDateString()).toBe(initialDate.toDateString());
  });

  test("toString() should return the correct string representation of the date", () => {
    const initialDate = new Date("2023-01-01");
    jsCarbon = new JsCarbon(initialDate);

    const result = jsCarbon.toString();
    expect(result).toBe(initialDate.toDateString());
  });
});
