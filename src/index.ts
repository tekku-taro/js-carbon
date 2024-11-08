// src/index.ts

export class JsCarbon {
  private date: Date;

  constructor(date: Date = new Date()) {
    this.date = date;
  }

  // クラスメソッド now
  static now(): JsCarbon {
    return new JsCarbon(new Date());
  }

  addDays(days: number): JsCarbon {
    const resultDate = new Date(this.date);
    resultDate.setDate(resultDate.getDate() + days);
    this.date = resultDate;
    return this;
  }

  // 日付を表示するためのメソッド
  toDate(): Date {
    return this.date;
  }

  // フォーマット済みの文字列を取得
  toString(): string {
    return this.date.toDateString();
  }
}
