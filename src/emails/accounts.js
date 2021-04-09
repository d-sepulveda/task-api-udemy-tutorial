const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENGRID_API_KEY); //process.env.SENDGRID_API_KEY

const sendWelcomeEmail = (userEmail, userName = "User") => {
  sgMail.send({
    to: userEmail,
    from: "d.sepulveda2310@gmail.com", // Change to your verified sender
    subject: "Your account has been created correctly",
    text: `Welcome to aplication, ${userName}` ,
    // html: "<strong>and easy to do anywhere, even with Node.js</strong>", investigar platilla html
  });
};

const sendDeleteAccountEmail = (userEmail, userName = "User") => {
  sgMail.send({
    to: userEmail,
    from: "d.sepulveda2310@gmail.com", // Change to your verified sender
    subject: "Your account has been delete. we sorry your lose",
    text: `what is the reason for your decision?, ${userName}` ,
  })
}

module.exports = {
  sendWelcomeEmail,
  sendDeleteAccountEmail
}