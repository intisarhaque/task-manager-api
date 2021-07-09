const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name)=>{
    console.log("am now in the email function")
    sgMail.send({
        to: email,
        from: "hawksawed@gmail.com",
        subject: 'Thanks for joining in',
        text: `Welcome to the app, ${name}. Let me know how you get along with the app.`
    })
}

const sendCancellationEmail = (email, name)=>{
    sgMail.send({
        to: email,
        from: "hawksawed@gmail.com",
        subject: "Sorry you're leaving :(",
        text: `Sorry that you're leaving us, ${name}. Feel free to join back any time!`
    })
}

module.exports = {
    sendWelcomeEmail, 
    sendCancellationEmail
}