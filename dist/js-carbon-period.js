// src/js-carbon-period.ts
import { JsCarbon } from "./js-carbon.js";
export class JsCarbonPeriod {
  constructor(options = {}) {
    this.filters = [];
    this.start = this.parseDate(options.start) || JsCarbon.now();
    this.end = options.end ? this.parseDate(options.end) : JsCarbon.now();
    [this.intervalValue, this.intervalUnit] = this.parseInterval(
      options.interval || "1 day"
    );
    this.recurrences = options.recurrences;
    this.inclusiveEnd = true;
    this.current = undefined;
  }
  // ファクトリメソッド
  static create(start, intervalOrEnd, end) {
    if (end) {
      // パターン1:期間指定 start, interval, end
      return new JsCarbonPeriod({
        start,
        end,
        interval: intervalOrEnd,
      });
    } else {
      // パターン2:開始・終了指定  start, end (デフォルトインターバルを1日に設定)
      return new JsCarbonPeriod({
        start,
        end: intervalOrEnd,
        interval: "1 day", // デフォルトインターバルを明示的に設定
      });
    }
  }
  static between(start, end) {
    return new JsCarbonPeriod({ start, end });
  }
  // シンタックスシュガー - スタティックメソッド
  static since(date) {
    return new JsCarbonPeriod({
      start: date,
      interval: "1 day", // デフォルトのインターバル
    });
  }
  static until(date) {
    return new JsCarbonPeriod({ end: date });
  }
  static untilNow() {
    return new JsCarbonPeriod({ end: JsCarbon.now() });
  }
  // シンタックスシュガー - インスタンスメソッド
  since(date) {
    return new JsCarbonPeriod({
      start: this.parseDate(date),
      interval: `${this.intervalValue} ${this.intervalUnit}`,
      recurrences: this.recurrences,
    });
  }
  until(date) {
    return new JsCarbonPeriod({
      start: this.start,
      end: this.parseDate(date),
      interval: `${this.intervalValue} ${this.intervalUnit}`,
      recurrences: this.recurrences,
    });
  }
  untilNow() {
    return this.until(JsCarbon.now());
  }
  // 単位設定メソッド
  years(value = 1) {
    return new JsCarbonPeriod({
      start: this.start,
      end: this.end,
      interval: `${value} years`,
      recurrences: this.recurrences,
    });
  }
  months(value = 1) {
    var _a;
    const end =
      ((_a = this.end) === null || _a === void 0 ? void 0 : _a.clone()) ||
      this.start.clone().addMonths(value);
    return new JsCarbonPeriod({
      start: this.start.clone(),
      end,
      interval: `${value} months`,
      recurrences: this.recurrences,
    });
  }
  weeks(value = 1) {
    return new JsCarbonPeriod({
      start: this.start,
      end: this.end,
      interval: `${value} weeks`,
      recurrences: this.recurrences,
    });
  }
  days(value = 1) {
    return new JsCarbonPeriod({
      start: this.start,
      end: this.end,
      interval: `${value} days`,
      recurrences: this.recurrences,
    });
  }
  hours(value = 1) {
    return new JsCarbonPeriod({
      start: this.start,
      end: this.end,
      interval: `${value} hours`,
      recurrences: this.recurrences,
    });
  }
  minutes(value = 1) {
    return new JsCarbonPeriod({
      start: this.start,
      end: this.end,
      interval: `${value} minutes`,
      recurrences: this.recurrences,
    });
  }
  seconds(value = 1) {
    return new JsCarbonPeriod({
      start: this.start,
      end: this.end,
      interval: `${value} seconds`,
      recurrences: this.recurrences,
    });
  }
  // Iterator実装
  [Symbol.iterator]() {
    return this.getIterator();
  }
  // Iteratorの実装を更新
  *getIterator() {
    let current = this.start.clone();
    let count = 0;
    while (this.isValidPosition(current, count)) {
      if (this.passesAllFilters(current)) {
        yield current.clone();
      }
      // 次の日付を計算
      current = this.addInterval(current);
      count++;
      // 安全装置
      if (count > 1000) {
        console.warn("Loop limit exceeded");
        break;
      }
    }
  }
  // 配列変換メソッド
  toArray() {
    return [...this];
  }
  toArrayReverse() {
    return this.toArray().reverse();
  }
  // ユーティリティメソッド
  count() {
    return this.toArray().length;
  }
  first() {
    return this.start.clone();
  }
  last() {
    var _a, _b;
    const array = this.toArray();
    let last = array.length > 0 ? array[array.length - 1] : null;
    if (!last) {
      last =
        (_b =
          (_a = this.end) === null || _a === void 0 ? void 0 : _a.clone()) !==
          null && _b !== void 0
          ? _b
          : null;
    }
    return last;
  }
  // 設定メソッド
  setStartDate(start) {
    this.start = this.parseDate(start);
    return this;
  }
  setEndDate(end) {
    this.end = this.parseDate(end);
    return this;
  }
  setRecurrences(recurrences) {
    this.recurrences = recurrences;
    return this;
  }
  // ヘルパーメソッド
  parseDate(date) {
    if (!date) return JsCarbon.now();
    if (date instanceof JsCarbon) return date.clone();
    return JsCarbon.parse(date.toString());
  }
  parseInterval(interval) {
    const match = interval.match(/^(\d+)\s+(.+)$/);
    if (!match) {
      return [1, "days"];
    }
    const value = parseInt(match[1], 10);
    let unit = match[2].toLowerCase();
    // 単数形を複数形に変換
    unit = this.pluralize(unit);
    // PeriodUnit型として有効な値かチェック
    if (!this.isValidPeriodUnit(unit)) {
      throw new Error(`Invalid interval unit: ${unit}`);
    }
    return [value, unit];
  }
  // 単数形を複数形に変換するヘルパーメソッド
  pluralize(unit) {
    // 既に複数形の場合はそのまま返す
    if (unit.endsWith("s")) {
      return unit;
    }
    // 特殊な複数形の処理
    const irregularPlurals = {
      day: "days",
      week: "weeks",
      month: "months",
      year: "years",
      hour: "hours",
      minute: "minutes",
      second: "seconds",
    };
    return irregularPlurals[unit] || `${unit}s`;
  }
  // 有効な期間単位かチェックするヘルパーメソッド
  isValidPeriodUnit(unit) {
    const validUnits = [
      "years",
      "months",
      "weeks",
      "days",
      "hours",
      "minutes",
      "seconds",
    ];
    return validUnits.includes(unit);
  }
  addInterval(date) {
    const newDate = date.clone();
    switch (this.intervalUnit) {
      case "years":
        return newDate.addYears(this.intervalValue);
      case "months":
        return newDate.addMonths(this.intervalValue);
      case "weeks":
        return newDate.addDays(this.intervalValue * 7);
      case "days":
        return newDate.addDays(this.intervalValue);
      case "hours":
        return newDate.addHours(this.intervalValue);
      case "minutes":
        return newDate.addMinutes(this.intervalValue);
      case "seconds":
        return newDate.addSeconds(this.intervalValue);
      default:
        throw new Error(`Invalid interval unit: ${this.intervalUnit}`);
    }
  }
  isValidPosition(current, count) {
    // recurrences のチェック
    if (this.recurrences !== undefined && count >= this.recurrences) {
      return false;
    }
    // 終了日のチェック
    if (!this.end) {
      return true;
    }
    const currentTimestamp = current.toJsDate().getTime();
    const endTimestamp = this.end.toJsDate().getTime();
    return this.inclusiveEnd
      ? currentTimestamp <= endTimestamp
      : currentTimestamp < endTimestamp;
  }
  // filterメソッドのオーバーロード
  filter(callback) {
    const newPeriod = new JsCarbonPeriod({
      start: this.start,
      end: this.end,
      interval: `${this.intervalValue} ${this.intervalUnit}`,
      recurrences: this.recurrences,
    });
    // 文字列が渡された場合、JsCarbonのメソッドとして実行
    if (typeof callback === "string") {
      const tmpDate = new JsCarbon();
      // メソッドの存在チェック
      const methodName = callback;
      if (!(methodName in tmpDate)) {
        throw new Error(`Method ${methodName} does not exist on JsCarbon`);
      }
      // メソッドの型チェック
      if (typeof tmpDate[methodName] !== "function") {
        throw new Error(`${methodName} is not a method of JsCarbon`);
      }
      newPeriod.filters = [
        ...this.filters,
        (date) => {
          // メソッドを実行して結果を返す
          return date[methodName]();
        },
      ];
    } else {
      // コールバック関数の場合はそのまま追加
      newPeriod.filters = [...this.filters, callback];
    }
    return newPeriod;
  }
  // フィルターチェックメソッド
  passesAllFilters(date) {
    if (this.filters.length === 0) return true;
    return this.filters.every((filter) => filter(date));
  }
  // フィルターのリセット
  clearFilters() {
    this.filters = [];
    return this;
  }
  // フィルター追加メソッド（内部用）
  addFilter(filter) {
    this.filters.push(filter);
    return this;
  }
  // デバッグ用メソッド
  debug() {
    var _a;
    console.log({
      start: this.start.toJsDate(),
      end: (_a = this.end) === null || _a === void 0 ? void 0 : _a.toJsDate(),
      intervalValue: this.intervalValue,
      intervalUnit: this.intervalUnit,
      recurrences: this.recurrences,
      inclusiveEnd: this.inclusiveEnd,
    });
  }
}
