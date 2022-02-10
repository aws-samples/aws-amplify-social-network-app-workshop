+++
title = "GitHubと連携してCI/CD環境を構築する(2)"
date = 2020-03-24T10:09:46+09:00
weight = 3
pre = "<b>7.3. </b>"
+++

### Amplify Console と GitHub アカウントを紐付ける

今までは`amplify publish`コマンドでアプリケーションをデプロイしてきました。Amplify Console と GitHub を連携することで、ソースコードの Push をしたタイミングで自動的にアプリケーションがデプロイされる仕組みを構築していきましょう。

まずは、既存の Hosting の設定を解除する必要があります。現時点で「production」「staging」環境が存在するので、まずは「production」環境から設定を解除していきましょう。

```sh
amplify env checkout production
```

```
$ amplify status

Current Environment: production <-- productionに切り替わっていることを確認
```

Hosting の設定を解除します

```sh
amplify remove hosting
```

`? Are you sure you want to delete the resource? This action deletes all files related to this resource from the backend directory.`には`Yes`と入力して Enter キーを押してください。

次に、Hosting 設定解除を「production」環境のバックエンドに反映します。
`amplify push`で設定を反映します。途中の質問には全てデフォルトで回答してください。

```sh
amplify push
```

{{% notice tip %}}
`remove hosting`の設定を反映したタイミングで、元の本番環境にはアクセスできなくなってしまいます。実際の運用の場合は、hosting 先の切り替えが行われないよう、Amplify Console を用いた hosting をお勧めします。
{{% /notice %}}

staging 環境も同様に Hosting 設定を解除します。

```sh
amplify env checkout staging
```

```
$ amplify status

Current Environment: staging <-- stagingに切り替わっていることを確認
```


```sh
amplify push
```

環境を production に戻します

```sh
amplify env checkout production
```

これで既存の Hosting 設定を解除できました。次に Amplify Console で Hosting するための設定を追加します。

```sh
amplify add hosting
```

`? Select the plugin module to execute (Use arrow keys)` では、`❯ Hosting with Amplify Console (Managed hosting with custom domains, Continuous deployment)`を

`? Choose a type`では`❯ Continuous deployment (Git-based deployments)`を選択し、Enter キーを押します

```sh
amplify add hosting
? Select the plugin module to execute Hosting with Amplify Console (Managed hosting with custom domains
, Continuous deployment)
? Choose a type
❯ Continuous deployment (Git-based deployments)
  Manual deployment
  Learn more
```

Cloud9 を使用している場合は、Amplify Console のマネジメントコンソール画面を開きます。今回作成したアプリが表示されているので、これを選択します。 ローカル端末で開発を行なっている場合は、コマンドラインから「Continuous deployment (Git-based deployments)」を選択したタイミングで、ソースリポジトリを選択する画面が自動で開きます。

![](/images/07_multi_env/click_app.png)

次の画面で連携するソースリポジトリを選択します。Amplify Console では今回連携する GitHub 以外にも BitBucket や AWS CodeCommit、GitLab などが連携できます。これらを使用せず、ビルドしたソースコードを S3 などから直接デプロイすることも可能です。今回は「GitHub」を選択し、「Connect branch」を押下します。

![](/images/07_multi_env/connect_github.png)

次の画面で、連携するリポジトリとブランチを選択します。先ほど作成したリポジトリと master ブランチを選択します。

![](/images/07_multi_env/sync_github_account.png)

次にビルド設定を行います。「Select a backend environment」からビルドするバックエンドの環境を選択できます。先ほど作成した「staging」とデフォルトの環境である「production」があります。今回は「production」環境を選択します。

また、この画面では Service Role を選択する必要があります。「Create new role」から新しいロールを作成し、このロールを指定します。ロールの設定項目は全てデフォルトを選択します。

環境の選択、Service Role の指定が終わったら、画面下部にある「次へ」ボタンを押下します。

![](/images/07_multi_env/create_build_settings.png)

設定内容を確認し、「保存してデプロイ」を押下します。

![](/images/07_multi_env/confirm.png)

ビルドがスタートします。デプロイが完了するまで数分かかります。(しばらく待っても表示内容に変化がない場合は、画面をリロードしてみてください)

![](/images/07_multi_env/start_build.png)

全てのステップが Green になったらデプロイは完了です。発行される URL からデプロイされたアプリケーションにアクセスすることができます。

![](/images/07_multi_env/complete_deploy.png)

コンソールに戻って、Enter キーを押下します。コンソールからホスティングされた環境を確認することができるようになります。

```null
? Continuous deployment is configured in the Amplify Console. Please hit enter once you conne
ct your repository
Amplify hosting urls:
┌──────────────┬─────────────────────────────────────────────────┐
│ FrontEnd Env │ Domain                                          │
├──────────────┼─────────────────────────────────────────────────┤
│ master       │ https://master.xxxxxxxxxxxxx.amplifyapp.com     │
├──────────────┼─────────────────────────────────────────────────┤
│ production   │ https://production.xxxxxxxxxxxxx.amplifyapp.com │
└──────────────┴─────────────────────────────────────────────────┘
```

これで GitHub と Amplify のバックエンドを紐づけることができました。試しにソースコードに簡単な修正を加えて、master ブランチに push してみましょう。

変更のわかりやすい例として、`Sidebar.js`のログアウトボタンのテキストを「Logout」から「Sign out」としてみましょう

```Sidebar.jsx
<ListItem key='logout'>
    <ListItemText primary={
    <Button
        variant="outlined"
        onClick={signOut}
        fullWidth
    >
        Sign out // <-- 「Logout」を「Sign out」に変更
    </Button>
} />
```

変更を加えたら、master ブランチに push します。

```sh
git add .
git commit -m "Edit Logout Button text"
git push
```

master ブランチに push すると、再度デプロイフローが開始されます。

![](/images/07_multi_env/re_deploy.png)

デプロイが完了したら、再度払い出された URL にアクセスします。master ブランチに push しただけで、変更が反映されていることがわかります。

![](/images/07_multi_env/compare.png)

いかがでしょうか？GitHub のブランチとバックエンドの紐付けを行うだけで簡単に CI/CD の環境を構築することができました。次の章では実運用を見据えた、もう少し複雑なデプロイフローを構築してみましょう。
