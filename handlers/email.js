const emailConfig = require('../config/email');
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const util = require('util');

let transport = nodemailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    auth: {
      user: emailConfig.user, 
      pass: emailConfig.pass
    }
});



// Utilizar templates de Handlebars
transport.use('compile', hbs({
    viewEngine : {
        extname: '.hbs', // handlebars extension
        layoutsDir: null, // location of handlebars templates
        defaultLayout: null, // name of main template
    },
    viewPath: __dirname + '/../views/emails',
    extName: '.hbs'
}));

exports.enviar = async (opciones) => {

    const opcionesEmail = {
        from:'PV System <noreply@devjobs.com',
        to: opciones.usuario.email,
        subject : opciones.subject, 
        template: opciones.archivo,
        context: {
            resetUrl : opciones.resetUrl,
            nombre : opciones.usuario.nombre_completo
        },
    };

    console.log('enviando....');

    const enviarEmail = util.promisify(transport.sendMail, transport);
    return enviarEmail.call(transport, opcionesEmail);
}
