+++
title = "Follow feature: Back-end"
date = 2020-03-18T10:09:49+09:00
weight = 1
pre = "<b>5.1. </b>"
+++

First, you implement the GraphQL API, which provides the following functions necessary for implementing the timeline.

{{< figure src="/images/50_follow_timeline/architecture_follow.png" title="" class="center" width="50%">}}

### Create GraphQL API
Let's create a FollowRelationship table so that one user can store the state following another user.
Add the following code to `./amplify/backend/api/BoyakiGql/schema.graphql`:

```graphql
type FollowRelationship
	@model(
    mutations: {create: "createFollowRelationship", delete: "deleteFollowRelationship", update: null}
    timestamps: null
  )
	@auth(rules: [
		{allow: owner, ownerField:"followerId", provider: userPools, operations:[read, create, delete]},
		{allow: private, provider: userPools, operations:[read]}
	])
	@key(fields: ["followeeId", "followerId"])
{
	followeeId: ID!
	followerId: ID!
	timestamp: Int!
}
```

The points are as follows:

- Fields
	- `followeId` is the `username` of the person being followed.
	- `followerId` is the `username` of the person following.
	- `tiemstamp` is the date and time when follow.
- `@model`
	-  GraphQL API doesn't have API for updating Post by specifing `mutations: ...` because user doesn't need to update Post in this app. [detail](https://docs.amplify.aws/cli/graphql-transformer/model#usage) 
	- Post type doesn't have `createdAt` and `updatedAt` attributes which are created by default by specifing `timestamps:...`. Use AWS Timestamp `timestamp` attribute instead here.
- `@auth`
	- `{allow: owner...` allows users to create and view FollowRelationships
	- `{allow: private... ` allows other users to view FollowRelasionship
- `@key`
	- If you do not specify `name` or `queryField`, you can set Partition Key (PK) or Secondary Key (SK) of DynamoDB Table itself (not GSI).
	- This time, get a list of FollowRelationships associated with a `followeId` to duplicate the Post to the Timeline of followers of those who posted the Post.
	- So specify `followeeId` as PK and `followerId` as SK.

### Operation Verification by Mocking
Let's run `$amplify mock api` to see if the FollowRelationship API works as expected.

{{% notice info%}}
Amplify Mocking requires port 20002 to be available and may not be available in all Cloud IDEs.
If you are using the applicable Cloud IDE, please do not follow this procedure and enjoy the atmosphere.
{{% /notice %}}

```bash
amplify mock api

...

AppSync Mock endpoint is running at http://XXX.XXX.XXX.XXX:20002
```

Copy the Mock endpoint and access it in any browser.

#### createFollowRelationship
First, let's create a FollowRelationship.

1. In the lower left corner, click `ADD NEW Query`, choose `Mutation`, and then click `+`.
1. Click on the `Update Auth` button to make `Username` `test_follower`.
1. Click `createFollowRelationship` in the left pane and fill the checkboxes and fields as shown in the following figure.
	1. `followeId`: `test_followee`
	1. `followerId`: `test_follower`
1. Click **▶** to run the GraphQL Mutation.


![](/images/50_follow_timeline/follow_mutation.png)


{{% notice info %}}
If a `Unauthorized Error` occurs, click on the `Update Auth` button and please make sure `Username` of the user currently issuing Mutation matches `followerId`. As set by `@auth`, only the following users (= followers) can execute `createFollowRelationship`. If the error did not occur, you should try running `followerId` as another `Username` and make sure that `Unauthorized Error` occurs.
{{% /notice %}}

#### listFollowRelationships
Next, you get a list of followers for a user.

1. In the lower left corner, click on the text `ADD NEW Mutation`, choose `Query`, and then click `+`.
1. Click `listFollowRelationship` in the left pane and fill the checkboxes and fields as shown in the following figure.
	1. `followeId`: `test_followee`
1. Click **▶**︎ to execute a GraphQL Query.
1. The results are displayed in the right pane. Make sure that the FollowRelationship you just created is displayed.

![](/images/50_follow_timeline/listFollower.png)