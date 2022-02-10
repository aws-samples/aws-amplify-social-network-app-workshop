+++
title = "Building staging environment"
date = 2020-05-04T15:08:21+09:00
weight = 1
pre = "<b>7.1. </b>"
+++

### amplify env

You can do something related with environment by running `amplify env`. `amplify env list` command shows you a list of your environment.

```sh
amplify env list
```

If you have done steps in previous chapters properly so far, you see only "production" environment.

```null
$ amplify env list

| Environments |
| ------------ |
| *production  |
```

Now let's create a new environment named "staging" by running the next command.

```sh
amplify env add
```

When you see a question `? Do you want to use an existing environment?`, please enter `No` and press Enter.
For `? Enter a name for the environment`, please enter `staging`. After that, you can just press Enter several times with default option. The prompt should look like following.

- Do you want to use an existing environment?: `No`
- Enter a name for the environment: `staging`
- Do you want to use an AWS profile?: `Yes`
- Please choose the profile you want to use `amplify-handson`

After a while, you see `Initialized your environment successfully.`, and then the process is done.

Please run `amplify env list` again. There is a `production` environment on the list. The one with "\*" is the current environment where you are now.

```null
$ amplify env list

| Environments |
| ------------ |
| production   |
| *staging     |  <-- Your present enviroment is changed to "staging"
```

So, let's run `amplify status` at this timing. You have changed your local environment to "staging" at the last step, but the backend resources have not been built yet.


```
Current Environment: staging   <-- "staging" environment is specified now

| Category | Resource name         | Operation | Provider plugin   |
| -------- | --------------------- | --------- | ----------------- |
| Auth     | boyakia3e66b29        | Create    | awscloudformation |
| Api      | BoyakiGql             | Create    | awscloudformation |
| Hosting  | amplifyhosting        | Create    | awscloudformation |
| Function | createPostAndTimeline | Create    | awscloudformation |


Amplify hosting urls: 
┌──────────────┬──────────────────────────────────────────────────┐
│ FrontEnd Env │ Domain                                           │
├──────────────┼──────────────────────────────────────────────────┤
│ production   │ https://production.xxxxxxxxxxxxxx.amplifyapp.com │　
└──────────────┴──────────────────────────────────────────────────┘
^ Backend resources for staging environment have not been there yet.
```

You can switch the current environment by running `amplify env checkout <envname>` command.

```sh
amplify env checkout production
```

```null
$ amplify env list

| Environments |
| ------------ |
| *production  |   <-- The current environemnt is switched to "production"
| staging      |
```

{{% notice tip %}}
At this moment, a backend for staging environment has not been created yet. When you run `amplify env add` command, some resources required to build backend such as AWS IAM Roles, Amazon S3 Bucket, and an application on your [Amplify Console](https://aws.amazon.com/jp/amplify/console/) we will take a look later.
{{% /notice %}}

### Building a backend for staging environment

Now you are ready to build a backend for staging environment. To build the backend, you can use `amplify push` command as well as previous steps. Let's switch back the current environment to "staging" and build a backend.


```sh
amplify env checkout staging
amplify push
```

You get a couple of questions, then you can answer with default option at all. After a while, a new backend have been built.

```null
(snip)
...
CREATE_COMPLETE                     functioncreatePostResolver               AWS::CloudFormation::Stack Tue Mar 24 2020 04:25:16 GMT+0000 (Coordinated Universal Time)
UPDATE_COMPLETE_CLEANUP_IN_PROGRESS amplify-amplifyweek2020apr-staging-35217 AWS::CloudFormation::Stack Tue Mar 24 2020 04:25:18 GMT+0000 (Coordinated Universal Time)
UPDATE_COMPLETE                     amplify-amplifyweek2020apr-staging-35217 AWS::CloudFormation::Stack Tue Mar 24 2020 04:25:19 GMT+0000 (Coordinated Universal Time)
⠏ Updating resources in the cloud. This may take a few minutes...⠋ Generating GraphQL✔ Generated GraphQL operations successfully and saved at src/graphql
✔ All resources are updated in the cloud

GraphQL endpoint: https://xxxxxxxxxxxxxxxxxxxxxxxxxx.appsync-api.us-east-1.amazonaws.com/graphql

```

If you can see `✔ All resources are updated in the cloud`, building production environment has done.

So let's run `amplify status` command. The staging environment is added as a new backend.

```
Current Environment: staging

| Category | Resource name  | Operation | Provider plugin   |
| -------- | -------------- | --------- | ----------------- |
| Auth     | boyakid6e86bd3 | No Change | awscloudformation |
| Api      | boyaki         | No Change | awscloudformation |
| Hosting  | amplifyhosting | No Change | awscloudformation |

GraphQL endpoint: https://xxxxxxxxxxxxxxxxxxxxxxxx.appsync-api.ap-northeast-1.amazonaws.com/graphql

Amplify hosting urls: 
┌──────────────┬──────────────────────────────────────────────────┐
│ FrontEnd Env │ Domain                                           │
├──────────────┼──────────────────────────────────────────────────┤
│ production   │ https://production.xxxxxxxxxxxxxx.amplifyapp.com │
├──────────────┼──────────────────────────────────────────────────┤
│ staging      │ https://staging.xxxxxxxxxxxxxx.amplifyapp.com    │
└──────────────┴──────────────────────────────────────────────────┘
^ staging environment is added
```

### Run your application on the staging environment

After building a backend finished, please start your application.

```sh
npm start
```

If you can see login screen, it works! Please try to log in with a user you created on "production" environment earlier.

![](/images/07_multi_env/production_user_not_exist.png)

You see the message "User does not exist". It indicates that the current backend is not same as the other one for "production" environment. You can confirm that the user on production environment has not been existing yet on the current "staging" environment.

In this way, you can copy your existing environment as new ones easily by using the amplify env command. In the next chapter, let's connect GitHub to Amplify and build a mechanism that is hosting your application automatically on source code changes.
