# API ドキュメント

## クラス: `JsCarbon`

### コンストラクタ

- `JsCarbon(date?: Date, timezone?: string, locale?: LocaleType)`
  - date (オプション): 基準とする日付。指定しない場合、現在の日付を使用します。
  - timezone (オプション): タイムゾーンを指定。省略するとシステムのタイムゾーンが使用されます。
  - locale (オプション): 言語設定を指定。省略するとデフォルトのロケールが使用されます。

### Static Methods

- `setDefaultLocale(locale: LocaleType): void`

  - デフォルトロケールを設定します。指定したロケールがサポートされていない場合、エラーをスローします。

  - 引数
    - locale (LocaleType): 設定するロケールコード（例: "en", "ja" など）

- `setDefaultTimezone(timezone: string): void`

  - デフォルトタイムゾーンを設定します。指定したタイムゾーンがサポートされていない場合、エラーをスローします。

  - 引数
    - timezone (string): 設定するタイムゾーンコード（例: "America/New_York", "Asia/Tokyo" など）

- `now(timezone?: string, locale?: LocaleType): JsCarbon`

  - 現在の日付と時刻を含む JsCarbon インスタンスを作成します。

  - 引数
    - timezone (string, オプション): タイムゾーン（例: "Asia/Tokyo"）
    - locale (LocaleType, オプション): ロケール

- `parse(dateString: string, timezone?: string, locale?: LocaleType): JsCarbon`

  - 日付文字列から JsCarbon インスタンスを作成します。

  - 引数
    - dateString (string): 日付文字列（例: "2023-10-01"）
    - timezone (string, オプション): タイムゾーン
    - locale (LocaleType, オプション): ロケール

- `create(year: number, month: number, day: number, hour?: number, minute?: number, second?: number): JsCarbon`

  - 指定した年月日および時刻から JsCarbon インスタンスを作成します。

  - 引数
    - year (number): 年
    - month (number): 月（1-12）
    - day (number): 日
    - hour (number, オプション): 時（デフォルト: 0）
    - minute (number, オプション): 分（デフォルト: 0）
    - second (number, オプション): 秒（デフォルト: 0）

- `fromTimestamp(timestamp: number): JsCarbon`

  - UNIXタイムスタンプから JsCarbon インスタンスを作成します。

  - 引数
    - timestamp (number): UNIXタイムスタンプ

### 基本メソッド

- `toDateString(): string`
  日付を "YYYY-MM-DD" 形式で取得します。

- `toTimeString(): string`
  時刻を "HH:mm" 形式で取得します。

- `format(formatStr: string): string`  
  指定した形式で日付をフォーマットします。

- `toISOString(): string`
  ISO 8601 形式で日付を取得します。

- `day(): number`  
  日を取得します。

- `month(): number`  
  月を取得します。

- `year(): number`  
  年を取得します。

### 日付操作メソッド

- `addDays(days: number): JsCarbon`  
  指定した日数を加算します。

- `subDays(days: number): JsCarbon`  
  指定した日数を減算します。

- `addMonths(months: number): JsCarbon`  
  指定した月数を加算します。

- `subMonths(months: number): JsCarbon`  
  指定した月数を減算します。

- `addYears(years: number): JsCarbon`  
  指定した年数を加算します。

- `subYears(years: number): JsCarbon`  
  指定した年数を減算します。

- `setDay(day: number): JsCarbon`  
  日を設定します。

- `setMonth(month: number): JsCarbon`  
  月を設定します。

- `setYear(year: number): JsCarbon`  
  年を設定します。

- `startOfWeek(): JsCarbon`  
  週の始まりの日付に設定します。

- `endOfWeek(): JsCarbon`  
  週の終わりの日付に設定します。

- `startOfMonth(): JsCarbon`  
  月の始まりの日付に設定します。

- `endOfMonth(): JsCarbon`  
  月の終わりの日付に設定します。

- `startOfYear(): JsCarbon`  
  年の始まりの日付に設定します。

- `endOfYear(): JsCarbon`  
  年の終わりの日付に設定します。

