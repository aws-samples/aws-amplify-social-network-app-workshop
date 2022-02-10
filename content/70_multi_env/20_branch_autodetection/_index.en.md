+++
title = "Building complex development flows #1"
date = 2020-05-04T18:21:10+09:00
weight = 4
pre = "<b>7.4. </b>"
+++

### Design your backend with considering operations in the real world

Until the previous chapters, you have built a production backend environment connected to a master branch having front-end application. Now you have understood that you could deploy your app by just pushing to master branch.

![](/images/07_multi_env/master_env.png)

When you develop in your team actually, a shared environment for testing such as "staging environment" is needed. And the testing environment should not be public for end users. To achieve that security requirement, for example, you can configure Basic authentication for the testing environment to prevent accesses from end users or search engine's crawler.

![](/images/07_multi_env/staging_env.png)

When you need to develop including UI design, it might not be efficient that building backends for each branch because changes for UI design are not affected by backend things in many cases. 
In such case, for branches beginning with "design/~" for example, it might be better to use shared backend.

![](/images/07_multi_env/design_env.png)

In this chapter, you build environments like above diagram.

### Connect your develop branch to the staging environment

First, create a new develop branch and push to GitHub.

```shß
git checkout -b develop
git push --set-upstream origin develop
```

### Configure staging environment on Amplify Console

Let's get back to Amplify Console and connect your develop branch to the staging environment.
Please click on the "Connect branch" button in the home screen of your app.

![](/images/07_multi_env/connect_develop-branch.png)

Choose "develop" for Branch, and choose "staging" for Backend environment.

![](/images/07_multi_env/select_branch_env.png)

After you review, please click on the "Save and deploy" button.

![](/images/07_multi_env/staging_confirm.png)

If a deployment for the develop branch starts, it succeeded.

![](/images/07_multi_env/success_to_create_staging.png)

You can see a URL for the staging environment by hitting `amplify status` command on your terminal.

```null

$ amplify status

(snip)

Amplify hosting urls:
┌──────────────┬──────────────────────────────────────────────┐
│ FrontEnd Env │ Domain                                       │
├──────────────┼──────────────────────────────────────────────┤
│ develop      │ https://develop.xxxxxxxxxxxx.amplifyapp.com │
├──────────────┼──────────────────────────────────────────────┤
│ master       │ https://master.xxxxxxxxxxxx.amplifyapp.com  │
└──────────────┴──────────────────────────────────────────────┘

```

In this state, everyone can access to the staging environment URL as well as production environment.
So let's add Basic Authentication to the staging environment to allow people only who know dedicated ID and password to access. 

Go to "Access control" > "Manage access" on your Amplify Console.

![](/images/07_multi_env/access_control.png)

Change "Access setting" on the develop branch to "Restricted - password required" and enter username and password you want to use. And then click on the "Save" button.

![](/images/07_multi_env/setting_basic_auth_pass.png)

Again, access to the staging environment and confirm that Basic Authentication is enabled.

{{< figure src="/images/07_multi_env/enable_basic_auth.png" title="" class="left" width="480"  >}}

That's it for building the staging environment!

### Build a design environment


Next, let's build a design environment where you can develop UI-related things. The difference between design environment and staging environment is that design environment shares one backend with multiple branches.
Configure all branches with a branch name starting with "design/" to refer the shared design environment backend.

![](/images/07_multi_env/share_multi_backend.png)

Please build a backend for the design environment using `amplify env add` command as same as when you built production and staging environment.

```sh
amplify env add
```

When you are asked `? Do you want to use an existing environment?`, then enter `No` and press the Enter key.

For `? Enter a name for the environment`, enter `design`. After that, you can answer with default options for all questions.

Confirm that the staging environment has been created by running `amplify env list` command.

```sh
amplify env list
```

```null
$ amplify env list

| Environments |
| ------------ |
| production   |
| staging      |
| *design      |  <-- Current env is switched to "design"
```

