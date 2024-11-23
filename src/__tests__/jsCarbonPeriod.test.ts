import { JsCarbon } from "../js-carbon";
import { JsCarbonPeriod } from "../js-carbon-period";

describe("JsCarbonPeriod", () => {
  describe("constructor", () => {
    it("should create instance with default values", () => {
      const period = new JsCarbonPeriod();
      expect(period).toBeInstanceOf(JsCarbonPeriod);
    });

    it("should create instance with custom options", () => {
      const start = new JsCarbon("2024-01-01");
      const end = new JsCarbon("2024-01-31");
      const period = new JsCarbonPeriod({
        start,
        end,
        interval: "2 days",
      });

      const dates = period.toArray();
      expect(dates[0].toISOString().split("T")[0]).toBe("2024-01-01");
      expect(dates[1].toISOString().split("T")[0]).toBe("2024-01-03");
      expect(dates.length).toBe(16); // 31 days with 2-day interval
    });
  });

  describe("static factory methods", () => {
    it("should create period using create() with start and end", () => {
      const start = new JsCarbon("2024-01-01");
      const end = new JsCarbon("2024-01-05");
      const period = JsCarbonPeriod.create(start, end);

      const dates = period.toArray();
      expect(dates.length).toBe(5);
      expect(dates[0].toISOString().split("T")[0]).toBe("2024-01-01");
      expect(dates[4].toISOString().split("T")[0]).toBe("2024-01-05");
    });

    it("should create period using create() with start, interval, and end", () => {
      const start = new JsCarbon("2024-01-01");
      const end = new JsCarbon("2024-01-10");
      const period = JsCarbonPeriod.create(start, "2 days", end);

      const dates = period.toArray();
      expect(dates.length).toBe(5);
      expect(dates[0].toISOString().split("T")[0]).toBe("2024-01-01");
      expect(dates[1].toISOString().split("T")[0]).toBe("2024-01-03");
    });

    it("should create period using between()", () => {
      const period = JsCarbonPeriod.between("2024-01-01", "2024-01-05");
      expect(period.toArray().length).toBe(5);
    });

    it("should create period using since()", () => {
      const startDate = new JsCarbon("2024-01-01");
      const period = JsCarbonPeriod.since(startDate).until("2024-01-05");
      expect(period.toArray().length).toBe(5);
    });

    it("should create period using until()", () => {
      const endDate = new JsCarbon("2024-01-05");
      const period = JsCarbonPeriod.until(endDate);
      expect(period.last()?.toISOString().split("T")[0]).toBe("2024-01-05");
    });
  });

  describe("interval methods", () => {
    it("should create period with years interval", () => {
      const period = JsCarbonPeriod.since("2020-01-01")
        .until("2024-01-01")
        .years(1);
      const dates = period.toArray();
      expect(dates.length).toBe(5);
      expect(dates[1].toISOString().split("T")[0]).toBe("2021-01-01");
    });

    it("should create period with months interval", () => {
      const period = JsCarbonPeriod.since("2024-01-01")
        .until("2024-06-01")
        .months(2);
      const dates = period.toArray();
      expect(dates.length).toBe(3);
      expect(dates[1].toISOString().split("T")[0]).toBe("2024-03-01");
    });

    it("should create period with weeks interval", () => {
      const period = JsCarbonPeriod.since("2024-01-01")
        .until("2024-01-31")
        .weeks(1);
      const dates = period.toArray();
      expect(dates[1].toISOString().split("T")[0]).toBe("2024-01-08");
    });

    it("should create period with days interval", () => {
      const period = JsCarbonPeriod.since("2024-01-01")
        .until("2024-01-10")
        .days(3);
      const dates = period.toArray();
      expect(dates.length).toBe(4);
      expect(dates[1].toISOString().split("T")[0]).toBe("2024-01-04");
    });
  });

  describe("filter methods", () => {
    it("should filter dates using callback function", () => {
      const period = JsCarbonPeriod.since("2024-01-01")
        .until("2024-01-07")
        .filter((date) => date.isWeekday());

      const dates = period.toArray();
      expect(dates.length).toBe(5); // Excluding weekend days
    });

    it("should filter dates using method name string", () => {
      const period = JsCarbonPeriod.since("2024-01-01")
        .until("2024-01-07")
        .filter("isWeekday");

      const dates = period.toArray();
      expect(dates.length).toBe(5); // Excluding weekend days
    });

    it("should clear filters", () => {
      const period = JsCarbonPeriod.since("2024-01-01")
        .until("2024-01-07")
        .filter("isWeekday")
        .clearFilters();

      const dates = period.toArray();
      expect(dates.length).toBe(7); // All days included after clearing filters
    });
  });

  describe("utility methods", () => {
    it("should count dates in period", () => {
      const period = JsCarbonPeriod.since("2024-01-01").until("2024-01-05");
      expect(period.count()).toBe(5);
    });

    it("should get first date", () => {
      const period = JsCarbonPeriod.since("2024-01-01").until("2024-01-05");
      expect(period.first().toISOString().split("T")[0]).toBe("2024-01-01");
    });

    it("should get last date", () => {
      const period = JsCarbonPeriod.since("2024-01-01").until("2024-01-05");
      expect(period.last()?.toISOString().split("T")[0]).toBe("2024-01-05");
    });

    it("should convert to array", () => {
      const period = JsCarbonPeriod.since("2024-01-01").until("2024-01-05");
      const dates = period.toArray();
      expect(Array.isArray(dates)).toBe(true);
      expect(dates.length).toBe(5);
    });

    it("should convert to reverse array", () => {
      const period = JsCarbonPeriod.since("2024-01-01").until("2024-01-03");
      const dates = period.toArrayReverse();
      expect(dates[0].toISOString().split("T")[0]).toBe("2024-01-03");
      expect(dates[2].toISOString().split("T")[0]).toBe("2024-01-01");
    });
  });

  describe("iterator functionality", () => {
    it("should be iterable", () => {
      const period = JsCarbonPeriod.since("2024-01-01").until("2024-01-03");
      const dates = [];
      for (const date of period) {
        dates.push(date);
      }
      expect(dates.length).toBe(3);
    });

    it("should handle spread operator", () => {
      const period = JsCarbonPeriod.since("2024-01-01").until("2024-01-03");
      const dates = [...period];
      expect(dates.length).toBe(3);
    });
  });

  describe("error handling", () => {
    it("should throw error for invalid interval unit", () => {
      expect(() => {
        new JsCarbonPeriod({ interval: "1 invalid" });
      }).toThrow();
    });

    it("should throw error for invalid filter method", () => {
      expect(() => {
        JsCarbonPeriod.since("2024-01-01")
          .until("2024-01-05")
          .filter("nonExistentMethod");
      }).toThrow();
    });
  });
});
