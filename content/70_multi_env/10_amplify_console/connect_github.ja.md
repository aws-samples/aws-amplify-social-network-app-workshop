+++
title = "GitHubと連携してCI/CD環境を構築する(1)"
date = 2020-03-24T10:09:46+09:00
weight = 2
pre = "<b>7.2. </b>"
+++

今までは、アプリケーションをデプロイする度に、ローカル環境で`amplify publish`コマンドを発行していました。これから紹介する[Amplify Console](https://aws.amazon.com/jp/amplify/console/)を用いることで、GitHub と連携した CI/CD 環境の構築を容易に行うことができます。

### Amplify Console とは？

Amplify Console は SPA(シングルページアプリケーション)や静的サイトのホスティング、CI/CD の運用を自動化するマネージドサービスです。 GitHub や AWS CodeCommit のようなソースリポジトリと連携し、CI/CD の仕組みを数クリックで構築することができます。また、ブランチごとにテスト環境を自動で構築したり、特定の環境のみ Basic 認証を付与するといった、柔軟な開発フローの設計が可能なサービスです。 Amplify Console と銘打っていますが、静的サイトであれば Amplify を用いなくても使用できるサービスです。

![](/images/07_multi_env/amplify_console.png)

### GitHub にソースコードを push する

ここまで作ってきたソースコードを GitHub に Push しましょう。GitHub の操作方法について熟知されている方は、「GitHub にソースコードを push する」の章は読み飛ばしていただいて構いません。ここでは、GitHub にソースを Push する方法について解説します。

{{% notice info %}}
リポジトリの種類には、プライベートリポジトリを選択してください。この後に紹介する Previews 機能(プルリク毎に自動的に環境を複製する機能)はセキュリティの観点からプライベートリポジトリのみ提供されます。パブリックリポジトリの場合も、その他の機能はご利用いただくことが可能です。
{{% /notice %}}

まず GitHub のアカウントにログインし、画面右上の「＋」ボタンから「New repository」を選択します。

{{< figure src="/images/07_multi_env/new_repository.png" title="" class="left" width="320"  >}}

「Create a new repository」で 任意の Repository name を入力し、リポジトリを作成します。この時、「Private」を指定することに注意してください。「Private」をどうしても選択できない場合は「Public」でリポジトリを作成します。

![](/images/07_multi_env/create_new_repository.png)

リポジトリが作成できたら、GitHub の URL をコピーします。この時、「SSH」が選択されていることに注意してください。

![](/images/07_multi_env/copy_ssh_git_url.png)

アプリケーションのトップディレクトリで以下のコマンドを実行し、GitHub にソースコードを push します。`git remote add origin <コピーしたgitのURL>`は先ほどコピーした git の URL に置き換えてください。

```sh
rm -rf .git  <-- 念の為.gitフォルダを削除
git init
git add .
git commit -m "first commit"
git remote add origin <コピーしたgitのURL>
git push -u origin master
```

GitHub のページをリロードして、ソースコードが更新されていれば push は成功です。

![](/images/07_multi_env/success_to_push.png)

### 補足：「Permission denied」でソースコードの push に失敗する場合

端末で GitHub の設定が完了していない場合、「Permission denied」で push に失敗することがあります。その場合は、以下の手順を実施してから再度 push コマンドを実行してください。

公開鍵・秘密鍵のペアを作成します。途中いくつか質問されますが、全てデフォルトで Enter を押してください。

```sh
cd ~/.ssh
ssh-keygen -t rsa
```

`~/.ssh/id_rsa.pub` というファイルが作成されるので、このファイルの中身をコピーします。

```sh
cat id_rsa.pub

ssh-rsa ... から始まる文字列をコピーする

```

[https://github.com/settings/ssh/new](https://github.com/settings/ssh/new) にアクセスし、「Title」と「key」を入力します。Title にはアクセスする端末を特定するわかりやすい名前を入力してください。「Key」には先ほどコピーした「ssh-rsa ...」から始まる文字列を貼り付けてください。「Add SSH key」を押下すると、公開鍵を登録することができます。

![](/images/07_multi_env/add_ssh_key.png)

この状態で再度、push コマンドを発行してください。

```sh
git push -u origin master
```
