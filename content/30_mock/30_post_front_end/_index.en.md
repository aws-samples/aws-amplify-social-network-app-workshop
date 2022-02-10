+++
title = "Post feature: Front-end"
date = 2020-03-18T10:09:47+09:00
weight = 50
pre = "<b>3.5. </b>"
+++



Now that you have implemented the GraphQL API, let's implement the front-end implementation.


![](/images/30_mock/confirm.png)


- The menu list on the left and the section showing the post is called Sidebar. (`Sideber.js`)
- The portion of the Post list on the right displays the following components depending on the function selected in Sidebar
  - Global Timeline: Posts from all users (`AllPost.js`)
  - Profile: Posts from a specific user(`PostsBySpecifiedUser.js`)
- Routing which components to display with `App.js`


### Installing Required Libraries
Install the necessary libraries to build the front.


```bash
npm install --save @material-ui/core@4.11.2 @material-ui/icons@4.11.2 moment@2.29.1 react-router@5.2.0 react-router-dom@5.2.0
```


### App.js
Copy the following code and replace `/src/App.js` with it.

{{%attachments title="./src/App.js"pattern="App.js" /%}}

The points are as follows:

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


- Routing process using `react-router`
  - `HashRouter`
    - This time you use `HashRouter` to take advantage of the browser's `back` function within a static site or to access certain components directly from outside
    - e.g. `https://example.com/#/global-timeline`
  - `Switch`: If one of the `Route` matches, only renders it (without `Switch`, all matching components is rendered)
  - `Route`
    - Render and display the `AllPosts` component when `/` or `/global-timeline` is accessed
    - `/:userId` matches when accesses such as `/userA`, renders and displays the `PostsBySpecifiedUser` component, and passes `:userId ` as a Parameter
      - If you write `Route` of `/:userId` on `Route` of `/global-timeline`, it matches `/:userId` first, so `global- timeline` is not displayed
- `ThemeProvider`: Material-UI class, which sets the CSS theme for the entire application


### Sidebar.js
There are three main roles of Sidebar.

- Logout button display
- Menu features such as switching to Global Timeline and Profile
- Post interface (text field and button)

First, create the `src/containers` directory and `Sidebar.js`.

```sh
mkdir src/containers
touch src/containers/Sidebar.js
```

Copy the contents of `Sidebar.js` below and replace  `./src/containers/Sidebar.js` with it.


{{%attachments title="./src/containers/Sidebar.js "pattern="Sidebar.js" /%}}


Let's look at the points of this code.


#### Handling TextField Input Values Using React Hooks


```js
const [value, setValue] = React.useState ('');
```


- State management can be achieved using `useState` hook.
- `value` manages the `content` of Posts entered with TextField
- `value` can be updated with `setValue`
- When `value` created using `useState` is updated by `setValue`, the component referencing `value` is re-rendered.


