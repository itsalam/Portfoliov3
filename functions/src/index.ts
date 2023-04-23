
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
const sendgrid = require('@sendgrid/mail');
const functions = require('firebase-functions');

sendgrid.setApiKey(functions.config().sendgrid.key);

export const sendContactMail = functions.https.onRequest(async (req: any, res: any) => {
  res.set('Access-Control-Allow-Origin', "https://www.vincentlam.dev");
  res.set('Access-Control-Allow-Credentials', 'true');
  res.set('Access-Control-Allow-Methods', 'GET, POST');    
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  res.set('Access-Control-Max-Age', '3600');
  console.log("req body"+req);

  const data = {
    name: req.body.name,
    email: req.body.email,
    subject: req.body.subject,
    message: req.body.message
  }

  console.log(data);
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  for (const [, value] of Object.entries(data)) {
    if (value === undefined || value === null) {
      res.status(401).send(`Missing field: ${value}`);
      return;
    }
  }

  async function sendEmail() {
    await sendgrid.send({
      to: 'vincentthanhlam@gmail.com',
      from: data.email,
      subject: `${data.name} | ${data.subject}`,
      text: data.message
    });
  }


  try {
    await sendEmail();
  } catch (err){
    res.status(500).send(`Error found: ${err}`);
  }  
  const message = req.body.message;
  res.status(200).send(`Following message sent: ${message}`);
});
