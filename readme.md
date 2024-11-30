# JsCarbon

JsCarbon は、PHP の [Carbon](https://carbon.nesbot.com/) ライブラリを参考に JavaScript で作成した日付と時間の操作を簡便に行えるライブラリです。Moment.js や Day.js のように使いやすく、純粋な JavaScript で実装されています。日付や時間の計算、フォーマット、比較、ローカライズといった多くの機能を提供します。

## インストール

現在、JsCarbon は Node.js 環境またはブラウザに直接インポートして使用できます。

ブラウザ環境で直接利用する場合:

```html
<script type="module">
  import { JsCarbon } from "path/to/js-carbon.all.js";

  // 以下省略...
</script>
```

## 主な機能

- 日付・時間の操作
- フォーマット・変換
- 日付の比較
- ローカライズ（英語・日本語・フランス語・ドイツ語・中国語・韓国語・スペイン語・ポルトガル語）
- タイムゾーン
- 時間間隔 (JsCarbonInterval) や期間 (JsCarbonPeriod) のサポート

## ドキュメント

- [JsCarbon API ドキュメント](docs/JsCarbonAPI.md)
- [JsCarbonInterval クラスの詳細](docs/JsCarbonInterval.md)
- [JsCarbonPeriod クラスの詳細](docs/JsCarbonPeriod.md)-

## 使い方

```js
// 現在日時のインスタンス生成
const now = JsCarbon.now();

// 日付のフォーマット
console.log(now.format("YYYY-MM-DD HH:mm:ss"));

// 日付の加算/減算
now.addDays(5);
console.log("日付の加算 +5", now.toDateString()); // 5日後
now.subDays(5);
// 日付のクローン
const cloned = now.clone();
console.log("日付のクローン 5カ月後", cloned.addMonths(5).toDateString()); // 5カ月後
console.log("日付のクローン 現在", now.toDateString()); // 現在

// 時差を含む日付の操作
const other = JsCarbon.create(2023, 5, 15);
console.log("時差を含む日付の操作", now.diffInDays(other)); // 他の日付との日数差

// 日付の比較
if (now.isBefore(other)) {
  console.log("今は2023-5-15より前です。");
}
if (now.isAfter(other)) {
  console.log("今は2023-5-15より後です。");
}

// タイムゾーンの設定
const nyTime = JsCarbon.now("America/New_York");
console.log("タイムゾーンの設定", nyTime.toLocaleString()); // ニューヨーク時間で表示

// ロケールの設定
now.setLocale("ja");
console.log("ロケールの設定", now.toLocaleDateString());

// デフォルトロケールを設定
JsCarbon.setDefaultLocale("ja");

// 日本語ロケールで東京時間の現在時刻を作成
const tokyo = JsCarbon.now("Asia/Tokyo", "ja");

// フランス語ロケールでパリ時間に変換
const paris = tokyo.clone().setLocale("fr").setTimezone("Europe/Paris");

// ローカライズされた日付表示
console.log("日本語形式ローカライズされた日付表示", tokyo.toLocaleDateString()); // 日本語形式
console.log(
  "フランス語形式ローカライズされた日付表示",
  paris.toLocaleDateString()
); // フランス語形式

// 相対時間表示も各ロケールで
console.log("日本語ロケール相対時間表示", tokyo.diffForHumans()); // 「3時間前」など
console.log("フランス語ロケール相対時間表示", paris.diffForHumans()); // "il y a 3 heures" など
```

## ライセンス

JsCarbon は MIT ライセンスのもとで提供されます。