- `next(dayOfWeek: number): JsCarbon`  
  次の指定した曜日の日付に移動します。

- `previous(dayOfWeek: number): JsCarbon`  
  前の指定した曜日の日付に移動します。

### 比較メソッド

- `diffInMonths(other: JsCarbon): number`  
  他の日付との差を月数で取得します。

- `diffInYears(other: JsCarbon): number`  
  他の日付との差を年数で取得します。

- `isBefore(other: JsCarbon): boolean`  
  指定した日付より前かどうかを判定します。

- `isAfter(other: JsCarbon): boolean`  
  指定した日付より後かどうかを判定します。

- `isSameDay(other: JsCarbon): boolean`  
  同じ日付かどうかを判定します。

### タイムゾーン操作

- `setTimezone(timezone: string): JsCarbon`
  タイムゾーンを設定します。

- `timezone(): string`
  現在のタイムゾーンを取得します。

- `timezoneOffset(): string`  
  タイムゾーンのオフセットを取得します。

- `inTimezone(timezone: string): JsCarbon`  
  指定したタイムゾーンで新しいインスタンスを取得します。

- `isDST(): boolean`  
  夏時間かどうかを判定します。

- `utc(): JsCarbon`  
  UTC タイムゾーンに設定します。

- `toTimezoneString(timezone?: string): string`  
  指定したタイムゾーンでフォーマットされた日付文字列を取得します。

- `toISOStringWithTimezone(): string`  
  タイムゾーン情報付きの ISO 形式の文字列に変換します。

- `diffInHoursWithTimezone(timezone: string): number`  
  指定したタイムゾーンとの時間差を取得します。

- `getTimezoneAbbreviation(): string`  
  タイムゾーンの略称を取得します。

- `isSameTimezone(other: JsCarbon): boolean`  
  同じタイムゾーンかどうかを判定します。

### ロケール設定

- `setLocale(locale: LocaleType): JsCarbon`
  ロケール（言語設定）を変更します。対応言語は英語・日本語・フランス語・ドイツ語・中国語・韓国語・スペイン語・ポルトガル語（"en" | "ja" | "fr" | "de" | "zh" | "ko" | "es" | "pt"）。

- `toLocaleDateString(options?: Intl.DateTimeFormatOptions): string`
  現在のロケールとタイムゾーンに従ってフォーマットされた日付文字列を取得します。

- `toLocaleTimeString(options: Intl.DateTimeFormatOptions = {}): string`  
  ローカライズされた時刻文字列を取得します。

- `toLocaleString(options: Intl.DateTimeFormatOptions = {}): string`  
  ローカライズされた日付時刻文字列を取得します。

- `monthName(): string`  
  現在の月の名前を取得します。

- `shortMonthName(): string`  
  現在の月の短縮名を取得します。

- `dayName(): string`  
  現在の曜日の名前を取得します。

- `shortDayName(): string`  
  現在の曜日の短縮名を取得します。

- `localizedFormat(formatStr: string): string`  
  ローカライズされた形式で日付をフォーマットします。

- `diffForHumans(other: JsCarbon = JsCarbon.now()): string`  
  人間が読みやすい相対時間を返します。

### その他のメソッド

- `isToday(): boolean`  
  今日の日付かどうかを判定します。

- `isTomorrow(): boolean`  
  明日の日付かどうかを判定します。

- `isYesterday(): boolean`  
  昨日の日付かどうかを判定します。

- `isLeapYear(): boolean`  
  うるう年かどうかを判定します。

- `isWeekend(): boolean`  
  週末かどうかを判定します。

- `isWeekday(): boolean`  
  平日かどうかを判定します。

- `clone(): JsCarbon`
  インスタンスのコピーを生成します。

- `toRelativeTime(): string`
  現在からの相対的な時間を表現した文字列を返します（例："3 days ago" や "in 2 months"）。

- `toJsDate(): Date`  
  Javascriptの `Date` オブジェクトを返します。

- `toString(): string`  
  日付を文字列として返します。
