# Contributors-Readme-Action

Contributors-Readme-Action is a simple GitHub action to automate contributors list in README file.

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
        uses: akhilmhdh/contributors-readme-action@v1.1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

That's it!

To add it to your to your existing workflow, append this to your current `.yml` workflow script.

```yml
- uses: akhilmhdh/contributors-readme-action@v1.1
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

> Currently GITHUB_TOKEN doesn't have permission to directly commit on a protected branch. To solve this you may need to replace the github action token with an admin acc token as mentioned in this post by [phips28](https://github.community/t/how-to-push-to-protected-branches-in-a-github-action/16101/10). Hopefully in the future GitHub can give an exception to actions in workflow.

### Second Step

1. Add a `README.md` file
2. If you want the contributors list to appear in a particular section of your readme, add the section name like this:

```md
.
.
<any-prefered-header-style eg:#,##,###> Contributors  
.
.
```

> **Contributors** is the keyword in the header. Add a line-break (\n or enter) after the header. Also, the **Contributors** keyword can be changed. Kindly go through the next section to learn more about customization"

3. If you choose not to add the header it will be added automatically as your last section in readme.

## Contributors :sparkles:
<table>
<tr>
                <td align="center">
                    <a href="https://github.com/akhilmhdh">
                        <img src="https://avatars1.githubusercontent.com/u/31166322?v=4" width="100;" alt="akhilmhdh"/>
                        <br />
                        <sub><b>Akhil Mohan</b></sub>
                    </a>
                </td>
                <td align="center">
                    <a href="https://github.com/matks">
                        <img src="https://avatars0.githubusercontent.com/u/3830050?v=4" width="100;" alt="matks"/>
                        <br />
                        <sub><b>Mathieu Ferment</b></sub>
                    </a>
                </td>
                <td align="center">
                    <a href="https://github.com/athul">
                        <img src="https://avatars2.githubusercontent.com/u/40897573?v=4" width="100;" alt="athul"/>
                        <br />
                        <sub><b>Athul Cyriac Ajay</b></sub>
                    </a>
                </td>
                <td align="center">
                    <a href="https://github.com/nhcarrigan">
                        <img src="https://avatars1.githubusercontent.com/u/63889819?v=4" width="100;" alt="nhcarrigan"/>
                        <br />
                        <sub><b>Nicholas Carrigan</b></sub>
                    </a>
                </td></tr>
</table>


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [all-contributors-bot](https://github.com/all-contributors/all-contributors): Inspiration for this project
