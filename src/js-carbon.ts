// src/js-carbon.ts

import { TRANSLATIONS } from "./i18n/translations";
import { JsCarbonInterval } from "./js-carbon-interval";

export class JsCarbon {
  private date: Date;
  private static readonly DAYS_IN_WEEK = 7;
  private _locale: LocaleType;
  private _timezone: string;

  // デフォルトロケールの設定
  private static defaultLocale: LocaleType = "en";
  private static defaultTimezone: string;

  constructor(date: Date = new Date(), timezone?: string, locale?: LocaleType) {
    this.date = date;
    this._timezone =
      timezone ||
      JsCarbon.defaultTimezone ||
      Intl.DateTimeFormat().resolvedOptions().timeZone;
    this._locale = locale || JsCarbon.defaultLocale;
  }

  // デフォルトロケールを設定するstaticメソッド
  static setDefaultLocale(locale: LocaleType): void {
    if (TRANSLATIONS[locale]) {
      JsCarbon.defaultLocale = locale;
    } else {
      throw new Error(`Unsupported locale: ${locale}`);
    }
  }

  // デフォルトタイムゾーンを設定するstaticメソッド
  static setDefaultTimezone(timezone: string): void {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: timezone });
      JsCarbon.defaultTimezone = timezone;
    } catch (e) {
      throw new Error(`Unsupported timezone: ${timezone}`);
    }
  }

  // static メソッドもロケールを受け取れるように拡張
  static now(timezone?: string, locale?: LocaleType): JsCarbon {
    return new JsCarbon(new Date(), timezone, locale);
  }

  static parse(
    dateString: string,
    timezone?: string,
    locale?: LocaleType
  ): JsCarbon {
    return new JsCarbon(new Date(dateString), timezone, locale);
  }

  static create(
    year: number,
    month: number,
    day: number,
    hour: number = 0,
    minute: number = 0,
    second: number = 0
  ): JsCarbon {
    return new JsCarbon(new Date(year, month - 1, day, hour, minute, second));
  }

  static fromTimestamp(timestamp: number): JsCarbon {
    return new JsCarbon(new Date(timestamp * 1000));
  }

  toDateString(): string {
    return this.format("YYYY-MM-DD");
  }

  toTimeString(): string {
    return this.format("HH:mm:ss");
  }

  // 2.2 Date Formatting
  format(formatStr: string): string {
    const year = this.date.getFullYear();
    const month = this.date.getMonth() + 1;
    const day = this.date.getDate();
    const hours = this.date.getHours();
    const minutes = this.date.getMinutes();
    const seconds = this.date.getSeconds();

    return formatStr
      .replace("YYYY", year.toString().padStart(4, "0"))
      .replace("MM", month.toString().padStart(2, "0"))
      .replace("DD", day.toString().padStart(2, "0"))
      .replace("HH", hours.toString().padStart(2, "0"))
      .replace("mm", minutes.toString().padStart(2, "0"))
      .replace("ss", seconds.toString().padStart(2, "0"));
  }

  toISOString(): string {
    return this.date.toISOString();
  }

  // ロケールを設定
  setLocale(locale: LocaleType): JsCarbon {
    if (TRANSLATIONS[locale]) {
      this._locale = locale;
    } else {
      throw new Error(`Unsupported locale: ${locale}`);
    }
    return this;
  }

  // 現在のロケールを取得
  getLocale(): LocaleType {
    return this._locale;
  }

  // ロケールに応じたフォーマッタを取得するプライベートメソッド
  private getFormatter(
    options: Intl.DateTimeFormatOptions = {}
  ): Intl.DateTimeFormat {
    return new Intl.DateTimeFormat(this._locale, {
      timeZone: this._timezone,
      ...options,
    });
  }

  // 2.3 Date Addition and Subtraction
  addHours(hours: number): JsCarbon {
    this.date.setHours(this.date.getHours() + hours);
    return this;
  }

  addMinutes(minutes: number): JsCarbon {
    this.date.setMinutes(this.date.getMinutes() + minutes);
    return this;
  }

  addSeconds(seconds: number): JsCarbon {
    this.date.setSeconds(this.date.getSeconds() + seconds);
    return this;
  }

  addMilliseconds(milliseconds: number): JsCarbon {
    this.date.setMilliseconds(this.date.getMilliseconds() + milliseconds);
    return this;
  }

  addDays(days: number): JsCarbon {
    this.date.setDate(this.date.getDate() + days);
    return this;
  }

  subDays(days: number): JsCarbon {
    return this.addDays(-days);
  }

  addMonths(months: number): JsCarbon {
    this.date.setMonth(this.date.getMonth() + months);
    return this;
  }

  subMonths(months: number): JsCarbon {
    return this.addMonths(-months);
  }

  addYears(years: number): JsCarbon {
    this.date.setFullYear(this.date.getFullYear() + years);
    return this;
  }

  subYears(years: number): JsCarbon {
    return this.addYears(-years);
  }

  /**
   * 期間を加算して新しい JsCarbon インスタンスを返す
   * @param interval 加算する期間
   * @returns 新しい JsCarbon インスタンス
   */
  add(interval: JsCarbonInterval): JsCarbon {
    const result = this.clone();
    result.addYears(interval.years);
    result.addMonths(interval.months);
    result.addDays(interval.days);
    result.addHours(interval.hours);
    result.addMinutes(interval.minutes);
    result.addSeconds(interval.seconds);
    return result;
  }

  /**
   * 期間を減算して新しい JsCarbon インスタンスを返す
   * @param interval 減算する期間
   * @returns 新しい JsCarbon インスタンス
   */
  sub(interval: JsCarbonInterval): JsCarbon {
    const result = this.clone();
    result.addYears(-interval.years);
    result.addMonths(-interval.months);
    result.addDays(-interval.days);
    result.addHours(-interval.hours);
    result.addMinutes(-interval.minutes);
    result.addSeconds(-interval.seconds);
    return result;
  }

  // 2.4 Date Difference Calculations
  // タイムゾーンを考慮した時刻を取得するprivateメソッド
  private getTimezoneDate(): Date {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: this._timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    const parts = formatter.formatToParts(this.date);
    const dateValues = parts.reduce(
      (acc, part) => {
        if (part.type === "hour" && part.value === "24") {
          // 24時の場合は0時として扱う
          acc[part.type] = 0;
        } else {
          acc[part.type] = parseInt(part.value);
        }
        return acc;
      },
      {} as Record<string, number>
    );

    // タイムゾーンを考慮した新しいDateオブジェクトを作成
    const tzDate = new Date(
      Date.UTC(
        dateValues.year,
        dateValues.month - 1,
        dateValues.day,
        dateValues.hour,
        dateValues.minute,
        dateValues.second
      )
    );

    return tzDate;
  }

  /**
   * 2つの日付の差分を計算し、JsCarbonInterval を返す
   * @param other 比較対象の JsCarbon インスタンス
   * @param absolute 絶対値を返すかどうか
   * @returns JsCarbonInterval インスタンス
   */
  diff(other: JsCarbon, absolute: boolean = false): JsCarbonInterval {
    // タイムゾーンを考慮した日付を取得
    const thisDate = this.getTimezoneDate();
    const otherDate = other.getTimezoneDate();

    const thisCarbon = new JsCarbon(thisDate, "UTC");
    const otherCarbon = new JsCarbon(otherDate, "UTC");

    return JsCarbonInterval.fromDiff(thisCarbon, otherCarbon, absolute);
  }

  diffInDays(other: JsCarbon): number {
    const diffTime = this.date.getTime() - other.date.getTime();
    return Math.trunc(diffTime / (1000 * 60 * 60 * 24));
  }

  diffInMonths(other: JsCarbon): number {
    const yearDiff = this.date.getFullYear() - other.date.getFullYear();
    const monthDiff = this.date.getMonth() - other.date.getMonth();
    return yearDiff * 12 + monthDiff;
  }

  diffInYears(other: JsCarbon): number {
    return Math.trunc(this.diffInMonths(other) / 12);
  }

  isBefore(other: JsCarbon): boolean {
    return this.date < other.date;
  }

  isAfter(other: JsCarbon): boolean {
    return this.date > other.date;
  }

  // 2.5 Getting and Setting Day, Month, Year
  day(): number {
    return this.date.getDate();
  }

  month(): number {
    return this.date.getMonth() + 1;
  }

  year(): number {
    return this.date.getFullYear();
  }

  setDay(day: number): JsCarbon {
    this.date.setDate(day);
    return this;
  }

  setMonth(month: number): JsCarbon {
    this.date.setMonth(month - 1);
    return this;
  }

  setYear(year: number): JsCarbon {
    this.date.setFullYear(year);
    return this;
  }

  // 2.6 Week Operations
  startOfWeek(): JsCarbon {
    const day = this.date.getDay();
    const diff = day === 0 ? 6 : day - 1;
    this.date.setDate(this.date.getDate() - diff);
    this.date.setHours(0, 0, 0, 0);
    return this;
  }

  endOfWeek(): JsCarbon {
    const day = this.date.getDay();
    const diff = day === 0 ? 0 : 7 - day;
    this.date.setDate(this.date.getDate() + diff);
    this.date.setHours(23, 59, 59, 999);
    return this;
  }

  next(dayOfWeek: number): JsCarbon {
    const currentDay = this.date.getDay();
    const distance = (dayOfWeek - currentDay + 7) % 7;
    this.date.setDate(this.date.getDate() + distance);
    return this;
  }

  previous(dayOfWeek: number): JsCarbon {
    const currentDay = this.date.getDay();
    const distance = (currentDay - dayOfWeek + 7) % 7;
    this.date.setDate(this.date.getDate() - distance);
    return this;
  }

  // 2.7 Date Comparison
  isToday(): boolean {
    const today = new Date();
    return this.isSameDay(new JsCarbon(today));
  }

  isTomorrow(): boolean {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return this.isSameDay(new JsCarbon(tomorrow));
  }

  isYesterday(): boolean {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return this.isSameDay(new JsCarbon(yesterday));
  }

  isSameDay(other: JsCarbon): boolean {
    return (
      this.date.getFullYear() === other.date.getFullYear() &&
      this.date.getMonth() === other.date.getMonth() &&
      this.date.getDate() === other.date.getDate()
    );
  }

  // 2.8 Special Date Operations
  startOfMonth(): JsCarbon {
    this.date.setDate(1);
    this.date.setHours(0, 0, 0, 0);
    return this;
  }

  endOfMonth(): JsCarbon {
    this.date.setMonth(this.date.getMonth() + 1, 0);
    this.date.setHours(23, 59, 59, 999);
    return this;
  }

  startOfYear(): JsCarbon {
    this.date.setMonth(0, 1);
    this.date.setHours(0, 0, 0, 0);
    return this;
  }

  endOfYear(): JsCarbon {
    this.date.setMonth(11, 31);
    this.date.setHours(23, 59, 59, 999);
    return this;
  }

  isLeapYear(): boolean {
    const year = this.date.getFullYear();
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  }

  // 2.9 Timezone Operations
  setTimezone(timezone: string): JsCarbon {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: timezone });
      this._timezone = timezone;
      return this;
    } catch (e) {
      throw new Error(`Unsupported timezone: ${timezone}`);
    }
    // const targetDate = new Date(
    //   this.date.toLocaleString("en-US", { timeZone: timezone })
    // );
    // const offset = targetDate.getTime() - this.date.getTime();
    // this.date = new Date(this.date.getTime() + offset);
  }

  timezone(): string {
    return this._timezone;
  }

  timezoneOffset(): string {
    const formatter = this.getFormatter({ timeZoneName: "longOffset" });
    const match = formatter.format(this.date).match(/GMT([+-]\d{2}:?\d{2})/);
    return match ? match[1] : "+00:00";
  }

  inTimezone(timezone: string): JsCarbon {
    return this.clone().setTimezone(timezone);
  }

  isDST(): boolean {
    const jan = new Date(this.date.getFullYear(), 0, 1);
    const jul = new Date(this.date.getFullYear(), 6, 1);

    const getOffset = (date: Date) => {
      return new Date(
        date.toLocaleString("en-US", { timeZone: this._timezone })
      ).getTimezoneOffset();
    };

    const janOffset = getOffset(jan);
    const julOffset = getOffset(jul);
    const currentOffset = getOffset(this.date);

    return Math.min(janOffset, julOffset) === currentOffset;
  }

  utc(): JsCarbon {
    return this.inTimezone("UTC");
  }

  toTimezoneString(timezone?: string): string {
    const formatter = this.getFormatter({
      timeZone: timezone || this._timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour12: false,
      // フォーマットを MM/DD/YYYY パターンに変更
      formatMatcher: "basic",
    });

    const parts = formatter.formatToParts(this.date);
    const values = parts.reduce(
      (acc, part) => {
        acc[part.type] = part.value;
        return acc;
      },
      {} as Record<string, string>
    );

    return `${values.month}/${values.day}/${values.year}`;
  }

  toISOStringWithTimezone(): string {
    const tzOffset = this.timezoneOffset();
    const isoString = this.date.toISOString();
    return isoString.slice(0, -1) + tzOffset;
  }

  diffInHoursWithTimezone(timezone: string): number {
    const getCurrentOffset = (tz: string) => {
      return new Date(
        this.date.toLocaleString("en-US", { timeZone: tz })
      ).getTimezoneOffset();
    };

    const currentOffset = getCurrentOffset(this._timezone);
    const targetOffset = getCurrentOffset(timezone);
    return (targetOffset - currentOffset) / 60;
  }

  getTimezoneAbbreviation(): string {
    const formatter = this.getFormatter({ timeZoneName: "short" });
    const parts = formatter.formatToParts(this.date);
    const timeZonePart = parts.find((part) => part.type === "timeZoneName");
    return timeZonePart ? timeZonePart.value : "";
  }

  isSameTimezone(other: JsCarbon): boolean {
    return this._timezone === other.timezone();
  }

  // 2.10 Helper Methods
  clone(): JsCarbon {
    return new JsCarbon(new Date(this.date), this._timezone, this._locale);
  }

  isWeekend(): boolean {
    const day = this.date.getDay();
    return day === 0 || day === 6;
  }

  isWeekday(): boolean {
    return !this.isWeekend();
  }

  // 月名を取得（長い形式）
  monthName(): string {
    return TRANSLATIONS[this._locale].months.long[this.date.getMonth()];
  }

  // 月名を取得（短い形式）
  shortMonthName(): string {
    return TRANSLATIONS[this._locale].months.short[this.date.getMonth()];
  }

  // 曜日名を取得（長い形式）
  dayName(): string {
    return TRANSLATIONS[this._locale].days.long[this.date.getDay()];
  }

  // 曜日名を取得（短い形式）
  shortDayName(): string {
    return TRANSLATIONS[this._locale].days.short[this.date.getDay()];
  }

  // ローカライズされたフォーマット
  localizedFormat(formatStr: string): string {
    const formatted = this.format(formatStr);
    return formatted
      .replace(/MMMM/g, this.monthName())
      .replace(/MMM/g, this.shortMonthName())
      .replace(/dddd/g, this.dayName())
      .replace(/ddd/g, this.shortDayName());
  }

  // 人間が読みやすい相対時間表示
  // 相対時間表示のローカライズ
  diffForHumans(other: JsCarbon = JsCarbon.now()): string {
    const diffMs = this.date.getTime() - other.date.getTime();
    const abs = Math.abs(diffMs);
    const seconds = Math.round(abs / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);
    const months = Math.round(days / 30.436875); // より正確な月の日数
    const years = Math.round(months / 12);

    const trans = TRANSLATIONS[this._locale].relative;
    const isFuture = diffMs > 0;

    let value: string;
    if (years > 0) {
      value =
        years === 1 ? trans.y : trans.yy.replace("{value}", String(years));
    } else if (months > 0) {
      value =
        months === 1 ? trans.M : trans.MM.replace("{value}", String(months));
    } else if (days > 0) {
      value = days === 1 ? trans.d : trans.dd.replace("{value}", String(days));
    } else if (hours > 0) {
      value =
        hours === 1 ? trans.h : trans.hh.replace("{value}", String(hours));
    } else if (minutes > 0) {
      value =
        minutes === 1 ? trans.m : trans.mm.replace("{value}", String(minutes));
    } else {
      value = trans.s;
    }

    return isFuture
      ? trans.future.replace("{value}", value)
      : trans.past.replace("{value}", value);
  }

  // 日付を現在のロケールに応じてフォーマット
  // ローカライズされた日付文字列を取得
  toLocaleDateString(options: Intl.DateTimeFormatOptions = {}): string {
    return this.getFormatter(options).format(this.date);
  }

  // ローカライズされた時刻文字列を取得
  toLocaleTimeString(options: Intl.DateTimeFormatOptions = {}): string {
    return this.getFormatter({
      ...options,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(this.date);
  }

  // ローカライズされた日付時刻文字列を取得
  toLocaleString(options: Intl.DateTimeFormatOptions = {}): string {
    const formatter = this.getFormatter({
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      ...options,
    });

    return formatter.format(this.date);
  }

  toRelativeTime(): string {
    return this.diffForHumans();
  }

  // javascript のDateオブジェクトを返す
  toJsDate(): Date {
    return this.date;
  }

  // フォーマット済みの文字列を取得
  toString(): string {
    return this.date.toDateString();
  }
}
