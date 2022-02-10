+++
title = "Building complex development flows #2"
date = 2020-05-05T14:36:37+09:00
weight = 5
pre = "<b>7.5. </b>"
+++

### Hosting pull requests

Amplify Console has Preview feature that provides automatic hosting functionality for not only branches but also pull request. This feature makes reviewers able to review source code while seeing actual screen. For this time, configure automatic hosting setting against pull requests published to "develop" branch.

{{% notice info %}}
You can use Preview feature for private repositories only from perspective of security. Also, only GitHub supports the feature as of April 2020.
{{% /notice %}}

Please click "Preview" > "Enable Preview" on Amplify Console screen.

![](/images/07_multi_env/enable_preview.png)

Then click "Install GitHub app".

![](/images/07_multi_env/install_preview_dialog.png)


You move to GitHub. Then choose a repository you want to install Preview feature and press "Save".

![](/images/07_multi_env/install_preview.png)

Once get back to Amplify Console, you can see a list of branches in the repository you selected. For this moment, let's choose "develop" branch and press "Manage" button.

![](/images/07_multi_env/select_preview_branch.png)

Enable "Pull Request Preview" and choose "staging" for "Pull Request Previews - backend environment".

![](/images/07_multi_env/preview_settings.png)

{{% notice tip %}}
If you choose "Create new backend environment for every Pull Request" for "Pull Request Preview - backend environment", you also can build dedicated backend for each pull request.
{{% /notice %}}

Then configuration on Amplify Console is completed. Let's send pull request to develop branch. Create a new branch and edit something for test. As a simple example for this time, please change the text on logout button from "Logout" to "Log out" in `Sidebar.js`.


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
        Log out // <-- Changed from "Logout" to "Log out"
    </Button>
} />
```

```sh
git add .
git commit -m "Edit Logout Button text"
git push --set-upstream origin chore/edit-logout-button-text
```

Then open a pull request for the develop branch.

![](/images/07_multi_env/open_pull_request.png)

After the pull request completion, you can see "AWS Amplify Console Web Preview". Just after pull request submitted, the status is "In Progress" because the hosting process is not completed.


![](/images/07_multi_env/pull_request_amplify_link.png)

Once the deployment is completed, the status is changed to "Success".

![](/images/07_multi_env/success_to_deploy_preview.png)

Click on the "Detail" link and move to summary screen. You can move to the screen of the hosted app by clicking "View more details on AWS Amplify (us-east-1)".

![](/images/07_multi_env/previews_detail.png)

You can also see a list of pull requests for the branches on the Previews screen on Amplify Console. Once a pull request is merged, the one is removed from the list as well.

![](/images/07_multi_env/previews_pr_list.png)
