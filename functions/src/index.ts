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
  async (req: any, res: any) => {
    res.set('Access-Control-Allow-Origin', 'https://www.vincentlam.dev');
    res.set('Access-Control-Allow-Credentials', 'true');
    res.set('Access-Control-Allow-Methods', 'GET, POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Access-Control-Max-Age', '3600');
    console.log('req body' + req);

    const data = {
      name: req.body.name,
      email: req.body.email,
      message: req.body.message
    };

    admin
      .firestore()
      .collection('mail')
      .add({
        to: 'vincentthanhlam@gmail.com',
        message: {
          subject: 'New message from ' + data.name + ' on portfolio site.',
          html: `From our portfolio site, ${data.name} says: ${data.message} <br> You can contact them at: ${data.email}`
        }
      })
      .catch((error) => {
        console.log(error);
        res.status(400).send(`An Error occured: ${error.message}`);
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
