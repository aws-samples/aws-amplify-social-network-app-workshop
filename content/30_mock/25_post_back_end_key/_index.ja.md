+++
title = "Post機能: Back-end(2)"
date = 2020-03-18T10:09:47+09:00
weight = 4
pre = "<b>3.4. </b>"
+++

本セクションではクライアントアプリケーションから効率的にクエリを投げられるように2つのQueryをAPIに追加します。

### Amazon DynamoDBのPartition KeyとSort Key
`@model`でプロビジョニングされるAmazon DynamoDBは、任意のスケールで1桁ミリ秒のパフォーマンスを提供するキーバリュー/ドキュメントデータベースですが、この速度を享受するにはアクセスパターンを考えて設計する必要があります。
DynamoDBのクエリは、最大で二つのAttribute(AppSyncのフィールド)を使うのがよいとされます。
この二つのAttributeはPartition Key(PK)とSort Key(SK)と呼ばれます。
DynamoDBはPK単体をプライマリキー(Tableにおけるユニークな識別子)、あるいはPKとSKを組み合わせてプライマリキーとして利用することができます。

@keyの主な役割は、このPKとSKを指定することにあります。
PKとSKを使わずにクエリを書く場合、DynamoDBのTableの中身全てをスキャンすることになり、非常に効率が悪いです。
効率が悪いと、クエリに時間がかかるだけでなく、従量課金制であるためにコストもかさんでしまいます。

今回はどのようにPK、SKを設計すれば良いのでしょうか？

### 必要なクエリを考えてみよう
Postには自動でIDを振りたいですし、Post単体を`getPost`Queryで`id`を指定して引っ張って来るためにも、作成したDynamoDB TableのPartition Key(PK)は`id`フィールドのままで良いでしょう。

{{% notice tip %}}
`createPost`の引数で`id`フィールドが空の場合、AmplifyでセットアップしたAppSyncは自動的にIDを生成して`id`フィールドに埋めます。
今回は、このIDの自動生成機能を利用するため、`id`を必須フィールドにしていません。(`id`を必須にしてしまうと`createPost`Mutation実行時に`id`をクライアント側で渡す必要があるため)
{{% /notice %}}

ただ、Postの一覧を取得する際には時系列に並んでいて欲しい一方、先程確認した通り、`listPost`ではランダムな順序でフェッチすることしかできません。
このような場合は`@key`を使用することでDynamoDBのインデックスを作成し、特定のフィールドを引数にしたQueryを作成します。

