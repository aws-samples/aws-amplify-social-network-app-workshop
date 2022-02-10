+++
title = "Connecting with your GitHub to build a CI/CD environment #1"
date = 2020-05-04T16:17:32+09:00
weight = 2
pre = "<b>7.2. </b>"
+++

So far, you have run the `amplify publish` command on our local environment. [Amplify Console](https://aws.amazon.com/jp/amplify/console/) makes it easy to build a CI/CD environment connected with your GitHub.

### What is the AWS Amplify Console?

AWS Amplify Console is a managed service that provides CI/CD operations, SPA(Single Page Apps), and static website hosting automation. You can easily connect your git repositories such as GitHub or AWS CodeCommit to the Amplify Console in a few clicks. And Amplify Console allows you to design flexible development workflows like build a test environment for each branch automatically and configure Basic authentication for specific environment where you want to do. While the service name is Amplify Console, you can host static websites even if you do not use Amplify.


![](/images/07_multi_env/amplify_console.png)

### Push your source code to GitHub

So let's push your source code you have developed so far to GitHub. If you are familiar with GitHub operations, you can skip this section. In this section, we describe how to push your source code to GitHub.

{{% notice info %}}
Please note that you should choose "Private" for your repository's visibility. Some features you learn soon such as Previews functionality, which copies environments for each pull request to make review easier, are provided for private repository only from perspective of security. Even if you use public repositories with Amplify Console, you can use other features excepting Previews.
{{% /notice %}}

First, please log in to your GitHub account and choose "New repository" from "+" button on upper right on the screen.

{{< figure src="/images/07_multi_env/new_repository.png" title="" class="left" width="320"  >}}

On the "Create a new repository" screen, create a new repository with any name you like. Please make sure that you are choosing "Private" on this screen. Only when you cannot choose "Private", please choose "Public" to create repository.

![](/images/07_multi_env/create_new_repository.png)

Once you created a new repository, copy the URL of the repository. Please make sure that not the "HTTPS" button but the "SSH" button has chosen.

![](/images/07_multi_env/copy_ssh_git_url.png)

Execute following commands at the top directory of your application, and then push your source code to GitHub. Please replace `git remote add origin <GitHub URL you copied>` with your git URL you copied just before.

```sh
rm -rf .git  <-- Remove .git folder just in case
git init
git add .
git commit -m "first commit"
git remote add origin <GitHub URL you copied>
git push -u origin master
```

Then reload your GitHub repository page, and if you can see your source code on GitHub, push command is succeeded.

![](/images/07_multi_env/success_to_push.png)

### Note:  When you catch "Permission denied" error with running push source code

If you have NOT completed GitHub configuration on your device, you might fail to push with "Permission denied" error. When you see this error, please follow the next steps and then try push command again.

Create a key pair of public key and private key using `ssh-keygen` command. You get several questions but you can just press Enter with default options.

```sh
cd ~/.ssh
ssh-keygen -t rsa
```

Copy the content of `~/.ssh/id_rsa.pub` that is a file created by above command.

```sh
cat id_rsa.pub

ssh-rsa ... < Copy this text begining with "ssh-rsa ..."
```

Then open [https://github.com/settings/ssh/new](https://github.com/settings/ssh/new) and enter "Title" and "Key". Please use the title that is easy to specify which device is using the key. Regarding to "Key" area, paste the text begins with "ssh-rsa ..." you copied earlier. After that, you can register your public key by clicking "Add SSH Key" button.

![](/images/07_multi_env/add_ssh_key.png)


Again, please execute "git push" command and you should success to push.

```sh
git push -u origin master
```
