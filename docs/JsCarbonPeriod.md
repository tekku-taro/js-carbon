# JsCarbonPeriod クラス

JsCarbonPeriod は、日付範囲と反復処理を簡単に管理するための JavaScript ユーティリティクラスです。特定の期間内の日付を生成、フィルタリング、操作するための柔軟な API を提供します。

## 主な機能

- 日付範囲の作成と反復
- 異なる時間単位（年、月、週、日、時間、分、秒）でのインターバル設定
- 日付フィルタリング
- イテレータおよび配列としての日付範囲の操作
- 柔軟な日付範囲の設定と変更

## 使用例

```typescript
// 特定の期間内の日付を生成
const period = JsCarbonPeriod.create("2024-01-01", "2024-06-01")
  .days(10) // 10日ごとの間隔
  .filter("isWeekend") // 週末のみ
  .toArray();

// 現在から特定の日付までの期間
const sinceLastMonth = JsCarbonPeriod.since("2024-11-01").untilNow().toArray();

// カスタムフィルターを使用
const customPeriod = JsCarbonPeriod.between("2024-01-01", "2024-12-31")
  .days(15)
  .filter((date) => {
    return date.day() > 15;
  })
  .toArray();
```

## API ドキュメント

### コンストラクタ

#### `constructor(options?: RecurrenceOptions)`

期間オプションを使用して新しいJsCarbonPeriodインスタンスを作成します。

- `options.start`: 期間の開始日 (オプション、デフォルトは現在日時)
- `options.end`: 期間の終了日 (オプション、デフォルトは現在日時)
- `options.interval`: 期間のインターバル (オプション、デフォルトは "1 day")
- `options.recurrences`: 繰り返し回数 (オプション)

### Static Methods

#### `JsCarbonPeriod.create(start, intervalOrEnd, end?): JsCarbonPeriod`

期間を作成するファクトリメソッド。複数のパターンをサポートします。

#### `JsCarbonPeriod.between(start, end): JsCarbonPeriod`

開始日と終了日の間の期間を作成します。

#### `JsCarbonPeriod.since(date): JsCarbonPeriod`

指定された日付から現在までの期間を作成します。

#### `JsCarbonPeriod.until(date): JsCarbonPeriod`

期間の開始を現在の日付とし、指定された日付までの期間を作成します。

#### `JsCarbonPeriod.untilNow(): JsCarbonPeriod`

期間の開始を現在の日付とし、現在までの期間を作成します。

### 期間単位設定メソッド

各メソッドは指定された単位と値で期間を設定し、新しいJsCarbonPeriodインスタンスを返します。

- `years(value?: number): JsCarbonPeriod`
- `months(value?: number): JsCarbonPeriod`
- `weeks(value?: number): JsCarbonPeriod`
- `days(value?: number): JsCarbonPeriod`
- `hours(value?: number): JsCarbonPeriod`
- `minutes(value?: number): JsCarbonPeriod`
- `seconds(value?: number): JsCarbonPeriod`

### インスタンスメソッド

#### `since(date): JsCarbonPeriod`

現在のインスタンスから新しい期間を作成し、指定された日付から開始します。

#### `until(date): JsCarbonPeriod`

現在のインスタンスから新しい期間を作成し、指定された日付まで延長します。

#### `untilNow(): JsCarbonPeriod`

現在のインスタンスから新しい期間を作成し、現在の日時まで延長します。

### データ取得メソッド

#### `toArray(): JsCarbon[]`

期間内のすべての日付を配列として返します。

#### `toArrayReverse(): JsCarbon[]`

期間内のすべての日付を逆順の配列として返します。

#### `count(): number`

期間内の日付の総数を返します。

#### `first(): JsCarbon`

期間の最初の日付を返します。

#### `last(): JsCarbon | null`

期間の最後の日付を返します。

### フィルタリングメソッド

#### `filter(callback: ((date: JsCarbon) => boolean) | string): JsCarbonPeriod`

期間内の日付にフィルターを適用し、新しいJsCarbonPeriodインスタンスを返します。

#### `clearFilters(): JsCarbonPeriod`

すべてのフィルターをクリアします。

### その他のメソッド

#### `setStartDate(start: JsCarbon | string | Date): JsCarbonPeriod`

期間の開始日を設定します。

#### `setEndDate(end: JsCarbon | string | Date): JsCarbonPeriod`

期間の終了日を設定します。

#### `setRecurrences(recurrences: number): JsCarbonPeriod`

期間の繰り返し回数を設定します。

#### `debug(): void`

現在の期間の設定をコンソールに出力します（デバッグ用）。

## 注意点

- すべてのメソッドは新しいJsCarbonPeriodインスタンスを返し、元のインスタンスは変更されません。
- フィルタリングは柔軟で、カスタム関数や組み込みのJsCarbonメソッドを使用できます。
- 安全装置として、イテレーションの最大回数は1000回に制限されています。
