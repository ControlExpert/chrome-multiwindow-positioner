# Chrome MultiWindow Positioner

Tool extension that enables effective window positioning/placement in multi-monitor setups.

## Features
* Flexible positioning options via Rules concept
* Multi-monitor support
* Validation of rules configuration against existent Monitor.
* Monitor detection
* Configuration templates support. It enables user profiles and larger organization distributed environments.
* Manual positioning detection that saves into rules.
* Default monitor support.

## Installation

1. Under the following address (https://goo.gl/bxuw3E) you will find the *MultiWindow Positioner*
2. Click the **ADD TO CHROME** button and then the **ADD EXTENSION** button.
3. The extension installation will take some seconds and you need to configure it. The configuration is available under either:
 * the following address: *chrome-extension://hmgehpjpfhobbnhhelhlggjfcaollidl/options.html*
 * or goint to the chrome://extensions/  und opening the **Options** link.
4. You may, at first, import a rules template
 * Click the **IMPORT TEMPLATE** icon
 * Give the following URL: https://cdn.rawgit.com/ControlExpert/chrome-multiwindow-positioner/gh-pages/templates/default-template-options.json
 * Click **ADD** to complete the dialog. 
 * Finally click **SAVE** to save all the changes permanently.
5. If you need to to use other monitors for specific rules/websites you may edit/add a rule respectively.   
6. In the edit or create rule dialog you may:
 * *Template*: List all available rule-templates.
 * *Active*: Tells if the rule is enabled and active.
 * *Remember*: (experimental) When enabled, automatically saves the target monitor when a window that matches to rule was re-position manually by the user. 
 * *Name*: The rule name
 * *URL*: The address that matches the rule. Its case sensitive. (should usually not change).
 * *Monitor*: Target-Monitor of the rule. It lists all the available monitors.
 * *Default Monitor*: Will pre-select the target-monitor when importing a template (in case no matching monitor was given from the Rules template.)  
 * *Position*: The position within the *target-monitor* where the window will be placed.
 * *Popup*: Shows the web address
7. Click **UPDATE** to accept the dialog changes.
8. Finally, click **SAVE** to save the all changes.

# Development

## Getting Started

```sh
# Install dependencies
npm install

# Transform updated source written by ES2015 (default option)
/

# or Using watch to update source continuously
gulp watch

# Make a production version extension
gulp build
```

## Test Chrome Extension

To test, go to: chrome://extensions, enable Developer mode and load app as an unpacked extension.

Need more information about Chrome Extension? Please visit [Google Chrome Extension Development](http://developer.chrome.com/extensions/devguide.html)

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
