+++
title = "複雑な開発環境の構築(2)"
date = 2020-03-24T10:09:46+09:00
weight = 5
pre = "<b>7.5. </b>"
+++

### プルリクエストをホスティングする

Amplify Console では、ブランチだけでなくプルリクエストのソースコードを自動的にホスティングする Preview 機能があります。この機能により、レビュー担当者が実際に画面を触りながらコードをレビューすることが可能になります。今回は、develop ブランチに対して発行されたプルリクエストを自動的にホスティングする設定を行なっていきましょう。

{{% notice info %}}
Preview 機能はセキュリティの観点からプライベートリポジトリにのみ有効です。また、2020/04 現在で GitHub にのみ対応しています。
{{% /notice %}}

Amplify Console の画面から「Preview」> 「Enable Preview」を選択します。

![](/images/07_multi_env/enable_preview.png)

「Install GitHub app」を押下します。

![](/images/07_multi_env/install_preview_dialog.png)

GitHub の画面に遷移するので、Preview 機能をインストールするリポジトリを選択し、「Save」を押下します。

![](/images/07_multi_env/install_preview.png)

Amplify Console の画面に戻ると、対象リポジトリのブランチ一覧が表示されています。今回は、develop ブランチを選択し、「Manage」ボタンを押下します。

![](/images/07_multi_env/select_preview_branch.png)

「Pull Request Preview」を ON にして、「Pull Request Preview - backend environment」に staging を指定します。
![](/images/07_multi_env/preview_settings.png)

{{% notice tip %}}
Pull Request Preview - backend environment の設定を「Create new backend environment for every Pull Request」にすると、プルリクごとに個別のバックエンドを構築することも可能です。
{{% /notice %}}

これで Amplify Console 側の設定は完了です。develop ブランチにプルリクエストを発行してみましょう。新しいブランチを発行し、簡単な修正を行います。変更のわかりやすい例として、`Sidebar.js`のログアウトボタンのテキストを「Logout」から「ログアウト」としてみましょう

```sh
git checkout -b chore/edit-logout-button-text
```

```Sidebar.jsx
<ListItem key='logout'>
    <ListItemText primary={
    <Button
        variant="outlined"
        onClick={signOut}
        fullWidth
    >
        ログアウト // <-- 「ログアウト」に変更
    </Button>
} />
```

```sh
git add .
git commit -m "Edit Logout Button text"
git push --set-upstream origin chore/edit-logout-button-text
```

develop ブランチに対しプルリクエストを発行します。

![](/images/07_multi_env/open_pull_request.png)

プルリクエストを発行すると、「AWS Amplify Console Web Preview」が表示されます。プルリクエストを発行した直後は、ホスティングが完了していないため「In progress」のステータスになっています。

![](/images/07_multi_env/pull_request_amplify_link.png)

デプロイが完了すると、ステータスが「Success」になります。

![](/images/07_multi_env/success_to_deploy_preview.png)

「Detail」リンクをクリックし、Summary 画面に遷移します。「View more details on AWS Amplify (us-east-1)」をクリックすると、ホスティングされたアプリケーションの画面に遷移することができます。

![](/images/07_multi_env/previews_detail.png)

Amplify Console の Previews 画面でも対象のプルリクエストの一覧を確認できます。プルリクエストがマージされると、一覧からも削除されます。

![](/images/07_multi_env/previews_pr_list.png)
