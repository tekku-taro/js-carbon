// src/__tests__/JsCarbon.test.ts

import { JsCarbon } from "../js-carbon";
import { JsCarbonInterval } from "../js-carbon-interval";

describe("JsCarbon", () => {
  let jsCarbon: JsCarbon;

  beforeEach(() => {
    // 2024-01-01 12:00:00 で固定したテスト用インスタンス
    jsCarbon = new JsCarbon(new Date(2024, 0, 1, 12, 0, 0));
  });

  // コンストラクタとスタティックメソッドのテスト
  describe("constructor and static methods", () => {
    test("constructor creates instance with default values", () => {
      const instance = new JsCarbon();
      expect(instance).toBeInstanceOf(JsCarbon);
      expect(instance.getLocale()).toBe("en");
      expect(instance.timezone()).toBe(
        Intl.DateTimeFormat().resolvedOptions().timeZone
      );
    });

    test("constructor creates instance with custom timezone and locale", () => {
      const instance = new JsCarbon(new Date(), "Asia/Tokyo", "ja");
      expect(instance.timezone()).toBe("Asia/Tokyo");
      expect(instance.getLocale()).toBe("ja");
    });

    test("now() creates instance with current time", () => {
      const instance = JsCarbon.now();
      const now = new Date();
      expect(instance.toJsDate().getTime()).toBeCloseTo(now.getTime(), -2);
    });

    test("parse() creates instance from date string", () => {
      const instance = JsCarbon.parse("2024-01-01T12:00:00Z");
      expect(instance.toISOString()).toBe("2024-01-01T12:00:00.000Z");
    });
  });

  // 日付計算関連のテスト
  describe("date manipulation", () => {
    test("addDays adds specified number of days", () => {
      const newDate = jsCarbon.clone().addDays(5);
      expect(newDate.day()).toBe(6);
    });

    test("subDays subtracts specified number of days", () => {
      const newDate = jsCarbon.clone().subDays(2);
      expect(newDate.day()).toBe(30);
    });

    test("addMonths adds specified number of months", () => {
      const newDate = jsCarbon.clone().addMonths(1);
      expect(newDate.month()).toBe(2);
    });

    test("subMonths subtracts specified number of months", () => {
      const newDate = jsCarbon.clone().subMonths(1);
      expect(newDate.month()).toBe(12);
    });

    test("addYears adds specified number of years", () => {
      const newDate = jsCarbon.clone().addYears(1);
      expect(newDate.year()).toBe(2025);
    });

    test("subYears subtracts specified number of years", () => {
      const newDate = jsCarbon.clone().subYears(1);
      expect(newDate.year()).toBe(2023);
    });
  });

  // 日付比較のテスト
  describe("date comparison", () => {
    test("isBefore correctly determines if date is before another date", () => {
      const earlierDate = JsCarbon.create(2023, 12, 31);
      expect(earlierDate.isBefore(jsCarbon)).toBe(true);
    });

    test("isAfter correctly determines if date is after another date", () => {
      const laterDate = JsCarbon.create(2024, 1, 2);
      expect(laterDate.isAfter(jsCarbon)).toBe(true);
    });

    test("isToday returns true if date is today", () => {
      const today = JsCarbon.now();
      expect(today.isToday()).toBe(true);
    });
  });

  // ロケール関連のテスト
  describe("locale operations", () => {
    test("setDefaultLocale sets default locale", () => {
      JsCarbon.setDefaultLocale("ja");
      const instance = new JsCarbon();
      expect(instance.getLocale()).toBe("ja");
    });

    test("setLocale changes instance locale", () => {
      const instance = jsCarbon.setLocale("ja");
      expect(instance.getLocale()).toBe("ja");
      expect(instance).toBe(jsCarbon); // メソッドチェーン確認
    });

    test("throws error for invalid locale", () => {
      expect(() => {
        jsCarbon.setLocale("invalid-locale" as any);
      }).toThrow("Unsupported locale");
    });
  });

  // タイムゾーン関連のテスト
  describe("timezone operations", () => {
    test("setDefaultTimezone sets default timezone", () => {
      JsCarbon.setDefaultTimezone("Asia/Tokyo");
      const instance = new JsCarbon();
      expect(instance.timezone()).toBe("Asia/Tokyo");
    });
    test("throws error for invalid timezone", () => {
      expect(() => {
        jsCarbon.setTimezone("invalid-timezone" as any);
      }).toThrow("Unsupported timezone");
      expect(() => {
        JsCarbon.setDefaultTimezone("invalid-timezone" as any);
      }).toThrow("Unsupported timezone");
    });
    test("setTimezone changes timezone", () => {
      const instance = jsCarbon.setTimezone("Asia/Tokyo");
      expect(instance.timezone()).toBe("Asia/Tokyo");
      expect(instance).toBe(jsCarbon); // メソッドチェーン確認
    });

    test("timezoneOffset returns correct offset", () => {
      const tokyoInstance = jsCarbon.setTimezone("Asia/Tokyo");
      expect(tokyoInstance.timezoneOffset()).toMatch(/[+-]\d{2}:\d{2}/);
    });

    test("inTimezone creates new instance with different timezone", () => {
      const tokyoTime = jsCarbon.inTimezone("Asia/Tokyo");
      expect(tokyoTime.timezone()).toBe("Asia/Tokyo");
      expect(tokyoTime).not.toBe(jsCarbon); // 新しいインスタンスであることを確認
    });

    test("isDST returns boolean", () => {
      const result = jsCarbon.isDST();
      expect(typeof result).toBe("boolean");
    });

    test("utc converts to UTC timezone", () => {
      const utcTime = jsCarbon.utc();
      expect(utcTime.timezone()).toBe("UTC");
    });

    test("toTimezoneString formats date for specified timezone", () => {
      const formatted = jsCarbon.toTimezoneString("Asia/Tokyo");
      expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    test("diffInHoursWithTimezone calculates hour difference", () => {
      const diff = jsCarbon.diffInHoursWithTimezone("Asia/Tokyo");
      expect(typeof diff).toBe("number");
    });

    test("getTimezoneAbbreviation returns timezone abbreviation", () => {
      const abbr = jsCarbon.getTimezoneAbbreviation();
      expect(typeof abbr).toBe("string");
      expect(abbr.length).toBeGreaterThan(0);
    });
  });

  // フォーマット関連のテスト
  describe("formatting operations", () => {
    test("toLocaleDateString formats date according to locale", () => {
      const formatted = jsCarbon.setLocale("ja").toLocaleDateString();
      expect(formatted).toMatch(/\d{4}\/\d{1,2}\/\d{1,2}/);
    });

    test("toLocaleTimeString formats time according to locale", () => {
      const formatted = jsCarbon.setLocale("ja").toLocaleTimeString();
      expect(formatted).toMatch(/\d{1,2}:\d{2}:\d{2}/);
    });

    test("toLocaleString formats date and time according to locale", () => {
      const formatted = jsCarbon.setLocale("ja").toLocaleString();
      expect(formatted).toMatch(/\d{4}\/\d{1,2}\/\d{1,2}/);
      expect(formatted).toMatch(/\d{1,2}:\d{2}:\d{2}/);
    });

    test("localizedFormat formats date string according to locale-specific format", () => {
      const formatted = jsCarbon
        .setLocale("ja")
        .localizedFormat("YYYY年MM月DD日 dddd");
      expect(formatted).toMatch(/\d{4}年\d{2}月\d{2}日 .+/);
    });

    test("monthName returns localized month name", () => {
      const month = jsCarbon.setLocale("en").monthName();
      expect(month).toBe("January");
    });

    test("shortMonthName returns localized abbreviated month name", () => {
      const month = jsCarbon.setLocale("en").shortMonthName();
      expect(month).toBe("Jan");
    });

    test("dayName returns localized day name", () => {
      const day = jsCarbon.setLocale("en").dayName();
      expect(day).toBe("Monday");
    });

    test("shortDayName returns localized abbreviated day name", () => {
      const day = jsCarbon.setLocale("en").shortDayName();
      expect(day).toBe("Mon");
    });
  });

  // 相対時間のテスト
  describe("relative time operations", () => {
    test("diffForHumans returns relative time string", () => {
      const futureDate = new JsCarbon(new Date(Date.now() + 3600000)); // 1時間後
      const relativeTime = futureDate.setLocale("en").diffForHumans();
      expect(relativeTime).toMatch(/in (1|an) hour/);
    });

    test("diffForHumans handles past times", () => {
      const pastDate = new JsCarbon(new Date(Date.now() - 3600000)); // 1時間前
      const relativeTime = pastDate.setLocale("en").diffForHumans();
      expect(relativeTime).toMatch(/(1|an) hour ago/);
    });
  });

  // その他のユーティリティメソッドのテスト
  describe("utility methods", () => {
    test("clone creates independent copy", () => {
      const clone = jsCarbon.clone();
      expect(clone).not.toBe(jsCarbon);
      expect(clone.toISOString()).toBe(jsCarbon.toISOString());
      expect(clone.timezone()).toBe(jsCarbon.timezone());
      expect(clone.getLocale()).toBe(jsCarbon.getLocale());
    });

    test("isSameTimezone compares timezones", () => {
      const tokyo1 = new JsCarbon(new Date(), "Asia/Tokyo");
      const tokyo2 = new JsCarbon(new Date(), "Asia/Tokyo");
      const ny = new JsCarbon(new Date(), "America/New_York");

      expect(tokyo1.isSameTimezone(tokyo2)).toBe(true);
      expect(tokyo1.isSameTimezone(ny)).toBe(false);
    });

    test("toISOStringWithTimezone includes timezone offset", () => {
      const isoString = jsCarbon.toISOStringWithTimezone();
      expect(isoString).toMatch(
        /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}[+-]\d{2}:\d{2}/
      );
    });
  });

  test("toJsDate() should return the correct Date object", () => {
    const initialDate = new Date("2023-01-01");
    jsCarbon = new JsCarbon(initialDate);

    const result = jsCarbon.toJsDate();
    expect(result).toBeInstanceOf(Date);
    expect(result.toDateString()).toBe(initialDate.toDateString());
  });

  describe("add() method", () => {
    test("adds interval correctly", () => {
      const interval = new JsCarbonInterval(1, 2, 3, 4, 5, 6);
      // 2024-01-01 12:00:00 で固定
      const result = jsCarbon.add(interval);

      expect(result.year()).toBe(2025);
      expect(result.month()).toBe(3); // March (1 + 2 months)
      expect(result.day()).toBe(4); // 1 + 3 days
      expect(result.toJsDate().getHours()).toBe(16); // 12 + 4 hours
      expect(result.toJsDate().getMinutes()).toBe(5); // 0 + 5 minutes
      expect(result.toJsDate().getSeconds()).toBe(6); // 0 + 6 seconds
    });
  });

  describe("sub() method", () => {
    test("subtracts interval correctly", () => {
      const interval = new JsCarbonInterval(1, 2, 3, 4, 5, 6);
      // jsCarbon 2024-01-01 12:00:00 で固定
      const result = jsCarbon.sub(interval);

      expect(result.year()).toBe(2022);
      expect(result.month()).toBe(10); // November (1 - 2 months)
      expect(result.day()).toBe(29); // Accounting for month end
      expect(result.toJsDate().getHours()).toBe(7); // 12 - 4 hours
      expect(result.toJsDate().getMinutes()).toBe(54); // 0 - 5 minutes
      expect(result.toJsDate().getSeconds()).toBe(54); // 0 - 6 seconds
    });
  });

  describe("diff() method", () => {
    test("calculates difference correctly", () => {
      const date1 = new JsCarbon(new Date(2024, 0, 1));
      const date2 = new JsCarbon(new Date(2025, 2, 4, 4, 5, 6));

      const interval = date1.diff(date2);
      expect(interval.years).toBe(1);
      expect(interval.months).toBe(2);
      expect(interval.days).toBe(3);
      expect(interval.hours).toBe(4);
      expect(interval.minutes).toBe(5);
      expect(interval.seconds).toBe(6);
    });

    test("should handle midnight correctly", () => {
      const midnight = new Date("2024-01-01T00:00:00Z");
      const jsCarbon = new JsCarbon(midnight, "UTC");
      const timezoneDate = jsCarbon["getTimezoneDate"]();

      expect(timezoneDate.getUTCHours()).toBe(0);
      expect(timezoneDate.getUTCDate()).toBe(1); // 日付が変わっていないことを確認
    });

    test("calculates absolute difference correctly", () => {
      const date1 = new JsCarbon(new Date(2025, 2, 4, 4, 5, 6));
      const date2 = new JsCarbon(new Date(2024, 0, 1));

      const interval = date1.diff(date2, true);
      expect(interval.years).toBe(1);
      expect(interval.months).toBe(2);
      expect(interval.days).toBe(3);
      expect(interval.hours).toBe(4);
      expect(interval.minutes).toBe(5);
      expect(interval.seconds).toBe(6);
    });
  });
});
