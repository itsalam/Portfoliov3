// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

admin.initializeApp();

export const sendContactMail = functions.https.onRequest(
  async (req: functions.https.Request, res: functions.Response) => {
    res.set('Access-Control-Allow-Origin', 'https://www.vincentlam.dev');
    res.set('Access-Control-Allow-Credentials', 'true');
    res.set('Access-Control-Allow-Methods', 'GET, POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Access-Control-Max-Age', '3600');

    const reqBody = JSON.parse(req.body);
    admin
      .firestore()
      .collection('mail')
      .add({
        to: 'vincentthanhlam@gmail.com',
        message: {
          subject: 'New message from ' + reqBody.name + ' on portfolio site.',
          html: `From our portfolio site, ${reqBody.name} says: ${reqBody.message} <br> You can contact them at: ${reqBody.email}`
        }
      })
      .then(() => {
        res.status(200).send(`Messaged recieved`);
      })
      .catch((error) => {
        console.log(error);
        res.status(400).send(`An Error occured: ${error.message}`);
      });
  }
);
