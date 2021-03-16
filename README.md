# Chrome MultiWindow Positioner

Extension that enables effective automated window positioning/placement in multi-monitor setups.

## Features
* Flexible and repeatible window positioning using a rules-based workflow.
* Support for multiple monitors.
* Validation of rules configuration against a current setup.
* Support for JSON-based configuration templates, enabling rapid deployment of a rulset to multiple environments.
* Ability to save a manual window positioning as a rule.

## Installation

1. Via the Chrome web store: https://goo.gl/bxuw3E
2. Click the **ADD TO CHROME** button and then the **ADD EXTENSION** button.
3. The extension installation will take some seconds and you need to configure it. The configuration is available under either:
 * the following address: *chrome-extension://hmgehpjpfhobbnhhelhlggjfcaollidl/options.html*
 * or goint to the chrome://extensions/ and opening the **Options** link.

## Usage

### Rules and Templates

1. If you have an existing rules template, start by importing it:
 * Click the **IMPORT TEMPLATE** icon
 * Enter the URL of your template in the field provided.
 * *An example template can be found at: https://cdn.rawgit.com/ControlExpert/chrome-multiwindow-positioner/gh-pages/templates/default-template-options.json*
 * Check the **Replace all templates** box if you'd like to overwrite an existing templates.
 * Click **ADD** to import your template.
 * Finally click **SAVE** to save all the changes permanently.
2. If you don't have a template, or would like to add a rule individually you can start by clicking on the **+** button. 
3. After clicking on the **+** button, the **New tab option** dialog is shown:
 * *Template*: List all available rule-templates.
 * *Active*: Tells if the rule is enabled and active.
 * *Remember*: (**experimental**) When enabled, automatically saves the target monitor when a window that matches to rule was re-position manually by the user. 
 * *Name*: A friendly name for the rule.
 * *URL*: The address that matches the rule. This field is case sensitive.
 * *Monitor*: The target-monitor for the rule. The drop-down menu shows all available monitors.
 * *Default Monitor*: Will pre-select the target-monitor when importing a template (in case no matching monitor was given from the Rules template.)  
 * *Position*: The position within the *target-monitor* where the window will be placed.
 * *Plain Window*: When checked, the new window will hide certain UI elements of Chrome, such as the address bar and bookmarks bar. If unchecked, the window will adhere to the system's existing Chrome window display settings.
4. Click **ADD** to create the rule.
5. Finally, click **SAVE** to save the all changes.

### Triggering a Rule

1. Once you have created a rule for a URL, create a bookmark for it on the bookmarks bar.
 * Hold down the **Ctrl** key while clicking on the bookmark to trigger the rule. A new tab should open and load the URL, and then the plugin should process the associated rule and move the window to the desired monitor and position.
2. You can automate opening N+1 URL's by placing them in a folder.
  * Create bookmarks for all of your desired URLs and place them in a folder.
  * Right-click on the folder you've created, hold down the **Ctrl** key, and click on *Open all*. All URL's contained as bookmarks in the folder should open as new tabs, load the URL, and then the plugin should process the associated rules and move the windows to the desired monitor(s) and position(s). 

# Development

## Getting Started

```sh
# Install dependencies
npm install
npm -g install bower
bower install

# Transform updated source written by ES2015 (default option)
/

# or Using watch to update source continuously
gulp watch

# Make a production version extension
gulp build
```

## Test Chrome Extension

To test, go to: chrome://extensions, enable Developer mode and load app as an unpacked extension.

Need more information about Chrome Extension? Please visit [Google Chrome Extension Development](https://developer.chrome.com/docs/extensions/)

## gulp tasks

### Babel

The generator supports ES 2015 syntax through babel transforming. You may have a source files in `script.babel` if your project has been generated without `--no-babel` options. While developing, When those of source has been changed, `gulp babel` should be run before test and run a extension on Chrome.

```sh
gulp babel
```

If you would like to have a continuous transforming by babel you can use `watch` task

### Watch

Watch task helps you reduce your efforts during development extensions. If the task detects your changes of source files, re-compile your sources automatically or Livereload([chromereload.js](https://github.com/yeoman/generator-chrome-extension/blob/master/app/templates/scripts/chromereload.js)) reloads your extension. If you would like to know more about Live-reload and preview of Yeoman? Please see [Getting started with Yeoman and generator-webapp](http://youtu.be/zBt2g9ekiug?t=3m51s) for your understanding.

```bash
gulp watch
```

### Build and Package

It will build your app as a result you can have a distribution version of the app in `dist`. Run this command to build your Chrome Extension app.

```bash
gulp build
```

You can also distribute your project with compressed file using the Chrome Developer Dashboard at Chrome Web Store. This command will compress your app built by `gulp build` command.

```bash
gulp package
```
  
### ES2015 and babel

You can use es2015 now for developing the Chrome extension. However, at this moment, you need to execute `babel` task of gulp to compile to test and run your extension on Chrome, because [ES2015 is not full functionality on Chrome as yet](http://kangax.github.io/compat-table/es6/).

The sources written by es2015 is located at `scripts.babel` and runnable sources are will be at `script` after compiling by `gulp babel`. May you don't want to use babel and ES2015 use `--no-babel` option when scaffolding a new project.

## Contribute

See the [contributing docs](https://github.com/ControlExpert/chrome-multiwindow-positioner/blob/master/contributing.md)

## License

[MIT license](https://github.com/ControlExpert/chrome-multiwindow-positioner/blob/master/LICENSE)
