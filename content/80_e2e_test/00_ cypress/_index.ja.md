+++
title = "CI/CDにE2E テストを組み込む"
date = 2020-03-24T10:09:46+09:00
weight = 1
pre = "<b>8.1. </b>"
+++

### Cypress のインストール

Amplify は E2E テスティングフレームワークである[Cypress](https://www.cypress.io/)をサポートします。Amplify Console と統合することで簡単に E2E テストを CI/CD 環境に組み込むことができます。今回は、develop ブランチをデプロイするときに E2E テストを実行するよう設定してみましょう。

develop ブランチに切り替えて、プロジェクトに`cypress`をインストールします。

```sh
git checkout develop
npm install cypress@6.3.0 mochawesome@4.1.0 mocha start-server-and-test --save-dev
```

### テストコードの記述

インストールが完了したら、テストを記述するフォルダとファイルを作成します。今回は`cypress/integration/authenticator_spec.js`を作成し、ここにテストコードを記述していきます。

```sh
mkdir -p cypress/integration
touch cypress/integration/authenticator_spec.js
touch cypress.json
```

今回の E2E テストでは以下のフローが正しく機能するかのテストを記述していきます。

1. トップページにアクセスし、ログイン画面を表示させる
2. テスト用のユーザ ID/パスワードでログインさせる
3. ログイン後の画面に「Global」というテキストが表示されていることを確認する

`cypress/integration/authenticator_spec.js`に以下のようなコードを記述します。
(ユーザ ID、パスワードを置き換えてください。)

```js
describe('Authenticator:', function() {
  beforeEach(function() {
      cy.visit('/');
  });
  describe('Sign In:', () => {
      it('allows a user to signin', () => {
          cy.get(selectors.usernameInput).type(
            '<** staging環境に存在するユーザID **>'
          );
          cy.get(selectors.signInPasswordInput).type(
            '<** staging環境に存在するユーザのパスワード **>'
          );
          cy.get(selectors.signInSignInButton).contains('Sign In').click();
          cy.wait(3000)
          cy.get(selectors.root).contains('Global');
      });
  });
});
export const selectors = {
  usernameInput: '[data-test="sign-in-username-input"]',
  signInPasswordInput: '[data-test="sign-in-password-input"]',
  signInSignInButton: '[data-test="sign-in-sign-in-button"]',
  root: '#root'
};
```

`cypress.json`に以下の設定を追加し、Cypressがテストを実行するためのサーバを指定します。

```json
{
    "baseUrl": "http://localhost:3000",
    "includeShadowDom": true
}
```

### Amplify Console に E2E の設定を追加

次に Amplify Console に E2E のテストを実行するよう設定を変更します。
Amplify Console の「ビルドの設定」> 「ビルド設定の追加」から「編集」ボタンを押下し、以下の設定で上書きます。
この yaml ファイルは Amplify Console のビルド設定を記述するものです。amplify.yml のうち、`test`から始まる以下の設定が cypress の設定です。

![](/images/80_e2e/build_settings.png)

```
version: 0.1
backend:
  phases:
    build:
      commands:
        - "# Execute Amplify CLI with the helper script"
        - amplifyPush --simple
frontend:
  phases:
    preBuild:
      commands:
        - yarn install
    build:
      commands:
        - yarn run build
  artifacts:
    baseDirectory: build
    files:
      - "**/*"
  cache:
    paths:
      - node_modules/**/*
test:
  artifacts:
    baseDirectory: cypress
    configFilePath: "**/mochawesome.json"
    files:
      - "**/*.png"
      - "**/*.mp4"
  phases:
    preTest:
      commands:
        - yarn install
        - yarn add mocha mochawesome mochawesome-merge mochawesome-report-generator
    test:
      commands:
        - npx start-test 'yarn start' 3000 'npx cypress run --reporter mochawesome --reporter-options "reportDir=cypress/report/mochawesome-report,overwrite=false,html=false,json=true,timestamp=mmddyyyy_HHMMss"'
    postTest:
      commands:
        - npx mochawesome-merge cypress/report/mochawesome-report/mochawesome*.json > cypress/report/mochawesome.json
```

設定したビルド設定をダウンロードし、プロジェクトのトップディレクトリ配下に配置します。

![](/images/80_e2e/amplifyyml_dl.png)

設定が完了すると、デプロイフローに「test」の項目が追加されたことが確認できます。

![](/images/80_e2e/test_flow.png)

{{% notice tip %}}
プロジェクトのトップディレクトリに`amplify.yml`を作成すると、マネジメントコンソールで保存した設定を上書くことが可能です。amplify.yml の記述方法の詳細については[こちら](https://docs.aws.amazon.com/ja_jp/amplify/latest/userguide/build-settings.html)のドキュメントをご覧ください。
{{% /notice %}}

develop ブランチに今回の設定を反映させてみましょう。

```sh
git add .
git commit -m "add cypress settings"
git push
```

Amplify Console の画面に戻ります。しばらくするとデプロイが完了します。「test」の項目をクリックし、E2E のテスト結果を確認してみましょう。

![](/images/80_e2e/success_to_e2e.png)

authenticator のテストが成功していることがわかります。「Download artifacts」をクリックすると、テストの様子を撮影した動画ファイルをダウンロードできます。

![](/images/80_e2e/success_to_authenticator_test.png)

ファイルを解凍し、mp4 ファイルを再生してみましょう。想定した通りテストが実施されていることがわかります。

![](/images/80_e2e/play_test_video.png)
