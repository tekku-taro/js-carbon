// src/js-carbon-period.ts

import { JsCarbon } from "./js-carbon";

type PeriodUnit =
  | "years"
  | "months"
  | "weeks"
  | "days"
  | "hours"
  | "minutes"
  | "seconds";

type RecurrenceOptions = {
  start?: JsCarbon | string | Date;
  end?: JsCarbon | string | Date;
  interval?: string; // e.g. "1 day", "2 weeks", "3 months"
  recurrences?: number;
};

export class JsCarbonPeriod implements Iterable<JsCarbon> {
  private start: JsCarbon;
  private end?: JsCarbon;
  private intervalValue: number;
  private intervalUnit: PeriodUnit;
  private recurrences?: number;
  private current?: JsCarbon;
  private inclusiveEnd: boolean;
  private filters: ((date: JsCarbon) => boolean)[] = [];

  constructor(options: RecurrenceOptions = {}) {
    this.start = this.parseDate(options.start) || JsCarbon.now();
    this.end = options.end ? this.parseDate(options.end) : JsCarbon.now();
    [this.intervalValue, this.intervalUnit] = this.parseInterval(
      options.interval || "1 day"
    );
    this.recurrences = options.recurrences;
    this.inclusiveEnd = true;
    this.current = undefined;
  }

