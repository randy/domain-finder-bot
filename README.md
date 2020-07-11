Domain Finder Bot
=================

[DFB](https://github.com/randyFRS/domain-finder-bot) is simple Slack app written in JavaScript (node.js).

This project is a simple app that takes a CSV file upload, locates the Email column, then parses the Domain from each entry and creates a new column in an output file.

Domain Finder Bot
------------

- `app.js` contains the primary Bolt app. It imports the Bolt package (`@slack/bolt`) and starts the Bolt app's server. 
- The app also utilizes Slack's Web API to receive the uploaded file
- It also uses Papa Parse to handle the CSV jazz. 

Read the [Bolt documentation](https://slack.dev/bolt)
-------------------

\ ゜o゜)ノ
