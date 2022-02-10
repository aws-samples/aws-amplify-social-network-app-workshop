+++
title = "Post機能: Back-end(1)"
date = 2020-03-18T10:09:47+09:00
weight = 3
pre = "<b>3.3. </b>"
+++

認証機能が実装できたところで、Postを管理するGraphQL APIを作成していきましょう。

{{< figure src="/images/30_mock/architecture_api.png" title="GraphQL API" class="center" width="50%">}}

### GraphQL APIの作成
`$ amplify add api`をターミナルで実行します。いくつか質問されるので、以下のように入力してください。

```sh
amplify add api
```

いくつか質問されるので、以下のように入力してください。

- Please select from one of the below mentioned services: `GraphQL`
- Provide API name: `BoyakiGql`
- Choose the default authorization type for the API: `Amazon Cognito User Pool`
- Do you want to configure advanced settings for the GraphQL API: `No, I am done.`
- Do you have an annotated GraphQL schema? `No`
- Choose a schema template: `Single object with fields (e.g., “Todo” with ID, name, description)`
- Do you want to edit the schema now? `No`

{{% notice tip %}}
GraphQLを選択すると、GraphQLのマネージドサービスであるAWS AppSyncがプロビジョニングされます。AWS AppSyncはIAM認証、API KEY認証、Amazon Cognito User Pool認証、OIDC認証の四つの認証が用意されており、この中の一つ、あるいは複数を同時に使用することが可能です。
ちなみに、RESTを選択するとAWS API Gateway + AWS Lambda + Amazon DynamoDB がプロビジョニングされます[[参考](https://docs.amplify.aws/cli/restapi)]。
{{% /notice %}}

### Post型の作成
AWS Amplifyでは`./amplify/backend/api/BoyakiGql/schema.graphql`を編集することによって、自由にGraphQL APIの挙動をコントロールすることが可能です。
schema.graphqlを編集して、Post(投稿)を管理するAPIを作成しましょう。

以下の内容をコピーして、`./amplify/backend/api/BoyakiGql/schema.graphql`を置き換えてください。

```graphql
type Post
  @model (
    mutations: {create: "createPost", delete: "deletePost", update: null}
    timestamps: null
    subscriptions: { level: public }
  )
  @auth(rules: [
    {allow: owner, ownerField:"owner", provider: userPools, operations:[read, create, delete]}
    {allow: private, provider: userPools, operations:[read]}
  ])
{
  type: String! # always set to 'post'. used in the SortByTimestamp GSI
  id: ID
  content: String!
  owner: String
  timestamp: Int!
}
```

- `@model`(model directive)をつけると、Post型の定義に沿ったAmazon DynamoDB Tableや、CRUDのためのQuery/Mutation/Subscriptionを自動作成します。[[詳細](https://docs.amplify.aws/cli/graphql-transformer/model#model)]
  - Postをupdateする必要はないので、`mutations: ...`の引数でupdate用のAPIを作成しない設定にしています。[詳細](https://docs.amplify.aws/cli/graphql-transformer/model#usage)
  `timestamps:...`では、デフォルトで自動的に付与される`updatedAt``createdAt`の属性を作らない設定をします。代わりにAWS Timestamp属性の`timestamp`を用います。
- `@auth`(auth directive)をつけると、Post型に対するQuery/Mutationの認可戦略を実装できます。[[詳細](https://docs.amplify.aws/cli/graphql-transformer/auth)]
  - `{allow: owner, ...`では、Postの作成者(owner)に対して、`read`と`create`と`delete`を許可しています。
  - `{allow: private,...`では、Cognito User Poolsで認証された全てのユーザーに対して`read`を許可しています。
- `content`は`String`型のフィールドで、`!`がついているため必須フィールドです。
- `type`フィールドは後ほど使用します。常に`"post"`が入ります。

{{% notice tip %}}
GraphQLには、`ID`、`String`、`Int`といったスカラー型が用意されていますが、AWS AppSyncにはこれらに加えて`AWSTimestamp`、`AWSURL`、`AWSPhone`といった独自のスカラー型が用意されています。[[参考](https://docs.aws.amazon.com/ja_jp/appsync/latest/devguide/scalars.html)]
{{% /notice %}}


### Amplify Mocking

{{% notice info%}}
Amplify Mocking(手元での動作確認)には20002番ポートが利用可能である必要があり、一部の Cloud IDE では利用できないことがあります。
該当するCloud IDEをご利用の方は本手順は実施せず、雰囲気を味わっていただけますと幸いです。
{{% /notice %}}

`$ amplify push`はAWS CloudFormationのスタックの参照と変更を行うため、それなりに時間がかかってしまいます。
`$ amplify mock`コマンドを使用すると、`$ amplify push`でクラウドリソースに変更反映する前に、変更後の動作確認をローカル環境で行うことが可能です。
一旦、Amplify Mockingを利用してスキーマの挙動を確認してみましょう。

```bash
amplify mock api
```

**最後の質問、`Enter maximum statement depth`で`3`と答える**ことに注意して、以下のように選択肢に答えていきます。

- Choose the code generation language target `javascript`
- Enter the file name pattern of graphql queries, mutations and subscriptions `src/graphql/**/*.js`
- Do you want to generate/update all possible GraphQL operations - queries, mutations and subscriptions `Yes`
- Enter maximum statement depth [increase from default if your schema is deeply nested] `3`

{{% notice tip%}}
ここではGraphQLのQuery/Mutation/Subscriptionを行うための`codegen`コマンドの設定を行なっています。
`maximum statement depth`では、schema.graphqlの`type`のネスト構造をどこまで読み取るかを設定します。
設定を変えたい場合は`$ amplify update codegen`コマンドにより同様の設定を行うことが可能です。
{{% /notice %}}

立ち上がると、`AppSync Mock endpoint is running at http://XXX.XXX.XXX.XXX:20002`と表示されます。`http://XXX.XXX.XXX.XXX:20002`を、ブラウザの検索バーに貼り付けアクセスします。(XXXのIPアドレス部分はご自身の環境によって変化します。また、コンテナをお使いの方は`localhost:20002`にアクセスしてください。)

![](/images/30_mock/graphql_1.png)

#### createPost
まず、Postを作成してみましょう。

1. 左下の`ADD NEW Query`と書いてある場所をクリックし、`Mutation`を選択したのち`+`をクリックします。
1. 左のペインにある`createPost`をクリックし、次図のようにチェックボックスやフィールド埋めてみましょう。
1. **▶︎**をクリックしてGraphQLのMutationを実行します
1. 右側のペインに結果が表示されます。inputに渡していないidやownerが自動的に付与されていることを確認してください
1. 後ほど`listPosts`の検証をするため、適当にいくつか`timestamp`の異なるPostを足しておきましょう

{{% notice tip %}}
現在時刻のUnix Timestampを取得したい場合は、ターミナルで`$ date +%s`を実行しましょう。
{{% /notice %}}

![](/images/30_mock/graphql_2.png)

#### listPosts
次に、作成したPostの一覧を取得してみましょう。

1. 左下の`ADD NEW Mutation`と書いてある場所をクリックし、`Query`を選択したのち`+`をクリックします。
1. 左のペインにある`listPosts`をクリックし、次図のようにチェックボックスやフィールド埋めてみましょう。
1. **▶︎**をクリックしてGraphQLのQueryを実行します。
1. 右側のペインに結果が表示されます。先ほど作成したPostが表示されていることを確認してください
  1. また、表示される順序が作成した順序とはならないこともご確認ください
1. 確認が終了したら`$ amplify mock api`が動いてるターミナルで`Ctrl + C`を実行し、Amplify Mockingを停止します

![](/images/30_mock/listPosts.png)

