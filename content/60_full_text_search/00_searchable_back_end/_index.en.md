+++
title = "Full text search: Back-end"
date = 2020-03-18T10:09:53+09:00
weight = 1
pre = "<b>6.1. </b>"
+++

Implementing full-text search using AWS Amplify is very simple.

### @searchable
The `@searchable` directive allows full-text search for the given model.
Open `./amplify/backend/api/BoyakiGql/schema.graphql` and add `@searchable` to Post type.

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
    {allow: private, provider: iam ,operations:[create]}
  ])
  @key(name: "SortByTimestamp", fields:["type", "timestamp"], queryField: "listPostsSortedByTimestamp")
  @key(name: "BySpecificOwner", fields:["owner", "timestamp"], queryField: "listPostsBySpecificOwner")
  @searchable
{
  type: String! # always set to 'post'. used in the SortByTimestamp GSI
  id: ID
  content: String!
  owner: String
  timestamp: Int!
}
```

The current `schema.graphql` is as follows:

{{%attachments title="./amplify/backend/api/BoyakiGql/schema.graphql" pattern="schema.graphql"/%}}

{{% notice tip %}}
If you use `@searchable` directive, Amplify provisions [Amazon DynamoDB Streams](https://docs.aws.amazon.com/ja_jp/amazondynamodb/latest/developerguide/Streams.html) and [ Amazon Elasticsearch Service](https://aws.amazon.com/jp/elasticsearch-service/).
DynamoDB Streams hooks the inserted data into the DynamoDB Table and adds the record to Elasticsearch.
To throw a query from the front end to Elasticsearch, execute a Query called `searchPosts` that is set up in the GraphQL API automatically.
Please note that Elasticsearch cannot query data before the `@searchable` directive is granted.
For more information about `@searchable`, see [here](https://docs.amplify.aws/cli/graphql-transformer/directives#searchable).
{{% /notice %}}

### Operation Verification
Unfortunately, `@searchable` does not currently support Amplify Mocking.
Therefore, this time, use the management console of AWS AppSync to verify its operation.

#### Applying Changes to the Cloud

```bash
$ amplify push
```

It takes about 10 minutes to run.

#### Create a Post
Since Elasticsearch cannot query insert data before the `@searchable` directive is granted, create a new Post.

1. Run the `$ amplify status` command and check the item in `Amplify hosting urls` to verify the URL.
1. Create a few posts through the app you created (let's keep your posts in mind, thinking about searching later)

#### AWS AppSync
1. Open [AWS AppSync Management Console](https://us-east-1.console.aws.amazon.com/appsync/home?region=us-east-1#/apis).
1. Open the API you created this time (if you created it according to this workshop manual, the name is `BoyakiGql-production`).
1. Open `Query` from the menu on the left.
1. Click `Log in User Pool` to the right of **▶**︎.
1. Enter the Username/Password and WebClient ID of the user you want to log in to.
  1. WebClientID can be referred as `aws_user_pools_web_client_id` in `./src/aws-exports.js `
  1. Example: XXXXXX.... of `"aws_user_pools_web_client_id": "XXXXXXXXXXXxXXXXXXXXXXXXXXXXX"`
1. Write the following Query in the left pane: Enter phrase you want to search for instead of `Amplify`.
```
query MyQuery{
  searchPosts (
      filter: {content: { matchPhrase: "AWS Amplify"} }
  ){
      items{
          id
          content
          owner
      }
  }
}
```
1. You can get a Post list containing the phrase entered in `content`.

![](/images/60_full_text_search/searchPosts.png)

{{% notice tip%}}
`matchPhrase` is equivalent to the `match_phrase` query in Elasticsearch.
Matches if all search keywords passed in half-width space-separated appear in that order.
In addition, complex queries using `match`, `multiPhrase`, `wildcard`, and `or``and` conditions are also supported.
The queries available in `@searchable` are [here](https://docs.amplify.aws/cli/graphql-transformer/directives#usage-5).
{{% /notice %}}