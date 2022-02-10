+++
title = "Timeline feature: Front-end"
date = 2020-03-18T10:09:52+09:00
weight = 5
pre = "<b>5.5. </b>"
+++

Finally, let's implement the Timeline feature front-end.

### Timeline
Create `./src/containers/Timeline.js ` and edit it.

```
touch ./src/containers/Timeline.js
```

Copy the contents of `Timeline.js` below and replace `./src/containers/Timeline.js` with it.

{{%attachments title="./src/containers/Timeline.js" pattern="Timeline.js"/%}}

The main points are the following:

#### Getting a Timeline

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

- `AllPosts.js` used `listPosts`, but this time you use `listTimelines`.
- Specifying `userId` as `username` for the current login user.

### Add reference to Timeline in Sidebar.js and App.js

#### Changes to App.js
Copy the contents of `App.js` below and replace `./src/App.js` with it.

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

- Changed to render `Timeline` instead of `AllPosts` when accessing `/`.

#### Sidebar.js Changes
Copy the contents of `Sidebar.js` below and replace `./src/containers/Sidebar.js` with it.

{{%attachments title="./src/containers/Sidebar.js" pattern="Sidebar.js"/%}}

The points are as follows:

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

- Call the newly created `createPostAndTimeline` instead of `createPost`.

### Applying to the Cloud
Let's apply this in the cloud. It takes several minutes to run.

```bash
$ amplify publish
```

{{% notice warning%}}
If you execute `$ amplify push` or `$ amplify publish` while `$amplify mock api` is running, 
sometimes your command execution fail with error message: `Parameters: [authRoleName] must have values`.
In that case, please interrupt the process of `$amplify mock api` with `Ctrl+C`, and then execute `$amplify push` or `$amplify publish`.
{{% /notice%}}

### Operation Check
1. Access `https://production.XXXXXXXXXXX.amplifyapp.com` and log in (User A).
1. Log in with another user (User B) using another browser.
1. Before following each other's accounts, make sure that their Post is only visible in the Global Timeline even after Posting.
1. From the Global Timeline of User A, click on the Post icon for User B to follow User B.
1. After following, do a Post as User B and make sure that User B's Post is displayed on the Timeline of User A.

{{% notice tip %}}
Currently, only Posts created after following are displayed in Timeline.
If you want the Post to be displayed in the Timeline before you follow it, you need an implementation like replicating Post to Timeline after `FollowRelationship` Mutation is triggered.
(This can be achieved by implementing `@function` or Amazon DynamoDB Streams with `$ amplify add function`)
{{% /notice %}}


{{% notice tip %}}
Now, even after you unfollow, posts displayed in the Timeline remain whether you follow or unfollow.
If you want to remove a user's Post from the Timeline after unfollowing it, you need an implementation of the deletion of the unfollowed user's Post from the Timeline.
(This can be achieved by implementing `@function` or Amazon DynamoDB Streams with `$ amplify add function`)
{{% /notice %}}