Next, let's build the design environment based on configuration you created using `amplify push`.

```sh
amplify push
```

After a while, it succeeds with a message `✔ All resources are updated in the cloud`.
And then create and push the design-base branch to GitHub.

```sh
git add .
git commit -m "add design-base env"
git checkout -b design-base
git push --set-upstream origin design-base
```

### Configure design environment on Amplify Console

Get back to Amplify Console and connect the design-base branch to the design environment.
Click on the "Connect branch" button on the home of the app.

![](/images/07_multi_env/connect_develop-branch.png)

Choose "design-base" for Branch, and choose "design" you added earlier for Backend environment.

![](/images/07_multi_env/select_branch_env_design.png)

Review the details and click on the "Save and deploy" button.

![](/images/07_multi_env/staging_confirm_design.png)

It succeeded if you can see that a deployment of the design branch started.

![](/images/07_multi_env/success_to_create_design.png)

You can confirm a URL for the design environment by hitting `amplify status` command on your terminal.

```null

$ amplify status

(snip)

Amplify hosting urls:
┌──────────────┬──────────────────────────────────────────────────┐
│ FrontEnd Env │ Domain                                           │
├──────────────┼──────────────────────────────────────────────────┤
│ design-base  │ https://design-base.xxxxxxxxxxxx.amplifyapp.com │
├──────────────┼──────────────────────────────────────────────────┤
│ develop      │ https://develop.xxxxxxxxxxxx.amplifyapp.com     │
├──────────────┼──────────────────────────────────────────────────┤
│ master       │ https://master.xxxxxxxxxxxx.amplifyapp.com      │
└──────────────┴──────────────────────────────────────────────────┘

```

{{% notice tip %}}
The design-base branch is a dummy branch to make Amplify Console recognize the design environment. In the steps after this, you do not use this branch but other branches that match a regular expression "design/**" to be connected to the design environment.
{{% /notice %}}

### Let branches with specific branch name use the design branch

Using Amplify Console, let's configure your branches to use the design environment when the branch name starts with "design/". On the management console, please click "General" > "Edit".


![](/images/07_multi_env/general_settings.png)

On the editing form, please set each values as following.

- Branch autodetection: Enabled
- Branch autodetection - patterms: design/\*\*
- Branch autodetection branch environment: design
- Branch autodetection access control: Enabled
  - any username and password you want to use

![](/images/07_multi_env/branch_name_prefix_settings.png)

{{% notice tip %}}
If you set value of "Branch autodetection branch environment" to "Create new backend environment for every connected branch", you can use individual backend for each branch.
{{% /notice %}}

Now once any branches starting name with "design/" are pushed to GitHub, hosting process is run for each branch and they use design environment as the backend.

So now let's try with "design/alpha" and "design/beta" branches. Create them and push to GitHub.

```sh
git checkout -b design/alpha
git push --set-upstream origin design/alpha
git checkout -b design/beta
git push --set-upstream origin design/beta
```

After that, you should be able to see that the deployments are started for "design/alpha" and "design/beta" branches on your Amplify Console.

![](/images/07_multi_env/start-autodetect-branch.png)

{{% notice info %}}
You might be faced with a build error on one of the branches when you push both "design/alpha" and "design/beta" branches at the same time. In such case, you can recover with clicking on the "Redeploy this version" button in a detail screen of the failed build.
![](/images/07_multi_env/rebuild.png)


{{% /notice %}}

### Review this chapter

Let's review the environments created at this time.
You have created 3 backend environments, "production", "staging" and "design". Each of environments is connected to "master", "develop" and "design/" branches. The "design/alpha" and "design/beta" branches you created at last are matched with "design/\*" regular expression, so they are hosted as a backend for design environment. And you configured Basic Authentication for frontend access for environments excepting production.


![](/images/07_multi_env/design_env.png)

Now you have learned how to connect your branches to backends. In the next chapter, let's study about building backends based on pull requests.