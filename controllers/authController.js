const pool = require('../config/db');
const helpers = require('../config/helpers');
const enviarEmail = require('../handlers/email');

const passport = require('passport');
const crypto = require('crypto');
const moment = require('moment');


exports.iniciarSesion = async (req, res) => {
    res.render('auth/signin', {
        nombrePagina: 'Iniciar Sesión'
    });
}

exports.autenticarUsuario = (req, res, next) => {
    passport.authenticate('local.signin', {
        successRedirect: '/',
        failureRedirect: '/signin',
        failureFlash: true,
        badRequestMessage: 'Ambos Campos son Obligatorios'
    })(req, res, next)

};


exports.logout = (req, res) => {
    req.logout();
    req.session.destroy();
    res.redirect('/signin');
}


exports.formRestablecer = async (req, res) => {
    res.render('auth/restablecer', {
        nombrePagina: 'Restablecer Contraseña'
    });
}


exports.enviarToken = async (req, res) => {

    const { emailUser } = req.body;

    const validMail = await pool.query('SELECT * FROM empleados WHERE email=?', emailUser);

    if(validMail.length > 0){

        const userToken = crypto.randomBytes(20).toString('hex');
        const expiraTime =  moment().add(12, 'h');
        const expiraToken = moment(expiraTime).format('YYYY-MM-DD hh:mm:ss a');
        
        const userName = await pool.query('SELECT a.*, b.* FROM pos_node.empleados a INNER JOIN pos_node.usuarios b ON a.idempleado=b.idempleado WHERE a.email=?',emailUser);

        const arrayUsuario = [];

        for (var x = 0; x < userName.length; x++) {
            const arrayUser = userName[x];
            const obj = {
                nombre_completo: arrayUser.nombre_completo,
                email: arrayUser.email,
                usuario: arrayUser.usuario
              };
            
              arrayUsuario.push(obj);

            //var nameUser = arrayUser.usuario;
        }

        var usuario = arrayUsuario[0];
        var nameUser = usuario.usuario;

        await pool.query('UPDATE usuarios SET token= ? WHERE usuario=?',[userToken, nameUser]);
        await pool.query('UPDATE usuarios SET expira_token= ? WHERE usuario=?',[expiraToken, nameUser]);

        const resetUrl = `http://${req.headers.host}/restablecer/${userToken}`;

        //console.log(resetUrl);

        await enviarEmail.enviar({
            usuario,
            subject: 'Password Reset', 
            resetUrl, 
            archivo : 'restablecer-password'
        });

        res.status(200).send('Existe');

    }else{
        res.send('Inexistente'); 
    }
}

exports.validarToken = async (req, res) => {

    const tokenUser = req.params.token;

    //console.log(tokenUser);

    const existToken = await pool.query('SELECT * FROM usuarios WHERE token=?',tokenUser);

    //console.log(existToken);

    if(existToken.length > 0){
        res.render('auth/reset-pass', {
            nombrePagina: 'Cambiar Contraseña'
        });
        
    }else{
        console.log('no existe');
    }
}


exports.actualizarPassword = async (req, res) => {

    const tokenUser = req.params.token;

    const { newPassword } = req.body;

    const validToken = await pool.query('SELECT usuario, expira_token FROM usuarios WHERE token=?',tokenUser);

    if(validToken.length > 0){

        for (var x = 0; x < validToken.length; x++) {
            const arrayToken = validToken[x];
            var userName = arrayToken.usuario;
            var expiraToken = arrayToken.expira_token;
        }
        
        if( moment().format('YYYY-MM-DD hh:mm:ss a') > moment(expiraToken).format('YYYY-MM-DD hh:mm:ss a')){

            res.status(200).send('Expiro');

        }else{

            var pass_usuario = await helpers.encryptPassword(newPassword);
            var token = null;
            var expira_token = null;

            await pool.query('UPDATE usuarios SET pass_usuario=?, token=?, expira_token=? WHERE usuario=?',[pass_usuario,token,expira_token,userName]);

            res.status(200).send('Contraseña Actualizada');
        }
        
    }else{
        console.log('no existe');
    }



}