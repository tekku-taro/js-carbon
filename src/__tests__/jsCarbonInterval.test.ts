import { JsCarbon } from "../js-carbon";
import { JsCarbonInterval } from "../js-carbon-interval";

describe("JsCarbonInterval", () => {
  describe("Constructor and Factory Methods", () => {
    test("constructor creates instance with correct values", () => {
      const interval = new JsCarbonInterval(1, 2, 3, 4, 5, 6, 7);
      expect(interval.years).toBe(1);
      expect(interval.months).toBe(2);
      expect(interval.days).toBe(3);
      expect(interval.hours).toBe(4);
      expect(interval.minutes).toBe(5);
      expect(interval.seconds).toBe(6);
      expect(interval.milliseconds).toBe(7);
    });

    test("create() factory method creates correct instance", () => {
      const interval = JsCarbonInterval.create(1, 2, 3, 4, 5, 6, 7);
      expect(interval.years).toBe(1);
      expect(interval.months).toBe(2);
      expect(interval.days).toBe(3);
      expect(interval.hours).toBe(4);
      expect(interval.minutes).toBe(5);
      expect(interval.seconds).toBe(6);
      expect(interval.milliseconds).toBe(7);
    });

    test("convenience factory methods create correct instances", () => {
      expect(JsCarbonInterval.years(2).years).toBe(2);
      expect(JsCarbonInterval.months(3).months).toBe(3);
      expect(JsCarbonInterval.days(4).days).toBe(4);
      expect(JsCarbonInterval.hours(5).hours).toBe(5);
      expect(JsCarbonInterval.minutes(6).minutes).toBe(6);
      expect(JsCarbonInterval.seconds(7).seconds).toBe(7);
    });
  });

  describe("Add Methods", () => {
    test("addYears() adds years correctly", () => {
      const interval = new JsCarbonInterval(1);
      expect(interval.addYears(2).years).toBe(3);
    });

    test("addMonths() adds months correctly", () => {
      const interval = new JsCarbonInterval(0, 1);
      expect(interval.addMonths(2).months).toBe(3);
    });

    test("addDays() adds days correctly", () => {
      const interval = new JsCarbonInterval(0, 0, 1);
      expect(interval.addDays(2).days).toBe(3);
    });

    test("addHours() adds hours correctly", () => {
      const interval = new JsCarbonInterval(0, 0, 0, 1);
      expect(interval.addHours(2).hours).toBe(3);
    });

    test("addMinutes() adds minutes correctly", () => {
      const interval = new JsCarbonInterval(0, 0, 0, 0, 1);
      expect(interval.addMinutes(2).minutes).toBe(3);
    });

    test("addSeconds() adds seconds correctly", () => {
      const interval = new JsCarbonInterval(0, 0, 0, 0, 0, 1);
      expect(interval.addSeconds(2).seconds).toBe(3);
    });
  });

  describe("Arithmetic Operations", () => {
    test("plus() adds intervals correctly", () => {
      const interval1 = new JsCarbonInterval(1, 2, 3, 4, 5, 6);
      const interval2 = new JsCarbonInterval(1, 2, 3, 4, 5, 6);
      const result = interval1.plus(interval2);

      expect(result.years).toBe(2);
      expect(result.months).toBe(4);
      expect(result.days).toBe(6);
      expect(result.hours).toBe(8);
      expect(result.minutes).toBe(10);
      expect(result.seconds).toBe(12);
    });

    test("minus() subtracts intervals correctly", () => {
      const interval1 = new JsCarbonInterval(2, 4, 6, 8, 10, 12);
      const interval2 = new JsCarbonInterval(1, 2, 3, 4, 5, 6);
      const result = interval1.minus(interval2);

      expect(result.years).toBe(1);
      expect(result.months).toBe(2);
      expect(result.days).toBe(3);
      expect(result.hours).toBe(4);
      expect(result.minutes).toBe(5);
      expect(result.seconds).toBe(6);
    });

    test("multiply() multiplies interval correctly", () => {
      const interval = new JsCarbonInterval(1, 2, 3, 4, 5, 6);
      const result = interval.multiply(2);

      expect(result.years).toBe(2);
      expect(result.months).toBe(4);
      expect(result.days).toBe(6);
      expect(result.hours).toBe(8);
      expect(result.minutes).toBe(10);
      expect(result.seconds).toBe(12);
    });

    test("divide() divides interval correctly", () => {
      const interval = new JsCarbonInterval(2, 4, 6, 8, 10, 12);
      const result = interval.divide(2);

      expect(result.years).toBe(1);
      expect(result.months).toBe(2);
      expect(result.days).toBe(3);
      expect(result.hours).toBe(4);
      expect(result.minutes).toBe(5);
      expect(result.seconds).toBe(6);
    });
  });

  describe("Comparison Methods", () => {
    test("compareTo() compares intervals correctly", () => {
      const interval1 = new JsCarbonInterval(1, 0, 0);
      const interval2 = new JsCarbonInterval(2, 0, 0);
      const interval3 = new JsCarbonInterval(1, 0, 0);

      expect(interval1.compareTo(interval2)).toBeLessThan(0);
      expect(interval2.compareTo(interval1)).toBeGreaterThan(0);
      expect(interval1.compareTo(interval3)).toBe(0);
    });

    test("isGreaterThan() compares correctly", () => {
      const interval1 = new JsCarbonInterval(2, 0, 0);
      const interval2 = new JsCarbonInterval(1, 0, 0);

      expect(interval1.isGreaterThan(interval2)).toBe(true);
      expect(interval2.isGreaterThan(interval1)).toBe(false);
    });

    test("isLessThan() compares correctly", () => {
      const interval1 = new JsCarbonInterval(1, 0, 0);
      const interval2 = new JsCarbonInterval(2, 0, 0);

      expect(interval1.isLessThan(interval2)).toBe(true);
      expect(interval2.isLessThan(interval1)).toBe(false);
    });

    test("equals() compares correctly", () => {
      const interval1 = new JsCarbonInterval(1, 0, 0);
      const interval2 = new JsCarbonInterval(1, 0, 0);
      const interval3 = new JsCarbonInterval(2, 0, 0);

      expect(interval1.equals(interval2)).toBe(true);
      expect(interval1.equals(interval3)).toBe(false);
    });
  });

  describe("Formatting Methods", () => {
    test("format() with traditional syntax formats correctly", () => {
      const interval = new JsCarbonInterval(1, 2, 3, 4, 5, 6);
      expect(interval.format("traditional")).toBe("1y 2m 3d 4h 5m 6s");
    });

    test("format() with relative syntax formats correctly", () => {
      const interval = new JsCarbonInterval(1);
      expect(interval.format("relative")).toMatch(/in a year/);
    });

    test("forHumans() formats correctly", () => {
      const interval = new JsCarbonInterval(1);
      expect(interval.forHumans()).toMatch(/in a year/);
    });
  });

  describe("Total Calculations", () => {
    test("total calculations are correct", () => {
      const interval = new JsCarbonInterval(1, 2, 3, 4, 5, 6);

      expect(interval.totalMonths).toBe(14); // 1 year + 2 months
      expect(interval.totalDays).toBeGreaterThan(365); // Approximately 1 year + 2 months + 3 days
      expect(interval.totalHours).toBeGreaterThan(8760); // More than 1 year in hours
      expect(interval.totalMinutes).toBeGreaterThan(525600); // More than 1 year in minutes
      expect(interval.totalSeconds).toBeGreaterThan(31536000); // More than 1 year in seconds
    });
  });

  // Basic date difference calculations
  describe("fromDiff - Basic Date Differences", () => {
    test("should calculate interval between two dates in the same year", () => {
      const start = JsCarbon.create(2023, 1, 15);
      const end = JsCarbon.create(2023, 6, 20);

      const interval = JsCarbonInterval.fromDiff(start, end);

      expect(interval.years).toBe(0);
      expect(interval.months).toBe(5);
      expect(interval.days).toBe(5);
    });

    test("should calculate interval across year boundary", () => {
      const start = JsCarbon.create(2022, 12, 25);
      const end = JsCarbon.create(2023, 2, 10);

      const interval = JsCarbonInterval.fromDiff(start, end);

      expect(interval.years).toBe(0);
      expect(interval.months).toBe(1);
      expect(interval.days).toBe(16);
    });

    test("should handle full year difference", () => {
      const start = JsCarbon.create(2022, 1, 1);
      const end = JsCarbon.create(2023, 1, 1);

      const interval = JsCarbonInterval.fromDiff(start, end);

      expect(interval.years).toBe(1);
      expect(interval.months).toBe(0);
      expect(interval.days).toBe(0);
    });
  });

  // Reverse date order (negative intervals)
  describe("fromDiff - Reverse Date Order", () => {
    test("should handle end date before start date", () => {
      const start = JsCarbon.create(2023, 6, 20);
      const end = JsCarbon.create(2023, 1, 15);

      const interval = JsCarbonInterval.fromDiff(start, end);

      expect(interval.invert).toBe(true);
      expect(interval.years).toBe(0);
      expect(interval.months).toBe(-5);
      expect(interval.days).toBe(-5);
    });

    test("should handle multi-year reverse interval", () => {
      const start = JsCarbon.create(2024, 3, 15);
      const end = JsCarbon.create(2022, 6, 20);

      const interval = JsCarbonInterval.fromDiff(start, end);

      expect(interval.invert).toBe(true);
      expect(interval.years).toBe(-1);
      expect(interval.months).toBe(-8);
      expect(interval.days).toBe(-25);
    });
  });

  // Absolute interval calculations
  describe("fromDiff - Absolute Intervals", () => {
    test("should calculate absolute interval", () => {
      const start = JsCarbon.create(2023, 6, 20);
      const end = JsCarbon.create(2023, 1, 15);

      const interval = JsCarbonInterval.fromDiff(start, end, true);

      expect(interval.invert).toBe(true);
      expect(interval.years).toBe(0);
      expect(interval.months).toBe(5);
      expect(interval.days).toBe(5);
    });

    test("should handle absolute multi-year interval", () => {
      const start = JsCarbon.create(2021, 3, 15);
      const end = JsCarbon.create(2024, 6, 20);

      const interval = JsCarbonInterval.fromDiff(start, end, true);

      expect(interval.invert).toBe(false);
      expect(interval.years).toBe(3);
      expect(interval.months).toBe(3);
      expect(interval.days).toBe(5);
    });
  });

  // Edge cases
  describe("fromDiff - Edge Cases", () => {
    test("should handle same date", () => {
      const start = JsCarbon.create(2023, 1, 15);
      const end = JsCarbon.create(2023, 1, 15);

      const interval = JsCarbonInterval.fromDiff(start, end);

      expect(interval.years).toBe(0);
      expect(interval.months).toBe(0);
      expect(interval.days).toBe(0);
    });

    test("should handle leap year boundary", () => {
      const start = JsCarbon.create(2024, 2, 28);
      const end = JsCarbon.create(2024, 3, 1);

      const interval = JsCarbonInterval.fromDiff(start, end);

      expect(interval.years).toBe(0);
      expect(interval.months).toBe(0);
      expect(interval.days).toBe(2);
    });

    test("should handle complex month boundary", () => {
      const start = JsCarbon.create(2023, 1, 31);
      const end = JsCarbon.create(2023, 2, 28);

      const interval = JsCarbonInterval.fromDiff(start, end);

      expect(interval.years).toBe(0);
      expect(interval.months).toBe(0);
      expect(interval.days).toBe(28);
    });
  });
});
