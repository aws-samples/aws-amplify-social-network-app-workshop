+++
title = "Manual deployment"
date = 2020-03-18T10:09:48+09:00
weight = 1
pre = "<b>4.1. </b>"
+++

### AWS Amplify Console
[AWS Amplify Console](https://aws.amazon.com/jp/amplify/console/) provides a Git-based workflow for deploying and hosting applications.
You decided to do manual deployment instead of Git-based because you're the only engineer this time.
Use the Amplify CLI to host your application using the AWS Amplify Console.

Run `$amplify add hosting` in the terminal and answer the questions as follows:

```
amplify add hosting
```

- Select the plugin module to execute `Hosting with Amplify Console (Managed hosting with custom domains, Continuous deployment) `
- Choose a type `Manual deployment`

Then start hosting with the `$ amplify publish` command.

```
amplify publish
```

{{% notice info%}}
`$amplify publish` is a command that changes to the cloud resources in the same way as `$amplify push`, builds a web application at local, and uploads it to update the application hosted in Amplify Console.
{{% /notice%}}

{{% notice warning%}}
If you execute `$ amplify push` or `$ amplify publish` while `$amplify mock api` is running, 
sometimes your command exection fail with error message: `Parameters: [authRoleName] must have values`.
In that case, please interrupt the process of `$amplify mock api` with `Ctrl+C`, and then execute `$amplify push` or `$amplify publish`.
{{% /notice%}}

Wait a few minutes and the execution result is returned as shown below.
If you visit the last URL, you are able to browse the website.

```
✔ Zipping artifacts completed.
✔ Deployment complete!
https://production.XXXXXXXXXXX.amplifyapp.com
```