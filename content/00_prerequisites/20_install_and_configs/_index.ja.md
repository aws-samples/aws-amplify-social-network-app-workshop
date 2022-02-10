+++
title = "Install & Configs"
date = 2020-03-18T10:09:43+09:00
weight = 3
pre = "<b>1.2. </b>"
+++

{{% notice info%}}
本ワークショップは**ローカル環境での実施を推奨**します。
ローカル環境での`node.js`や`npm`のセットアップが困難な方は、AWS が提供するクラウドベースの統合開発環境 (IDE)である[AWS Cloud9](https://aws.amazon.com/jp/cloud9/)をお使いください。
詳しい手順は[10.1. Cloud9のセットアップ](/ja/100_supplemental_resource/10_cloud9.html)をご覧ください。
ただし、Amplify Mocking(手元での動作確認)には20002番ポートが利用可能である必要があり、一部の Cloud IDE では利用できないことがあります。
あらかじめご了承ください。
{{% /notice %}}

{{% notice tip%}}
Visual Studio CodeとDockerに馴染みがある場合、ローカル環境を使用する代わりに[aws-amplify-sns-workshop-in-vscode](https://github.com/toricls/aws-amplify-sns-workshop-in-vscode)を使うことができます。
その場合、このセクションのNode.js/npmのインストール、Javaのインストール、Amplify CLIのインストールはスキップできます。
{{% /notice %}}

コーディングを始める前に、いくつかのソフトウェアをインストール・アップデートしたり、環境設定を行います。

### Node.js/npmのインストール
Amplify CLIではNode.jsで10.x、npmでは6.x以降のバージョンが推奨されています。
本セクションではAmplifyの推奨バージョンのNode.js/npmがお手元の環境にインストールされているか確認します。
その上でNode.js/npmのインストールが必要な方のみ、インストール手順を実施していただきます。

1. バージョンの確認を行うため、ターミナルで次のコマンドを実行してください。
```
node -v; npm -v
# 以下は実行結果の例
v12.16.1 # <-Node.jsのバージョン
6.13.4 #<- npmのバージョン
```
2. Node.js 10.x以降のバージョンをお使いの方は次のセクションにお進みください
3. Node.js 10.xより前のバージョンをお使いの方、あるいはNode.jsがインストールされていない方は、ご自身で対処いただくか、次の手順にしたがってNode.jsのインストールをお願いします
    - [MacOSの手順](https://nodejs.org/en/download/package-manager/#macos)
    - [Windowsの手順](https://nodejs.org/en/download/package-manager/#windows)
    - [Amazon Linuxの手順](https://docs.aws.amazon.com/ja_jp/sdk-for-javascript/v2/developer-guide/setting-up-node-on-ec2-instance.html)
4. インストールができたことをご確認ください
```
node -v; npm -v
```

{{% notice tip %}}
パッケージ管理ツールであるnpmは、Node.jsのインストール時に自動的にインストールされます
{{% /notice %}}

### Java のインストール
Amplify MockingはOpenJDK 1.8 以降のJavaのランタイムを必要とします。
本セクションではAmplify Mockingが求めるバージョンのJavaがお手元の環境にインストールされているか確認します。
その上でJavaのインストールが必要な方のみ、Javaのインストール手順を実施していただきます。

1. Javaバージョンの確認
```
java -version
# 以下は実行結果の例
openjdk version "1.8.0_232"
OpenJDK Runtime Environment Corretto-8.232.09.1 (build 1.8.0_232-b09)
OpenJDK 64-Bit Server VM Corretto-8.232.09.1 (build 25.232-b09, mixed mode)
```
2. OpenJDK 1.8以降のバージョンをお使いの方は次のセクションにお進みください
3. OpenJDK 1.7以前のバージョンをお使いの方、あるいはJavaがインストールされていない方は、ご自身でアップデートいただくか、次の手順にしたがってJavaのインストールをお願いします。本手順では、AWSが提供する本番環境対応の無償OpenJDK Distributionである[Amazon Corretto](https://aws.amazon.com/jp/corretto/)のセットアップ方法を紹介いたします。
    - [MacOSの手順](https://docs.aws.amazon.com/ja_jp/corretto/latest/corretto-8-ug/macos-install.html)
    - [Windowsの手順](https://docs.aws.amazon.com/ja_jp/corretto/latest/corretto-8-ug/windows-7-install.html)
    - [Amazon Linuxの手順](https://docs.aws.amazon.com/ja_jp/corretto/latest/corretto-8-ug/linux-info.html)
1. インストールができたことをご確認ください
```
java -version
```

{{% notice tip %}}
MacOSでパッケージ管理ツールの`brew`がインストールされている場合、`$ brew cask install corretto`でインストール可能です。
{{% /notice %}}

### Amplify CLIのインストール

Amplfiy CLIのインストールのため、ターミナルで次のコマンドを実行してください。

```bash
# Install the AWS Amplify CLI
npm install -g @aws-amplify/cli@4.45.0
```

{{% notice warning %}}
すでにAmplify CLIをご利用されている方も、指定のVersionに合わせて再インストールをお願いします。
{{% /notice %}}

### Amplify CLIの設定
本ワークショップではAmplify CLIを使ってバックエンドの構築を行います。Amplify CLIがバックエンドに接続できるようにするためのIAMユーザの作成と認証情報の設定を行います。

```sh
amplify configure
```

`amplify configure` コマンドを実行すると、「Sign in to your AWS administrator account:」が表示されます

{{% notice info %}}
このとき、ルートユーザーでのログインが求められる場合がありますが、必ずしもルートユーザーである必要はありません。
「Amplifyが必要とする権限をもったIAMユーザー」を作成可能なIAMユーザーでログインしてください。
{{% /notice %}}

Enter キーを押すと使用するリージョンや IAM ユーザー名を訊かれます。リージョンには`us-east-1`を選択し、他は全てデフォルトを指定します。

https://console.aws.amazon.com/iam/~~ から始まるURLが発行されるので、別のブラウザでこのURLにアクセスします。

![confirmation](/images/00_prequisites/amplify-configure-new-iam.png)

※もしURLが発行されない場合は
[ここ](https://console.aws.amazon.com/iam/home?region=undefined#/users$new?step=details&accessKey&permissionType=policies&policies=arn:aws:iam::aws:policy%2FAdministratorAccess)
にアクセスして、任意のユーザ名を入力してください。

画面に沿って IAM ユーザーを作成します。特に選択肢や設定を変更する必要はなく、次に進めていきます。

{{% notice warning %}}
本手順で作成する `AdministratorAccess`権限を持つIAMユーザーは、非常に大きな権限を持ちます。
例えば、仮想VMサービスであるEC2のインスタンスを立ち上げたり、オブジェクトストレージサービスであるS3のデータをみたりと、様々なことができてしまいます。
IAMユーザーのクレデンシャル情報はGitHubなどに誤ってアップロードしないよう、厳重に保管することを意識しましょう。
ワークショップが終わったあと、必要なければIAMユーザーを削除することをお勧めします(参考: [IAMユーザーの削除](https://docs.aws.amazon.com/ja_jp/IAM/latest/UserGuide/id_users_manage.html#id_users_deleting))。
下のTipで紹介するように、本ワークショップで必要な権限のみを追加することも可能です。
あるいは、IAMユーザーを使用せずに、MFAを有効化したIAMロールでよりセキュアにAmplify CLIを使うことも可能です(参考: [IAM Roles & MFA](https://docs.amplify.aws/cli/usage/iam-roles-mfa))。
{{% /notice %}}

{{% notice tip %}}
Adimin権限をもったIAMユーザーを作成することに抵抗のある方は、
[10.3 IAM Policy](../100_supplemental_resource/30_iam_policy.html)
を参考にIAMポリシーを作成してください。
{{% /notice %}}

1. ユーザー作成 ![create iam user](/images/00_prequisites/creatingiamuser.jpg)
2. IAM ポリシーのアタッチ ![attach policy](/images/00_prequisites/attachingpolicy.jpg)
3. タグの追加 ![adding tags](/images/00_prequisites/addingtags.jpg)
4. 作成内容の確認 ![confirmation](/images/00_prequisites/creatinguserconfirmation.jpg)
5. ユーザー作成完了しましたが、***この画面を閉じないでください！*** ![confirmation](/images/00_prequisites/usercreated.jpg)

ターミナルに戻り、Enter キーを押します。アクセスキーID、シークレットアクセスキーID を訊かれるので、ブラウザの IAM ユーザー作成完了画面に表示されているものをコピーしてください。<br>
`Profile Name` はデフォルト（`default`）のままでもよいですが、後からわかりやすくするためにここでは `amplify-handson` とします。

![inputcredentials](/images/00_prequisites/inputcredentials.jpg)

コンソール上に「Successfully set up the new user.」と表示されることを確認してください。

これで、作成したIAMユーザの権限でAmplify CLIからコマンドを発行できるようになりました。

{{% notice tip %}}
[AWS CLI](https://docs.aws.amazon.com/ja_jp/cli/latest/userguide/cli-chap-welcome.html)がインストールされている場合は次のコマンドで作成したProfileを確認することもできます。
(インストールされていない方は実行する必要はありません)
{{% /notice %}}

```bash
aws sts get-caller-identity --profile amplify-handson
{
    "UserId": "XXXXXXXXXXXXXXXX",
    "Account":  "YYYYYYYYYYYY",
    "Arn": "arn:aws:iam::YYYYYYYYYYYY:user/amplify-ZZZZZ"
}
```