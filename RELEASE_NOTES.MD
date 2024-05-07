# Client develop

Fixes

- Bugfix: could not resume print job after pausing.
- Bugfix: printer control dialog was empty after opening the second time, now it will load again.

# Client 22/04/2024 1.5.15

Fixes

- fix: current MonsterPi version would be hidden on the Software Upgrade page.

# Client 18/04/2024 1.5.14

Fixes

- fix: ZIP download would be corrupt sometimes. Ensure file downloaded as ArrayBuffer (instead of blob) and written as text/plain instead of text.

# Client 18/04/2024 1.5.13

Features:

- Printer Create/Update: add URL and apiKey validation with feedback. When wanted force save can be used in case of failures.

# Client 18/04/2024 1.5.12

Fixes:

- Settings: software upgrade page for client upgrades would not calculate ability to upgrade correctly (again). Now fixed.

# Client 18/04/2024 1.5.11

Fixes:

- Settings: pre-upload file cleaning settings could not be saved and no message was shown. Now both those things are fixed.

# Client 16/04/2024 1.5.10

Features:

- Settings: Software Upgrade - the GitHub API limit will be tested and shown in the software upgrade UI before attempting to load releases
- Settings Use a feature flag to determine if server can provide GitHub rate limit information

Changes:

- Settings: The settings toolbars have been refactored: consistent icon, simpler titles and dark color
- Settings: The settings navigation has been re-ordered and given separations

# Client 13/04/2024 1.5.9

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
