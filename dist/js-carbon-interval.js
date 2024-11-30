import { TRANSLATIONS } from "./i18n/translations.js";
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
JsCarbonInterval._locale = "en";
