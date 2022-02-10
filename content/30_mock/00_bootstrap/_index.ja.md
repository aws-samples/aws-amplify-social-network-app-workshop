+++
title = "Bootstrap"
date = 2020-03-18T10:09:45+09:00
weight = 1
pre = "<b>3.1. </b>"
+++

### 作業ディレクトリの作成
任意のディレクトリに移動していただいた後、次のコマンドを実行し、本ワークショップの作業を行うディレクトリを作成します。

```
mkdir amplify-sns-workshop
cd amplify-sns-workshop
```

{{% notice info %}}
後ほど見返した時に何のワークショップで作成したかわかりやすいようにしています
{{% /notice %}}

### Creating a React app
Reactのcreate-react-appコマンドを利用して、Reactウェブアプリケーションの雛形を作成していきます。

{{% notice tip %}}
create-react-appコマンドについての詳細は次のリンクご参照ください。[https://github.com/facebook/create-react-app](https://github.com/facebook/create-react-app).
{{% /notice %}}

```bash
npx create-react-app boyaki
cd boyaki
```

### Amplifyの初期化
先ほど`$ cd boyaki`で移動したReactのプロジェクトルートディレクトリ（`boyaki`）のトップで `amplify init` コマンドを実行します。

```bash
amplify init
```

途中いくつか質問をされます。以下の選択肢に注意して他はデフォルトでOKです。

- environment name : `production`
- Choose your default editor: `Vim (via Terminal, Mac OS only)` (お好きなエディタを選択してください)
- Please choose the profile you want to use `amplify-handson` (1.3.でAmplify用に作成されたProfileを選択してください)

以下は全質問への解答例です。

- Enter a name for the project `boyaki`
- Enter a name for the environment `production`
- Choose your default editor: `Vim (via Terminal, Mac OS only)`
- Choose the type of app that you're building `javascript`
- What javascript framework are you using `react`
- Source Directory Path:  `src`
- Distribution Directory Path: `build`
- Build Command:  `npm run-script build`
- Start Command:  `npm run-script start`
- Do you want to use an AWS profile? `Yes`
- Please choose the profile you want to use `amplify-handson`


{{% notice info %}}
事前準備で `amplify configure` を正しく完了していない場合、途中で `? Setup new user` と出て新しいユーザーをセットアップするか聞かれます。
その場合、`Y` と答えると、ブラウザで AWS マネジメントコンソールが立ち上がるので、マネジメントコンソールにログインし、その後のガイドに従ってください。
{{% /notice %}}

{{% notice tip %}}
Amplify CLIではYes/Noで回答する質問の際に`Y/n`や`y/N`と表示されます。
こうした質問では`yes`や`no`に加え、`y`や`n`で回答することができます。
また、`Y/n`であればYes、`y/N`であればNoがデフォルトの回答になりますので、デフォルトの回答でよければそのままEnterキーを押していただくこともできます。
{{% /notice %}}

Profile の選択が終わると、バックエンドの初期化を開始します。AWS CloudFormation によって、アプリケーションのバックエンドに必要な基礎的な AWS リソース（IAM Role、Amazon S3 バケットなど）が自動的に作成されます。

### 環境のテスト
コードの変更反映をリアルタイムで確認できるよう、development serverを立ち上げてブラウザで確認してみましょう。

```bash
npm start
```

development serverが立ち上がると、自動的にブラウザで`http://localhost:3000`が開かれます。
自動的に開かない場合はブラウザの検索窓に`http://localhost:3000`と入力してからEnterを押し、アクセスしましょう。

![](/images/30_mock/npm_start.png)

確認ができましたら、`$ npm start`を実行中のターミナルのタブはそのままに、新しくタブを開いて作業を進めていきます。

{{% notice info%}}
以下はCloud9を利用している方の手順になります。Cloud9を使用していない方は次へお進みください。
なお、繰り返しになりますが本ワークショップではローカル環境での実施を推奨しております。
{{% /notice %}}

Cloud9のPreviewメニューをクリックし、Preview Running Applicationを選択しましょう。

![preview running application](/images/10_getting_started/preview_running_application.png)

お好みで、新しいタブでPreviewを表示していただくことができます。

![pop app to new window](/images/10_getting_started/pop_browser_new_window.png)

最後に、追加でターミナルのタブを開きましょう。元のターミナルはそのままにしておき、development serverを立ち上げたままにします。このとき、`cd boyaki`を実行しておきます。

![new terminal](/images/10_getting_started/c9_new_terminal.png)

