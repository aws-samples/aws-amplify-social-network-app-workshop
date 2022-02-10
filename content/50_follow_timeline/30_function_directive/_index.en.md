+++
title = "Timeline feature: @function"
date = 2020-03-18T10:09:51+09:00
weight = 4
pre = "<b>5.4. </b>"
+++

You have created the FollowRelationship API and the Timeline API.
Here you create `createPostAndTimeline` Lambda Resolver.
Its role is as follows:

1. `createPost`Mutation to create a new Post in the Post Table.
1. Read the FollowRelationship Table and retrieve the followers of the user who made the API call.
1. Create items in the Timeline Table so that each follower can read the post content of the followee.

{{< figure src="/images/50_follow_timeline/architecture_lambda.png" title="" class="center" width="50%">}}

### amplify add function
Execute `$ amplify add function`. A few questions are asked to you, so please enter as follows:

{{% notice warning %}}
`Select the category` and `Select the operations...` are multi-select expressions.
After moving to item with the cursor, you can choose item by pressing the __Space key__. Press Enter to confirm the selection and move to the next item.
Make sure that you have selected item with the __Space key__.
{{% /notice %}}

- Select which capability you want to add: `Lambda function (serverless function)`
- Provide a friendly name for your resource to be used as a label for this category in the project: `createPostAndTimeline`
- Provide the AWS Lambda function name: `createPostAndTimeline`
- Choose the runtime that you want to use: `NodeJS`
- Choose the function template that you want to use: `Hello World`
- Do you want to configure advanced settings? `Yes`
- Do you want to access other resources in this project from your Lambda function? `Yes`
- Select the category `api`
- Select the operations you want to permit for BoyakiGql `Query, Mutation`
- Do you want to invoke this function on a recurring schedule? `No`
- Do you want to configure Lambda layers for this function? `No`
- Do you want to edit the local lambda function now? `No`

