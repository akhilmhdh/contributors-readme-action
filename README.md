# Contributors-Readme-Action

Contributors-Readme-Action is a simple github action to automate contributors list in README file.<br>
As it uses github action its secure and very easy to integrate into your projects. Once added it will automatically add all the contributors into your readme as well formated. Also the future ones :smile:. Now why would you need a contributors list. Come on man, show some love to the ones who contribute to your project.:wink:

The contributors list is fetched from [GitHub API](https://developer.github.com/v3/repos/statistics/).

## Getting Started

### First Step

If your new to action add these to your .github/workflows/main.yml

```yml
on: [push, pull_request]

jobs:
  contrib-readme-job:
    runs-on: ubuntu-latest
    name: A job to automate contrib in readme
    steps:
      - name: Contribute List
        uses: akhilmhdh/contributors-readme-action@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

Thats it.<br>
To add it to your to your existing workflow

```yml
  - uses: akhilmhdh/contributors-readme-action@v1
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Second Step

1. Add a readme.md file
2. If you want the contributors list to appear in a particular position add like this

```md
.
.
<any-prefered-header-style eg:#,##,###> Contributors  
.
.
```

Sidenote: "Contributors is the keyword in header and also add enter(\n) at last"

3. If not given it will be added automatically as your last section in readme.


### Optional parameters

1. To change the image size inside the box

```yml

imageSize:100

```

Default value is 100x100px

2. To change the number of columns in a row

```yml

columnsPerRow:6

```

Default value is 6

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
                    <a href="https://github.com/athul">
                        <img src="https://avatars2.githubusercontent.com/u/40897573?v=4" width="100;" alt="athul"/>
                        <br />
                        <sub><b>Athul Cyriac Ajay</b></sub>
                    </a>
                </td></tr>
</table>


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

## Acknowledgments

- [all-contributors-bot](https://github.com/all-contributors/all-contributors): Inspiration of this project
