+++
title = "Follow機能: Back-end"
date = 2020-03-18T10:09:49+09:00
weight = 1
pre = "<b>5.1. </b>"
+++

まずは、タイムラインの実装に必要なフォロー機能を提供するGraphQL APIを実装していきます。

{{< figure src="/images/50_follow_timeline/architecture_follow.png" title="" class="center" width="50%">}}

### GraphQL APIの作成
FollowRelationshipテーブルを作成し、あるユーザーが他のユーザーをフォローしている状態を保存できるようにしましょう。
`./amplify/backend/api/BoyakiGql/schema.graphql`に、次のコードを追加します。

```graphql
type FollowRelationship
	@model(
    mutations: {create: "createFollowRelationship", delete: "deleteFollowRelationship", update: null}
    timestamps: null
  )
	@auth(rules: [
		{allow: owner, ownerField:"followerId", provider: userPools, operations:[read, create, delete]},
		{allow: private, provider: userPools, operations:[read]}
	])
	@key(fields: ["followeeId", "followerId"])
{
	followeeId: ID!
	followerId: ID!
	timestamp: Int!
}
```

ポイントは以下です。

- フィールド
  - `followeeId`はフォローされている人の`username`です。
  - `followerId`はフォローしている人の`username`です。
  - `tiemstamp`はフォローした日時です。
- `@model`
  - `mutations:...`では必要のないudpate用APIを作らない設定をします
  - `timestamps:...`では、デフォルトで自動的に付与される`updatedAt``createdAt`の属性を作らない設定をします。代わりにAWS Timestamp属性の`timestamp`を用います。
- `@auth`
  - `{allow: owner...`により、ユーザーは自分を`follower`としたFollowRelationshipの作成と閲覧ができます
  - `{allow: private...`では他のユーザーのFollowRelasionshipの閲覧を許可しています
- `@key`
  - `name`や`queryField`を指定しない場合、DynamoDB Table自体のPartition Key(PK)やSecondary Key(SK)を設定することができます
  - 今回、Postを投稿したユーザーのフォロワーのTimelineにPostを複製するため、ある`followeeId`に紐づくFollowRelationship一覧を取得する必要があります
  - そのため`followeeId`をPK、`followerId`をSKに指定します

### Mockingによる動作確認
`$ amplify mock api`を実行して、FollowRelationship APIが期待通り動くかどうか確認しましょう。

{{% notice info%}}
Amplify Mocking(手元での動作確認)には20002番ポートが利用可能である必要があり、一部の Cloud IDE では利用できないことがあります。
該当するCloud IDEをご利用の方は本手順は実施せず、雰囲気を味わっていただけますと幸いです。
{{% /notice %}}

```bash
amplify mock api

{中略}

AppSync Mock endpoint is running at http://XXX.XXX.XXX.XXX:20002
```

Mock endpointをコピーし、任意のブラウザでアクセスします。

#### createFollowRelationship
まず、FollowRelationshipを作成してみましょう。

1. 左下の`ADD NEW Query`と書いてある場所をクリックし、`Mutation`を選択したのち`+`をクリックします。
1. `Update Auth`ボタンを押して、`Username`を`test_follower`にします
1. 左のペインにある`createFollowRelationship`をクリックし、次図のようにチェックボックスやフィールド埋めてみましょう。
  1. `followeeId`: `test_followee`
  1. `followerId`: `test_follower`
1. **▶︎**をクリックしてGraphQLのMutationを実行します。

![](/images/50_follow_timeline/follow_mutation.png)

{{% notice info %}}
`Unauthorized Error`が発生する場合、`Update Auth`ボタンを押して現在Mutationを発行しているユーザーの`Username`と、`followerId`が一致していることを確かめてください。`@auth`で設定した通り、フォローするユーザー(=フォロワー)しか`createFollowRelationship`を実行できません。エラーが発生しなかった方は`followerId`を別の`Username`として実行し、`Unauthorized Error`が発生することを確かめてみてください。
{{% /notice %}}

#### listFollowRelationships
次に、あるユーザーのフォロワー一覧を取得してみます。

1. 左下の`ADD NEW Mutation`と書いてある場所をクリックし、`Query`を選択したのち`+`をクリックします。
1. 左のペインにある`listFollowRelationship`をクリックし、次図のようにチェックボックスやフィールド埋めてみましょう。
  1. `followeeId`: `test_followee`
1. **▶︎**をクリックしてGraphQLのQueryを実行します。
1. 右側のペインに結果が表示されます。先ほど作成したFollowRelationshipが表示されていることを確認してください。

![](/images/50_follow_timeline/listFollower.png)