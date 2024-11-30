# JsCarbonInterval クラス

JsCarbonInterval は、日付と時間の間隔（期間）を表現し、操作するための強力なクラスです。PHP の Carbon ライブラリの Interval 機能を JavaScript で再現し、直感的な日時間隔の管理を可能にします。

## 主な機能

- 年、月、日、時間、分、秒、ミリ秒単位の期間の作成と操作
- 期間の加算、減算、乗算、除算
- 様々な単位での期間の合計計算（月、日、時間、分、秒）
- 国際化対応の相対的な期間フォーマット
- 期間の比較と符号の管理
- 開始日と終了日に基づく期間の自動計算

## 使用例

```typescript
// 期間の作成
const interval1 = JsCarbonInterval.years(2);
const interval2 = JsCarbonInterval.months(6).addDays(15);

// 期間の操作
const combinedInterval = interval1.plus(interval2);
console.log(combinedInterval.format()); // "2y 6m 1d 2w"

// 相対的な表現
console.log(interval1.forHumans()); // "in 2 years"

// 期間の比較
const moreThanAYear = JsCarbonInterval.days(400);
console.log(moreThanAYear.isGreaterThan(interval1)); // false

// 開始日と終了日に基づく期間
const start = JsCarbon.create(2023, 1, 1);
const end = JsCarbon.create(2024, 7, 15);
const diffInterval = JsCarbonInterval.fromDiff(start, end);
console.log(diffInterval.format()); // 1y 6m 2w
```

## API ドキュメント

### コンストラクタ

```typescript
constructor(
  (years = 0),
  (months = 0),
  (days = 0),
  (hours = 0),
  (minutes = 0),
  (seconds = 0),
  (milliseconds = 0),
  (invert = false)
);
```

期間を表すインスタンスを作成します。各パラメータはデフォルトで0に設定されています。

### Static Methods

#### `create()`

期間を作成する汎用的なスタティックメソッド。指定された単位の期間を生成します。

```typescript
static create(years?: number, months?: number, days?: number, hours?: number, minutes?: number, seconds?: number, milliseconds?: number): JsCarbonInterval
```

#### 単一単位の期間作成メソッド

指定された単一の単位の期間を作成します。

- `static years(years: number): JsCarbonInterval`
- `static months(months: number): JsCarbonInterval`
- `static days(days: number): JsCarbonInterval`
- `static hours(hours: number): JsCarbonInterval`
- `static minutes(minutes: number): JsCarbonInterval`
- `static seconds(seconds: number): JsCarbonInterval`

#### `fromDiff()`

2つの日付間の期間を計算して作成します。オプションで絶対値モードを指定できます。

```typescript
static fromDiff(start: JsCarbon, end: JsCarbon, absolute?: boolean): JsCarbonInterval
```

#### `setLocale()`

期間表示のための言語ロケールを設定します。

```typescript
static setLocale(locale: LocaleType): void
```

### 基本メソッド

#### 期間の追加メソッド

現在の期間に指定された単位を追加します。メソッドチェーンをサポートします。

- `addYears(years: number): JsCarbonInterval`
- `addMonths(months: number): JsCarbonInterval`
- `addDays(days: number): JsCarbonInterval`
- `addHours(hours: number): JsCarbonInterval`
- `addMinutes(minutes: number): JsCarbonInterval`
- `addSeconds(seconds: number): JsCarbonInterval`

#### 期間の演算メソッド

期間に対して演算を実行し、新しい期間インスタンスを返します。

- `plus(other: JsCarbonInterval): JsCarbonInterval`
- `minus(other: JsCarbonInterval): JsCarbonInterval`
- `multiply(factor: number): JsCarbonInterval`
- `divide(divisor: number): JsCarbonInterval`

#### フォーマットメソッド

期間を文字列表現に変換します。

- `format(syntax?: "traditional" | "relative"): string`
- `forHumans(): string`

### 総計算メソッド

異なる単位での期間の総計を返します。

- `totalMonths: number`
- `totalDays: number`
- `totalHours: number`
- `totalMinutes: number`
- `totalSeconds: number`

### 比較メソッド

- `compareTo(other: JsCarbonInterval): number`
  二つの期間を比較し、差を返します。

- `isGreaterThan(other: JsCarbonInterval): boolean`
  現在の期間が指定された期間より長いかを判定します。

- `isLessThan(other: JsCarbonInterval): boolean`
  現在の期間が指定された期間より短いかを判定します。

- `equals(other: JsCarbonInterval): boolean`
  二つの期間が等しいかを判定します。

### その他のメソッド

- `clone(): JsCarbonInterval`
  現在のインターバルの完全なコピーを作成します。

### Getters

期間の各単位の値を返します。

- `years: number`
- `months: number`
- `days: number`
- `weeks: number`
- `hours: number`
- `minutes: number`
- `seconds: number`
- `milliseconds: number`

## 注意点

- fromDiffメソッドを使って、開始・終了日時を特定しない場合は、期間の計算は概算に基づいて行われます（例：1ヶ月 = 30日）
- 負の値や符号の処理に注意が必要です
- 国際化対応のため、ロケールの設定が可能です
