+++
title = "staging 環境の構築"
date = 2020-03-24T10:09:46+09:00
weight = 1
pre = "<b>7.1. </b>"
+++

### amplify env

`amplify env` コマンドで環境に関する命令を実行することができます。`amplify env list`を実行すると、環境の一覧を取得することができます。

```sh
amplify env list
```

今までの手順を実施してきたのであれば「production」という環境のみ存在しています。

```null
$ amplify env list

| Environments |
| ------------ |
| *production  |
```

次のコマンドを実行し、「staging」という名前の環境を作ってみましょう。

```sh
amplify env add
```

`? Do you want to use an existing environment?`と訊かれたら`No`を入力し Enter を押してください。`? Enter a name for the environment`には`staging`を入力します。以降は、デフォルトの選択肢で Enter を押下します。

- Do you want to use an existing environment?: `No`
- Enter a name for the environment: `staging`
- Do you want to use an AWS profile?: `Yes`
- Please choose the profile you want to use `amplify-handson`

しばらくして`Initialized your environment successfully.`と表示されれば処理は完了です。

もう一度、`amplify env list`を実行してみましょう。「production」環境が追加されていることが確認できます。「\*」がついているのが現在の環境です。

```null
$ amplify env list

| Environments |
| ------------ |
| production   |
| *staging     |  <-- 環境が「staging」に切り替わる
```

このタイミングで`amplify status`を発行してみましょう。一つ前の手順では、ローカル環境をstagingに切り替えましたが、この段階ではバックエンドは構築されていません。

```
Current Environment: staging   <-- 「staging」環境が指定されている

| Category | Resource name  | Operation | Provider plugin   |
| -------- | -------------- | --------- | ----------------- |
| Auth     | boyakid6e86bd3 | Create    | awscloudformation |
| Api      | boyaki         | Create    | awscloudformation |
| Hosting  | amplifyhosting | Create    | awscloudformation |


Amplify hosting urls: 
┌──────────────┬──────────────────────────────────────────────────┐
│ FrontEnd Env │ Domain                                           │
├──────────────┼──────────────────────────────────────────────────┤
│ production   │ https://production.xxxxxxxxxxxxxx.amplifyapp.com │　
└──────────────┴──────────────────────────────────────────────────┘
↑ バックエンドにはまだstaging環境は構築されていない
```
`amplify env checkout <環境名>`で現在の環境を切り替えることができます。

```sh
amplify env checkout production
```

```null
$ amplify env list

| Environments |
| ------------ |
| *production  |   <-- 環境が「production」に切り替わる
| staging      |
```

{{% notice tip %}}
この段階ではまだクラウド上には staging 用のバックエンドは構築されていません。`amplify env add`を発行した段階では、バックエンド構築のために必要な IAM ロール、S3 バケット、そしてこの後の手順で説明する[Amplify Console](https://aws.amazon.com/jp/amplify/console/)のアプリケーションが構築されています。
{{% /notice %}}

### staging 環境のバックエンドを構築

ここまでで staging 環境のバックエンドを構築する準備ができました。バックエンドの構築には、今までと同じように`amplify push`コマンドを用いることができます。環境を再び「staging」に戻して、バックエンドを構築しましょう。

```sh
amplify env checkout staging
amplify push
```

いくつか質問をされますが、全てデフォルトで回答します。しばらくするとバックエンドの構築が完了します。

```null
(省略)
...
CREATE_COMPLETE                     functioncreatePostResolver               AWS::CloudFormation::Stack Tue Mar 24 2020 04:25:16 GMT+0000 (Coordinated Universal Time)
UPDATE_COMPLETE_CLEANUP_IN_PROGRESS amplify-amplifyweek2020apr-staging-35217 AWS::CloudFormation::Stack Tue Mar 24 2020 04:25:18 GMT+0000 (Coordinated Universal Time)
UPDATE_COMPLETE                     amplify-amplifyweek2020apr-staging-35217 AWS::CloudFormation::Stack Tue Mar 24 2020 04:25:19 GMT+0000 (Coordinated Universal Time)
⠏ Updating resources in the cloud. This may take a few minutes...⠋ Generating GraphQL✔ Generated GraphQL operations successfully and saved at src/graphql
✔ All resources are updated in the cloud

GraphQL endpoint: https://xxxxxxxxxxxxxxxxxxxxxxxxxx.appsync-api.us-east-1.amazonaws.com/graphql

```

`✔ All resources are updated in the cloud`と表示されれば staging 環境の構築は完了です。

ここで`amplify status`のコマンドを実行してみましょう。バックエンドにstaging環境が追加されていることがわかります。

```
Current Environment: staging

| Category | Resource name         | Operation | Provider plugin   |
| -------- | --------------------- | --------- | ----------------- |
| Auth     | boyakia3e66b29        | Create    | awscloudformation |
| Api      | BoyakiGql             | Create    | awscloudformation |
| Hosting  | amplifyhosting        | Create    | awscloudformation |
| Function | createPostAndTimeline | Create    | awscloudformation |

GraphQL endpoint: https://xxxxxxxxxxxxxxxxxxxxxxxx.appsync-api.ap-northeast-1.amazonaws.com/graphql

Amplify hosting urls: 
┌──────────────┬──────────────────────────────────────────────────┐
│ FrontEnd Env │ Domain                                           │
├──────────────┼──────────────────────────────────────────────────┤
│ production   │ https://production.xxxxxxxxxxxxxx.amplifyapp.com │
├──────────────┼──────────────────────────────────────────────────┤
│ staging      │ https://staging.xxxxxxxxxxxxxx.amplifyapp.com    │
└──────────────┴──────────────────────────────────────────────────┘
↑ staging環境が追加されていることがわかる
```

### staging 環境でアプリケーションを実行する

バックエンドの構築が完了したらアプリケーションを実行します。

```sh
npm start
```

ログイン画面が表示されたら成功です。試しに、「production」環境で作成したユーザでログインを試みてください。

![](/images/07_multi_env/production_user_not_exist.png)

「User does not exist」と表示されます。「production」環境とは別のバックエンドが構築されているためユーザが存在しないことが確認できます。

このように、amplify env コマンドを用いれば、環境を容易に複製することができます。次の章では GitHub と Amplify を連携させ、ソースコードの変更をトリガーに自動的にアプリケーションがホスティングされる仕組みを構築していきましょう。
