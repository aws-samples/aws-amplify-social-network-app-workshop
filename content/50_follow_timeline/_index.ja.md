+++
title = "Follow/Timeline機能の実装"
date = 2020-03-18T10:09:49+09:00
weight = 5
chapter = true
pre = "<b>5. </b>"
+++

### Story
サービス公開後、順調にユーザー数は増加しています。
ユーザー数が増加するにつれ、すべてのPostを追うのが辛くなってきました。
そこでユキとあなたは、ユーザーがフォローしている人のPostだけを表示するタイムライン機能を実装することにします。
タイムライン機能に合わせて必要なフォロー機能も実装していきましょう。

### 本セクションで実装するもの
- Follow関係を保存・取得するためのAPIとDB(FollowRelationship Table)
- 各ユーザーがフォローするユーザーのPost一覧を保存・取得するためのAPIとDB(Timeline Table)
- Follow関係に基づき、Post作成時にフォロワーのTimeline Tableに書き込むLambda Resolver
  - 今までは直接Post Tableに読み書きしていました
  - 今後はPost作成はLambda Resolverを介して行います

{{< figure src="/images/50_follow_timeline/architecture.png" title="" class="center" width="50%">}}

### 本セクションの目次
{{% children showhidden="false" %}}{{% /children%}}