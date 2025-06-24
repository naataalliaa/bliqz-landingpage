
/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// const {setGlobalOptions} = require("firebase-functions");

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
// setGlobalOptions({maxInstances: 10});


// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
require("dotenv").config();

const functions = require("firebase-functions");
const sgMail = require("@sendgrid/mail");

const sendGridApiKey = process.env.SENDGRID_API_KEY;
if (!sendGridApiKey) {
  throw new Error("SENDGRID_API_KEY environment variable not set");
}
sgMail.setApiKey(sendGridApiKey);

const JOIN_WAITLIST_TEMPLATE_ID = "d-7fc6ddbc7bda4e3fa9f488e0597673d6";
const UPDATE_POSITION_TEMPLATE_ID = "d-d7d1c07b2ba54610aacf69728659da4e";

exports.sendThankYouEmail = functions.firestore
    .document("waitlist/{docId}")
    .onCreate(async (snapshot, context) => {
      const data = snapshot.data();
      const email = data.email;
      const position = data.position;

      const msg = {
        to: email,
        from: "no-reply@em1933.www.bliqz.com",
        templateId: JOIN_WAITLIST_TEMPLATE_ID,
        dynamic_template_data: {
          position,
          referralCode: data.referralCode,
        },
      };

      try {
        await sgMail.send(msg);
        console.log("Join waitlist email sent to:", email);
      } catch (error) {
        console.error("Error sending join waitlist email:", error);
      }
    });

exports.sendPositionUpdateEmail = functions.firestore
    .document("waitlist/{docId}")
    .onUpdate(async (change, context) => {
      const before = change.before.data() || {};
      const after = change.after.data() || {};

      if (
        before.position === after.position ||
      !after.email ||
      after.position == null
      ) {
        return;
      }

      const {email, position: newPos} = after;
      const oldPos = before.position;

      const msg = {
        to: email,
        from: "no-reply@em1933.www.bliqz.com",
        templateId: UPDATE_POSITION_TEMPLATE_ID,
        dynamic_template_data: {
          oldPos,
          newPos,
          referralCode: after.referralCode,
        },
      };

      try {
        await sgMail.send(msg);
        console.log("Update position email sent to:", email);
      } catch (err) {
        console.error("Error sending update position email:", err);
      }
    });
