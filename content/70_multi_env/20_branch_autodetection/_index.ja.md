+++
title = "複雑な開発環境の構築(1)"
date = 2020-03-24T10:09:46+09:00
weight = 4
pre = "<b>7.4. </b>"
+++

### 実運用に即したバックエンドを設計する

前回の章では、以下の図のような master ブランチ(フロントエンド)に紐づいた production 環境(バックエンド)を構築しました。Amplify Console を活用することで master ブランチに push するだけでデプロイまで行うことができるようになりました。

![](/images/07_multi_env/master_env.png)

実際に複数人で開発を行う場合、staging 環境のような共通のテスト環境が必要になります。また、テスト環境の画面はエンドユーザに公開すべきではありません。テスト環境にはエンドユーザや検索エンジンのクローラーがアクセスできないよう Basic 認証の仕組みを導入します。

![](/images/07_multi_env/staging_env.png)

また、UI やデザインの開発を行う場合、ブランチごとにバックエンドの構築を行うことが効率的でないケースがあります。UI やデザインの変更は、多くの場合バックエンドの構成に影響を受けないためです。そういったケースの場合、例えば design/~から始まるブランチの場合、バックエンドは共通の物を使用するといった構成が望ましいでしょう。

![](/images/07_multi_env/design_env.png)

今回は上記のような構成の環境を構築していきたいと思います。

### staging 環境と develop ブランチを紐づける

develop ブランチを新たに作成し、 GitHub に push します。

```shß
git checkout -b develop
git push --set-upstream origin develop
```

### Amplify Console から staging 環境の設定を行う

Amplify Console の画面に戻り、stating 環境と develop ブランチの紐付けを行います。
アプリのトップ画面から「ブランチの接続」を押下します。

![](/images/07_multi_env/connect_develop-branch.png)

ブランチに「develop」、Backend environment に先ほど追加で作成した「staging」を選択します。

![](/images/07_multi_env/select_branch_env.png)

内容を確認し、「保存してデプロイ」を押下します。

![](/images/07_multi_env/staging_confirm.png)

develop ブランチのデプロイが開始されれば成功です。

![](/images/07_multi_env/success_to_create_staging.png)

コンソールで`amplify status`を発行すると、staging 環境の URL を確認することができます。

```null

$ amplify status

(省略)

Amplify hosting urls:
┌──────────────┬──────────────────────────────────────────────┐
│ FrontEnd Env │ Domain                                       │
├──────────────┼──────────────────────────────────────────────┤
│ develop      │ https://develop.xxxxxxxxxxxx.amplifyapp.com │
├──────────────┼──────────────────────────────────────────────┤
│ master       │ https://master.xxxxxxxxxxxx.amplifyapp.com  │
└──────────────┴──────────────────────────────────────────────┘

```

この状態では production 環境同様に、誰でも staging 環境の URL にアクセスできてしまいます。staging 環境には専用の ID/Pass を知っている人しかアクセスできないよう Basic 認証を追加しましょう。

Amplify Console の画面で「アクセスコントロール」＞「アクセスの管理」を選択します。

![](/images/07_multi_env/access_control.png)

develop ブランチの「Access Setting」を「制限-パスワードが必須です」に変更し、username と password を設定します。設定が完了したら「Save」を押下します。

![](/images/07_multi_env/setting_basic_auth_pass.png)

再び、staging 環境にアクセスし、Basic 認証が有効になっていることを確認します。

{{< figure src="/images/07_multi_env/enable_basic_auth.png" title="" class="left" width="480"  >}}

これで staging 環境の構築は完了です！

### design 環境を構築する

次に design 環境を構築します。design 環境と staging 環境の違いは複数のブランチで一つのバックエンドを共有するという点です。「design/」から始まるブランチ名は全て design 環境のバックエンドを参照するよう構築します。

![](/images/07_multi_env/share_multi_backend.png)

production、staging 環境を構築した時同様に、`amplify env add`コマンドで design 環境のバックエンドを構築します。

```sh
amplify env add
```

`? Do you want to use an existing environment?`と訊かれたら`No`を入力し Enter を押してください。`? Enter a name for the environment`には`design`を入力します。以降は、デフォルトの選択肢で Enter を押下します。

`amplify env list`で staging 環境の設定が作成されていることを確認します。

```sh
amplify env list
```

```null
$ amplify env list

| Environments |
| ------------ |
| production   |
| staging      |
| *design      |  <-- 環境が「design」に切り替わる
```

