+++
title = "手動デプロイ"
date = 2020-03-18T10:09:48+09:00
weight = 1
pre = "<b>4.1. </b>"
+++

### AWS Amplify Console
[AWS Amplify Console](https://aws.amazon.com/jp/amplify/console/)は、フルスタックのサーバーレスウェブアプリケーションをデプロイおよびホストするための、Git ベースのワークフローを提供しています。
ただ、今回は開発しているのが自分だけ、ということもあり、Gitベースでなく手動デプロイを行うことにしました。
Amplify CLIから、AWS Amplify Consoleを利用したアプリケーションホスティングを行いましょう。

`$ amplify add hosting`をターミナルで実行し、以下のように質問に答えていきます。

```
amplify add hosting
```

- Select the plugin module to execute `Hosting with Amplify Console (Managed hosting with custom domains, Continuous deployment)`
- Choose a type `Manual deployment`

続けて`$ amplify publish`コマンドでホスティングを開始しましょう。

```
amplify publish
```

{{% notice info %}}
`$ amplify publish`は`$ amplify push`と同じようにクラウドリソースへの変更を行なった上で、ウェブアプリケーションを手元でBuildし、Amplify Consoleでホスティングされたアプリケーションを更新するコマンドです。
{{% /notice %}}

{{% notice warning %}}
`$ amplify mock api`を動かしている状態で`$ amplify push`や`$ amplify publish`を実行した場合、`Parameters: [authRoleName] must have values`というエラーがでて`$ amplify push`や`$ amplify publish`が失敗する場合があります。
その場合は、`Ctrl + C`で`$ amplify mock api`のプロセスを中断してから、`$ amplify push`や`$ amplify publish`を実行してください。
{{% /notice %}}

数分待つと以下のように実行結果が返ってきます。
最後のURLにアクセスすると、ウェブサイトが閲覧できます。

```
✔ Zipping artifacts completed.
✔ Deployment complete!
https://production.XXXXXXXXXXX.amplifyapp.com
```