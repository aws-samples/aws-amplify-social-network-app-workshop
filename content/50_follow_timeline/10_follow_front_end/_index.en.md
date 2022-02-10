+++
title = "Follow feature: Front-end"
date = 2020-03-18T10:09:50+09:00
weight = 2
pre = "<b>5.2. </b>"
+++

Next, let's create a UI to follow users.
Now, when you click on a user's icon in the Global Timeline, you can view a list of the user's Post.
This time, you add a follow button to this screen.

### PostsBySpecifiedUser
Copy the contents of `PostsBySpecifiedUser.js` below and replace `./src/containers/PostsBySpecifiedUser.js` with it.

{{%attachments title="./src/containers/PostsBySpecifiedUser.js" pattern="PostsBySpecifiedUser.js"/%}}

The main changes are as follows:

#### Get logged-in user information with useEffect()

```js
useEffect(() => {
  //getPosts(INITIAL_QUERY); <-before change

  //↓↓↓↓↓↓↓added codes↓↓↓↓↓↓↓
  const init = async() => {
    const currentUser = await Auth.currentAuthenticatedUser();
    setCurrentUser(currentUser);

    setIsFollowing(await getIsFollowing({followeeId: userId, followerId: currentUser.username}));

    getPosts(INITIAL_QUERY);
  }
  init()
  //↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑

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


- In `useEffect()`, call Amplify Auth's `Auth.currentAuthenticatedUser` method to get current user information.
- Call the `getIsFollowing` function to get the following relationship between the logged in user and the user displayed on the app and store it in the `isFollowing` state.

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


- Execute a `getFollowRelationship` Query and return whether the user whose `followerId` is `Username` is following the user whose `followeeId` is  `Username`.


#### Add a Follow Button Component

```js
<PostList
  isLoading={isLoading}
  posts={posts}
  getAdditionalPosts={getAdditionalPosts}
  listHeaderTitle={userId}

  //↓↓↓↓↓↓↓added codes↓↓↓↓↓↓↓
  listHeaderTitleButton={
    ( currentUser && userId !== currentUser.username ) &&
    ( isFollowing ? 
      <Button  variant='contained' color='primary' onClick={unfollow}>Following</Button> 
    :
      <Button variant='outlined' color='primary' onClick={follow}>Follow</Button> 
    )
  }
  //↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
/>
```

- Adding a follower button in `listHeaderTitleButton` when calling the `PostList` component.
- React decides whether to show the follow button in two conditions.
  - `currentUser`: Whether the previous `init` function has been executed and `currentUser` has already been set.
  - `userId! == currentUser.username`: Make sure that followee is not yourself.
- Refer to `isFollowing` and switch the behavior of button click due to the wording and appearance of the follow button when following or not.

#### Follow/Unfollow Functions

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
  - Execute `createFollowRelationship` Mutation to create a new FollowRelationship.
  - Set the current login user's username to `followerId`.
  - Set usename of displayed user in `PostsBySpecifiedUser` component to `followeeId`.
- `unfollow`
  - Runs `deleteFollowRelationship` Mutation and deletes the specified FollowRelationship.

### Verifying Behavior
1. If not, run the following command in separate terminal windows:
```
amplify mock api
npm start
```
1. Click on the appropriate user's icon to jump to the user's Post list and press the Follow button.
1. Run `listFollowRelationship` in Amplify GraphQL Explorer to verify that a new item has been created
1. Click on the `Following` button and check that the unfollow function is still active.

![](/images/50_follow_timeline/follow_confirm.png)

{{% notice tip%}}
Why is the GraphQL API doing the behavior after the `schema.graphql` change, despite not executing `$amplify push`?
In Amplify CLI, executing `$ amplify push` exports the configuration of AWS Resources such as endpoint URL and ID to `aws-exports.js`.
Using `aws-exports.js` to perform the initial configuration of Amplify, even if you change or add resources, you do not need to rewrite the configuration. So it's so easy to use!
And only while using Amplify Mocking with `$amplify mock` command, Amplify rewrites `aws-exports.js` to point to local mocking server's endpoint.
{{% /notice %}}