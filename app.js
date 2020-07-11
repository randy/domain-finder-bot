// Require the Bolt package (github.com/slackapi/bolt)
const { App } = require("@slack/bolt");
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

const { WebClient } = require('@slack/web-api');
const web = new WebClient(process.env.SLACK_BOT_TOKEN);

const papa = require('papaparse');

app.event("file_created", async ({ event }) => {
  console.log(`User ${event.user_id} on channel: ${event.channel} created a file.`);
});

// Listener middleware that filters out messages with 'bot_message' subtype
async function noBotMessages({ message, next }) {
  if (!message.subtype || message.subtype !== 'bot_message') {
    await next();
  }
}

// The listener only receives messages from humans
app.message(async ({ event }) => {

  if (event && event.files && event.files[0].filetype === 'csv') {

    let uploadFile = await web.files.info({
      token: process.env.SLACK_BOT_TOKEN,
      file: event.files[0].id
    });

    if (uploadFile) {

      let contents = papa.parse(uploadFile.content, {
        "header": true,
        "skipEmptyLines": true,
        "delimiter": ",",
        "quoteChar": "\""
      });

      if (contents && contents.errors.length === 0) {

        if (contents.meta.aborted) {
          throw Error ("parsing aborted")
        }

        let output = processCsvData(contents);

        let filename = uploadFile.file.name.slice(0, -4) + "-out.csv";

        try {
          await app.client.files.upload({
            token: process.env.SLACK_BOT_TOKEN,
            channels: event.channel,
            initial_comment: `Here ya go, <@${event.user}>!`,
            content: output,
            filename: filename,
            filetype: 'csv',
          });

        } catch (e) {
          console.log(e);
        }

      }
    }
  }

}, noBotMessages);


processCsvData = function (contents) {
  contents.data.forEach( function (row) {
    row['Domain'] = /@([^.]+.*)\b/.exec(row['Email'])[1];
  });

  var emailIndex = contents.meta.fields.indexOf("Email");

  // inserting the header puts the column in the right place during output
  contents.meta.fields.splice((emailIndex + 1), 0, "Domain");

  return papa.unparse(contents, {
    "header": true,
    "skipEmptyLines": true,
    "delimiter": ",",
    "quoteChar": "\"",
    "newline": "\r\n"
  });
};

(async () => {
    // Start the app
    await app.start(process.env.PORT || 3000);

console.log('⚡️ Bolt app is running!');
})();
