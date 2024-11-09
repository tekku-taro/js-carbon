// src/index.ts
import { TRANSLATIONS } from "./i18n/translations.js";
export class JsCarbon {
  constructor(date = new Date(), timezone, locale) {
    this._locale = "en";
    this.date = date;
    this._timezone =
      timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    this._locale = locale || JsCarbon.defaultLocale;
  }
  // デフォルトロケールを設定するstaticメソッド
  static setDefaultLocale(locale) {
    if (TRANSLATIONS[locale]) {
      JsCarbon.defaultLocale = locale;
    } else {
      throw new Error(`Unsupported locale: ${locale}`);
    }
  }
  // static メソッドもロケールを受け取れるように拡張
  static now(timezone, locale) {
    return new JsCarbon(new Date(), timezone, locale);
  }
  static parse(dateString, timezone, locale) {
    return new JsCarbon(new Date(dateString), timezone, locale);
  }
  static create(year, month, day, hour = 0, minute = 0, second = 0) {
    return new JsCarbon(new Date(year, month - 1, day, hour, minute, second));
  }
  static fromTimestamp(timestamp) {
    return new JsCarbon(new Date(timestamp * 1000));
  }
  toDateString() {
    return this.format("YYYY-MM-DD");
  }
  toTimeString() {
    return this.format("HH:mm:ss");
  }
  // 2.2 Date Formatting
  format(formatStr) {
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
  toISOString() {
    return this.date.toISOString();
  }
  // ロケールを設定
  setLocale(locale) {
    if (TRANSLATIONS[locale]) {
      this._locale = locale;
    } else {
      throw new Error(`Unsupported locale: ${locale}`);
    }
    return this;
  }
  // 現在のロケールを取得
  getLocale() {
    return this._locale;
  }
  // ロケールに応じたフォーマッタを取得するプライベートメソッド
  getFormatter(options = {}) {
    return new Intl.DateTimeFormat(
      this._locale,
      Object.assign({ timeZone: this._timezone }, options)
    );
  }
  // 2.3 Date Addition and Subtraction
  addDays(days) {
    this.date.setDate(this.date.getDate() + days);
    return this;
  }
  subDays(days) {
    return this.addDays(-days);
  }
  addMonths(months) {
    this.date.setMonth(this.date.getMonth() + months);
    return this;
  }
  subMonths(months) {
    return this.addMonths(-months);
  }
  addYears(years) {
    this.date.setFullYear(this.date.getFullYear() + years);
    return this;
  }
  subYears(years) {
    return this.addYears(-years);
  }
  // 2.4 Date Difference Calculations
  diffInDays(other) {
    const diffTime = Math.abs(this.date.getTime() - other.date.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }
  diffInMonths(other) {
    const yearDiff = this.date.getFullYear() - other.date.getFullYear();
    const monthDiff = this.date.getMonth() - other.date.getMonth();
    return yearDiff * 12 + monthDiff;
  }
  diffInYears(other) {
    return Math.floor(this.diffInMonths(other) / 12);
  }
  isBefore(other) {
    return this.date < other.date;
  }
  isAfter(other) {
    return this.date > other.date;
  }
  // 2.5 Getting and Setting Day, Month, Year
  day() {
    return this.date.getDate();
  }
  month() {
    return this.date.getMonth() + 1;
  }
  year() {
    return this.date.getFullYear();
  }
  setDay(day) {
    this.date.setDate(day);
    return this;
  }
  setMonth(month) {
    this.date.setMonth(month - 1);
    return this;
  }
  setYear(year) {
    this.date.setFullYear(year);
    return this;
  }
  // 2.6 Week Operations
  startOfWeek() {
    const day = this.date.getDay();
    const diff = day === 0 ? 6 : day - 1;
    this.date.setDate(this.date.getDate() - diff);
    this.date.setHours(0, 0, 0, 0);
    return this;
  }
  endOfWeek() {
    const day = this.date.getDay();
    const diff = day === 0 ? 0 : 7 - day;
    this.date.setDate(this.date.getDate() + diff);
    this.date.setHours(23, 59, 59, 999);
    return this;
  }
  next(dayOfWeek) {
    const currentDay = this.date.getDay();
    const distance = (dayOfWeek - currentDay + 7) % 7;
    this.date.setDate(this.date.getDate() + distance);
    return this;
  }
  previous(dayOfWeek) {
    const currentDay = this.date.getDay();
    const distance = (currentDay - dayOfWeek + 7) % 7;
    this.date.setDate(this.date.getDate() - distance);
    return this;
  }
  // 2.7 Date Comparison
  isToday() {
    const today = new Date();
    return this.isSameDay(new JsCarbon(today));
  }
  isTomorrow() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return this.isSameDay(new JsCarbon(tomorrow));
  }
  isYesterday() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return this.isSameDay(new JsCarbon(yesterday));
  }
  isSameDay(other) {
    return (
      this.date.getFullYear() === other.date.getFullYear() &&
      this.date.getMonth() === other.date.getMonth() &&
      this.date.getDate() === other.date.getDate()
    );
  }
  // 2.8 Special Date Operations
  startOfMonth() {
    this.date.setDate(1);
    this.date.setHours(0, 0, 0, 0);
    return this;
  }
  endOfMonth() {
    this.date.setMonth(this.date.getMonth() + 1, 0);
    this.date.setHours(23, 59, 59, 999);
    return this;
  }
  startOfYear() {
    this.date.setMonth(0, 1);
    this.date.setHours(0, 0, 0, 0);
    return this;
  }
  endOfYear() {
    this.date.setMonth(11, 31);
    this.date.setHours(23, 59, 59, 999);
    return this;
  }
  isLeapYear() {
    const year = this.date.getFullYear();
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  }
  // 2.9 Timezone Operations
  setTimezone(timezone) {
    // const targetDate = new Date(
    //   this.date.toLocaleString("en-US", { timeZone: timezone })
    // );
    // const offset = targetDate.getTime() - this.date.getTime();
    // this.date = new Date(this.date.getTime() + offset);
    this._timezone = timezone;
    return this;
  }
  timezone() {
    return this._timezone;
  }
  timezoneOffset() {
    const formatter = this.getFormatter({ timeZoneName: "longOffset" });
    const match = formatter.format(this.date).match(/GMT([+-]\d{2}:?\d{2})/);
    return match ? match[1] : "+00:00";
  }
  inTimezone(timezone) {
    return this.clone().setTimezone(timezone);
  }
  isDST() {
    const jan = new Date(this.date.getFullYear(), 0, 1);
    const jul = new Date(this.date.getFullYear(), 6, 1);
    const getOffset = (date) => {
      return new Date(
        date.toLocaleString("en-US", { timeZone: this._timezone })
      ).getTimezoneOffset();
    };
    const janOffset = getOffset(jan);
    const julOffset = getOffset(jul);
    const currentOffset = getOffset(this.date);
    return Math.min(janOffset, julOffset) === currentOffset;
  }
  utc() {
    return this.inTimezone("UTC");
  }
  toTimezoneString(timezone) {
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
    const values = parts.reduce((acc, part) => {
      acc[part.type] = part.value;
      return acc;
    }, {});
    return `${values.month}/${values.day}/${values.year}`;
  }
  toISOStringWithTimezone() {
    const tzOffset = this.timezoneOffset();
    const isoString = this.date.toISOString();
    return isoString.slice(0, -1) + tzOffset;
  }
  diffInHoursWithTimezone(timezone) {
    const getCurrentOffset = (tz) => {
      return new Date(
        this.date.toLocaleString("en-US", { timeZone: tz })
      ).getTimezoneOffset();
    };
    const currentOffset = getCurrentOffset(this._timezone);
    const targetOffset = getCurrentOffset(timezone);
    return (targetOffset - currentOffset) / 60;
  }
  getTimezoneAbbreviation() {
    const formatter = this.getFormatter({ timeZoneName: "short" });
    const parts = formatter.formatToParts(this.date);
    const timeZonePart = parts.find((part) => part.type === "timeZoneName");
    return timeZonePart ? timeZonePart.value : "";
  }
  isSameTimezone(other) {
    return this._timezone === other.timezone();
  }
  // 2.10 Helper Methods
  clone() {
    return new JsCarbon(new Date(this.date), this._timezone, this._locale);
  }
  isWeekend() {
    const day = this.date.getDay();
    return day === 0 || day === 6;
  }
  isWeekday() {
    return !this.isWeekend();
  }
  // 月名を取得（長い形式）
  monthName() {
    return TRANSLATIONS[this._locale].months.long[this.date.getMonth()];
  }
  // 月名を取得（短い形式）
  shortMonthName() {
    return TRANSLATIONS[this._locale].months.short[this.date.getMonth()];
  }
  // 曜日名を取得（長い形式）
  dayName() {
    return TRANSLATIONS[this._locale].days.long[this.date.getDay()];
  }
  // 曜日名を取得（短い形式）
  shortDayName() {
    return TRANSLATIONS[this._locale].days.short[this.date.getDay()];
  }
  // ローカライズされたフォーマット
  localizedFormat(formatStr) {
    const formatted = this.format(formatStr);
    return formatted
      .replace(/MMMM/g, this.monthName())
      .replace(/MMM/g, this.shortMonthName())
      .replace(/dddd/g, this.dayName())
      .replace(/ddd/g, this.shortDayName());
  }
  // 人間が読みやすい相対時間表示
  // 相対時間表示のローカライズ
  diffForHumans(other = JsCarbon.now()) {
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
    let value;
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
  toLocaleDateString(options = {}) {
    return this.getFormatter(options).format(this.date);
  }
  // ローカライズされた時刻文字列を取得
  toLocaleTimeString(options = {}) {
    return this.getFormatter(
      Object.assign(Object.assign({}, options), {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    ).format(this.date);
  }
  // ローカライズされた日付時刻文字列を取得
  toLocaleString(options = {}) {
    const formatter = this.getFormatter(
      Object.assign(
        {
          year: "numeric",
          month: "numeric",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        },
        options
      )
    );
    return formatter.format(this.date);
  }
  toRelativeTime() {
    return this.diffForHumans();
  }
  // 日付を表示するためのメソッド
  toJsDate() {
    return this.date;
  }
  // フォーマット済みの文字列を取得
  toString() {
    return this.date.toDateString();
  }
}
JsCarbon.DAYS_IN_WEEK = 7;
// デフォルトロケールの設定
JsCarbon.defaultLocale = "en";
