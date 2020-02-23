# First Five

A GitHub app to speed up the creation of GitHub issues using plain text.

![create-github-issues-fast](https://user-images.githubusercontent.com/1041600/74682306-70f7dd00-51a4-11ea-9262-298b1ddacc3e.gif)


## Overview

This app allows to enter GitHub issues in plain text in a text box and will automatically create the issues on submission using the GitHub API.

The only required field is the title. It also supports assigning the issue to someone, setting a description (that can any length but no line breaks), and tagging it with labels. All these fields must be separated by a pipe character.

Assignation and labeling supports multiple assignees and labels if they're separated by a comma.

For example:

```
Issue title | assignee | Description of the issue. | enhancement, speed
```

## Install

To install this locally:

```
git clone git@github.com:eliorivero/first-five.git
cd first-five
npm install
```

To work, this requires you to create a GitHub app, and to get the app id and private key into a `.env` file in the app root. It should be like:

```
APP_ID=1234567890
PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n1a2b3c4d5e
```

Other accepted vars that can be defined here are:

```
REPO="the-repo-slug"
ISSUE_AUTHOR="someusername"
PORT=8080
```

## Scripts

There are some scripts included to build different environments:


| Command | Description |
|---------------|--------------------------------------------------|
|`npm run server`| Starts the server with Express debugging, restarting automatically when files change. |
|`npm run client`| Builds the client in dev mode and starts its development server with hot reload. |
|`npm run build`| Build final files in a `/public` repository. |


## Backend

- Node.js
- Express
- [Octokit App](https://github.com/octokit/app.js) for GitHub authentication
- [Octokit REST](https://octokit.github.io/rest.js) to interact with the GitHub API
- `dotenv` to keep the configuration in the environment separated from the code.
- `nodemon` to restart the server when the files change.
- `axios` to handle data requests.

## Frontend

- React
