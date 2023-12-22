const nodemailer = require("nodemailer");

// send Email will have arguments like "subjectOfEmail", "messageInMail", "Sender", "reciever", "SpecailReplyAddress" 
const sendEmail = async(subject, message, sent_to, sent_from, reply_to) => {
   
    // Transporter : a variable which will transport the mail
    const trasporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST ,
        port: 465,
        secure:true,
        auth: {
        user : process.env.EMAIL_USER,
        // NOTE : setUp Google App Password in Gmail Account Settings 
        // This will allow less secure Apps to use An external Password to access your gmail
        // The PassWord is in the File GoogleAppPass 
        pass : process.env.EMAIL_PASS,  
        },

        // for issues like https and security add a tls property
        tls:{
            rejectUnauthorized : false
        }
    })
    
    // options are the info about ->
    //  1. who is sending the mail
    //  2. who is recieving it 
    //  3. where to reply
    //  4. subject of mail
    //  5. message in mail in html format
    const options = {
        from: sent_from,
        to: sent_to,
        replyTo: reply_to,
        subject: subject,
        html: message,
    }

    // send mail
    // if email is not send successfully see the Error
    // else Send successfully : the info how its send
    // .sendMail() is the used 
    trasporter.sendMail(options, function(err, info){
        if(err){
            console.log(err);
        }
        else{
            console.log(info);
        }
    })
}

module.exports = sendEmail 