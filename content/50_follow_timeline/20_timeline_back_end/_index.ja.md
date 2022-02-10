+++
title = "Timeline機能: Back-end"
date = 2020-03-18T10:09:50+09:00
weight = 3
pre = "<b>5.3. </b>"
+++

フォロー機能が実装できたので、次はユーザー固有のタイムラインをハンドリングするGraphQL APIを実装していきましょう。

{{< figure src="/images/50_follow_timeline/architecture_timeline.png" title="" class="center" width="50%">}}

### Timeline APIの作成
Timelineテーブルを作成し、特定のユーザーがフォローしているユーザーのポストにアクセスできるようにしましょう。
`./amplify/backend/api/BoyakiGql/schema.graphql`に次のコードを追加します。

```graphql
type Timeline 
	@model(
    mutations: {create: "createTimeline", delete: null, update: null}
    timestamps: null
  )
	@auth(rules: [
    {allow: owner, ownerField: "userId", provider: userPools, operations:[read, create]},
    {allow: private, provider: iam ,operations:[create]},
	])
	@key(fields: ["userId", "timestamp"])
{
	userId: ID!
	timestamp: Int!
	postId: ID!
	post: Post @connection(fields: ["postId"])
}
```

ポイントを見ていきましょう。

- `@model`
  - `mutations:...`では必要のないudpate、delete用APIを作らない設定をします
  - `timestamps:...`では、デフォルトで自動的に付与される`updatedAt``createdAt`の属性を作らない設定をします。代わりにAWS Timestamp属性の`timestamp`を用います。
- `@auth`
  - `{allow: owner...`では、OwnerであるユーザーのみがTimelineのQuery/Subscriptionを実行できるよう設定しています。
    - Subscriptionを行うためには`read``create`、この2つの権限が必要です
  - `{allow: private...`では、後ほど作成するAWS Lambda関数がTimeline APIのMutationを実行できるようにIAM認証によるアクセスを許可しています
- `@key`
  - あるユーザーがTimelineを閲覧するときには、`userId`が自分の`Username`と一致するアイテムを時系列順でフェッチすることになります
  - `userId`がPartition Key(PK)、`timestamp`をSort Key(SK)とすることで、自身のTimelineを時系列順にフェッチすることが可能です
- `@connection`
  - Timeline APIの役割は、あるユーザーのPostを、そのフォロワーのTimelineに複製することで、各ユーザー固有のTimelineを実現することでした
  - 複製する際に、まるごとPostのフィールドをTimelineのフィールドに複製することも可能ですが、例えば"いいね"や、"返信"機能を実装する際に、フィールドをアップデートすべき箇所がPostとTimelineにまたがってしまうと大変です
  - `@connection`を使用することで、AWS AppSyncがQueryを処理する際に、複数のDynamoDB Tableにまたがるデータを結合してくれるようになります
  - `fields`では、Post TableのPrimary Keyを指定しています。Timeline Tableの`postId`フィールドにPostの`id`を格納しています。Postは`id`フィールドがPrimary Keyでしたので、`postId`だけを渡してやれば、一意にアイテムが識別できます


### GraphQL APIの認証方法にIAMを追加
Timeline APIのMutationを実行してTimelineアイテムを作成するのはAWS Lambda関数の役割です。
Lambda関数がAWS AppSyncのAPIコールを行う最も簡単な認証方法は、AWS IAMのIAM Roleを利用することです。
3.2.で`$ amplify add api`によりGraphQL APIを作成した際には、Amazon Cognito User Poolsのみを認証方法として設定していました。
ここではさらにAWS IAMを認証方法として追加します。

`$ amplify update api`をターミナルで実行し、次のように質問に答えていきましょう。

```
amplify update api
```

- Please select from one of the below mentioned services: `GraphQL`
- Select from the options below: `Update auth settings`
- Choose the default authorization type for the API `Amazon Cognito User Pool`
- Configure additional auth types? `Yes`
- Choose the additional authorization types you want to configure for the API `IAM`

{{% notice warning %}}
`Choose the additional authorization types...`の項目は複数選択式となります。
`IAM`までカーソルで移動後、__スペースキー__を押すことで`IAM`が選択でき、Enterキーを押すことで選択が確定し次の項目に移ります。
スペースキーで選択ができていることを確認してください。
{{% /notice %}}

{{% notice info %}}
このように、Amplifyでは一度作成したリソースを変更するために`$ amplify udpate`コマンドを利用することができます。ただし、AuthカテゴリでプロビジョニングするAmazon CognitoのIDとしてどのフィールドを指定するか？といった設定など、一部後から変更できないものがあることに注意してください。
{{% /notice %}}

### Amplify Mockingによる動作確認
`$ amplify mock api`を実行して、Timeline APIが期待通り動くかを確認しましょう。

{{% notice info%}}
Amplify Mocking(手元での動作確認)には20002番ポートが利用可能である必要があり、一部の Cloud IDE では利用できないことがあります。
該当するCloud IDEをご利用の方は本手順は実施せず、雰囲気を味わっていただけますと幸いです。
{{% /notice %}}

```bash
amplify mock api
```

すでにAmplify GraphQL Explorerをブラウザで開かれている方は、変更を読み込むためページの更新をお願いします。

#### createTimeline
まずはTimelineアイテムを作成してみます。

1. 左のペインにある`listPosts`をクリックし、`items`直下にある`id`、`owner`、`timestamp`にチェックをつけます
1. **▶︎**をクリックしてGraphQLのQueryを実行すると、右側のペインにPost一覧が表示されるので、うち一つの`id`、`timestamp`をメモしておきます。(Postが一つも存在しない場合は、3.2.の手順に従いPostを新規に作成します)
1. 左下の`ADD NEW Query`と書いてある場所をクリックし、`Mutation`を選択したのち`+`をクリックします
1. 左のペインにある`createTimeline`をクリックし、次図のようにチェックボックスやフィールド埋めてみましょう
  1. このとき、先ほどメモしたPostの`id`、`timestamp`を使用します
  1. `userId`は`test_follower`にしておきます
1. `createTimeline`を実行できるのはIAM認証のユーザーのみです。画面上部の`Use: User Pool`をクリックし、`Use: IAM`に変更しましょう
1. **▶︎**をクリックしてGraphQLのMutationを実行します

![](/images/50_follow_timeline/createTimeline.png)

#### listTimelines

次に作成したTimelineアイテムのリストを表示してみます。

1. 左のペインにある`listTimelines`をクリックし、次図のようにチェックボックスやフィールド埋めてみましょう
1. `listTimelines`を実行できるのはCognito User Pools認証された、`Timeline`の`userId`フィールドと同じ`Username`をもつユーザーのみです
  1. 画面上部の`Update Auth`をクリックし、`Cognito User Pool`に変更します
  1. さらに`Username`を`test_follower`にかえ`Generate Token`をクリックします
1. **▶︎**をクリックしてGraphQLのQueryを実行します
1. 右側のペインに結果が表示されます。先ほど作成したTimelineが表示されていることを確認してください
  1. `@connection`により、`postId`に紐づくPostが`post`フィールドに展開されています


{{% notice info %}}
作成したTimelineが表示されない場合、`Update Auth`を押して`Username`を確認し、`listTimelines`の`userId`引数に渡している値と一致しているか確認してください。TimelineはOwnerにしか`read`が許されていないため、他のユーザーのクレデンシャルでQueryを発行しても取得ができません。
{{% /notice %}}

![](/images/50_follow_timeline/listTimelines.png)