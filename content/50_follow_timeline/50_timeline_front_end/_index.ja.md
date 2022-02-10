+++
title = "Timeline機能: Front-end"
date = 2020-03-18T10:09:52+09:00
weight = 5
pre = "<b>5.5. </b>"
+++

いよいよTimeline機能のフロントエンドを実装していきましょう。

### Timeline
`./src/containers/Timeline.js`を作成し、編集していきます。

```
touch ./src/containers/Timeline.js
```

以下の`Timeline.js`の中身をコピーし、`./src/containers/Timeline.js`を置き換えてください。

{{%attachments title="./src/containers/Timeline.js" pattern="Timeline.js"/%}}

主なポイントは以下です。

#### Timelineの取得

```js
const getPosts = async (type, currentUser, nextToken = null) => {
  const res = await API.graphql(graphqlOperation(listTimelines, {
    userId: currentUser.username,
    sortDirection: 'DESC',
    limit: 20, //default = 10
    nextToken: nextToken,
  }));
  dispatch({ type: type, posts: _.map(res.data.listTimelines.items, 'post') })
  setNextToken(res.data.listTimelines.nextToken);
  setIsLoading(false);
}
```

- `AllPosts.js`では`listPosts`を利用していましたが、今回は`listTimelines`を利用しています
- `userId`に現在のログインユーザーの`username`を指定しています

### Sidebar.jsとApp.jsにTimelineへの参照を追加

#### App.jsの変更
以下の`App.js`の中身をコピーし、`./src/App.js`を置き換えてください。

{{%attachments title="./src/App.js" pattern="App.js"/%}}

```js
<HashRouter>
  <Switch>
    <Route exact path='/' component={Timeline} />
    <Route exact path='/global-timeline' component={AllPosts} />
    <Route exact path='/:userId' component={PostsBySpecifiedUser}/>
    <Redirect path="*" to="/" />
  </Switch>
</HashRouter>
```

- `/`へアクセスがあった場合、これまでの`AllPosts`でなく、`Timeline`をレンダリングするよう変更しました

#### Sidebar.jsの変更
以下の`Sidebar.js`の中身をコピーし、`./src/containers/Sidebar.js`を置き換えてください。

{{%attachments title="./src/containers/Sidebar.js" pattern="Sidebar.js"/%}}

ポイントは以下です。

```js
const onPost = async () => {
  /** Before
  const res = await API.graphql(graphqlOperation(createPost, { input: {
    type: 'post',
    content: value,
    timestamp: Math.floor(Date.now() / 1000),
  }})); 
  */

  //After
  const res = await API.graphql(graphqlOperation(createPostAndTimeline, { content: value })); 

  setValue('');
}
```

- `createPost`の代わりに、新しく作成した`createPostAndTimeline`を呼び出すようにします


### クラウドへの反映
ここまでの内容をクラウドに反映しましょう。実行には数分かかります。

```bash
$ amplify publish
```

{{% notice warning %}}
`$ amplify mock api`を動かしている状態で`$ amplify push`や`$ amplify publish`を実行した場合、`Parameters: [authRoleName] must have values`というエラーがでて`$ amplify push`や`$ amplify publish`が失敗する場合があります。
その場合は、`Ctrl + C`で`$ amplify mock api`のプロセスを中断してから、`$ amplify push`や`$ amplify publish`を実行してください。
{{% /notice %}}

### 動作確認
1. ウェブブラウザで`https://production.XXXXXXXXXXX.amplifyapp.com`にアクセスし、ログインしましょう(ユーザーA)
1. 他のブラウザを用いて他のユーザー(ユーザーB)でログインしておきましょう
1. お互いのアカウントをフォローする前は、PostをしてもGlobal Timelineにしか相手のPostが表示されないことを確認します
1. ユーザーAのGlobal Timelineから、ユーザーBのPostのアイコンをクリックし、ユーザーBをフォローしましょう
1. フォロー後にユーザーBでPostを行い、ユーザーAのTimeline上にユーザーBのPostが表示されることを確認しましょう。

{{% notice tip %}}
現在はフォロー後に作成されたPostしかTimelineに表示されません。
フォローするまえのPostもTimelineに表示したい場合は、`createFollowRelationship`Mutationが実行された際に、Followeeの過去のPostをTimelineに複製するような実装が必要です。
(`$ amplify add function`で`@function`や、Amazon DynamoDB Streamsを実装することで実現できます)
{{% /notice %}}

{{% notice tip %}}
現在はフォロー解除後でも、フォローしてからフォロー解除するまでにTimelineに表示されたPostは残り続けます。
フォロー解除後に該当のユーザーのPostをTimelineから削除したい場合は、`deleteFollowRelationship`Mutationが実行された際に、Timelineから該当ユーザーのPostを削除する実装が必要です。
(`$ amplify add function`で`@function`や、Amazon DynamoDB Streamsを実装することで実現できます)
{{% /notice %}}