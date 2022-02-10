+++
title = "Timeline feature: Back-end"
date = 2020-03-18T10:09:50+09:00
weight = 3
pre = "<b>5.3. </b>"
+++


Now that you have implemented the follow function, let's implement the GraphQL API to handle user-specific timelines.

{{< figure src="/images/50_follow_timeline/architecture_timeline.png" title="" class="center" width="50%">}}

### Creating a Timeline API
Let's create a Timeline table so that specific users can access the posts of the users they follow.
Add the following code to `./amplify/backend/api/BoyakiGql/schema.graphql`:

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

Let's look at the points.

- `@model`
	-  GraphQL API doesn't have API for updating Post by specifing `mutations: ...` because user doesn't need to update Post in this app. [detail](https://docs.amplify.aws/cli/graphql-transformer/model#usage) 
	- Post type doesn't have `createdAt` and `updatedAt` attributes which are created by default by specifing `timestamps:...`. Use AWS Timestamp `timestamp` attribute instead here.
- `@auth`
	- `{allow: owner... ` allows only users who are Owner to execute Timeline Query/Subscription.
	- To do Subscription, both of `read` and `create` permissions are required.
	- `{allow: private... ` allows access through IAM authentication so that the AWS Lambda function you create later can run the Timeline API Mutation.
- `@key`
	- When a user browses the Timeline, fetches items matching `userid` with their `Username` in chronological order.
	- Fetch their own Timeline in chronological order by using `userId` as Partition Key (PK) and `timestamp` as Sort Key (SK).
- `@connection`
	- Timeline API's role is to replicate a user's Post to the Timeline of its followers, thus creating a unique Timeline for each user.
	- When duplicating, it is possible to duplicate the entire Post field into the Timeline field. However, for example, when implementing the "Like" or "Reply" function, duplicated items need all updated. It is very difficult in case the place is crossing Post and Timeline.
	- By using `@connection`, AWS AppSync is able to combine data across multiple DynamoDB Tables when processing a Query.
	- In `fields`, the Primary Key of the Post Table is specified. Post `id` is stored in the `postId` field of the Timeline Table. In Post, the `id` field was Primary Key, so if you pass only `postId`, you can uniquely identify the Post.

### Add IAM to GraphQL API authentication method
It is the role of the AWS Lambda function to run the Timeline API Mutation to create a Timeline item in Timeline table.
The easiest way to authenticate Lambda functions to make API calls to AWS AppSync is to use the IAM Role of AWS IAM.
When creating GraphQL API with `$ amplify add api` in 3.2, only Amazon Cognito User Pools was set as authentication method.
You also add AWS IAM as an authentication method here.

Let's run `$ amplify update api` in the terminal and answer the question as follows:

```bash
amplify update api
```

- Please select from one of the below mentioned services: `GraphQL`
- Select from the options below: `Update auth settings`
- Choose the default authorization type for the API `Amazon Cognito User Pool`
- Configure additional auth types? `Yes`
- Choose the additional authorization types you want to configure for the API `IAM`

{{% notice warning %}}
`Choose the additional authorization types... ` is a multi-select expression.
After moving to `IAM` with the cursor, you can choose `IAM` by pressing the __Space key__. Press Enter to confirm the selection and move to the next item.
Make sure that you have selected `IAM` with the __Space key__.
{{% /notice %}}

{{% notice info %}}
In this way, Amplify allows you to use the `$ amplify update` command to modify a resource that has been created once. 
However, note that some settings cannot be changed later such as the ID of Amazon Cognito to provision in the Auth category. 
(Though there is warning message when configuring these settings.)
{{% /notice %}}

### Operation confirmed by Amplify Mocking
Run `$amplify mock api` to see if the Timeline API works as expected.

{{% notice info%}}
Amplify Mocking requires port 20002 to be available and may not be available in all Cloud IDEs.
If you are using the applicable Cloud IDE, please do not follow this procedure and enjoy the atmosphere.
{{% /notice %}}

```bash
amplify mock api
```

If you have already opened Amplify GraphQL Explorer in your browser, please refresh the page to load the changes.

#### createTimeline
First, you create a Timeline item.

1. Click `listPosts` in the left pane and check the `id`, `owner`, and `timestamp` directly below `items`.
1. Click on **▶** ︎ to execute a GraphQL Query, and the Post list is displayed in the right pane. Make a note of `id` and `timestamp` of a Post. (If no Post exists, follow the steps in 3.2.2 to create a new Post.)
1. In the lower left corner, click `ADD NEW Query`, choose `Mutation`, and then click `+`.
1. Click on `createTimeline` in the left pane and fill the checkboxes and fields as shown in the following figure.
	1. In this case, use the `id` and `timestamp` of the post noted earlier.
	1. `userId` should be `test_follower`.
1. Only IAM authenticated users can execute `createTimeline`. Click `Use:User Pool` at the top of the screen and change it to `Use:IAM`.
1. Click **▶** to run GraphQL Mutation.

![](/images/50_follow_timeline/createTimeline.png)

#### listTimelines

Next, you display a list of the Timeline items you created.

1. Click `listTimelines` in the left pane and fill the checkboxes and fields as shown in the following figure.
1. `listTimelines` can be executed only users authenticated by Amazon Cognito User Pools and having the same `Username` as the `userId` field in `Timeline`.
	1. Click `Update Auth` at the top of the screen and change it to `Cognito User Pool`.
	1. Set `Username` to `test_follower` and click `Generate Token`.
1. Click **▶** ︎ to execute a GraphQL Query.
1. The results are displayed in the right pane. Make sure that the Timeline you just created is displayed.
1. The Post associated with `postId` has been expanded to the `post` field by `@connection`.

{{% notice info %}}
If you do not see the Timeline that you created, click `Update Auth` to check `Username`. And check it matches the value that you are passing to the `userId` argument of `listTimelines`. Timeline only allows `read` for Owner, so it cannot be retrieved by issuing a Query with other user's credentials.
{{% /notice %}}

![](/images/50_follow_timeline/listTimelines.png)