{{% notice tip%}}
In this workshop, we do not explain in detail about React Hooks or React state management.
For more information about useState, see [here](https://reactjs.org/docs/hooks-state.html).
{{% /notice%}}


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


- Passes the `value` state you just created to the TextField input `value`.
- If the input value of a TextField is changed by user, the `handleChange` function passed in `onChange={handleChange} ` is called.

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

- When `handleChange` is called from a TextField component, information such as a new input value is passed as an argument.
- Update a new TextField value to `value` state using `setValue (event.target.value)`.
- Verifying that there are no more than 140 characters.

#### Running createPost Mutation

```react
import { createPost } from '../graphql/mutations';

...

  const onPost = async () => {
    const res = await API.graphql(graphqlOperation(createPost, { input: {
      type: 'post',
      content: value,
      timestamp: Math.floor(Date.now() / 1000),
),
    }})); 

    setValue('');
  }
``` 

- If you execute `amplify mock api` or `amplify push`, the code for GraphQL Operation such as `createPost` is generated at `./src/graphql`.
- Using the generated `createPost`, the `onPost` method performs the Post-creation Mutation.
- The value of the TextField stored in the `value` state is used.
- If mutation succeeds, `setValue ('')` sets the TextField value to an empty string.

#### Sign-Out Functionality Implementation

```react
import Auth from '@aws-amplify/auth';

...

  const signOut = () => {
    Auth.signOut()
      .then(data => console.log(data))
      .catch(err => console.log(err));
  }
```

- Sign-out implementation uses the Auth module.
- When sign-out is performed, `withAuthenticator` detects that it is no longer in the sign-in state and returns to the sign-in screen.

### AllPosts.js
You create a UI for displaying all Posts.

```bash
touch src/containers/AllPosts.js
```

Copy the contents of `AllPosts.js` below and replace `./src/containers/AllPosts.js` with it.

{{%attachments title="./src/containers/AllPosts.js"pattern="AllPosts.js" /%}}


Let's look at the points of the code.

#### Fetch Posts for all users in chronological order

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

- List all user's posts in descending order of timestamp using `ListPostsSortedByTimestamp` you have created in 3.2.
- You can control the number of records fetched with `limit` parameter. You have acquired 20 records this time, and the default is 10 records.
- `nextToken` is a token that is set when there are the next 20 records of fetched data. By specifying `NextToken`, it is possible to fetch  the next 20 records in descending order of `timestamp`.

#### Subscription: Retrieving a New Post in Real Time

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

- Use `useEffect` Hook to describe the process after the Component's mount is completed. (see [more](https://reactjs.org/docs/hooks-effect.html) about useEffect)
- Issuing a subscription and whenever `createPost` Mutation is called, the Arrow Function passed to `.subscribe` is executed.
- By returning Arrow Function to unsubscribe, the Subscription gets closed when the Component is unmounted.

### PostsBySpecifiedUser.js
You create a UI for displaying a list of the Posts for a specific user.

```bash
touch src/containers/PostsBySpecifiedUser.js
```

Copy the contents of `PostsBySpecifiedUser.js` below and replace `./src/containers/PostsBySpecifiedUser.js` with it.


{{%attachments title="./src/containers/PostsBySpecifiedUser.js"pattern="PostsBySpecifiedUser.js" /%}}

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

- Using `listPostsBySpecificOwner` to set `owner` to `userId` taken from URI parameter


### PostList.js
You create a UI to display the Post list passed from `AllPosts.js` or `PostsBySpecifiedUser.js`.

```bash
mkdir src/components
touch src/components/PostList.js
```

Copy the contents of `PostList.js` below and replace `./src/components/PostList.js` with it.

{{%attachments title="./src/components/PostList.js"pattern="PostList.js" /%}}

{{% notice info%}}
In this workshop, the components using `useState` to manage state are under `./src/containers `, otherwise under `./src/components `.
{{% /notice%}}


### Checking the File Configuration
If you check the current directory structure with the `tree` command, it looks like this:

```bastree src
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
└── setupTests.jsh
```

Points

- `PostList.js` is under components directory.
- `AllPosts.js`, `PostsBySpecifiedUser.js`, `Sidebar.js` are under the containers directory.

### Check
Let's see these changes applied in the cloud. (It takes a few minutes to run)

```bash
amplify push
```


If `$amplify mock api` is running, use `Ctrl+C` to stop the execution of the command.
Now let's check if the UI implementation is working well.
If `$ npm start` is not running, run it again.

{{% notice info %}}
You can run `$ amplify mock api` and `$ npm start` at the same time and check without `$ amplify push`. To do that, you need to change `"aws_appsync_graphqlEndpoint"`'s value to`"http://localhost:20002/graphql"` in `aws-exports.js`.
{{% /notice %}}

- Make sure that Post functionality in SideBar works
- Make sure that you can LOGOUT
- Open multiple web browsers, log in with another user and post (even if the same email address, you can create multiple users by changing Username)
- Profile shows only your own Posts


![](/images/30_mock/confirm.png)