  // ファクトリメソッドのオーバーロード
  static create(
    start: JsCarbon | string | Date,
    end: JsCarbon | string | Date
  ): JsCarbonPeriod;
  static create(
    start: JsCarbon | string | Date,
    interval: string,
    end: JsCarbon | string | Date
  ): JsCarbonPeriod;
  // ファクトリメソッド
  static create(
    start: JsCarbon | string | Date,
    intervalOrEnd: string | JsCarbon | Date,
    end?: JsCarbon | string | Date
  ): JsCarbonPeriod {
    if (end) {
      // パターン1:期間指定 start, interval, end
      return new JsCarbonPeriod({
        start,
        end,
        interval: intervalOrEnd as string,
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

  static between(
    start: JsCarbon | string | Date,
    end: JsCarbon | string | Date
  ): JsCarbonPeriod {
    return new JsCarbonPeriod({ start, end });
  }

  // シンタックスシュガー - スタティックメソッド
  static since(date: JsCarbon | string | Date): JsCarbonPeriod {
    return new JsCarbonPeriod({
      start: date,
      interval: "1 day", // デフォルトのインターバル
    });
  }

  static until(date: JsCarbon | string | Date): JsCarbonPeriod {
    return new JsCarbonPeriod({ end: date });
  }

  static untilNow(): JsCarbonPeriod {
    return new JsCarbonPeriod({ end: JsCarbon.now() });
  }

  // シンタックスシュガー - インスタンスメソッド
  since(date: JsCarbon | string | Date): JsCarbonPeriod {
    return new JsCarbonPeriod({
      start: this.parseDate(date),
      interval: `${this.intervalValue} ${this.intervalUnit}`,
      recurrences: this.recurrences,
    });
  }

  until(date: JsCarbon | string | Date): JsCarbonPeriod {
    return new JsCarbonPeriod({
      start: this.start,
      end: this.parseDate(date),
      interval: `${this.intervalValue} ${this.intervalUnit}`,
      recurrences: this.recurrences,
    });
  }

  untilNow(): JsCarbonPeriod {
    return this.until(JsCarbon.now());
  }

  // 単位設定メソッド
  years(value: number = 1): JsCarbonPeriod {
    return new JsCarbonPeriod({
      start: this.start,
      end: this.end,
      interval: `${value} years`,
      recurrences: this.recurrences,
    });
  }

  months(value: number = 1): JsCarbonPeriod {
    const end = this.end?.clone() || this.start.clone().addMonths(value);
    return new JsCarbonPeriod({
      start: this.start.clone(),
      end,
      interval: `${value} months`,
      recurrences: this.recurrences,
    });
  }

  weeks(value: number = 1): JsCarbonPeriod {
    return new JsCarbonPeriod({
      start: this.start,
      end: this.end,
      interval: `${value} weeks`,
      recurrences: this.recurrences,
    });
  }

  days(value: number = 1): JsCarbonPeriod {
    return new JsCarbonPeriod({
      start: this.start,
      end: this.end,
      interval: `${value} days`,
      recurrences: this.recurrences,
    });
  }

  hours(value: number = 1): JsCarbonPeriod {
    return new JsCarbonPeriod({
      start: this.start,
      end: this.end,
      interval: `${value} hours`,
      recurrences: this.recurrences,
    });
  }

  minutes(value: number = 1): JsCarbonPeriod {
    return new JsCarbonPeriod({
      start: this.start,
      end: this.end,
      interval: `${value} minutes`,
      recurrences: this.recurrences,
    });
  }

  seconds(value: number = 1): JsCarbonPeriod {
    return new JsCarbonPeriod({
      start: this.start,
      end: this.end,
      interval: `${value} seconds`,
      recurrences: this.recurrences,
    });
  }

  // Iterator実装
  [Symbol.iterator](): Iterator<JsCarbon> {
    return this.getIterator();
  }

  // Iteratorの実装を更新
  private *getIterator(): Generator<JsCarbon> {
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
  toArray(): JsCarbon[] {
    return [...this];
  }

  toArrayReverse(): JsCarbon[] {
    return this.toArray().reverse();
  }

  // ユーティリティメソッド
  count(): number {
    return this.toArray().length;
  }

  first(): JsCarbon {
    return this.start.clone();
  }

  last(): JsCarbon | null {
    const array = this.toArray();
    let last = array.length > 0 ? array[array.length - 1] : null;
    if (!last) {
      last = this.end?.clone() ?? null;
    }
    return last;
  }

  // 設定メソッド
  setStartDate(start: JsCarbon | string | Date): this {
    this.start = this.parseDate(start);
    return this;
  }

  setEndDate(end: JsCarbon | string | Date): this {
    this.end = this.parseDate(end);
    return this;
  }

  setRecurrences(recurrences: number): this {
    this.recurrences = recurrences;
    return this;
  }

  // ヘルパーメソッド
  private parseDate(date?: JsCarbon | string | Date): JsCarbon {
    if (!date) return JsCarbon.now();
    if (date instanceof JsCarbon) return date.clone();
    return JsCarbon.parse(date.toString());
  }

  private parseInterval(interval: string): [number, PeriodUnit] {
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

    return [value, unit as PeriodUnit];
  }

  // 単数形を複数形に変換するヘルパーメソッド
  private pluralize(unit: string): string {
    // 既に複数形の場合はそのまま返す
    if (unit.endsWith("s")) {
      return unit;
    }

    // 特殊な複数形の処理
    const irregularPlurals: { [key: string]: string } = {
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
  private isValidPeriodUnit(unit: string): boolean {
    const validUnits: PeriodUnit[] = [
      "years",
      "months",
      "weeks",
      "days",
      "hours",
      "minutes",
      "seconds",
    ];

    return validUnits.includes(unit as PeriodUnit);
  }

  private addInterval(date: JsCarbon): JsCarbon {
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

  private isValidPosition(current: JsCarbon, count: number): boolean {
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
  filter(callback: ((date: JsCarbon) => boolean) | string): JsCarbonPeriod {
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
      if (typeof (tmpDate as any)[methodName] !== "function") {
        throw new Error(`${methodName} is not a method of JsCarbon`);
      }
      newPeriod.filters = [
        ...this.filters,
        (date: JsCarbon) => {
          // メソッドを実行して結果を返す
          return (date as any)[methodName]();
        },
      ];
    } else {
      // コールバック関数の場合はそのまま追加
      newPeriod.filters = [...this.filters, callback];
    }

    return newPeriod;
  }

  // フィルターチェックメソッド
  private passesAllFilters(date: JsCarbon): boolean {
    if (this.filters.length === 0) return true;
    return this.filters.every((filter) => filter(date));
  }

  // フィルターのリセット
  clearFilters(): this {
    this.filters = [];
    return this;
  }

  // フィルター追加メソッド（内部用）
  addFilter(filter: (date: JsCarbon) => boolean): this {
    this.filters.push(filter);
    return this;
  }

  // デバッグ用メソッド
  debug(): void {
    console.log({
      start: this.start.toJsDate(),
      end: this.end?.toJsDate(),
      intervalValue: this.intervalValue,
      intervalUnit: this.intervalUnit,
      recurrences: this.recurrences,
      inclusiveEnd: this.inclusiveEnd,
    });
  }
}