{{% notice tip %}}
In `$ amplify add function`, several templates are available.
For example, if you select `Lambda Trigger`, you can set up DynamoDB Streams that detects changes to the Amazon DynamoDB Table created in `@model` and executes your AWS Lambda function.
For more information, see [here] (https://docs.amplify.aws/cli/function#graphql-from-lambda).
{{% /notice %}}

### Creating a createPostAndTimeline Mutation
Let's create a `createPostAndTimeline` Mutation so that you can call the Lambda function you just created via the GraphQL API.
Add the following code to `./amplify/backend/api/BoyakiGql/schema.graphql`:

```graphql
type Mutation
{
  createPostAndTimeline(
		content: String!
	): Post
    @function(name: "createPostAndTimeline-${env}")
    @auth(rules: [
      {allow: private, provider: userPools},
    ])
}
```

- You can add Mutation by writing `createPostAndTimeline` under `type Mutation`.
- `createPostAndTimeline`
    - Take `content` of String type as an argument.
    - The return value is of the previously defined `Post` type.
- `@function`
    - You can set Lambda Resolver by using `@function`.
    - The Lambda function you just created is named `createPostAndTimeline`. However the resource name of AWS Lambda function actually created is added `env` name in order not to compete with other env.
    - This time you are working on `production` env created in 3.1, so the resource name created is `createPostAndTimeline-production`.
    - More information about Amplify Env is discussed in Chapter 7.
- `@auth`
    - Any user authenticated with Amazon Cognito User Pools is able to run `createPostAndTimeline`.

### Adding Access to Existing APIs
Until now, only users authenticated with Amazon Cognito User Pools were calling the GraphQL API.
As a result, Lambda functions cannot perform operations such as `listFollowRelationship` or `createPost`.
Here, add auth rules allowing Lambda function to run these Operations.

```graphql
type Post
  @model (
    mutations: {create: "createPost", delete: "deletePost", update: null}
    timestamps: null
    subscriptions: { level: public}
  )
  @auth(rules: [
        {allow: owner, ownerField:"owner", provider: userPools, operations:[read, create]}
        {allow: private, provider: userPools, operations:[read]}
        {allow: private, provider: iam ,operations:[create]} #追加
  ])
```

```graphql
type FollowRelationship
    @model(
        mutations: {create: "createFollowRelationship", delete: "deleteFollowRelationship", update: null}
        timestamps: null
    )
	@auth(rules: [
		{allow: owner, ownerField:"followerId", provider: userPools, operations:[read, create]}
		{allow: private, provider: userPools, operations:[read]}
		{allow: private, provider: iam ,operations:[read]} #追加
	])
```

The current `schema.graphql` is as follows:

{{%attachments title="./amplify/backend/api/BoyakiGql/schema.graphql" pattern="schema.graphql"/%}}


### Editing Code for AWS Lambda Functions
The configuration file of Lambda function is stored under `./amplify/backend/function/createPostAndTimeline`.

Copy the contents of `index.js` below and replace `./amplify/backend/function/createPostAndTimeline/src/index.js` with it.

{{%attachments title="./amplify/backend/function/createPostAndTimeline/src/index.js" pattern="index.js"/%}}

In addition, execute the following script in your terminal to install the necessary libraries to run your Lambda functions:

```bash
cd ./amplify/backend/function/createPostAndTimeline/src
npm install --save aws-appsync graphql-tag node-fetch
cd ../../../../..
```

The points are as follows:

#### Accessing Resources in Other Projects

```js
/* Amplify Params - DO NOT EDIT
You can access the following resource attributes as environment variables from your Lambda function
var environment = process.env.ENV
var region = process.env.REGION
var apiGraphqlapiGraphQLAPIIdOutput = process.env.API_BOYAKIGQL_GRAPHQLAPIIDOUTPUT
var apiGraphqlapiGraphQLAPIEndpointOutput = process.env.API_BOYAKIGQL_GRAPHQLAPIENDPOINTOUTPUT

Amplify Params - DO NOT EDIT */
```

- The top of the source file contains information about resources of other categories that you specify to access when executing `$ amplify add function`.
- For example, you can refer to the GraphQL endpoint with `process.env.API_BOYAKIGQL_GRAPHQLAPHQLAPIENDPOINTOUTPUT`.

#### Post Validation

```js
if(event.arguments.content.length > 140) {
    callback('content length is over 140', null);
}
```

- `event.arguments.content`:
    - Arguments when AWS Lambda is called are stored in `event` object.
    - When AppSync calls Lambda, the input to execute GraphQL Operation is stored in `event.arguments`.
- Returns an error immediately if it exceeds 140 characters.
- This prevents hack from creating Posts that exceed 140 character limits, such as making GraphQL API requests manually rather than via the app and making API calls.

#### AppSync Client Setup for Your Environment

```js
if ('AWS_EXECUTION_ENV' in process.env && process.env.AWS_EXECUTION_ENV.startsWith('AWS_Lambda_')) {
    //for cloud env
    env = process.env;
    graphql_auth = {
        type: "AWS_IAM",
        credentials: {
            accessKeyId: env.AWS_ACCESS_KEY_ID,
            secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
            sessionToken: env.AWS_SESSION_TOKEN,
        }
    };
    graphql_endoint = env.apiGraphqlapiGraphQLAPIEndpointOutput;
} else {
    // for local mock
    env = {
        API_GRAPHQLAPI_GRAPHQLAPIENDPOINTOUTPUT: 'http://192.168.1.2:20002/graphql',
        REGION: 'us-east-1',
    }
    graphql_auth = {
        type: "AWS_IAM",
        credentials: {
            accessKeyId: 'mock',
            secretAccessKey: 'mock',
            sessionToken: 'mock',
        }
    };
}

if (!graphqlClient) {
    graphqlClient = new AWSAppSyncClient({
        url: env.API_GRAPHQLAPI_GRAPHQLAPIENDPOINTOUTPUT,
        region: env.REGION,
        auth: graphql_auth,
        disableOffline: true,
    });
}
```

- `if ('AWS_EXECUTION_ENV'... ` determines whether the environment in which this code is running is AWS Lambda or otherwise.
    - In the conditional branch of local mock, you manually set environment variables passed from AWS Lambda.
    - The variable `API_GRAPHQLAPI_GRAPHQLAPIENDPOINTOUTPUT` is set to ` http://192.168.1.2:20002/graphql`. **Please rewrite this IP address with suit your environment**.
- At this time, Amplify's JavaScript library does not work with the Node.js runtime perfectly. When calling AWS AppSync from an AWS Lambda function, use [AWS AppSync SDK](https://docs.amplify.aws/lib/graphqlapi/query-data?platform=js#using-aws-appsync-sdk).

#### Running createPost Mutation

```js
//post to the origin
const postInput = {
    mutation: gql(createPost),
    variables: {
        input: {
            type: 'post',
            timestamp: Math.floor(Date.now() / 1000),
            owner: event.identity.username,
            content: event.arguments.content,
        },
    },
};
const res = await graphqlClient.mutate(postInput);
const post = res.data.createPost;
```

- Create a Post with `const res = await graphqlClient.mutate (postInput)`.
    - Prevent unauthorized mutation by assigning owner, type, timestamp, etc. on the server side.
- `event.identity.username`: Get information about the user who executed Post.
    - Arguments when AWS Lambda is called are stored in `event` object.
    - When AppSync calls AWS Lambda, the user information that executed GraphQL Operation is stored in `event.identity`.

#### Get followers of the Posting User

```js
const queryInput = {
    followeeId: event.identity.username,
    limit: 100000,
}
const listFollowRelationshipsResult = await graphqlClient.query({
    query: gql(listFollowRelationships),
    fetchPolicy: 'network-only',
    variables: queryInput,
});
const followers = listFollowRelationshipsResult.data.listFollowRelationships.items;
```

- `graphqlClient.query`
    - By setting `fetchPolisty` to `network-only`, it always takes data from AWS AppSync instead of cache data.

{{% notice tip %}}
For more information of the structure of `event` when AWS AppSync set up with Amplify calls to Lambda functions, see [here] ( https://docs.amplify.aws/cli/graphql-transformer/directives#structure-of-the-function-event).
{{% /notice %}}

#### Creating a Timeline

```js
//post to timeline
followers.push({
    followerId: post.owner,
})
const results = await Promise.all(followers.map((follower)=> createTimelineForAUser({follower: follower, post: post})));
```

- At `followers.push... `, Post-author's `Username` is added to `followers` so that the post is displayed in the Timeline of the Post-author.
- `const results... ` calls the `createTimelineForAUser` method for each follower to create a Timeline item.

```js
const createTimelineForAUser = async ({follower, post}) => {
    const timelineInput = {
        mutation: gql(createTimeline),
        variables: {
            input: {
                userId: follower.followerId,
                timestamp: post.timestamp,
                postId: post.id,
            },
        },
    }
    const res = await graphqlClient.mutate(timelineInput);
}
```

### Operation Check with Amplify Mocking

{{% notice info%}}
Amplify Mocking requires port 20002 to be available and may not be available in all Cloud IDEs.
If you are using the applicable Cloud IDE, please do not follow this procedure and enjoy the atmosphere.
{{% /notice %}}

#### createPostAndTimeline

{{% notice info%}}
You can ignore `Could not find ref for "apiBoyakiGqlGraphQLAPIIdOutput". Using unsubstituted value.`
`Could not find ref for "apiBoyakiGqlGraphQLAPIEndpointOutput". Using unsubstituted value.` in log of `$ amplify mock api`.
{{% /notice %}}


1. In the lower left corner, click `ADD NEW Query`, choose `Mutation`, and then click `+`.
1. Click `createPostAndTimeline` in the left pane and enter the contents of the `content` within 140 characters.
1. Click `Update Auth` at the top of the screen, change `Username` to `test_followe` created in 5.1, and click `Generate Token`.
1. Click **▶** to run GraphQL Mutation.
1. Make sure that the post you created, such as `timestamp`, `id`, etc., appears in the right pane.

![](/images/50_follow_timeline/createPostAndTimeline.png)

#### CreatePostAndTimeline Validation Confirmation
1. Click `createPostAndTimeline` in the left pane and enter more than 140 characters in `content`.
1. Click **▶** to run GraphQL Mutation.
1. Verify that the error message appears in the right pane.

{{% notice tip %}}
When creating more than 140 characters of text, you can use the created Fron-End application. (If you exceed 140 characters, you get an error)
{{% /notice %}}

![](/images/50_follow_timeline/createPostAndTimeline_error.png)


#### listTimelines

1. In the lower left corner, click on the text `ADD NEW Mutation`, choose `Query`, and then click `+`.
1. Click `listTimeline` in the left pane to create a Query using the following figure as a guide.
1. Enter `test_follower` for `userId`.
1. Click `Update Auth` at the top of the screen and change `Username` to `test_follower` created in 5.1.
1. Click **▶**︎ to execute a GraphQL Query.
1. Make sure that the Post you just created is displayed.

![](/images/50_follow_timeline/listTimelines_2.png)