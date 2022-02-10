+++
title = "Connecting with your GitHub to build a CI/CD environment #2"
date = 2020-05-04T17:19:18+09:00
weight = 3
pre = "<b>7.3. </b>"
+++

### Connect your GitHub repository to Amplify Console

In previous steps, you have deployed applications by running `amplify publish` command. From now on, let's build a mechanism that deploys your apps automatically when source code is pushed.

At first, you should remove existing hosting configuration. There should be "production" and "staging" environments, so let's remove them from "production" environment.

```sh
amplify env checkout production
```

```
$ amplify status

Current Environment: production <-- Make sure the environment has switched to production
```

Remove hosting configuration.

```sh
amplify remove hosting
```


When you are asked `? Are you sure you want to delete the resource? This action deletes all files related to this resource from the backend directory.`, please enter `Yes` and press the Enter key.


Then you apply that change to your backend for "production" environment by running `amplify push` command.

```sh
amplify push
```

{{% notice tip %}}
Once you apply removing hosting configuration, you are not able to access to the webpage for previous production environment. If you use hosting feature for your production, please consider to use Amplify Console for hosting instead of hosting category to prevent these kinds of downtime.
{{% /notice %}}

Then remove Hosting configuration from staging environment as well.

```sh
amplify env checkout staging
```

```
$ amplify status

Current Environment: staging <-- Make sure the environment has switched to staging
```


```sh
amplify push
```

After that, get back to production environment.

```sh
amplify env checkout production
```

Now you succeeded to remove old Hosting configurations. Next, let's add new Hosting configuration using Amplify Console.

```sh
amplify add hosting
```

For `? Select the plugin module to execute (Use arrow keys)`, you should choose `❯ Hosting with Amplify Console (Managed hosting with custom domains, Continuous deployment)`, 
for `? Choose a type`, you should choose `❯ Continuous deployment (Git-based deployments)`. 
 
Then press the Enter key.

```sh
amplify add hosting
? Select the plugin module to execute Hosting with Amplify Console (Managed hosting with custom domains
, Continuous deployment)
? Choose a type
❯ Continuous deployment (Git-based deployments)
  Manual deployment
  Learn more
```

When you are using AWS Cloud9, please open the Amplify Console management screen using your web browser. You should be able to find the new app you created just before, so choose that app. Or, if you are developing on your local device, your browser open and show you the screen to select source repository automatically when you choose "Continous deployment (Git-based deployments)" on above step.

![](/images/07_multi_env/click_app.png)

In the next screen, you choose the repository you want to connect. At this workshop, you use GitHub, but Amplify Console also provides connectivity to BitBucket, AWS CodeCommit, and GitLab etc. If you do not want to use Git repos, you can simplify to deploy your source code you built from any place like Amazon S3 directly.

For this time, please choose "GitHub" and click on the "Connect branch" button.

![](/images/07_multi_env/connect_github.png)

In the next screen, you can choose the repository and branch you want to connect. Please choose the repository you created just before and the master branch.

![](/images/07_multi_env/sync_github_account.png)

Then configure build settings. At "Select a backend environment", you can select a backend environment you want to build. You should find backend names "staging" and "production" you created on a select box. At this time, let's choose the "production" environment.

And you should choose a Service Role to allow Amplify Console to access other resources. Create a new role by clicking on the "Create new role" button, and choose that role. During the role configuration steps, you can choose all default options.

After choosing an environment and a role, click on the "Next" button at the bottom of the screen.

![](/images/07_multi_env/create_build_settings.png)


Please review the details and click on the "Save and deploy" button.

![](/images/07_multi_env/confirm.png)

Then build is started. It takes a few minutes until complete deploy. (If you can't any update on the screen after you wait a while, please try to reload.)

![](/images/07_multi_env/start_build.png)

Once all steps have been Green, the deployment finished. You can access the application deployed via the published URL you can see on the screen. 


![](/images/07_multi_env/complete_deploy.png)

So get back to the console and press Enter key. Now you can confirm the environment hosted using Amplify Console.

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

Now you have connected your GitHub to Amplify backend. So let's try the automated operations by pushing a little changes to master branch.

For easy example, change the text on the logout button from "Logout" to "Sign out" in `Sidebar.js`.

```Sidebar.jsx
<ListItem key='logout'>
    <ListItemText primary={
    <Button
        variant="outlined"
        onClick={signOut}
        fullWidth
    >
        Sign out // <-- Change from "Logout" to "Sign out"
    </Button>
} />
```

After changing the code, please push to master branch.

```sh
git add .
git commit -m "Edit Logout Button text"
git push
```

Once you push to master branch, the deploy flow is started again automatically.

![](/images/07_multi_env/re_deploy.png)

After the deployment completed, please access the published URL again. You can see the changes have been applied by pushing to master branch simply.

![](/images/07_multi_env/compare.png)


How do you feel? You have built the CI/CD environment easily by connecting GitHub branch to your backend. In the next chapter, let's dive deep into more complex deployment flows that we can use in the real world.