続いて、作成した設定を元に design 環境を構築します。

```sh
amplify push
```

しばらく待って、`✔ All resources are updated in the cloud`と表示されれば成功です。

次に design-base ブランチを GitHub に push します。

```sh
git add .
git commit -m "add design-base env"
git checkout -b design-base
git push --set-upstream origin design-base
```

### Amplify Console から design 環境の設定を行う

Amplify Console の画面に戻り、design 環境と design-base ブランチの紐付けを行います。
アプリのトップ画面から「ブランチの接続」を押下します。

![](/images/07_multi_env/connect_develop-branch.png)

ブランチに「design-base」、Backend environment に先ほど追加で作成した「design」を選択します。

![](/images/07_multi_env/select_branch_env_design.png)

内容を確認し、「保存してデプロイ」を押下します。

![](/images/07_multi_env/staging_confirm_design.png)

design ブランチのデプロイが開始されれば成功です。

![](/images/07_multi_env/success_to_create_staging.png)

コンソールで`amplify status`を発行すると、design 環境の URL を確認することができます。

```null

$ amplify status

(省略)

Amplify hosting urls:
┌──────────────┬──────────────────────────────────────────────────┐
│ FrontEnd Env │ Domain                                           │
├──────────────┼──────────────────────────────────────────────────┤
│ design-base  │ https://design-base.d3wy0v7jofaty.amplifyapp.com │
├──────────────┼──────────────────────────────────────────────────┤
│ develop      │ https://develop.d3wy0v7jofaty.amplifyapp.com     │
├──────────────┼──────────────────────────────────────────────────┤
│ master       │ https://master.d3wy0v7jofaty.amplifyapp.com      │
└──────────────┴──────────────────────────────────────────────────┘

```

{{% notice tip %}}
design-baseブランチはAmplify Consoleでdesign環境を認識させるためのダミーブランチです。以降の手順ではこのブランチは使用せず、「design/**」 の正規表現にマッチしたブランチがdesign環境を使用するよう設定していきます。
{{% /notice %}}

### 特定のブランチ名に design 環境を指定する

Amplify Console から 「desgin/」から始まるブランチ名の時は design 環境を使用するよう設定します。マネジメントコンソールの「全般」>「編集」を選択します。

![](/images/07_multi_env/general_settings.png)

編集画面で以下の設定を行います。

- Branch autodetection: Enabled
- Branch autodetection - patterms: design/\*\*
- Branch autodetection branch environment: design
- Branch autodetection access control: Enabled
  - 任意の username と password

![](/images/07_multi_env/branch_name_prefix_settings.png)

{{% notice tip %}}
Branch autodetection branch environment の設定を「Create new backend environment for every connected branch」にすると、ブランチごとに個別のバックエンドを構築することも可能です。
{{% /notice %}}

これで「desgin/」から始まるブランチ名が push された場合は、ブランチごとに design 環境をバックエンドとしたホスティングが実行されます。

試しに、「design/alpha」「design/beta」というブランチを作成して push してみましょう。

```sh
git checkout -b design/alpha
git push --set-upstream origin design/alpha
git checkout -b design/beta
git push --set-upstream origin design/beta
```

「desing/alpha」「design/beta」のデプロイが開始されたことが確認できます。

![](/images/07_multi_env/start-autodetect-branch.png)

{{% notice info %}}
この時、「desing/alpha」「design/beta」のブランチを同時にブランチをpushすると、片方のビルドが失敗することがあります。その場合は、失敗したビルドの画面で「このバージョンの再デプロイ」を押下し、再デプロイを行うと正しく処理が完了します。![](/images/07_multi_env/rebuild.png)


{{% /notice %}}

### おさらい

改めて今回作成した環境についておさらいしてみましょう。今回は「production」「staging」「design」の３種類のバックエンドを構築しました。それぞれの環境は「master」「develop」「design/」 というブランチに紐づいています。最後に作成した「design/alpha」「design/beta」ブランチは 「design/\*」の正規表現にマッチするため、design バックエンドとしてホスティングされています。また、production 環境以外のフロントエンドにアクセスする場合は Basic 認証を設定しました。

![](/images/07_multi_env/design_env.png)

今回はブランチにバックエンドを紐づける方法を学びました。次の章では、プルリクエストに紐づいたバックエンドの構築について試してみましょう。
