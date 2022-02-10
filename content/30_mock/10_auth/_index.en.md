+++
title = "Authenticator"
date = 2020-03-18T10:09:46+09:00
weight = 2
pre = "<b>3.2. </b>"
+++

In this section, you add the functionality of user authentication to your application.
{{< figure src="/images/30_mock/architecture_auth.png" title="Authentication" class="center" width="50%">}}

### Adding Authentication Features
Execute `amplify add auth` to add the authentication function to the app. 
A few questions are asked to you, so please all choose the default answers.


```sh
amplify add auth
```

- Do you want to use the default authentication and security configuration? `Default configuration`
- How do you want users to be able to sign in? `Username`
- Do you want to configure advanced settings? `No, I am done. `


1. Execute `amplify status` and verify that the Auth Category resource has been added.
```
$ amplify status

Current Environment: production

| Category | Resource name  | Operation | Provider plugin   |
| -------- | -------------- | --------- | ----------------- |
| Auth     | boyaki6ab6e661 | Create    | awscloudformation |
```
2. Execute `amplify push` to apply the changes to the cloud. The message, `Are you sure you want to continue? ` is appeared, so press Enter.
```
amplify push
✔ Successfully pulled backend environment production from the cloud.

Current Environment: production

| Category | Resource name  | Operation | Provider plugin   |
| -------- | -------------- | --------- | ----------------- |
| Auth     | boyaki6ab6e661 | Create    | awscloudformation |
? Are you sure you want to continue? Yes
```
3. Wait a few minutes for the changes to the cloud to apply.

{{% notice tip%}}
The `amplify add $CATEGORY_NAME` command adds any Category resource to the application ([learn more](https://docs.amplify.aws/cli/start/workflows#amplify-category-add)).
The `amplify status` command displays a list of resources that are currently added to the application.
The `amplify push` command is a command that applies changes made by the `amplify add` command to resources in the cloud. In other words, any changes are not applied to the cloud resources until you execute the `amplify push` command ([learn more](https://docs.amplify.aws/cli/start/workflows#amplify-push)).
{{% /notice%}}


### Implementing Authentication Functionality on Front End
Amplify provides [@aws-amplify/ui-react](https://docs.amplify.aws/ui/q/framework/react) that is a library of useful components available in React.
In this workshop, you use the [Authenticator](https://docs.amplify.aws/ui/auth/authenticator/q/framework/react) component to allow only authenticated users to interact with the application.


1. Add `aws-amplify` and `Amplify Framework` to your application.
```
npm install --save aws-amplify@3.3.14 @aws-amplify/ui-react@0.2.34
```
If you get `npm ERR! peer react@"^16.7.0" from @aws-amplify/ui-react@0.2.34` error, you need to fix react version to 16.8.0. Please update package.json as below.
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
then run `npm install`
```bash
npm install
```
re-run install command.
```bash
npm install --save aws-amplify@3.3.14 @aws-amplify/ui-react@0.2.34
```
2. Replace the code in `./src/App.js` file with the following code (please delete all the original code).

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

{{% notice tip%}}
`Authenticator` prompts you for a phone number by default. You can skip the phone number input by specifying `formFields`.
{{% /notice%}}

### Login Test
Let's create an account and log in.

1. Access `http://localhost:3000` in web browser.
1. Click `Create account`.
1. Enter `Username`, `Password`, `Email`, and click `CREATE ACCOUNT`.
1. Password must be at least 8 characters long.
1. Enter the `Confirmation Code` sent to the email address you entered and click `CONFIRM`.
1. Enter `Username` and `Password` to log in.
1. `Hello, ${username}! ` is displayed, the login is complete.


![](/images/30_mock/auth.png)