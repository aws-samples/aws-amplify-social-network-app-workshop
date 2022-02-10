+++
title = "全文検索機能: Front-end"
date = 2020-03-18T10:09:53+09:00
weight = 2
pre = "<b>6.2. </b>"
+++

全文検索用APIが作成できたので、フロントエンドを実装していきます。

{{< figure src="/images/60_full_text_search/front.png" title="Front-end" class="center" width="100%">}}

1. 画面右側の検索用のインタフェースを作成します(`Search.js`)
1. 検索画面へアクセスするためのURI`https://example.com/#/search`を追加します(`App.js`)
1. 左側のナビゲーションに検索画面へのリンクを追加します(`Sidebar.js`)

### Search.js
`./src/containers/Search.js`を作成し、編集していきます。

```bash
touch ./src/containers/Search.js
```

以下の`Search.js`の中身をコピーし、`./src/containers/Search.js`を置き換えてください。

{{%attachments title="./src/containers/Search.js" pattern="Search.js"/%}}

主なポイントは以下です。

```js
const searchPosts = async (type, nextToken = null) => {
  if (query === '') return;

  const res = await API.graphql(graphqlOperation(searchPostsGql, {
    filter: { content: { matchPhrase: query } },
    limit: 20,
    nextToken: nextToken,
  }));

  dispatch({ type: type, posts: res.data.searchPosts.items })
  setNextToken(res.data.searchPosts.nextToken);
  setIsLoading(false);
}
```

- `query`の中身が空であればクエリを実行しません
- `API.graphql(...`では、AppSyncのマネジメントコンソールで試したのと同じ、`matchPhrase`を利用しています

### Searchコンポーネントへのアクセスを追加
#### App.jsの変更
以下の`App.js`の中身をコピーし、`./src/App.js`を置き換えてください。

{{%attachments title="./src/App.js" pattern="App.js"/%}}

```jsx
<HashRouter>
  <Switch>
    <Route exact path='/' component={Timeline} />
    <Route exact path='/search' component={Search} />
    <Route exact path='/global-timeline' component={AllPosts} />
    <Route exact path='/:userId' component={PostsBySpecifiedUser}/>
    <Redirect path="*" to="/" />
  </Switch>
</HashRouter>
```

- `/search`へアクセスがあった場合、先ほど実装した`Search`コンポーネントをレンダリングするよう変更しました


#### Sidebar.jsの変更
以下の`Sidebar.js`の中身をコピーし、`./src/containers/Sidebar.js`を置き換えてください。

{{%attachments title="./src/containers/Sidebar.js" pattern="Sidebar.js"/%}}

ポイントは以下です。

```js
<ListItem
  button
  selected={activeListItem === 'search'}
  onClick={() => {
    Auth.currentAuthenticatedUser().then((user) => {
      history.push('search');
    })
  }}
  key='search'
>
  <ListItemIcon>
    <SearchIcon />
  </ListItemIcon>
  <ListItemText primary="Search" />
</ListItem>
```

- 新たに`/search`へのリンクをサイドバーへ追加しました

### 変更の反映

```bash
$ amplify publish
```

{{% notice warning %}}
`$ amplify mock api`を動かしている状態で`$ amplify push`や`$ amplify publish`を実行した場合、`Parameters: [authRoleName] must have values`というエラーがでて`$ amplify push`や`$ amplify publish`が失敗する場合があります。
その場合は、`Ctrl + C`で`$ amplify mock api`のプロセスを中断してから、`$ amplify push`や`$ amplify publish`を実行してください。
{{% /notice %}}


### 動作確認
- ホストされたウェブアプリケーションを開き、左側のSearchをクリックします
- 検索ワードを入力し、`SEARCH`ボタンをクリックします
- 結果が表示されれば成功です