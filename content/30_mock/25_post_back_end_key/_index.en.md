+++
title = "Post feature: Back-end (2)"
date = 2020-03-18T10:09:47+09:00
weight = 4
pre = "<b>3.4. </b>"
+++

In this section, you add two Queries to the GraphQL API so that you can efficiently throw queries from the client application.

### Partition Key and Sort Key in Amazon DynamoDB
Amazon DynamoDB provisioned with `@model` is a key-value/document database that provides single-digit millisecond performance at any scale. 
To achieve this speed, you need to consider about access patterns.
It is best to use at most two Attributes (AppSync fields) for DynamoDB queries.
These two attributes are called Partition Key (PK) and Sort Key (SK).
DynamoDB can use a single PK as a primary key (unique identifier in Table) or a combination of PK and SK as a primary key.

Main role of @key (key directive) specifies PK and SK.
If you write a query without PK and SK, it scans all the contents in your DynamoDB table, which is very inefficient.
Not only takes time to query, but also costs more because of pay-as-you-go.

How do you design PK and SK this time?

### Think of the query you need
You want to automatically assign an ID to Post, and also want to pull the Post by specifying `id` in `getPost` Query.
You created the DynamoDB Table's Partition Key (PK) should remain the `id` field.

{{% notice tip%}}
If the `id` field is empty in the `createPost` argument, AppSync set up with Amplify automatically generates an ID and fills the `id` field.
In boyaki, `id` is not a required field in order to use the auto-generation function of this ID. (If `id` is required, `id` needs to be passed on the client side when `createPost` Mutation is executed)
{{% /notice%}}

However, while you want the list of Post to be in chronological order, you can only fetch it in a random order in `listPost` as we confirmed earlier.
In such case, you can create a DynamoDB index by using `@key` and create a query with a specific field as an argument.

{{% notice info%}}
Indexes set up in DynamoDB when using `@key` are called Global Secondary Index (GSI).
The detailed description of GSI is omitted.
Roughly speaking, GSI is a functionality of DynamoDB to create another table with different PK and SK, to avoid scanning, and to quickly execute specific queries. 
[[learn more](https://docs.aws.amazon.com/ja_jp/amazondynamodb/latest/developerguide/GSI.html)].
{{% /notice%}}


Now let's consider what format the client application wants to fetch data.

1. List all tweets in chronological order
1. List tweets by a specific user

### Set up @key
Let's write `@key` to achieve this.
Update `./amplify/backend/api/BoyakiGql/schema.graphql` as follows.

```graphql
type Post
  @model (
    mutations: {create: "createPost", delete: "deletePost", update: null}
    timestamps: null
    subscriptions: { level: public}
  )
  @auth(rules: [
    {allow: owner, ownerField:"owner", provider: userPools, operations:[read, create, delete]}
    {allow: private, provider: userPools, operations:[read]}
  ])
  @key(name: "SortByTimestamp", fields:["type", "timestamp"], queryField: "listPostsSortedByTimestamp")
  @key(name: "BySpecificOwner", fields:["owner", "timestamp"], queryField: "listPostsBySpecificOwner")
{
  type: String! # always set to 'post'. used in the SortByTimestamp GSI
  id: ID
  content: String!
  owner: String
  timestamp: Int!
}
```

The following three fields are used in `@key`.

- name: a name of the DynamoDB index (Global Secondary Index)
- fields: the first field is used for Partition Key, and the second field is used for Sort Key. If you write only one, only Partition Key is set up.
- queryField: a name of the GraphQL query, such as `getPost`.

What kind of query does the addition of `@key` allow?

- `listPostsSortedByTimestamp`
  - All Posts can be fetched by setting to PK to the `type` field that `"post"` is always contained.
  - By setting `timestamp` to SortKey, Posts are sorted with `timestamp` in ascending and descending direction.
- `listPostsBySpecificOwner`
  - You can list a certain `owner` Post by specifying `owner` in the PK.
  - By setting `timestamp` to SortKey, Posts are sorted with `timestamp` in ascending and descending direction.


### Checking Behavior with Amplify Mock
Let's take a look at Amplify GraphQL Explorer again to see how @key works.

{{% notice info%}}
Amplify Mocking requires port 20002 to be available and may not be available in all Cloud IDEs.
If you are using the applicable Cloud IDE, please do not follow this procedure and enjoy the atmosphere.
{{% /notice%}}


#### Applying @key
When multiple `@key`s are added, you need to restgart `$ amplify mock api`.

```bash
Ctrl + C 
amplify mock api
```

Also, please refresh the Amplify GraphQL Explorer webpage.

#### Creating a Post
You create multiple Posts with different `timestamp` from two different users.

1. First, create multiple Posts with different `timestamp` for the current user (`Username` is `user`).
1. Click `Update Auth` at the top of the screen, edit `Username` to `user_2`, and then click `Generate Token`.
1. To display a list of Posts, create a few Posts with referring to the previous steps.

![](/images/30_mock/graphql_change_auth.png)

#### Checking new Queries generated by @key

1. Confirm that `listPostsSortedByTimestamp` you just added to `query` and `listPostsBySpecificOwner` have been added.
1. Choose `listPostsSortedByTimestamp` and fill the fields as shown.
1. At the same time, choose `listPostsBySpecificOwner` and fill the fields as shown.
1. Click **▶** ︎to execute a GraphQL Query. (In this way GraphQL can execute multiple queries in a single API call at the same time)
1. In `listPostsSortedByTimestamp`, make sure that all `owner`'s Posts are listed in the order of `timestamp`.
1. In `listPostsBySpecificOwner`, make sure that only Posts by specific `owner` are listed in order of `timestamp`.
1. When the check is complete, execute `Ctrl+C` in the terminal where `$amplify mock api` is running to stop Amplify Mocking. The Amplify GraphQL Explorer is used later, so you can leave it as it is.

![](/images/30_mock/key.png) 

{{% notice tip%}}
Why Amplify Mocking?
In this workshop, there are not any significant changes to schema.
In actual development, significant changes are often made to the schema in the early stages and repeat tri-and-error.
The problem here is that DynamoDB PK/SK set by `@key` can only be set at the time of creation.
(If you want to change PK/SK in a situation where DynamoDB cannot be recreated, add GSI with `@key`.)
Therefore, it is best practice to develop with Amplify Mocking to a certain extent, and then apply it in the cloud after the specification is confirmed.
{{% /notice%}}