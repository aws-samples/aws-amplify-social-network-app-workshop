+++
title = "Timeline機能: @function"
date = 2020-03-18T10:09:51+09:00
weight = 4
pre = "<b>5.4. </b>"
+++

FollowRelationship APIと、Timeline APIが作成できました。
ここでは`createPostAndTimeline`Lambda Resolverを作成します。
その役割は、以下です。

1. `createPost`Mutationを行い、Post Tableに新たなPostを作成
1. FollowRelationship Tableを読み、APIコールしたユーザーのフォロワーを取得
1. Timeline Tableに、各フォロワーがフォロイーのPost内容を読み取れるよう、アイテムを作成

{{< figure src="/images/50_follow_timeline/architecture_lambda.png" title="" class="center" width="50%">}}

### amplify add function
`$ amplify add function`を実行します。いくつか質問されるので、以下のように入力してください。

{{% notice warning %}}
`Select the category`と`Select the operations...`の項目は複数選択式となります。
該当項目までカーソルで移動後、__スペースキー__を押すことで選択でき、Enterキーを押すことで選択が確定し次の項目に移ります。
スペースキーで選択ができていることを確認してください。
{{% /notice %}}

- Select which capability you want to add: `Lambda function (serverless function)`
- Provide a friendly name for your resource to be used as a label for this category in the project: `createPostAndTimeline`
- Provide the AWS Lambda function name: `createPostAndTimeline`
- Choose the runtime that you want to use: `NodeJS`
- Choose the function template that you want to use: `Hello World`
- Do you want to configure advanced settings? `Yes`
- Do you want to access other resources in this project from your Lambda function? `Yes`
- Select the category `api`
- Select the operations you want to permit for BoyakiGql `Query, Mutation`
- Do you want to invoke this function on a recurring schedule? `No`
- Do you want to configure Lambda layers for this function? `No`
- Do you want to edit the local lambda function now? `No`

