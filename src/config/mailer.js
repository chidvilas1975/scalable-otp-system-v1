import nodemailer from "nodemailer";
import env from "./env.js";

const transporter = nodemailer.createTransport({

    service: "gmail",

    pool: true,

    maxConnections: 5,

    auth: {

        user: env.EMAIL_USER,

        pass: env.EMAIL_PASSWORD

    }

});

transporter.verify((error, success)=>{

    if(error){
        console.log("SMTP Error:", error.message);
    }
    else{
        console.log("SMTP Ready");
    }

});


export default transporter;