+++
title = "Add E2E testing to your CI/CD"
date = 2020-05-05T15:19:12+09:00
weight = 1
pre = "<b>8.1. </b>"
+++

### Install Cypress

AWS Amplify supports [Cypress](https://www.cypress.io/) that is a E2E testing framework. You can easily add E2E testing into your CI/CD environment by integrating Cypress with Amplify Console. For this time, let's configure as E2E testing runs when the develop branch is deployed.


First, switch to develop branch and install `cypress` to your project.

```sh
git checkout develop
npm install cypress@6.3.0 mochawesome@4.1.0 mocha start-server-and-test --save-dev
```

### Write the test code

After install completion, make folders and files where you write tests. For this time, please create `cypress/integration/authenticator_spec.js` and let's write test code into this file.

```sh
mkdir -p cypress/integration
touch cypress/integration/authenticator_spec.js
touch cypress.json
```

At this E2E testing, you test following scenarios work properly.

1. Access to the home page then login screen is shown
2. Able to login with ID and password for a test user
3. The text "Global" is shown on the screen after login

Write your source code into `cypress/integration/authenticator_spec.js`. (Please replace username and password to ones you created for staging environment)

```js
describe('Authenticator:', function() {
  beforeEach(function() {
      cy.visit('/');
  });
  describe('Sign In:', () => {
      it('allows a user to signin', () => {
          cy.get(selectors.usernameInput).type(
            '<Your Username in stating env>'
          );
          cy.get(selectors.signInPasswordInput).type(
            '<Your Password in staging env>'
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

Add following item to `cypress.json` to tell Cypress the server where test run.

```json
{
    "baseUrl": "http://localhost:3000",
    "includeShadowDom": true
}
```

### Add E2E settings to Amplify Console

Next, change the configuration of Amplify Console to run E2E testing.
Update the form shown after clicking "Build settings" > "Edit" button with following content. This YAML file is for build settings of Amplify Console. In this amplify.yml, the configurations for Cypress are the `test` section as following.

![](/images/80_e2e/build_settings.png)

```yml
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

Download the configuration you updated and put it at the top directory of your project.

![](/images/80_e2e/amplifyyml_dl.png)

Once you complete the configuration, you can see the "test" step in the deployment flow.

![](/images/80_e2e/test_flow.png)

{{% notice tip %}}
You can overwrite the configuration you saved on management console by putting `amplify.yml` at the top directory of your project. Please read [this document](https://docs.aws.amazon.com/ja_jp/amplify/latest/userguide/build-settings.html) to know details of configuring build settings.
{{% /notice %}}

So let's apply this setting to the develop branch.

```sh
git add .
git commit -m "add cypress settings"
git push
```

Then go back to Amplify Console and the deployment is finished after a while. Click "test" step in the flow and see the results of the E2E testing.

![](/images/80_e2e/success_to_e2e.png)

You can see that the test for authenticator has been succeeded. You can also download a movie file capturing how the test was going by clicking "Download artifacts" button.

![](/images/80_e2e/success_to_authenticator_test.png)

Please uncompress that file and play the mp4 file. You see that the test was done as you expected.

![](/images/80_e2e/play_test_video.png)