{{% notice info%}}
`@key`の使用時にDynamoDBでセットアップされるインデックスはGlobal Secondary Indexと呼ばれます。
Global Secondary Indexの詳細な説明は省かせていただきますが、ざっくりいうとPKとSKを変えたTableをもう一つ作成し、スキャンを回避して高速に特定のクエリを実行するための機能です[[参考](https://docs.aws.amazon.com/ja_jp/amazondynamodb/latest/developerguide/GSI.html)]。
{{% /notice %}}

ここで、クライアントアプリケーションがどのような形式でデータをフェッチしたいか考えてみましょう。

1. 全てのつぶやきを時系列順にリスト
1. 特定のユーザーによるつぶやきをリスト

### 必要なクエリを@keyに落とし込む

これを実現する`@key`を書いてみます。
`./amplify/backend/api/BoyakiGql/schema.graphql`を編集して、
`type Post`を以下の内容に置き換えましょう。

```graphql
type Post
  @model (
    mutations: {create: "createPost", delete: "deletePost", update: null}
    timestamps: null
    subscriptions: { level: public}
  )
  @auth(rules: [
    {allow: owner, ownerField:"owner", provider: userPools, operations:[read, create, delete]}
    {allow: private, provider: userPools, operations:[read]}
  ])
  @key(name: "SortByTimestamp", fields:["type", "timestamp"], queryField: "listPostsSortedByTimestamp")
  @key(name: "BySpecificOwner", fields:["owner", "timestamp"], queryField: "listPostsBySpecificOwner")
{
  type: String! # always set to 'post'. used in the SortByTimestamp GSI
  id: ID
  content: String!
  owner: String
  timestamp: Int!
}
```

`@key`で使用する項目は以下の三つです。

- name: DynamoDBのインデックス(Global Secondary Index)の名前
- fields: ひとつめがPartition Keyに利用するフィールド、二つ目がSort Keyに利用するフィールドです。ひとつだけ書くと、Partition Keyのみがセットアップされます。
- queryField: `getPost`のような、GraphQLのqueryの名前です。

今回足した`@key`はどのようなクエリを可能にするのでしょうか？

- `listPostsSortedByTimestamp`
  - 常に`"post"`が格納される`type`フィールドをPKにすることで、全てのPostをフェッチすることができます
  - `timestamp`をSortKeyにすることで、`timestamp`での昇降順ソートが可能になります
- `listPostsBySpecificOwner`
  - PKに`owner`を指定することで、ある`owner`のPostをリストアップすることができます。
  - `timestamp`をSortKeyにすることで、`timestamp`での昇降順ソートが可能になります

### Amplify Mockによる挙動の確認
挙動を確認するために再度Amplify GraphQL Explorerをみてみましょう。

{{% notice info%}}
Amplify Mocking(手元での動作確認)には20002番ポートが利用可能である必要があり、一部の Cloud IDE では利用できないことがあります。
該当するCloud IDEをご利用の方は本手順は実施せず、雰囲気を味わっていただけますと幸いです。
{{% /notice %}}

#### @keyの変更の反映
`@key`を複数同時に追加した際は、`$ amplify mock api`を一度止め、再度実行する必要があります。

```bash
Ctrl + C
amplify mock api
```

また、Amplify GraphQL Explorerのウェブページを更新しておいてください。

#### Postの作成
異なる二つのユーザーから、`timestamp`が異なるPostを複数作成します。

1. まず、現在のユーザー(`Username`は`user`)で`timestamp`が異なる複数のPostを作成しておきましょう
1. 画面上部の`Update Auth`をクリックし、`Username`を`user_2`などに編集したのち、`Generate Token`をクリック
1. Postのリストを表示するため、先ほどの手順を参照しつつ、いくつかPostを作成しておきます。

![](/images/30_mock/graphql_change_auth.png)

#### @keyで追加したQueryの動作確認

1. `query`に先ほど追加した`listPostsSortedByTimestamp`と、`listPostsBySpecificOwner`が追加されていることが確認できます。
1. `listPostsSortedByTimestamp`を選択し、図のようにフィールドを埋めます。
1. 同時に`listPostsBySpecificOwner`を選択し、図のようにフィールドを埋めます。
1. **▶︎**をクリックしてGraphQLのQueryを実行します。(このようにGraphQLは同時に複数のQueryを一回のAPIコールで実行できます)
1. `listPostsSortedByTimestamp`ではすべての`owner`によるPostが`timestamp`の順に表示されていることを確認しましょう
1. `listPostsBySpecificOwner`では特定の`owner`によるPostのみが`timestamp`の順に表示されていることを確認しましょう
1. 確認が終了したら`$ amplify mock api`が動いてるターミナルで`Ctrl + C`を実行し、Amplify Mockingを停止します。Amplify GraphQL Explorerは後ほど利用するため、そのまま閉じずにおいて大丈夫です。

![](/images/30_mock/key.png)

{{% notice tip %}}
なぜAmplify Mockingを使うとよいのでしょうか？
本ワークショップでは手順上、出戻りやスキーマの大幅な修正がありません。
一方、実際の開発では初期の段階でスキーマを大幅に変更してトライアンドエラーを繰り返すことが多いと思います。
ここで困るのが`@key`で設定するDynamoDBのPK/SKは作成時しか設定ができないことです。
(DynamoDBの作り直しができない状況でPK/SKの変更をおこなう場合、`@key`でGSIを追加することで対処します。)
そのため、ある程度Amplify Mockingで開発を行い、仕様が固まってからクラウドに反映するのがベストプラクティスとなります。
{{% /notice %}}