# Fast Author 🚀

Improve productivity when creating written articles **specific for tech tutorials involving lots screenshots**.

* quick editing of images and assest management
* publisher preview
* hotkey, hotkey, hotkey
* optimizes your markdown files for multiple publishing platforms

![](https://github.com/ExamProCo/fast-author/blob/master/docs/screenshot.png)

## Table of Contents
* [How to Install](#How-to-Install)
* [Cross-Platform Support](#Cross-Platform-Support)
* [Fast Author Projects Folder](#Fast-Author-Projects-Folder)
* [The Anatomy of a Project](#The-Anatomy-of-a-Project)
* [Assets](#Assets)
  * [What are assets?](#What-are-assets?)
  * [How do you include assets?](#How-do-you-include-assets)
  * [The original](#The-original)
  * [The first version](#The-first-version)
  * [Assets Manifest](#Assets-Manifest)
    * [Manifest Items](#Manifest-Items)
  * [Assets Manipulation](#Assets-Manipulation)
    * [Resizing Preset](#Resizing-Preset)
    * [Border Preset](#Border-Preset)
    * [Cropping (WIP)](#Cropping-(WIP))
    * [Asset Drawing Editor](#Asset-Drawing-Editor)
* [Autosaving](#Autosaving)
* [Hotkeys](#Hotkeys)
  * [Global Hotkeys](#Global-Hotkeys)
  * [Editor Hotkeys](#Editor-Hotkeys)
* [Publisher Preview (WIP)](#Publisher-Preview-(WIP))
* [Export (WIP)](#Export-(WIP))
* [Development](#Development)
  * [Core Technologies](#Core-Technologies)
  * [Anatomy of the Source Code](#Anatomy-of-the-Source-Code)
    * [/css and /webfonts](#/css-and-/webfonts)
    * [/sass](#/sass)
    * [/util](#/util)
    * [draw.css, draw.js and draw.html](#draw.css,-draw.js-and-draw.html)
    * [index.html, preload.js and main.js](#index.html,-preload.js-and-main.js)
    * [package.json](#package.json)
    * [webpack.conf.js](#webpack.conf.js)
  * [How to run the application in development](How-to-run-the-application-in-development)
  * [Known Gotchas with Sharp](#Known-Gotchas-with-Sharp)

## How to Install

We have yet to build any binaries. So you have to run the soucre code in development mode. I use the app daily in development mode so there is no downsides other than getting the app the run.

To run the source code in developer mode go to: **[How to run the application in development](How-to-run-the-application-in-development)**

## Cross-Platform Support

Platform | Status | Reason |
|---|---|---|
macOS | Throughly Tested | Andrew (open-source owner) uses Fast Author daily in macOS so it should work with little issue and macOS issues are correctled instantly
| Ubuntu | Lighty Tested| Bayko (open-source contributor) uses Fast Author a few times a week so Linux issues get resolved frequently.
|Windows | Neglected | We don't have anyone in active use or contributor who is using Fast Author. We have Windows and can resolve issues, but you need to speak up so we'll go dual boot and see the problem.

## Fast Author Projects Folder


Projects are hardcoded to be stored in the home directory `~/fast-author` (Mac) or `C:\Users\<Username>\fast-author` (Windows). 

When you create a new project we substitues the spaces for hypens eg. `My New Project` will become `My-New-Project`. We do this since it spaces needed to be escaped and this was problematic for the projects code and was just easier to replace the spaces with hypens.

### The Anatomy of a Project

So this is what a typical Fast Author project looks like:

```
~/fast-author
└── /My-New-Project
     ├── index.md
     ├── /backups
     │    ├── 1581798473.md
     │    ├── 1581798475.md
     │    ├── 1581798485.md
     │    └── 1581798488.md  
     ├── /exports
     ├── /assets
     │    ├── /2be96f54-f0eb-4b09-a3a7-79caa8edee1f (asset folder)
     │    │    ├── My Original Screenshot.png 
     │    │    └── /versions
     │    │         ├── 1581803907.png
     │    │         ├── 1581803912.png
     │    │         └── 1581803914.png
     │    └── /2eae45bb-6052-4ad6-a716-6e469f047cc8
     │         ├── My Original Gif.gif 
     │         └── /versions
     │              └── 1581799234.gif
     └── assets-manifest.json
  
```

Lets talk about these components of the project:

* **index.md** - This is your active markdown file when you are using the editor
* **/backups** - Whenever you save a backup is stored in this directory. The files are named using a epoch datetime. eg `1581798473` You could use [https://www.epochconverter.com/](https://www.epochconverter.com/) if you're curious how to translate that into a readable date.
* **/(asset folder)** - The name of this folder is a generated uuid using `uuid4`. When you drag an image into the editor it will create an asset folder and store the original at the root of this new folder.
* **/exports** - Exported projects organized for publishing to multiple platform
* **/assets** - Stores all of assets. Assets current just encompasses image formats We could have called it `/images` but thought better to go with a generic name for future growth.

* **/versions** - When you manipluate the original or a version of an asset it will be stored here. It is also using epoch date for the name of the file. A version will retain the original image format 
* **assets-manifest.json** - This stores metadata about all the assets.

## Assets 

### What are assets?
Assets are images which you can include within you markdown. 

### How do you include assets?
You drag an image into the markdown editor (textarea) and it will be included

### The original
When you drag an image into the editor it will create a new asset folder and store the original with its original naming. The reason behind this is so you always have the original just in case.

### The first version
The first version of an asset is identitcal to the original with the exception that we have renamed it to use an epoch date format. See the example below:

```
└── /2eae45bb-6052-4ad6-a716-6e469f047cc8
     ├── My Original Gif.gif 
     └── /versions
          └── 1581799234.gif
```

In the markdown editor we never refernce the original image, and this is why we create an immediate copy of the original.

### Assets Manifest

The Assets Manifest is located at the root of a asset folder and is named `assets-manifet.json`
This file is autogenerated and managed by the app and generally should never be manually edited. 

The Assets Manifest contains an array of json objects we call Manifest Items.

#### Manifest Items

Here is an example of a manifest file

```json
  {
    "id": "2a6a411a-f5ae-4518-8b3a-0841647b4e12",
    "name": "tenor",
    "original": {
      "name": "tenor.gif",
      "width": 498,
      "height": 278,
      "ext": ".gif"
    },
    "versions": [
      {
        "epoch": 1581799234,
        "width": 498,
        "height": 278,
        "ext": ".gif"
      }
    ]
  }
```

* **id** - The asset folder name which is a uuid
* **name** - The name we display in the editor, it defaults to the original filename, you can override this name, but its not currently used on export and just to help you identify assets in the left hand column.
* **original** - Contains metadata about the original file
* **versions** - An array of json objects containing metadata about the versioned files. Version numbers are maintained by the index of this array.

> Fast Author does not have any delete button for assets. If you want to remove assets you need to manually removed them from the `assets-manifest.json` and delete the asset folder.

### Assets Manipulation

Fast Author allows for quick editing of images. Asset manipulation is achieved using [SharpJs](https://github.com/lovell/sharp) and HTML5 Canvas. Asset manipulation is hardecoded currently for the needs of project owner until we code in configuration options.

#### Resizing Preset

This will resize an image to a width of `760px` with one press of a button

#### Border Preset

This will add a black border of `2px` thick with one press of a button

#### Cropping (WIP)

This is not fully implemented. It will open the Asset Drawing Editor into crop mode and allow you to crop the asset.

#### Asset Drawing Editor

This allows you to annotate with red rectanges or to place red numbered markers upon the asset.

## Autosaving

**Fast Author** automatically saves a backup of the current open file every **5 minutes**.

Autosaving at this stage is dumb and will save even when there are no changes. When we integrate more intelligent saving, saving will occur more frequently. So currently its recommend you manually save to ensure no changes lost using `Ctrl+S` (Win/Linux) or  `⌘+S` (Mac) hotkey.

When you toggle between projects a save will be triggerd. This is the only passive saving that occurs.

Autosaving is stored in the **[src/common/save.coffee](https://github.com/ExamProCo/fast-author/blob/master/src/common/save.coffee)**


## Hotkeys

Hotkeys are harcdoded into the application until I find time to extract them out into their own dialog. 

There **global** and **editor** hotkeys.

### Global Hotkeys

Global hotkeys work anywhere within the application.

These are located in **[src/application.coffee](https://github.com/ExamProCo/fast-author/blob/master/src/application.coffee)**

| Command | Mac Hotkey | Window/Linux Hotkey| Description |
|---|---|---|---|
| Fullscreen | ⌘+F | Ctrl+F | Toggles Fullscreen Mode |
| Publisher Preview | ⌘+P | Ctrl+P | Toggles Publisher Preview Mode |
| Split View | Ctrl+⇧+S | Ctrl+Shift+S | Toggles Live Preview |
| New Project | ⌘+N | Ctrl+N | Prompt to create new Project |
| Line Wrap | ⌘+⇧+W | Ctrl+Shift+W | Toggles line-wrappng for the editor |


### Editor Hotkeys

Editor hotkeys only work when the editor has focus. The editor happens to be a textarea.

Editor hotkey are located in **[src/components/textarea.coffee](https://github.com/ExamProCo/fast-author/blob/master/src/components/textarea.coffee)**

| Command | Mac Hotkey | Window/Linux Hotkey| Description |
|---|---|---|---|
| Save | ⌘+S | Ctrl+S | Save the markdown document |
| Heading 1 | ⌘+1 | Ctrl+1 | Turn current line into `# Heading 1` |
| Heading 2 | ⌘+2 | Ctrl+2 | Turn current line into `## Heading 2` |
| Heading 3 | ⌘+3 | Ctrl+3 | Turn current line into `### Heading 3` |
| Heading 4 | ⌘+4 | Ctrl+4 | Turn current line into `#### Heading 4` |
| Heading 5 | ⌘+5 | Ctrl+5 | Turn current line into `##### Heading 5` |
| Bold | ⌘+B | Ctrl+B | Bold current selected text `**bold**` |
| *Red | ⌘+G | Ctrl+G | Turn red current selected text `<strong class='r'>bold</strong>` |
| *Highlight | ⌘+H | Ctrl+H | Turn red current selected text `<strong class='d'>bold</strong>` |

> *These commands are specific to ExamPro markdown and will likely get extracted out into a plugin since they have no use on various platforms.

## Publisher Preview (WIP)

This allows you preview your markdown. Its suppose to let you choose different platform such as freeCodeCamp, DEV, Github or custom styling so you can quickly preview your markdown based on the platform you plan on targeting.

## Export (WIP)

You can export your project so when you go to upload to your target publishing platform everything is nealtly organized.

It will cherry pick only the images you are using. It will also render out an html and css file so if you wanted to use these file as static site generator or to share the final html file somewhere.

## Development

### Core Technologies

These are the core technologies that Fast Author is built upon:
* Webpack
* Coffescript (not used everywhere)
* Sass 1.0 (indented based syntax)
* Sharp 
* Electron

We use Coffeescript because its great for rapid development. If we feel we have more contributors or need better QA via test suites we'll likley switch over to Typescript which has worked well for past projects.


### Anatomy of the Source Code

This directory sturcture is likely to change but has been built out of practicality.
Here I am loggically grouping folders and files to best understand their relationships to one another

```
fast-author
├──/css/font-awesome.css
└──/webfonts/fa*

├──/sass/style.sass
└──/src
    ├── /common
    │    ├── data.coffee
    │    ├── save.coffee
    ├── /components
    │    └── *.coffee
    ├── /lib
    │    └── *.coffee
    ├── /views
    │    └── *.coffee
    └── application.coffee

└──/util/asset_ids.js

├──/draw.css
├──/draw.js
└──/draw.html

├──/index.html
├──/preload.js
└──/main.js

├──/package.json
└──/webpack.conf.js
```

#### /css and /webfonts
These folders and files are for **[Font Awesome icons](https://fontawesome.com/icons?d=gallery)**. I would have liked to have collected these along with all the other css generated files into a single folder but it was time-effective to dump these into the root of the project.

#### /sass

There is only was one sass file called `style.sass` which is transpiled to `style.css` for the application. The project is using SASS 1.0 syntax which is indent based. Why? because it was faster for me to copy and paste working code from an existing Electron app instead of hunting down a modern implementation in my graveyard of applications.

#### /util

This folder is intended for utility scripts for miscellaneous needs. I wrote **assets_ids** to take a folder of images and generate out an `assets-manifest.json` when I was migrating an older assets-folder. These probably will never be used by anyone other than me but I include them just in-case I need to point someone to one of these scripts.

#### draw.css, draw.js and draw.html

These files are for the Assets Drawing Editor. I didn't feel like adding a namespace to webpack so I am using plain css and js. Maybe I'll convert this to be consistent with the rest of the application.

### index.html, preload.js and main.js

`main.js` is the main file which is exected when you do `npm start`. Its server-side Electron logic. It is what creates windows, and processes images using Sharp.

`index.html` is the main html file for Fast Author


`preload.js` does nothing and is part of a default Electron app. I honestly can't remember what is used for so until I look it up, its going to hangout in the codebase with us.

#### package.json

Let us take a look at the scripts command:
```json
  "scripts": {
    "start": "npm run build_js && npm run build_electron",
    "util_asset_ids": "node util/asset_ids.js",
    "build_electron": "electron .",
    "build_js": "webpack --mode development --config webpack.conf.js"
  },
```

When you run `npm start` it will build the javascript as well as run the electron app.

Also note that 99% of dependencies are `devDependencies` because I honestly can't remember when something should be `devDependencies` or `Dependencies`


#### webpack.conf.js

I created two namespaces 

* `namespace_application` (electron-renderer)  - application.coffee > renderer.js
* `namespace_styles` (web) - style.sass > style.css

Why wasn't it called `application.js`. Laziness and default Electron apps generally call them `renderer.js`.

### How to run the application in development
Install dependencies



```
npm i
```

Package to rebuild native Node.js modules against the currently installed Electron version
```
electron-rebuild -p -t "dev,prod,optional"
```

Start the application
```
npm start
```


### Known Gotchas with Sharp


We have experienced hours of frustration with **[Sharp](https://github.com/lovell/sharp) + [Electron](https://github.com/electron/electron)** based on dependencies.

1. Sharp v0.24 may not be comptiable with Electron 8 so you'll need to drop to Electron 7
1. Sharp v0.24 may have issues on Linux and you'll nee to drop to 0.23.4

Remember to:

* Edit the  `package.json`
* delete `rm -rf node_modules sharp`,
* reinstall via `npm i`
* and package natives for electron `electron-rebuild -p -t "dev,prod,optional"`

