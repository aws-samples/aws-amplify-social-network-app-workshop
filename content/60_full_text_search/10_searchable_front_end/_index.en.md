+++
title = "Full-text search: Front-end"
date = 2020-03-18T10:09:53+09:00
weight = 2
pre = "<b>6.2. </b>"
+++

Now that you have created a full-text search API.
Let's implement the front end using it.

{{< figure src="/images/60_full_text_search/front.png" title="Front-end" class="center" width="100%">}}

1. Create a search interface on the right side of the screen (`Search.js`)
1. Add path of ` https://example.com/#/search` to access the search screen (`App.js`).
1. Add a link to the search screen in the left navigation (`Sidebar.js`)

### Search.js
Create `./src/containers/Search.js `and edit it.

```bash
touch ./src/containers/Search.js
```

Copy the contents of `Search.js` below and replace `./src/containers/Search.js` with it.

{{%attachments title="./src/containers/Search.js" pattern="Search.js"/%}}

The main points are the following:

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
- Do not execute a query if the contents of `query` is empty.
- `API.graphql (... ` uses `matchPhrase` that is the same as you tried in the AppSync Management Console.

### Add Access to Search Components
#### Changes to App.js
Copy the contents of `App.js` below and replace `./src/App.js` with it.

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

- Changed to render the `Search` component when access `/search`.

#### Sidebar.js Changes
Copy the contents of `Sidebar.js` below and replace `./src/containers/Sidebar.js` with it.

{{%attachments title="./src/containers/Sidebar.js" pattern="Sidebar.js"/%}}

The points are as follows:

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

- Added a new link to `/search` to sidebar.

### Applying Changes

```bash
$ amplify publish
```

{{% notice warning%}}
If you execute `$ amplify push` or `$ amplify publish` while `$amplify mock api` is running, 
sometimes your command execution fail with error message: `Parameters: [authRoleName] must have values`.
In that case, please interrupt the process of `$amplify mock api` with `Ctrl+C`, and then execute `amplify push` or `$amplify publish`.
{{% /notice%}}

### Operation Check
- Open the hosted web application and click Search on the left.
- Enter the search word and click on the `SEARCH` button.
- Success if the result is displayed.