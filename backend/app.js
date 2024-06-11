const express = require('express');
//test api key will change later
const stripe = require('stripe')('sk_test_51PNIdBHgfBYVHXADDenzS6FbrMlHhzw4xRZp3Jjv72DQbhGsFfxp7ZaUWWRjNTfaWTl7xvSLFPKrxshVTCzkd1Lx00GHRoWAar');
const nodemailer = require('nodemailer');
const send = require('send');

const app = express();
const PORT = 3000;
const YOUR_DOMAIN = 'http://localhost:3000';

app.listen(PORT, (error) =>{
    if(!error)
        console.log("Server is Successfully Running, and App is listening on port " + PORT)
    else 
        console.log("Error occurred, server can't start", error);
    }
);

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    port: 465,               // true for 465, false for other ports
    host: "smtp.gmail.com",
       auth: {
            user: 'youremail@gmail.com',
            pass: 'password',
         },
    secure: true,
    });

//API Endpoints

app.get('/', (req, res)=>{
    res.status(200);
    res.send("Welcome to root URL of Server");
});

app.post('/create-checkout-session', async (req, res) => {
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      line_items: [
        {
          // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
          price: 'price_1PNJFfHgfBYVHXADqXrUOlyL',
          quantity: 1,
        },
      ],
      mode: 'payment',
      return_url: `${YOUR_DOMAIN}/return?session_id={CHECKOUT_SESSION_ID}`,
    });
  
    res.send({clientSecret: session.client_secret});
});

app.get('/session-status', async (req, res) => {
    const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
  
    res.send({
      status: session.status,
      customer_email: session.customer_details.email
    });
});

app.post('/sendemail', async (req, res) => {
    const senderEmail = req.body.sender;
    const name = req.body.name;
    const phone = req.body.phone;
    const message = req.body.message;
    const mailData = {
        from: senderEmail,  // sender address
        to: 'dyamijr@yahoo.com',   // list of receivers
        subject: name + ' would like to contact you',
        text: 'Name: ' + name + '\nPhone: ' + phone + '\nEmail: ' + senderEmail + '\n\n' + message,
    }
    transporter.sendMail(mailData, (error, info) =>{
        if (error) {
            return console.log(error);
        }
        res.status(200).send({message: "Mail send", message_id: info.messageId});
    })
})