{{% notice tip %}}
`$ amplify add function`では、いくつかのテンプレートが用意されています。
例えば`Lambda Trigger`を選択すると、`@model`で作成したAmazon DynamoDB Tableの変更を検知してAWS Lambda関数を実行するDynamoDB Streamsがセットアップできたりします。
詳細は[こちら](https://docs.amplify.aws/cli/function#graphql-from-lambda)。
{{% /notice %}}


### createPostAndTimeline Mutationの作成
`createPostAndTimeline`Mutationを作成し、GraphQL API経由で先ほど作成したLambda関数を呼び出せるようにしましょう。
`./amplify/backend/api/BoyakiGql/schema.graphql`に次のコードを追加します。

```graphql
type Mutation
{
  createPostAndTimeline(
		content: String!
	): Post
    @function(name: "createPostAndTimeline-${env}")
    @auth(rules: [
      {allow: private, provider: userPools},
    ])
}
```

- `type Mutation`配下に`createPostAndTimeline`のように書く事で、Mutationを追加できます
- `createPostAndTimeline`
  - String型の`content`を引数にします
  - 返り値は以前定義した`Post`型となります
- `@function`
  - `@function`を利用する事で、Lambda Resolverを設定できます
  - 先ほど作成したLambda関数の名前は`createPostAndTimeline`でしたが、実際に作成されるAWS Lambda関数のリソース名には`-`つなぎで`env`名が追加された形になります
    - 今回は3.1.で作成した`production` envで作業しているため、作成されるリソース名は`createPostAndTimeline-production`になります
    - Amplify Envについて、詳しくは第7章で扱っていきます
- `@auth`
  - おなじみの`@auth`で、Amazon Cognito User Poolsで認証されたユーザーであればだれでも、`createPostAndTimeline` Mutationを実行することが可能です

### 既存APIへのアクセス権の追加
今まではGraphQL APIをコールするのはAmazon Cognito User Poolsで認証されたユーザーだけでした。
そのためLambda関数は`listFollowRelationship`や`createPost`といったOperationを実行することができません。
ここではLambda関数がこれらのOperationを実行できるようにします。

```graphql
type Post
  @model (
    mutations: {create: "createPost", delete: "deletePost", update: null}
    timestamps: null
    subscriptions: { level: public}
  )
  @auth(rules: [
        {allow: owner, ownerField:"owner", provider: userPools, operations:[read, create]}
        {allow: private, provider: userPools, operations:[read]}
        {allow: private, provider: iam ,operations:[create]} #追加
  ])
```

```graphql
type FollowRelationship
    @model(
        mutations: {create: "createFollowRelationship", delete: "deleteFollowRelationship", update: null}
        timestamps: null
    )
	@auth(rules: [
		{allow: owner, ownerField:"followerId", provider: userPools, operations:[read, create]}
		{allow: private, provider: userPools, operations:[read]}
		{allow: private, provider: iam ,operations:[read]} #追加
	])
```

現在の`schema.graphql`は以下のようになっています。

{{%attachments title="./amplify/backend/api/BoyakiGql/schema.graphql" pattern="schema.graphql"/%}}

### AWS Lambda関数のコードの編集
作成したLambda関数は`./amplify/backend/function/createPostAndTimeline`配下に設定ファイルが格納されています。

以下の`index.js`の中身をコピーし、`./amplify/backend/function/createPostAndTimeline/src/index.js`を置き換えてください。

{{%attachments title="./amplify/backend/function/createPostAndTimeline/src/index.js" pattern="index.js"/%}}

また次のスクリプトをターミナルで実行し、Lambda関数の実行に必要なライブラリをインストールしてください。

```bash
cd ./amplify/backend/function/createPostAndTimeline/src
npm install --save aws-appsync@3.0.2 graphql-tag@2.10.3 node-fetch@2.6.0
cd ../../../../..
```

ポイントは以下です。

#### 他のプロジェクト内リソースへのアクセス

```js
/* Amplify Params - DO NOT EDIT
You can access the following resource attributes as environment variables from your Lambda function
var environment = process.env.ENV
var region = process.env.REGION
var apiGraphqlapiGraphQLAPIIdOutput = process.env.API_BOYAKIGQL_GRAPHQLAPIIDOUTPUT
var apiGraphqlapiGraphQLAPIEndpointOutput = process.env.API_BOYAKIGQL_GRAPHQLAPIENDPOINTOUTPUT

Amplify Params - DO NOT EDIT */
```

- ファイルの先頭には`$ amplify add function`を実行した際にアクセスするよう指定した他カテゴリのリソースに関する情報が記載されています
- 例えば`process.env.API_BOYAKIGQL_GRAPHQLAPIENDPOINTOUTPUT`でGraphQL のエンドポイントが参照できます

#### Postのバリデーション

```js
if(event.arguments.content.length > 140) {
    callback('content length is over 140', null);
}
```
- `event.arguments.content`: 
  - AWS Lambdaが呼び出された時の引数は`event`オブジェクトに格納されています
  - AppSyncがLambdaを呼び出した際、GraphQLのOperationを実行した際の入力は`event.arguments`に格納されています
- 140字を超えていた場合、すぐさまエラーを返します
- これにより、GraphQL APIリクエストをアプリ経由でなくマニュアルで作成してAPIコールするようなHackでも140字制限を超えたPostを作成することができなくなります

#### 環境に応じたAppSync Clientセットアップ

```js
if ('AWS_EXECUTION_ENV' in process.env && process.env.AWS_EXECUTION_ENV.startsWith('AWS_Lambda_')) {
    //for cloud env
    env = process.env;
    graphql_auth = {
        type: "AWS_IAM",
        credentials: {
            accessKeyId: env.AWS_ACCESS_KEY_ID,
            secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
            sessionToken: env.AWS_SESSION_TOKEN,
        }
    };
    graphql_endoint = env.apiGraphqlapiGraphQLAPIEndpointOutput;
} else {
    // for local mock
    env = {
        API_GRAPHQLAPI_GRAPHQLAPIENDPOINTOUTPUT: 'http://192.168.1.2:20002/graphql',
        REGION: 'us-east-1',
    }
    graphql_auth = {
        type: "AWS_IAM",
        credentials: {
            accessKeyId: 'mock',
            secretAccessKey: 'mock',
            sessionToken: 'mock',
        }
    };
}

if (!graphqlClient) {
    graphqlClient = new AWSAppSyncClient({
        url: env.API_GRAPHQLAPI_GRAPHQLAPIENDPOINTOUTPUT,
        region: env.REGION,
        auth: graphql_auth,
        disableOffline: true,
    });
}
```

- `if('AWS_EXECUTION_ENV'...`では、このコードが動いてる環境がAWS Lambdaかそれ以外かを判定しています
  - local mockの条件分岐では、AWS Lambdaから渡される環境変数を手動で設定しています
  - `API_GRAPHQLAPI_GRAPHQLAPIENDPOINTOUTPUT`の`http://192.168.1.2:20002/graphql`のIPアドレスは、**ご自身の環境に合わせて書き換えてください**
- 現時点でAmplifyのJavaScriptライブラリはNode.jsランタイムで動作しないため、AWS Lambda関数からAWS AppSyncを呼び出す際には[AWS AppSync SDK](https://docs.amplify.aws/lib/graphqlapi/query-data?platform=js#using-aws-appsync-sdk)を利用します

#### createPost Mutationの実行

```js
//post to the origin
const postInput = {
    mutation: gql(createPost),
    variables: {
        input: {
            type: 'post',
            timestamp: Math.floor(Date.now() / 1000),
            owner: event.identity.username,
            content: event.arguments.content,
        },
    },
};
const res = await graphqlClient.mutate(postInput);
const post = res.data.createPost;
```

- `const res = await graphqlClient.mutate(postInput)`でPostを作成します
  - ownerやtype、timestampなどをサーバーサイドで付与することにより不正なMutationを防ぎます
- `event.identity.username`: Postを実行したユーザー情報の取得
  - AWS Lambdaが呼び出された時の引数は`event`オブジェクトに格納されています
  - AppSyncがLambdaを呼び出した際、GraphQLのOperationを実行したユーザー情報は`event.identity`に格納されています

#### Postしたユーザーのフォロワーの取得

```js
const queryInput = {
    followeeId: event.identity.username,
    limit: 100000,
}
const listFollowRelationshipsResult = await graphqlClient.query({
    query: gql(listFollowRelationships),
    fetchPolicy: 'network-only',
    variables: queryInput,
});
const followers = listFollowRelationshipsResult.data.listFollowRelationships.items;
```

- `graphqlClient.query`
  - `fetchPolisty`を`network-only`にすることにより、つねにキャッシュデータでなくAppSyncからデータを取ってきます

{{% notice tip %}}
AmplifyでセットアップしたAppSyncがLambda関数を呼び出す時の`event`の構造については[こちら](https://docs.amplify.aws/cli/graphql-transformer/directives#structure-of-the-function-event)をご覧ください。
{{% /notice %}}

#### Timelineの作成

```js
//post to timeline
followers.push({
    followerId: post.owner,
})
const results = await Promise.all(followers.map((follower)=> createTimelineForAUser({follower: follower, post: post})));
```

- `followers.push...`の箇所では、Post作成者のTimelineに表示するよう、`followers`にPost作成者の`Username`を追加しています
- `const results...`では、フォロワーごとに`createTimelineForAUser`メソッドを呼び出し、Timelineアイテムの作成を行なっています

```js
const createTimelineForAUser = async ({follower, post}) => {
    const timelineInput = {
        mutation: gql(createTimeline),
        variables: {
            input: {
                userId: follower.followerId,
                timestamp: post.timestamp,
                postId: post.id,
            },
        },
    }
    const res = await graphqlClient.mutate(timelineInput);
}
```

### Amplify Mockingによる動作確認

{{% notice info%}}
Amplify Mocking(手元での動作確認)には20002番ポートが利用可能である必要があり、一部の Cloud IDE では利用できないことがあります。
該当するCloud IDEをご利用の方は本手順は実施せず、雰囲気を味わっていただけますと幸いです。
{{% /notice %}}

#### createPostAndTimeline
{{% notice info%}}
`$ amplify mock api`のログに、`Could not find ref for "apiBoyakiGqlGraphQLAPIIdOutput". Using unsubstituted value.`
`Could not find ref for "apiBoyakiGqlGraphQLAPIEndpointOutput". Using unsubstituted value.`と出る場合がありますが、気にせず以下の手順を実施頂くことができます。
{{% /notice %}}

1. 左下の`ADD NEW Query`と書いてある場所をクリックし、`Mutation`を選択したのち`+`をクリックします
1. 左のペインにある`createPostAndTimeline`をクリックし、`content`に140字以内の内容を入力しましょう
1. 画面上部の`Update Auth`をクリックし、`Username`を5.1で作成した`test_followee`に変更し、`Generate Token`をクリックします
1. **▶︎**をクリックしてGraphQLのMutationを実行します
1. `timestamp`、`id`など、作成したPostが右側のペインに表示されることを確認します

![](/images/50_follow_timeline/createPostAndTimeline.png)

#### createPostAndTimeline バリデーションの確認
1. 左のペインにある`createPostAndTimeline`をクリックし、`content`に141字以上の内容を入力しましょう。
1. **▶︎**をクリックしてGraphQLのMutationを実行します
1. 右側のペインにエラーメッセージが表示されることを確認します。

{{% notice tip %}}
141字以上のテキストを作成する際は、作成したフロンエンドアプリケーションを利用すると捗ります。(140字越えるとエラーがでるため)
{{% /notice %}}

![](/images/50_follow_timeline/createPostAndTimeline_error.png)

#### listTimelines

1. 左下の`ADD NEW Mutation`と書いてある場所をクリックし、`Query`を選択したのち`+`をクリックします。
1. 左のペインにある`listTimeline`をクリックし、次の図を参考にQueryを作成していきます
  1. `userId`に`test_follower`を入力します。
1. 画面上部の`Update Auth`をクリックし、`Username`を5.1で作成した`test_follower`にします
1. **▶︎**をクリックしてGraphQLのQueryを実行します
1. 先ほど作成したPostが表示されることを確認します

![](/images/50_follow_timeline/listTimelines_2.png)