# Release notes

Fixes:

- Hide octoprint Sync Name button for moonraker type printer
- Printer dialog: do not require api key for moonraker type and send empty one on moonraker printer submission
- Printer dialog: adapt form label based on requirement of api key (octoprint: yes, moonraker: no)
- Batch reprint dialog mentions OctoPrint, should be type dependent
- Settings page: experimental settings - improve visual confirmation by introducing save spinners and checkboxes
- Sometimes empty flags can be passed (regressions backend...) prevent errors

## Client 27/10/2024 1.6.5

Feature:

- Support klipper in printer create/update dialog, if backend is able to provide said feature (feature flags).
- Show klipper/octoprint on tile
- Add moonraker/mainsail redirects in side panel
- Show klipper/octoprint in printer list

## Client 27/10/2024 1.6.4

Fix:

- Setting: adapt to new naming experiment client support

## Client 27/10/2024 1.6.3

Chore:

- Workflows: upgrade github actions to node 20
- Removes unnecessary -api suffix from methods across all methods.
- Update types of print statistics and completions
- Fix type issues PrintersView
- Refactor FileControlList component with setup
- Remove validation observer from AddOrUpdateFloorDialog
- Revamp all action FAB-style buttons to setup style

Features:

- Settings: load and set experiment moonraker support setting
- Switch to "next" UI support (beta)

Fixes:

- Settings for OctoPrint page icon wrong compared to settings nav

## Client 23/10/2024 1.6.2

Fixes:

- Settings page: Improve the layout of navigation and content. Now it wont wrap and its vertically stretched.

## Client 23/10/2024 1.6.1

Fixes:

- Fix: print jobs menu printTime is unavailable because progress is unset
- Fix: error handling in reprint dialog was throwing an error
- Fix: add helpful button with tooltip about what is happening in the reprint dialog

## Client 23/10/2024 1.6.0

Chore:

- Cleanup API caller services

Changes:

- Printing a file will not send select/print parameters anymore. This is assumed always true.

Features:

- Add support for two printer service types Moonraker & OctoPrint in the frontend

## Client 22/06/2024 1.5.18

Fixes:

- Fix: Printer dialog reset validation error before pressing test connection
- Fix: Printer list - show current printer count presented vs total present

## Client 22/06/2024 1.5.17

Fixes:

- Fix: replaced "Emergency Stop" terminology with "Quick Stop"

## Client 07/05/2024 1.5.16

Fixes:

- Bugfix: could not resume print job after pausing.
- Bugfix: printer control dialog was empty after opening the second time, now it will load again.

## Client 22/04/2024 1.5.15

Fixes:

- fix: current MonsterPi version would be hidden on the Software Upgrade page.

## Client 18/04/2024 1.5.14

Fixes:

- fix: ZIP download would be corrupt sometimes. Ensure file downloaded as ArrayBuffer (instead of blob) and written as text/plain instead of text.

## Client 18/04/2024 1.5.13

Features:

- Printer Create/Update: add URL and apiKey validation with feedback. When wanted force save can be used in case of failures.

## Client 18/04/2024 1.5.12

Fixes:

- Settings: software upgrade page for client upgrades would not calculate ability to upgrade correctly (again). Now fixed.

## Client 18/04/2024 1.5.11

Fixes:

- Settings: pre-upload file cleaning settings could not be saved and no message was shown. Now both those things are fixed.

## Client 16/04/2024 1.5.10

Features:

- Settings: Software Upgrade - the GitHub API limit will be tested and shown in the software upgrade UI before attempting to load releases
- Settings Use a feature flag to determine if server can provide GitHub rate limit information

Changes:

- Settings: The settings toolbars have been refactored: consistent icon, simpler titles and dark color
- Settings: The settings navigation has been re-ordered and given separations

## Client 13/04/2024 1.5.9

Features:

- GIF added to OctoFarm Import Printers dialog showing how the JSON can be retrieved from OctoFarm

Changes:

- yaml import dialog: convert to setup script
- OctoFarm Import dialog has been completely redesigned
- OctoFarm import validation added (client side only)
  - Only known properties will be imported, preventing import errors
  - A PrintersDB.json structure is accepted, directly from OctoFarm
- Dialog has been renamed from **Batch Import** to **Import OctoFarm Printers**

Fixes:

- yaml import: clear import file field when closing dialog
- yaml import: also clear import file field when an error has occurred during import
- yaml import: show an error message to provide context about why import has failed
- OctoFarm import: Only known properties will be imported, preventing import errors
