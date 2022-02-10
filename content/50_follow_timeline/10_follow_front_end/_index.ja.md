+++
title = "Follow機能: Front-end"
date = 2020-03-18T10:09:50+09:00
weight = 2
pre = "<b>5.2. </b>"
+++

次に、ユーザーをフォローするためのUIを作成していきましょう。
現在は、Global Timelineなどに表示されるユーザーのアイコンをクリックすると、そのユーザーのPost一覧を表示できるようになっています。
今回、この画面にフォローボタンを足していきます。

### PostsBySpecifiedUser
`./src/containers/PostsBySpecifiedUser.js`を編集していきます。

以下の`PostsBySpecifiedUser.js`の中身をコピーし、`./src/containers/PostsBySpecifiedUser.js`を置き換えてください。

{{%attachments title="./src/containers/PostsBySpecifiedUser.js" pattern="PostsBySpecifiedUser.js"/%}}

主な変更点は以下です。

#### useEffect()でログイン中のユーザー情報を取得

```js
useEffect(() => {
  //getPosts(INITIAL_QUERY); <-変更前

  //↓↓↓↓↓↓↓変更部分↓↓↓↓↓↓↓
  const init = async() => {
    const currentUser = await Auth.currentAuthenticatedUser();
    setCurrentUser(currentUser);

    setIsFollowing(await getIsFollowing({followeeId: userId, followerId: currentUser.username}));

    getPosts(INITIAL_QUERY);
  }
  init()
  //↑↑↑↑↑↑↑↑ここまで↑↑↑↑↑↑↑↑↑↑

  const subscription = API.graphql(graphqlOperation(onCreatePost)).subscribe({
    next: (msg) => {
      const post = msg.value.data.onCreatePost;
      if (post.owner !== userId) return;
      dispatch({ type: SUBSCRIPTION, post: post });
    }
  });
  return () => subscription.unsubscribe();
}, []);
```

- `useEffect()`内で、Amplify Authの`Auth.currentAuthenticatedUser`メソッドを呼び出し、現在のユーザー情報を取得しています。
- `getIsFollowing`関数を呼び出し、ログイン中のユーザーとアプリ上で表示されているユーザーのフォロー関係を取得し、`isFollowing`ステートに格納しています。

#### getIsFollowing()

```js
const getIsFollowing = async ({followerId, followeeId}) => {
  const res = await API.graphql(graphqlOperation(getFollowRelationship,{
    followeeId: followeeId,
    followerId: followerId,
  }));
  console.log(res)
  return res.data.getFollowRelationship !== null
}
```

- `getFollowRelationship` Queryを実行し、`followerId`を`Username`とするユーザーが、`followeeId`を`Username`とするユーザーをフォローしているか返す

#### フォローボタンのコンポーネントを追加

```js
<PostList
  isLoading={isLoading}
  posts={posts}
  getAdditionalPosts={getAdditionalPosts}
  listHeaderTitle={userId}

  //↓↓↓↓↓↓↓追加部分↓↓↓↓↓↓↓
  listHeaderTitleButton={
    ( currentUser && userId !== currentUser.username ) &&
    ( isFollowing ? 
      <Button  variant='contained' color='primary' onClick={unfollow}>Following</Button> 
    :
      <Button variant='outlined' color='primary' onClick={follow}>Follow</Button> 
    )
  }
  //↑↑↑↑↑↑↑↑ここまで↑↑↑↑↑↑↑↑↑↑
/>
```

- `PostList`コンポーネントを呼び出す際に、`listHeaderTitleButton`でフォロー用のボタンを追加しています
- 次の二つの条件で、フォローボタンを表示するか決めています
  - `currentUser`: 先ほどの`init`関数が実行され、すでに`currentUser`がセットされているか
  - `userId !== currentUser.username`: 自分自身でないか
- `isFollowing`を参照し、フォローしている場合とそうでない場合でフォローボタンの文言やみため、ボタンクリック時の挙動を切り替えています

#### フォロー・フォロー解除用関数

```js
  const follow = async () => {
    const input = {
      followeeId: userId,
      followerId: currentUser.username,
      timestamp: Math.floor(Date.now() / 1000),
    }
    const res = await API.graphql(graphqlOperation(createFollowRelationship, {input: input}));

    if(!res.data.createFollowRelationship.erros) setIsFollowing(true);
  }

  const unfollow = async() => {
    const input = {
      followeeId: userId,
      followerId: currentUser.username,
    }
    const res = await API.graphql(graphqlOperation(deleteFollowRelationship,{input: input}));

    if(!res.data.deleteFollowRelationship.erros) setIsFollowing(false);
  }
```
- `follow`
  - `createFollowRelationship` Mutationを実行し、新規FollowRelationshipを作成します
  - 現在のログインユーザーを`followerId`に
  - `PostsBySpecifiedUser`コンポーネントで表示中のユーザーを`followeeId`に
- `unfollow`
  - `deleteFollowRelationship`Mutationを実行し、指定のFollowRelationshipを削除します

### 挙動の確認
1. 実行していない場合は次のコマンドを**それぞれ別の**ターミナルウィンドウで実行します
```
amplify mock api
npm start
```
1. 適当な他のユーザーのアイコンを押してユーザーのPost一覧に飛び、フォローボタンを押してみましょう。
1. Amplify GraphQL Explorerで`listFollowRelationship`を実行して、新しいアイテムが作成されていることを確認します
1. ついでに`Following`ボタンをクリックして、フォロー解除機能が動いていることも確認してみましょう


![](/images/50_follow_timeline/follow_confirm.png)

{{% notice tip%}}
なぜ`$ amplify push`していないにも関わらず、`schema.graphql`の変更が行われた後の挙動をGraphQL APIが行っているのでしょうか。
Amplify CLIでは、 `$ amplify push`を実行すると、Amplify Framework(SDK)がリソースにアクセスするために必要なエンドポイント、IDといった情報を`aws-exports.js`にexportします。
`aws-exports.js`を使ってAmplifyの初期設定を行うと、リソース変更や追加をしても設定を書き換える必要がなくなり、非常に楽です。
そして`$ amplify mock`コマンドを使用してAmplify Mockingをしている間だけ、ローカルでたちあがったMock ServerのGraphQL Endpointを指すように`aws-exports.js`が書き換わります。
{{% /notice %}}