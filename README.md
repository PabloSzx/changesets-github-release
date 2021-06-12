# changesets-github-release

Automatize publishing GitHub releases after every [changesets](https://github.com/atlassian/changesets) publish

## Installation

```bash
pnpm add -D changesets-github-release
```

or

```bash
yarn add -D changesets-github-release
```

or

```bash
npm install -D changesets-github-release
```

## Usage

First it assumes the presence of the `GITHUB_TOKEN` environment variable (you also can create a local .env in the same folder of the package including it).

In your `package.json` add a `postpublish` scripts as it follows:

```json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/repo-owner/repo-name"
  },
  "scripts": {
    "postpublish": "gh-release"
  }
}
```

You also can specify the target GitHub repository using the "--repo" argument:

```json
{
  "scripts": {
    "postpublish": "gh-release --repo repo-owner/repo-name"
  }
}
```

You also can specify the target GitHub repository using the `GITHUB_REPO` environment variable

> .env
```env
GITHUB_TOKEN=XXXXXX
GITHUB_REPO=repo-owner/repo-name
```

```json
{
  "scripts": {
    "postpublish": "gh-release"
  }
}
```
