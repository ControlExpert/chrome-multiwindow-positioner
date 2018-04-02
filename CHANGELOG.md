<a name="1.0.11"></a>
# 1.0.11 (2018-2-April)

* Usability improvements
** Easy help button
** Quick info section
** Help / Getting started section
* Corporate branding
* More error handling in internal code.
* Use newer features of JavaScript ES5.
* Upgrade internal libraries. That include webkit bugfixes. 
** jquery: ~3.1.0 -> ~3.3.1,
** lodash: 4.16.4 -> 4.17.5,
** angular: 1.5.8 -> ~1.6.9,
** angular-resource: 1.5.8 -> ~1.6.9,
** font-awesome: ~4.6.3 -> ~4.7.0,
** angular-bootstrap: 2.2.0 -> ~2.5.0,
** file-saver: 1.3.3 -> ~1.3.8,
** angular-bootstrap-checkbox: 0.4.0 -> ~0.5.1
** angular-intro.js: ~3.3.0
 

<a name="1.0.10"></a>
# 1.0.10 (2016-13-December)

* Add ability to do batch changes. For example, if you want to change the monitor or position to all rules.
* Usability: Ability to close the monitor detection by pressing "Esc" key

<a name="1.0.8"></a>
# 1.0.8 (2016-12-December)

* Fixes Name of "Monitor" does not always reflect the number.
* Usability: Reduce duration of monitor detection to 3 seconds.
* Fixes enforce order of rules when import template enhancement.
* Usability: Save-Button does not close window.

<a name="1.0.6"></a>
# 1.0.6 (2016-01-December)

* Usability: reorganize the toolbar, and include the undo button.
* Fixed after template import and restarting the page, unexpected(default) rule templates are shown.

<a name="1.0.4"></a>
# 1.0.4 (2016-01-December)

* Usability: make more visible when changes are not saved.
* Fixed when importing a template, unsaved changes hint was not being displayed.
* Usability: Increased the delay when showing the monitor detection.
* Usability: add ability to quickly change the main settings from an existent rule.
* Fixed when in advanced more the options page would become wider, so that table fits.
* Improve german translations. (thanks Pascal)

# 1.0.2 (2016-30-November)

* Smoother transition when the options page is loading

<a name="1.0.1"></a>

# 1.0.1 (2016-17-November)

Initial implementation that includes:
* Flexible positioning options via Rules concept
* Multi-monitor support
* Validation of rules configuration against existent Monitor.
* Monitor detection
* Manual positioning detection that saves into rules.
* Default monitor support.
* Templates have unique code for any option in order to support template merging during import.
