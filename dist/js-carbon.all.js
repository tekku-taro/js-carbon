export class JsCarbon {
  constructor(date = new Date(), timezone, locale) {
    this.date = date instanceof Date ? date : new Date(date);
    this._timezone =
      timezone ||
      JsCarbon.defaultTimezone ||
      Intl.DateTimeFormat().resolvedOptions().timeZone;
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
  // デフォルトタイムゾーンを設定するstaticメソッド
  static setDefaultTimezone(timezone) {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: timezone });
      JsCarbon.defaultTimezone = timezone;
    } catch (e) {
      throw new Error(`Unsupported timezone: ${timezone}`);
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
  addHours(hours) {
    this.date.setHours(this.date.getHours() + hours);
    return this;
  }
  addMinutes(minutes) {
    this.date.setMinutes(this.date.getMinutes() + minutes);
    return this;
  }
  addSeconds(seconds) {
    this.date.setSeconds(this.date.getSeconds() + seconds);
    return this;
  }
  addMilliseconds(milliseconds) {
    this.date.setMilliseconds(this.date.getMilliseconds() + milliseconds);
    return this;
  }
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
  /**
   * 期間を加算して新しい JsCarbon インスタンスを返す
   * @param interval 加算する期間
   * @returns 新しい JsCarbon インスタンス
   */
  add(interval) {
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
  sub(interval) {
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
  getTimezoneDate() {
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
    const dateValues = parts.reduce((acc, part) => {
      if (part.type === "hour" && part.value === "24") {
        // 24時の場合は0時として扱う
        acc[part.type] = 0;
      } else {
        acc[part.type] = parseInt(part.value);
      }
      return acc;
    }, {});
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
  diff(other, absolute = false) {
    // タイムゾーンを考慮した日付を取得
    const thisDate = this.getTimezoneDate();
    const otherDate = other.getTimezoneDate();
    const thisCarbon = new JsCarbon(thisDate, "UTC");
    const otherCarbon = new JsCarbon(otherDate, "UTC");
    return JsCarbonInterval.fromDiff(thisCarbon, otherCarbon, absolute);
  }
  diffInDays(other) {
    const diffTime = this.date.getTime() - other.date.getTime();
    return Math.trunc(diffTime / (1000 * 60 * 60 * 24));
  }
  diffInMonths(other) {
    const yearDiff = this.date.getFullYear() - other.date.getFullYear();
    const monthDiff = this.date.getMonth() - other.date.getMonth();
    return yearDiff * 12 + monthDiff;
  }
  diffInYears(other) {
    return Math.trunc(this.diffInMonths(other) / 12);
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
  isSunday() {
    const day = this.date.getDay();
    return day === 0;
  }
  isMonday() {
    const day = this.date.getDay();
    return day === 1;
  }
  isTuesday() {
    const day = this.date.getDay();
    return day === 2;
  }
  isWednesday() {
    const day = this.date.getDay();
    return day === 3;
  }
  isThursday() {
    const day = this.date.getDay();
    return day === 4;
  }
  isFriday() {
    const day = this.date.getDay();
    return day === 5;
  }
  isSaturday() {
    const day = this.date.getDay();
    return day === 6;
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
  // javascript のDateオブジェクトを返す
  toJsDate() {
    return this.date;
  }
  // フォーマット済みの文字列を取得
  toString() {
    return this.date.toDateString();
  }
}

export class JsCarbonInterval {
  constructor(
    years = 0,
    months = 0,
    days = 0,
    hours = 0,
    minutes = 0,
    seconds = 0,
    milliseconds = 0,
    invert = false
  ) {
    this._years = years;
    this._months = months;
    this._days = days;
    this._hours = hours;
    this._minutes = minutes;
    this._seconds = seconds;
    this._milliseconds = milliseconds;
    this._invert = invert;
    this._absolute = false;
    // 初期化時に正規化
    this.normalize();
  }
  normalize() {
    if (this._start && this._end) {
      return JsCarbonInterval.hydrateFromStartEndDate(
        this._start,
        this._end,
        this
      );
    }
    const negativeInterval = this.checkNegative();
    let tempDays = (this._years * 12 + this._months) * 30 + this._days;
    let diffMs =
      (((tempDays * 24 + this._hours) * 60 + this._minutes) * 60 +
        this._seconds) *
        1000 +
      this._milliseconds;
    const absDiffMs = Math.abs(diffMs);
    const seconds = Math.floor(absDiffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    // start/endがない場合は30日を1ヶ月として概算
    let months = Math.floor(days / 30);
    const years = Math.floor(months / 12);
    this._years = years;
    this._months = months % 12;
    this._days = days % 30;
    this._hours = hours % 24;
    this._minutes = minutes % 60;
    this._seconds = seconds % 60;
    this._milliseconds = absDiffMs % 1000;
    // マイナスの値の処理
    if (negativeInterval) {
      this._invert = true;
    }
  }
  checkNegative() {
    if (this._start && this._end) {
      const diffMs =
        this._end.toJsDate().getTime() - this._start.toJsDate().getTime();
      return diffMs < 0;
    }
    let tempDays = (this._years * 12 + this._months) * 30 + this._days;
    let tempSeconds =
      ((tempDays * 24 + this._hours) * 60 + this._minutes) * 60 +
      this._seconds +
      this._milliseconds / 1000;
    return tempSeconds < 0;
  }
  // ファクトリメソッド
  static create(
    years = 0,
    months = 0,
    days = 0,
    hours = 0,
    minutes = 0,
    seconds = 0,
    milliseconds = 0
  ) {
    return new JsCarbonInterval(
      years,
      months,
      days,
      hours,
      minutes,
      seconds,
      milliseconds
    );
  }
  // 便利なスタティックファクトリメソッド
  static years(years) {
    return new JsCarbonInterval(Math.abs(years), 0, 0, 0, 0, 0, 0, years < 0);
  }
  static months(months) {
    return new JsCarbonInterval(0, Math.abs(months), 0, 0, 0, 0, 0, months < 0);
  }
  static days(days) {
    return new JsCarbonInterval(0, 0, Math.abs(days), 0, 0, 0, 0, days < 0);
  }
  static hours(hours) {
    return new JsCarbonInterval(0, 0, 0, Math.abs(hours), 0, 0, 0, hours < 0);
  }
  static minutes(minutes) {
    return new JsCarbonInterval(
      0,
      0,
      0,
      0,
      Math.abs(minutes),
      0,
      0,
      minutes < 0
    );
  }
  static seconds(seconds) {
    return new JsCarbonInterval(
      0,
      0,
      0,
      0,
      0,
      Math.abs(seconds),
      0,
      seconds < 0
    );
  }
  // メソッドチェーン用のメソッド
  addYears(years) {
    if (this._end) {
      const newEnd = this._end.clone().addYears(years);
      this._end = newEnd;
    }
    this._years += years;
    this.normalize();
    return this;
  }
  addMonths(months) {
    if (this._end) {
      const newEnd = this._end.clone().addMonths(months);
      this._end = newEnd;
    }
    this._months += months;
    this.normalize();
    return this;
  }
  addDays(days) {
    if (this._end) {
      const newEnd = this._end.clone().addDays(days);
      this._end = newEnd;
    }
    this._days += days;
    this.normalize();
    return this;
  }
  addHours(hours) {
    if (this._end) {
      const newEnd = this._end.clone().addHours(hours);
      this._end = newEnd;
    }
    this._hours += hours;
    this.normalize();
    return this;
  }
  addMinutes(minutes) {
    if (this._end) {
      const newEnd = this._end.clone().addMinutes(minutes);
      this._end = newEnd;
    }
    this._minutes += minutes;
    this.normalize();
    return this;
  }
  addSeconds(seconds) {
    if (this._end) {
      const newEnd = this._end.clone().addSeconds(seconds);
      this._end = newEnd;
    }
    this._seconds += seconds;
    this.normalize();
    return this;
  }
  // 期間の加算
  plus(other) {
    let result = this.clone();
    if (result._end && result._start) {
      // start/end がある場合は end を調整
      const newEnd = result._end
        .clone()
        .addYears(other.years)
        .addMonths(other.months)
        .addDays(other.days)
        .addHours(other.hours)
        .addMinutes(other.minutes)
        .addSeconds(other.seconds);
      result = JsCarbonInterval.fromDiff(result._start, newEnd);
    } else {
      // 通常の加算
      result._years += other.years;
      result._months += other.months;
      result._days += other.days;
      result._hours += other.hours;
      result._minutes += other.minutes;
      result._seconds += other.seconds;
      result._milliseconds += other.milliseconds;
      result.normalize();
    }
    // 符号の処理
    if (this._invert && other._invert) {
      result._invert = true;
    } else if (this._invert || other._invert) {
      // 絶対値の大きい方の符号を採用
      const thisTotal = Math.abs(this.totalSeconds);
      const otherTotal = Math.abs(other.totalSeconds);
      if (thisTotal > otherTotal) {
        result._invert = this._invert;
      } else {
        result._invert = other._invert;
      }
    }
    return result;
  }
  // 期間の減算
  minus(other) {
    const invertedOther = other.clone();
    invertedOther._invert = !invertedOther._invert;
    return this.plus(invertedOther);
  }
  // 期間の乗算
  multiply(factor) {
    let result = this.clone();
    if (result._end && result._start) {
      const diffSeconds =
        (result._end.toJsDate().getTime() -
          result._start.toJsDate().getTime()) /
        1000;
      const newDiffSeconds = diffSeconds * factor;
      const newEnd = result._start.clone().addSeconds(newDiffSeconds);
      result = JsCarbonInterval.fromDiff(result._start, newEnd);
    } else {
      result._years *= factor;
      result._months *= factor;
      result._days *= factor;
      result._hours *= factor;
      result._minutes *= factor;
      result._seconds *= factor;
      result._milliseconds *= factor;
      result.normalize();
    }
    return result;
  }
  // 期間の除算
  divide(divisor) {
    if (divisor === 0) {
      throw new Error("Division by zero");
    }
    return this.multiply(1 / divisor);
  }
  // getter メソッド
  get invert() {
    return this._invert;
  }
  get start() {
    return this._start;
  }
  get end() {
    return this._end;
  }
  get years() {
    let years = this._years;
    return this._absolute ? Math.abs(years) : this._invert ? -years : years;
  }
  get months() {
    let months = this._months;
    return this._absolute ? Math.abs(months) : this._invert ? -months : months;
  }
  get days() {
    let days = this._days;
    return this._absolute ? Math.abs(days) : this._invert ? -days : days;
  }
  get weeks() {
    return Math.floor(this.days / 7);
  }
  get hours() {
    let val = this._hours;
    return this._absolute ? Math.abs(val) : this._invert ? -val : val;
  }
  get minutes() {
    let val = this._minutes;
    return this._absolute ? Math.abs(val) : this._invert ? -val : val;
  }
  get seconds() {
    let val = this._seconds;
    return this._absolute ? Math.abs(val) : this._invert ? -val : val;
  }
  get milliseconds() {
    let val = this._milliseconds;
    return this._absolute ? Math.abs(val) : this._invert ? -val : val;
  }
  // 総計算メソッド
  get totalMonths() {
    if (this._start && this._end) {
      const months =
        (this._end.year() - this._start.year()) * 12 +
        (this._end.month() - this._start.month());
      return this._absolute
        ? Math.abs(months)
        : this._invert
          ? -months
          : months;
    }
    const total = this._years * 12 + this._months;
    return this._absolute ? Math.abs(total) : this._invert ? -total : total;
  }
  get totalDays() {
    if (this._start && this._end) {
      const days = Math.floor(
        (this._end.toJsDate().getTime() - this._start.toJsDate().getTime()) /
          (1000 * 60 * 60 * 24)
      );
      return this._absolute ? Math.abs(days) : this._invert ? -days : days;
    }
    const total = this._years * 365 + this._months * 30 + this._days;
    return this._absolute ? Math.abs(total) : this._invert ? -total : total;
  }
  get totalHours() {
    const total = this.totalDays * 24 + this._hours;
    return this._absolute ? Math.abs(total) : this._invert ? -total : total;
  }
  get totalMinutes() {
    const total = this.totalHours * 60 + this._minutes;
    return this._absolute ? Math.abs(total) : this._invert ? -total : total;
  }
  get totalSeconds() {
    const total = this.totalMinutes * 60 + this._seconds;
    return this._absolute ? Math.abs(total) : this._invert ? -total : total;
  }
  // フォーマットメソッド（国際化対応版）
  format(syntax = "traditional") {
    if (syntax === "traditional") {
      return this.formatTraditional();
    }
    return this.formatRelative();
  }
  formatTraditional() {
    const parts = [];
    if (this.years) parts.push(`${Math.abs(this.years)}y`);
    if (this.months) parts.push(`${Math.abs(this.months)}m`);
    if (this.days % 7) parts.push(`${Math.abs(this.days % 7)}d`);
    if (this.weeks) parts.push(`${Math.abs(this.weeks)}w`);
    if (this.hours) parts.push(`${Math.abs(this.hours)}h`);
    if (this.minutes) parts.push(`${Math.abs(this.minutes)}m`);
    if (this.seconds) parts.push(`${Math.abs(this.seconds)}s`);
    let result = parts.join(" ") || "0s";
    if (!this._absolute && this._invert) {
      return `-${result}`;
    }
    return result;
  }
  formatRelative() {
    const t = this.getTranslation().relative;
    let value = "";
    // 最も大きな単位を選択
    if (this.years != 0) {
      value =
        this.years === 1
          ? t.y
          : t.yy.replace("{value}", String(Math.abs(this.years)));
    } else if (this.months != 0) {
      value =
        this.months === 1
          ? t.M
          : t.MM.replace("{value}", String(Math.abs(this.months)));
    } else if (this.days != 0) {
      value =
        this.days === 1
          ? t.d
          : t.dd.replace("{value}", String(Math.abs(this.days)));
    } else if (this.hours != 0) {
      value =
        this.hours === 1
          ? t.h
          : t.hh.replace("{value}", String(Math.abs(this.hours)));
    } else if (this.minutes != 0) {
      value =
        this.minutes === 1
          ? t.m
          : t.mm.replace("{value}", String(Math.abs(this.minutes)));
    } else {
      value = t.s;
    }
    if (!this._absolute) {
      // 過去または未来の形式を適用
      return this._invert
        ? t.past.replace("{value}", value)
        : t.future.replace("{value}", value);
    }
    return value;
  }
  // forHumans() メソッドを追加（format('relative') のエイリアス）
  forHumans() {
    return this.format("relative");
  }
  // JsCarbon クラスとの連携メソッド
  static fromDiff(start, end, absolute = false) {
    const interval = new JsCarbonInterval();
    interval._start = start.clone();
    interval._end = end.clone();
    interval._absolute = absolute;
    // UTCベースで計算を行う
    this.hydrateFromStartEndDate(start, end, interval);
    return interval;
  }
  static hydrateFromStartEndDate(start, end, interval) {
    const startDate = start.toJsDate();
    const endDate = end.toJsDate();
    const diffMs = endDate.getTime() - startDate.getTime();
    interval._invert = diffMs < 0;
    const absDiffMs = Math.abs(diffMs);
    const seconds = Math.floor(absDiffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const startYear = startDate.getUTCFullYear();
    const startMonth = startDate.getUTCMonth();
    const startDay = startDate.getUTCDate();
    const endYear = endDate.getUTCFullYear();
    const endMonth = endDate.getUTCMonth();
    const endDay = endDate.getUTCDate();
    let yearDiff;
    let monthDiff;
    let dayDiff;
    if (!interval._invert) {
      yearDiff = endYear - startYear;
      monthDiff = endMonth - startMonth;
      dayDiff = endDay - startDay;
    } else {
      yearDiff = startYear - endYear;
      monthDiff = startMonth - endMonth;
      dayDiff = startDay - endDay;
    }
    // 日数がマイナスの場合の調整
    if (dayDiff < 0) {
      monthDiff--;
      let lastDayOfMonth;
      // 開始月の最終日を取得（UTCを使用）
      if (!interval._invert) {
        lastDayOfMonth = new Date(
          Date.UTC(startYear, startMonth + 1, 0)
        ).getUTCDate();
      } else {
        lastDayOfMonth = new Date(
          Date.UTC(endYear, endMonth + 1, 0)
        ).getUTCDate();
      }
      dayDiff += lastDayOfMonth;
    }
    // 月数がマイナスの場合の調整
    if (monthDiff < 0) {
      yearDiff--;
      monthDiff += 12;
    }
    interval._years = Math.abs(yearDiff);
    interval._months = Math.abs(monthDiff);
    interval._days = Math.abs(dayDiff);
    interval._hours = hours % 24;
    interval._minutes = minutes % 60;
    interval._seconds = seconds % 60;
    interval._milliseconds = absDiffMs % 1000;
  }
  // 比較メソッド
  // 期間の比較
  compareTo(other) {
    const thisTotal = this.totalSeconds * (this._invert ? -1 : 1);
    const otherTotal = other.totalSeconds * (other._invert ? -1 : 1);
    return thisTotal - otherTotal;
  }
  isGreaterThan(other) {
    return this.compareTo(other) > 0;
  }
  isLessThan(other) {
    return this.compareTo(other) < 0;
  }
  equals(other) {
    return this.compareTo(other) === 0;
  }
  // クローンメソッド
  clone() {
    const interval = new JsCarbonInterval(
      this._years,
      this._months,
      this._days,
      this._hours,
      this._minutes,
      this._seconds,
      this._milliseconds,
      this._invert
    );
    interval._absolute = this._absolute;
    if (this._start) interval._start = this._start.clone();
    if (this._end) interval._end = this._end.clone();
    return interval;
  }
  // 国際化関連のメソッド
  static setLocale(locale) {
    if (!TRANSLATIONS[locale]) {
      throw new Error(`Unsupported locale: ${locale}`);
    }
    JsCarbonInterval._locale = locale;
  }
  static getLocale() {
    return JsCarbonInterval._locale;
  }
  getTranslation() {
    return TRANSLATIONS[JsCarbonInterval._locale];
  }
}

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

JsCarbon.DAYS_IN_WEEK = 7;
// デフォルトロケールの設定
JsCarbon.defaultLocale = "en";
JsCarbonInterval._locale = "en";

export const TRANSLATIONS = {
  ja: {
    months: {
      long: [
        "1月",
        "2月",
        "3月",
        "4月",
        "5月",
        "6月",
        "7月",
        "8月",
        "9月",
        "10月",
        "11月",
        "12月",
      ],
      short: [
        "1月",
        "2月",
        "3月",
        "4月",
        "5月",
        "6月",
        "7月",
        "8月",
        "9月",
        "10月",
        "11月",
        "12月",
      ],
    },
    days: {
      long: [
        "日曜日",
        "月曜日",
        "火曜日",
        "水曜日",
        "木曜日",
        "金曜日",
        "土曜日",
      ],
      short: ["日", "月", "火", "水", "木", "金", "土"],
    },
    relative: {
      future: "{value}後",
      past: "{value}前",
      s: "数秒",
      m: "1分",
      mm: "{value}分",
      h: "1時間",
      hh: "{value}時間",
      d: "1日",
      dd: "{value}日",
      M: "1ヶ月",
      MM: "{value}ヶ月",
      y: "1年",
      yy: "{value}年",
    },
  },
  en: {
    months: {
      long: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ],
      short: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
    },
    days: {
      long: [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      short: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    },
    relative: {
      future: "in {value}",
      past: "{value} ago",
      s: "a few seconds",
      m: "a minute",
      mm: "{value} minutes",
      h: "an hour",
      hh: "{value} hours",
      d: "a day",
      dd: "{value} days",
      M: "a month",
      MM: "{value} months",
      y: "a year",
      yy: "{value} years",
    },
  },
  fr: {
    months: {
      long: [
        "janvier",
        "février",
        "mars",
        "avril",
        "mai",
        "juin",
        "juillet",
        "août",
        "septembre",
        "octobre",
        "novembre",
        "décembre",
      ],
      short: [
        "janv.",
        "févr.",
        "mars",
        "avr.",
        "mai",
        "juin",
        "juil.",
        "août",
        "sept.",
        "oct.",
        "nov.",
        "déc.",
      ],
    },
    days: {
      long: [
        "dimanche",
        "lundi",
        "mardi",
        "mercredi",
        "jeudi",
        "vendredi",
        "samedi",
      ],
      short: ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."],
    },
    relative: {
      future: "dans {value}",
      past: "il y a {value}",
      s: "quelques secondes",
      m: "une minute",
      mm: "{value} minutes",
      h: "une heure",
      hh: "{value} heures",
      d: "un jour",
      dd: "{value} jours",
      M: "un mois",
      MM: "{value} mois",
      y: "un an",
      yy: "{value} ans",
    },
  },
  de: {
    months: {
      long: [
        "Januar",
        "Februar",
        "März",
        "April",
        "Mai",
        "Juni",
        "Juli",
        "August",
        "September",
        "Oktober",
        "November",
        "Dezember",
      ],
      short: [
        "Jan.",
        "Feb.",
        "März",
        "Apr.",
        "Mai",
        "Juni",
        "Juli",
        "Aug.",
        "Sept.",
        "Okt.",
        "Nov.",
        "Dez.",
      ],
    },
    days: {
      long: [
        "Sonntag",
        "Montag",
        "Dienstag",
        "Mittwoch",
        "Donnerstag",
        "Freitag",
        "Samstag",
      ],
      short: ["So.", "Mo.", "Di.", "Mi.", "Do.", "Fr.", "Sa."],
    },
    relative: {
      future: "in {value}",
      past: "vor {value}",
      s: "einigen Sekunden",
      m: "einer Minute",
      mm: "{value} Minuten",
      h: "einer Stunde",
      hh: "{value} Stunden",
      d: "einem Tag",
      dd: "{value} Tagen",
      M: "einem Monat",
      MM: "{value} Monaten",
      y: "einem Jahr",
      yy: "{value} Jahren",
    },
  },
  zh: {
    months: {
      long: [
        "一月",
        "二月",
        "三月",
        "四月",
        "五月",
        "六月",
        "七月",
        "八月",
        "九月",
        "十月",
        "十一月",
        "十二月",
      ],
      short: [
        "1月",
        "2月",
        "3月",
        "4月",
        "5月",
        "6月",
        "7月",
        "8月",
        "9月",
        "10月",
        "11月",
        "12月",
      ],
    },
    days: {
      long: [
        "星期日",
        "星期一",
        "星期二",
        "星期三",
        "星期四",
        "星期五",
        "星期六",
      ],
      short: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],
    },
    relative: {
      future: "{value}后",
      past: "{value}前",
      s: "几秒",
      m: "1分钟",
      mm: "{value}分钟",
      h: "1小时",
      hh: "{value}小时",
      d: "1天",
      dd: "{value}天",
      M: "1个月",
      MM: "{value}个月",
      y: "1年",
      yy: "{value}年",
    },
  },
  ko: {
    months: {
      long: [
        "1월",
        "2월",
        "3월",
        "4월",
        "5월",
        "6월",
        "7월",
        "8월",
        "9월",
        "10월",
        "11월",
        "12월",
      ],
      short: [
        "1월",
        "2월",
        "3월",
        "4월",
        "5월",
        "6월",
        "7월",
        "8월",
        "9월",
        "10월",
        "11월",
        "12월",
      ],
    },
    days: {
      long: [
        "일요일",
        "월요일",
        "화요일",
        "수요일",
        "목요일",
        "금요일",
        "토요일",
      ],
      short: ["일", "월", "화", "수", "목", "금", "토"],
    },
    relative: {
      future: "{value} 후",
      past: "{value} 전",
      s: "몇 초",
      m: "1분",
      mm: "{value}분",
      h: "1시간",
      hh: "{value}시간",
      d: "1일",
      dd: "{value}일",
      M: "1개월",
      MM: "{value}개월",
      y: "1년",
      yy: "{value}년",
    },
  },
  es: {
    months: {
      long: [
        "enero",
        "febrero",
        "marzo",
        "abril",
        "mayo",
        "junio",
        "julio",
        "agosto",
        "septiembre",
        "octubre",
        "noviembre",
        "diciembre",
      ],
      short: [
        "ene.",
        "feb.",
        "mar.",
        "abr.",
        "may.",
        "jun.",
        "jul.",
        "ago.",
        "sep.",
        "oct.",
        "nov.",
        "dic.",
      ],
    },
    days: {
      long: [
        "domingo",
        "lunes",
        "martes",
        "miércoles",
        "jueves",
        "viernes",
        "sábado",
      ],
      short: ["dom.", "lun.", "mar.", "mié.", "jue.", "vie.", "sáb."],
    },
    relative: {
      future: "en {value}",
      past: "hace {value}",
      s: "unos segundos",
      m: "un minuto",
      mm: "{value} minutos",
      h: "una hora",
      hh: "{value} horas",
      d: "un día",
      dd: "{value} días",
      M: "un mes",
      MM: "{value} meses",
      y: "un año",
      yy: "{value} años",
    },
  },
  pt: {
    months: {
      long: [
        "janeiro",
        "fevereiro",
        "março",
        "abril",
        "maio",
        "junho",
        "julho",
        "agosto",
        "setembro",
        "outubro",
        "novembro",
        "dezembro",
      ],
      short: [
        "jan.",
        "fev.",
        "mar.",
        "abr.",
        "mai.",
        "jun.",
        "jul.",
        "ago.",
        "set.",
        "out.",
        "nov.",
        "dez.",
      ],
    },
    days: {
      long: [
        "domingo",
        "segunda-feira",
        "terça-feira",
        "quarta-feira",
        "quinta-feira",
        "sexta-feira",
        "sábado",
      ],
      short: ["dom.", "seg.", "ter.", "qua.", "qui.", "sex.", "sáb."],
    },
    relative: {
      future: "em {value}",
      past: "há {value}",
      s: "alguns segundos",
      m: "um minuto",
      mm: "{value} minutos",
      h: "uma hora",
      hh: "{value} horas",
      d: "um dia",
      dd: "{value} dias",
      M: "um mês",
      MM: "{value} meses",
      y: "um ano",
      yy: "{value} anos",
    },
  },
};
