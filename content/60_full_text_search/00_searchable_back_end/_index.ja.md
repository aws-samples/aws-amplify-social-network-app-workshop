+++
title = "全文検索機能: Back-end"
date = 2020-03-18T10:09:53+09:00
weight = 1
pre = "<b>6.1. </b>"
+++

AWS Amplifyを利用した全文検索機能の実装は非常にシンプルです。

### @searchable
`@searchable`ディレクティブを使用すると、該当のモデルを対象とした全文検索が可能になります。
`./amplify/backend/api/BoyakiGql/schema.graphql`を開き、編集します。

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
    {allow: private, provider: iam ,operations:[create]}
  ])
  @key(name: "SortByTimestamp", fields:["type", "timestamp"], queryField: "listPostsSortedByTimestamp")
  @key(name: "BySpecificOwner", fields:["owner", "timestamp"], queryField: "listPostsBySpecificOwner")
  @searchable
{
  type: String! # always set to 'post'. used in the SortByTimestamp GSI
  id: ID
  content: String!
  owner: String
  timestamp: Int!
}
```

現在の`schema.graphql`は以下のようになっています。

{{%attachments title="./amplify/backend/api/BoyakiGql/schema.graphql" pattern="schema.graphql"/%}}

{{% notice tip %}}
`@searchable`ディレクティブを使用すると、[Amazon DynamoDB Streams](https://docs.aws.amazon.com/ja_jp/amazondynamodb/latest/developerguide/Streams.html)と[Amazon Elasticsearch Service](https://aws.amazon.com/jp/elasticsearch-service/)がプロビジョニングされます。
該当のDynamoDB TableにInsertされたデータをDynamoDB Streamsがフックし、Elasticsearchへレコードを追加します。
フロントエンドからElasticsearchにクエリを投げるには、GraphQL APIにセットアップされる`searchPosts`というQueryを実行します。
`@searchable`ディレクティブが付与される前にInsertされたデータに関してはElasticsearchでクエリできませんのでご注意ください。
`@searchable`の詳細は[こちら](https://docs.amplify.aws/cli/graphql-transformer/directives#searchable)。
{{% /notice %}}


### 動作検証
残念ながら現在、`@searchable`はAmplify Mockingに対応しておりません。
そのため、今回はAWS AppSyncのマネジメントコンソールを用いて動作検証を行います。

#### クラウドへの変更反映

```bash
$ amplify push
```

実行には10分程度かかります。

#### Postの作成
`@searchable`ディレクティブが付与される前にInsertされたデータに関してはElasticsearchでクエリできないため、あらたにPostを作成しておきます。

1. `$ amplify status`コマンドを実行し、`Amplify hosting urls`の項目を確認してURLを確認します
1. 作成したアプリを通じて、いくつかPostを作成しておきます(後ほど検索することを考えて、投稿内容を頭に残しておきましょう)

#### AWS AppSync
1. [AWS AppSyncのマネジメントコンソール](https://us-east-1.console.aws.amazon.com/appsync/home?region=us-east-1#/apis)を開きます。
1. 今回作成したAPIを開きます(手順通り作成した場合は`BoyakiGql-production`という名前)
1. 左のメニューから`クエリ`を開きます
1. **▶︎**アイコンの右側にある、`ユーザープールでログイン`をクリックします
1. ログインしたいユーザーのUsername/PasswordとWebClient IDを入力します
  1. WebClientIDは、`./src/aws-exports.js`内の`aws_user_pools_web_client_id`の項目を参照します
  1. 例: `"aws_user_pools_web_client_id": "XXXXXXXXXXXxXXXXXXXXXXXXX"`のXXXXXX...の部分
1. 左側のペインに次のQueryを書き込みます。`Amplify`の部分には検索したいフレーズを入力しましょう
```
query MyQuery{
  searchPosts (
      filter: {content: { matchPhrase: "AWS Amplify"} }
  ){
      items{
          id
          content
          owner
      }
  }
}
```
1. `content`に入力したフレーズが含まれるPost一覧が取得できれば成功です

![](/images/60_full_text_search/searchPosts.png)

{{% notice tip%}}
`matchPhrase`はElasticsearchの`match_phrase`クエリに相当します。
半角スペース区切りで渡した検索キーワードが全てその順番に登場する場合にマッチします。
その他、`match`や`multiPhrase`、`wildcard`の使用や、`or``and`条件を利用した複雑なクエリも可能です。
`@searchable`で使用可能なクエリは[こちら](https://docs.amplify.aws/cli/graphql-transformer/directives#usage-5)をご参照ください。
{{% /notice %}}