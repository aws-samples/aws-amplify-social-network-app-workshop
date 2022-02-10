+++
title = "認証機能"
date = 2020-03-18T10:09:46+09:00
weight = 2
pre = "<b>3.2. </b>"
+++

本セクションではアプリケーションにユーザー認証の機能を追加していきます。
{{< figure src="/images/30_mock/architecture_auth.png" title="Authentication" class="center" width="50%">}}

### 認証機能の追加
`amplify add auth`を実行し、認証機能をアプリへ追加します。いくつか質問されますので、全てデフォルトの選択肢を選びます。

```sh
amplify add auth
```

- Do you want to use the default authentication and security configuration? `Default configuration`
- How do you want users to be able to sign in? `Username`
- Do you want to configure advanced settings? `No, I am done.`

1. `amplify status`を実行し、Auth Categoryのリソースが追加されていることを確認します。
```
$ amplify status

Current Environment: production

| Category | Resource name  | Operation | Provider plugin   |
| -------- | -------------- | --------- | ----------------- |
| Auth     | boyaki6ab6e661 | Create    | awscloudformation |
```
1. `amplify push`を実行し、クラウドへ変更を反映します。`Are you sure you want to continue?`と聞かれるのでEnterを押します。
```
amplify push
✔ Successfully pulled backend environment production from the cloud.

Current Environment: production

| Category | Resource name  | Operation | Provider plugin   |
| -------- | -------------- | --------- | ----------------- |
| Auth     | boyaki6ab6e661 | Create    | awscloudformation |
? Are you sure you want to continue? Yes
```
1. 数分待つとクラウドへの反映が終了します。

{{% notice tip %}}
`amplify add $CATEGORY_NAME`コマンドは、任意のCategoryのリソースをアプリケーションに追加するコマンドです([詳細](https://docs.amplify.aws/cli/start/workflows#amplify-category-add))。
`ampfliy status`コマンドは、現在アプリケーションに追加されているリソース一覧を表示するコマンドです。
`ampfliy push`コマンドは、`amplify add`コマンドなどによる変更をクラウドのリソースへ反映するコマンドです。逆に言えば`amplify push`コマンドを実行しない限り、クラウドのリソースへ反映されません([詳細](https://docs.amplify.aws/cli/start/workflows#amplify-push))。
{{% /notice %}}

### 認証機能のフロントエンドへの実装
AmplifyはReactで利用可能な便利なUIコンポーネントをまとめたライブラリ、[@aws-amplify/ui-react](https://docs.amplify.aws/ui/q/framework/react)を提供しています。
今回は[Authenticator](https://docs.amplify.aws/ui/auth/authenticator/q/framework/react)を利用して、認証機能を追加します。

1. `aws-amplify`と`Amplify Framework`をアプリケーションに追加します。
```
npm install --save aws-amplify@3.3.14 @aws-amplify/ui-react@0.2.34
```
この際`npm ERR! peer react@"^16.7.0" from @aws-amplify/ui-react@0.2.34`が出る場合は、Reactのバージョンを16系に変更する必要があります。`package.json`ファイルを以下の内容に書き換えてください。
```json
{
  "name": "boyaki",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@testing-library/jest-dom": "^5.14.1",
    "@testing-library/react": "^11.2.7",
    "@testing-library/user-event": "^12.8.3",
    "react": "16.8.0",
    "react-dom": "16.8.0",
    "react-scripts": "4.0.3",
    "web-vitals": "^1.1.2"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
```
さらに、`npm install`を実行してください
```bash
npm install
```
そして、もう一度必要ライブラリのインストールを実施します。
```bash
npm install --save aws-amplify@3.3.14 @aws-amplify/ui-react@0.2.34
```
1. `./src/App.js`ファイルの中身を以下の内容に置き換えます(元あったコードは全て削除してOKです)。

```js
import React from 'react';
import Amplify from 'aws-amplify';
import { AmplifyAuthenticator, AmplifySignUp, AmplifySignOut } from '@aws-amplify/ui-react';
import { AuthState, onAuthUIStateChange } from '@aws-amplify/ui-components';
import awsconfig from './aws-exports';

Amplify.configure(awsconfig);

const App = () => {
    const [authState, setAuthState] = React.useState();
    const [user, setUser] = React.useState();

    React.useEffect(() => {
        return onAuthUIStateChange((nextAuthState, authData) => {
            setAuthState(nextAuthState);
            setUser(authData)
        });
    }, []);

  return authState === AuthState.SignedIn && user ? (
      <div className="App">
          <div>Hello, {user.username}</div>
          <AmplifySignOut />
      </div>
    ) : (
      <AmplifyAuthenticator>
        <AmplifySignUp
          slot="sign-up"
          formFields={[
            { type: "username" },
            { type: "password" },
            { type: "email" }
          ]}
        />
      </AmplifyAuthenticator>
  );
}

export default App;
```

{{% notice tip %}}
デフォルトでは電話番号の入力フォームが表示されますが、今回は必要ないため、`formFields`を指定することで非表示にしています。
{{% /notice %}}

### 動作確認
実際にアカウントを作成して、ログインしてみましょう。

1. ブラウザで`http://localhost:3000`にアクセスします
1. `Create acccount`をクリックします
1. `Username`、`Password`、`Email`を入力し、`CREATE ACCOUNT`をクリックします
  1. Passwordは8文字以上である必要があります
1. 入力したメールアドレスに送付された`Confirmation Code`を入力し、`CONFIRM`をクリックします
1. `Username`、`Password`を入力しログインしましょう
1. `Hello, ${ユーザー名}`と表示されればログイン完了です

![](/images/30_mock/auth.png)