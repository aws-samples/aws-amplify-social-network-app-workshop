+++
title = "本ワークショップのゴール"
date = 2020-03-18T10:09:44+09:00
weight = 1
pre = "<b>2.1. </b>"
+++

### 最終的な構成
![](/images/10_getting_started/final_architecture.png)

### 使用ツール
* [AWS Amplify CLI](https://github.com/aws-amplify/amplify-cli)を利用して、バックエンドのAWS上のリソースを高速にプロビジョニングします。

* [AWS Amplify JavaScript library](https://aws-amplify.github.io/)を利用して、フロントエンドのReactアプリケーションからバックエンドのリソースを呼び出します。

* [Amazon Cognito](https://aws.amazon.com/cognito/)を利用して、サービスを利用するユーザーの認証を行います。

* [Amazon DynamoDB](https://aws.amazon.com/dynamodb/)を利用して、投稿やフォロー関係、タイムラインなどを保存します。

* [AWS AppSync](https://aws.amazon.com/appsync/)を利用して、マネージドにGraphQL APIをホストします。

* [AWS Lambda](https://aws.amazon.com/lambda/)を利用して、サーバーサイドで複雑なビジネスロジックを実装します。

* [Amazon Elasticsearch Service](https://aws.amazon.com/elasticsearch-service)を利用して、全文検索機能を実装します。