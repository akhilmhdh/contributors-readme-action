# beta stage will soon update

# Contributors-Readme-Action

Contributors-Readme-Action is a simple github action to automate contributors list in README file.<br>
As it uses github action its secure and very easy to integrate into your projects. Once added it will automatically add all the contributors into your readme in a nice style. Also the future ones :smile:. Now why would you need a contributors list. Come one man, show some love to the ones who contribute to your project.:wink:

## Getting Started

### First Step

If your new to action add these to your .github/workflows/main.yml

```
on: [push, issues]

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

```
  - uses: akhilmhdh/contributors-readme-action@v1
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Second Step

1. Add a readme.md file
2. If you want the contributors list to appear in a particular position add like this

Sidenote: "## Contributors is the keyword dont change it"<br>

3. If not given it will be added automatically as your last section in readme.

### Optional paramaters

1. To change the image size inside the box

```
 imageSize:100
```

Default value is 100x100px

2. To change the number of columns in a row

```
columnsPerRow:7
```

Default value is 7

##Contributors ✨
<table>
<tr>
                <td align="center">
                    <a href="https://github.com/akhilmhdh">
                        <img src="https://avatars1.githubusercontent.com/u/31166322?v=4" width="100;" alt="akhilmhdh"/>
                        <br />
                        <sub><b>Akhil Mohan</b></sub>
                    </a>
                </td>
</tr>
</table>


## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

- [all-contributors-bot](https://github.com/all-contributors/all-contributors):Insipration of this project)
