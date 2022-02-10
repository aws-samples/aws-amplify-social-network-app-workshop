+++
title = "全文検索機能の追加"
date = 2020-03-24T10:09:52+09:00
weight = 6
chapter = true
pre = "<b>6. </b>"
+++

### Story
Timeline/Follow機能をリリースした結果、ユーザーからは非常に好評でした。
その一方、Global Timeline以外にも、自分の興味のあるユーザーにリーチする機能がほしいというフィードバックが上がっています。
アプリケーションに全文検索機能を組み込み、ユーザーが興味のあるワードが含まれたPostを検索できるようにしましょう。

### 本セクションで実装するもの
- `@searchable`を利用した全文検索機能をPostに追加

{{< figure src="/images/60_full_text_search/architecture.png" title="Back-end" class="center" width="50%">}}

{{< figure src="/images/60_full_text_search/front.png" title="Front-end" class="center" width="100%">}}

{{% children showhidden="false" %}}{{% /children%}}