[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]

<br />

<p align="center">
    <h2 align="center">Contributors-Readme-Action</h3>
</p>

Contributors-Readme-Action is a simple GitHub action to automate contributors list in README file. Not only contributors, collborators, bots or any user.

As it uses a GitHub action it's secure and very easy to integrate into your projects. Once added it will automatically add all the repository contributors to your readme in a well-formatted table, including future contributors :smile:. Now why would you need a contributors list? Come on man, show some love to the ones who contribute to your project.:wink:

The contributors list is fetched from [GitHub API](https://developer.github.com/v3/repos/statistics/).

## Getting Started

### First Step

If you're new to actions, add these to your `.github/workflows/main.yml` file. If this file does not exist, create one.

```yml
on: [push, pull_request]

jobs:
    contrib-readme-job:
        runs-on: ubuntu-latest
        name: A job to automate contrib in readme
        steps:
            - name: Contribute List
              uses: akhilmhdh/contributors-readme-action@v2.0.2
              env:
                  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

That's it!

To add it to your to your existing workflow, append this to your current `.yml` workflow script.

```yml
- uses: akhilmhdh/contributors-readme-action@v2.0.2
  env:
      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

> Currently GITHUB_TOKEN doesn't have permission to directly commit on a protected branch. To solve this you may need to replace the github action token with an admin acc token as mentioned in this post by [phips28](https://github.community/t/how-to-push-to-protected-branches-in-a-github-action/16101/10). Hopefully in the future GitHub can give an exception to actions in workflow.

### Second Step

1. Add a `README.md` file
2. Add the below comment inside your `README.md` where you want it to appear.

```md
<!-- readme: contributors -start -->
<!-- readme: contributors -end -->
```

3. Save it, wait for the action to complete and tadaa :smile:

### But wait!!!

-   What if you wanted to add direct collaborators of a project, no worries

```md
## Collaborators

<!-- readme: collaborators -start -->
<!-- readme: collaborators -end -->

## Contributors

<!-- readme: contributors -start -->
<!-- readme: contributors -end -->
```

-   Now you decided that you want to join this into one list, no issue

```md
## Contributors

<!-- readme: collaborators,contributors -start -->
<!-- readme: collaborators,contributors -end -->
```

-   Then you decided to add some github users who are important figure in this project

```md
## Contributors

<!-- readme: <username1>,collaborators,<username2>,contributors -start -->
<!-- readme: <username1>,collaborators,<username3>,contributors -end -->
```

> The order of the list will be given priority. So username1 will appear first collaborators then username2 likewise.(No brackets for usernames)

> The subject inside start and end must be same.

> Currently supported key commands are _collaborators_, _contributors_, _bots_

-   [An example of this action can be found here](./contributors.md)

### Optional parameters

You can add these optional parameters in your action script to modify the appearance of the resulting list.

```yml
- name: Contribute List
  uses: akhilmhdh/contributors-readme-action@v2.0
  with:
      image_size: 100
```

| Option             | Default Value                            | Description                                       | Required |
| ------------------ | ---------------------------------------- | ------------------------------------------------- | -------- |
| image_size         | 100(px)                                  | Size of square images in the stack                | false    |
| readme_path        | README.md                                | Path of the readme file you want to update        | false    |
| columns_per_row    | 6                                        | Number of columns in a row                        | false    |
| collaborators      | direct                                   | Type of collaborators options: all/direct/outside | false    |
| commit_message     | contrib-readme-action has updated readme | Commit message of the github action               | false    |
| committer_username | contrib-readme-bot                       | Username on commit                                | false    |
| committer_email    | email id of committer                    | contrib-readme-action@noreply.com                 | false    |

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

-   [all-contributors-bot](https://github.com/all-contributors/all-contributors): Inspiration for this project

[contributors-shield]: https://img.shields.io/github/contributors/akhilmhdh/contributors-readme-action.svg?style=for-the-badge
[contributors-url]: https://github.com/akhilmhdh/contributors-readme-action/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/akhilmhdh/contributors-readme-action.svg?style=for-the-badge
[forks-url]: https://github.com/akhilmhdh/contributors-readme-action/network/members
[stars-shield]: https://img.shields.io/github/stars/akhilmhdh/contributors-readme-action?style=for-the-badge
[stars-url]: https://github.com/akhilmhdh/contributors-readme-action/stargazers
[issues-shield]: https://img.shields.io/github/issues/akhilmhdh/contributors-readme-action.svg?style=for-the-badge
[issues-url]: https://github.com/akhilmhdh/contributors-readme-action/issues
[license-shield]: https://img.shields.io/github/license/akhilmhdh/contributors-readme-action.svg?style=for-the-badge
[license-url]: https://github.com/akhilmhdh/contributors-readme-action/blob/master/LICENSE.txt

