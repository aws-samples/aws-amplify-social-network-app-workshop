+++
title = "Post機能: Front-end"
date = 2020-03-18T10:09:47+09:00
weight = 50
pre = "<b>3.5. </b>"
+++

GraphQL APIの実装ができたところで、フロントエンドの実装を行なっていきましょう。

![](/images/30_mock/confirm.png)

- 左側のメニュー一覧やPostを表示している部分をSidebarと呼ぶことにします(`Sideber.js`)
- 右側のPost一覧を表示する部分は、メニューで選択した機能に応じて以下のコンポーネントを表示します
  - Global Timeline: すべてのユーザーのPostが表示される(`AllPost.js`)
  - Profile: 特定のユーザーのPostが表示される(`PostsBySpecifiedUser.js`)
- どのコンポーネントを表示するかは`App.js`でルーティングします

### 必要ライブラリのインストール
フロントの構築に必要なライブラリをインストールします。

```bash
npm install --save @material-ui/core@4.11.2 @material-ui/icons@4.11.2 moment@2.29.1 react-router@5.2.0 react-router-dom@5.2.0
```

### App.js
次のコードをコピーして、`./src/App.js`の中身を書き換えましょう。

{{%attachments title="./src/App.js" pattern="App.js"/%}}

ポイントは以下です。

```jsx
function App() {
  const classes = useStyles();
  return (
    <div className={classes.root} >
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <HashRouter>
          <Switch>
            <Route exact path='/' component={AllPosts} />
            <Route exact path='/global-timeline' component={AllPosts} />
            <Route exact path='/:userId' component={PostsBySpecifiedUser}/>
            <Redirect path="*" to="/" />
          </Switch>
        </HashRouter>
      </ThemeProvider>
    </div>
  );
}
```

- `react-router`を利用したルーティング処理
  - `HashRouter`
      - 静的サイト内でブラウザの`戻る`機能を利用したり、外部から直接特定のコンポーネントにアクセスするため、今回は`HashRouter`を使用しています
      - `https://example.com/#/global-timeline`のような形式で、ルーティングが行われます
  - `Switch`: 配下の`Route`のうち、どれか一つにマッチしたらそれのみをレンダリング(`Switch`なしだとマッチしたもの全てがレンダリングされる)
  - `Route`
      - `/`または`/global-timeline`にアクセスがあった場合、`AllPosts`コンポーネントをレンダリングして表示
      - `/:userId`は`/userA`のようなアクセスがあった時にマッチし、`PostsBySpecifiedUser`コンポーネントをレンダリングして表示し、`:userId`をParameterとして受け渡します
          - `/global-timeline`の`Route`の上に`/:userId`の`Route`を書いた場合、先に`/:userId`とマッチしてしまうため、`global-timeline`が表示されません
- `ThemeProvider`: Material-UIのクラスで、アプリケーション全体のCSSテーマをセット

### Sidebar.js
Sidebarの役割は主に三つです。

- Logoutボタンの表示
- Global TimelineやProfileへの切り替えなど、メニュー機能
- Postの投稿

まず、`src/containers`ディレクトリを作り、`Sidebar.js`を作成します。

```sh
mkdir src/containers
touch src/containers/Sidebar.js
```

以下の`Sidebar.js`の中身をコピーし、`./src/containers/Sidebar.js`を置き換えてください。

{{%attachments title="./src/containers/Sidebar.js" pattern="Sidebar.js"/%}}

以下で、このコードのポイントについてみていきましょう。

#### React Hooksを利用したTextField入力値のハンドリング

```js
const [value, setValue] = React.useState('');
```

- `useState`Hookを使用すると、状態管理が実現できます
- `value`はTextFieldで入力されたPostの`content`を管理します
- `setValue`で`value`を更新することが可能です
- `useState`を利用して作成された`value`が`setValue`により更新されると、`value`を参照するコンポーネントが再レンダリングされます

{{% notice tip%}}
本ワークショップではReact HooksやReactの状態管理についての詳しい解説は行いません。
useStateについての詳細は[こちら](https://reactjs.org/docs/hooks-state.html)をご覧ください。
{{% /notice %}}

```jsx
<ListItem key='post-input-field'>
  <ListItemText primary={
    <TextField
      error={isError}
      helperText={helperText}
      id="post-input"
      label="Type your post!"
      multiline
      rowsMax="8"
      variant="filled"
      value={value}
      onChange={handleChange}
      fullWidth
      margin="normal"
    />
  } />
</ListItem>
```

- TextFieldの入力値`value`に先ほど作成した`value`ステートを渡します
- ユーザーの入力によりTextFieldの入力値が変更された場合、`onChange={handleChange}`で渡された`handleChange`関数が呼び出されます

```js
const handleChange = event => {
  setValue(event.target.value);
  if (event.target.value.length > MAX_POST_CONTENT_LENGTH) {
    setIsError(true);
    setHelperText(MAX_POST_CONTENT_LENGTH - event.target.value.length);
  } else {
    setIsError(false);
    setHelperText('');
  }
};
```

- `handleChange`がTextFieldコンポーネントから呼び出される時、新しい入力値などの情報が引数として渡されます
- `setValue(event.target.value)`によって、新しいTextFieldの値を`value`ステートに格納しています
- 同時に140字以下であることを検証しています

#### createPost Mutationの実行

```react
import { createPost } from '../graphql/mutations';

{中略}
  const onPost = async () => {
    const res = await API.graphql(graphqlOperation(createPost, { input: {
      type: 'post',
      content: value,
      timestamp: Math.floor(Date.now() / 1000),
    }})); 

    setValue('');
  }
``` 

- `amplify mock api`や`amplify push`を実行すると、`createPost`などのGraphQL Operationを行うためのコードが`./src/graphql`配下に書き出されます
- 書き出された`createPost`を利用して、Post作成のMutationを実行しているのが`onPost`メソッドになります
  - 先ほど`value`ステートに格納したTextFieldの値を用いています
- Mutationが成功したら`setValue('')`によりTextFieldの値を空文字列にしています

#### サインアウト機能の実装

```react
import Auth from '@aws-amplify/auth';

{中略}

  const signOut = () => {
    Auth.signOut()
      .then(data => console.log(data))
      .catch(err => console.log(err));
  }
```

- サインアウトの実装は、Authモジュールを利用しています。
- サインアウトが実行されると、サインイン状態でなくなったことを`withAuthenticator`が検知して、サインイン画面に戻ります。

### AllPosts.js
全てのPostを表示するためのUIを作成していきます。

```bash
touch src/containers/AllPosts.js
```

以下の`AllPosts.js`の中身をコピーし、`./src/containers/AllPosts.js`を置き換えてください。

{{%attachments title="./src/containers/AllPosts.js" pattern="AllPosts.js"/%}}

コードのポイントをみていきましょう。

#### 全ユーザーのPostを時系列順でフェッチ

```js
const getPosts = async (type, nextToken = null) => {
  const res = await API.graphql(graphqlOperation(listPostsSortedByTimestamp, {
    type: "post",
    sortDirection: 'DESC',
    limit: 20, //default = 10
    nextToken: nextToken,
  }));
  console.log(res);
  dispatch({ type: type, posts: res.data.listPostsSortedByTimestamp.items })
  setNextToken(res.data.listPostsSortedByTimestamp.nextToken);
  setIsLoading(false);
}
```

- 3.2.で作成した`listPostsSortedByTimestamp`を用いて、全てのユーザーのPostをtimestampの降順でリストアップしています
- `limit`で取得件数を制御することができます。今回は20件取得しており、デフォルトは10件です。
- `nextToken`は取得したデータの次の20件がある場合にセットされるトークンです。`NextToken`を指定するすることにより、`timestamp`の降順で20件ずつフェッチしてくることが可能です

#### Subscription: リアルタイムでの新規Postの取得

```js
useEffect(() => {
  getPosts(INITIAL_QUERY);

  const subscription = API.graphql(graphqlOperation(onCreatePost)).subscribe({
    next: (msg) => {
      console.log('allposts subscription fired')
      const post = msg.value.data.onCreatePost;
      dispatch({ type: SUBSCRIPTION, post: post });
    }
  });
  return () => subscription.unsubscribe();
}, []);
```

- `useEffect`Hookを利用して、ComponentのMountが完了した後の処理を記述しています(useEffectに関しての詳細はこちら)
- Subscriptionを発行しており、`createPost` Mutationが呼ばれるたびに、`.subscribe`に渡したArrow Functionが実行されます
- unsubscribeするためのArrow FunctionをReturnすることにより、ComponentがUnmountされた際にSubscriptionを解除しています

### PostsBySpecifiedUser.js
特定のユーザーのPost一覧を表示するためのUIを作成していきます。

```bash
touch src/containers/PostsBySpecifiedUser.js
```

以下の`PostsBySpecifiedUser.js`の中身をコピーし、`./src/containers/PostsBySpecifiedUser.js`を置き換えてください。

{{%attachments title="./src/containers/PostsBySpecifiedUser.js" pattern="PostsBySpecifiedUser.js"/%}}

```react
const getPosts = async (type, nextToken = null) => {
  const res = await API.graphql(graphqlOperation(listPostsBySpecificOwner, {
    owner: userId,
    sortDirection: 'DESC',
    limit: 20,
    nextToken: nextToken,
  }));

  dispatch({ type: type, posts: res.data.listPostsBySpecificOwner.items })
  setNextToken(res.data.listPostsBySpecificOwner.nextToken);
  setIsLoading(false);
}
```

- `listPostsBySpecificOwner`を使用して、`owner`にURIパラメータからとってきた`userId`をセットしています

### PostList.js
`AllPosts.js`や`PostsBySpecifiedUser.js`から渡されたPost一覧を表示するためのUIを作成していきます。

```bash
mkdir src/components
touch src/components/PostList.js
```

以下の`PostList.js`の中身をコピーし、`./src/components/PostList.js`を置き換えてください。

{{%attachments title="./src/components/PostList.js" pattern="PostList.js"/%}}

{{% notice info %}}
本ワークショップでは`useState`を使用して状態管理を行なっているコンポーネントは`./src/containers`、そうでないコンポーネントは`./src/components`に配置しています。
{{% /notice %}}

### ファイル構成の確認
`tree`コマンドで現在のディレクトリ構造を確認すると以下のようになっています。
環境によっては`tree`コマンドがデフォルトではインストールされていないことがあります。
その場合別途インストールいただくか、他の手段でディレクトリ構造をご確認ください。

```bash
tree src
├── App.css
├── App.js
├── App.test.js
├── aws-exports.js
├── components
│   └── PostList.js
├── containers
│   ├── AllPosts.js
│   ├── PostsBySpecifiedUser.js
│   └── Sidebar.js
├── graphql
│   ├── mutations.js
│   ├── queries.js
│   └── subscriptions.js
├── index.css
├── index.js
├── logo.svg
├── reportWebVitals.js
└── setupTests.js
```

ポイント

- componentsの配下に`PostList.js`があります
- containersの配下には`AllPosts.js`、`PostsBySpecifiedUser.js`、`Sidebar.js`があります


### 動作確認
ここまでの変更をクラウドに反映して確認していきましょう。(実行には数分かかります)

```bash
amplify push
```

もし、`$ amplify mock api`が動いているようであれば、`Ctrl+C`でコマンドの実行を止めておいてください。

{{% notice info %}}
`$ amplify mock api`と`$ npm start`を同時に実行し、`$ amplify push`せずに動作確認を行うことも可能です。ただし、作業環境にコンテナをお使いの場合は`aws-exports.js`ファイルのキーが`"aws_appsync_graphqlEndpoint"`の値を`"http://localhost:20002/graphql"`に変更する必要があることにご注意ください。
{{% /notice %}}

それでは、UIの実装がうまくいっているか確認しましょう。
`$ npm start`が実行されていない場合は、改めて実行しておきます。

- Postが動くことを確認します
- LOGOUTできることを確認します
- 複数ウェブブラウザを開き、別のユーザーでログインしてPostしてみましょう(同じメールアドレスであっても、Usernameを変えれば複数のユーザーを作成することができます)
- Profileを押すと自分のPostだけが表示されます

![](/images/30_mock/confirm.png)