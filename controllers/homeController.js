const pool = require('../config/db');


exports.home = async (req, res) => {

    var idusuario = res.locals.usuario.idusuario;

    var user = await pool.query('SELECT a.nombre FROM empleados a INNER JOIN usuarios b on a.idempleado=b.idempleado WHERE b.idusuario= ?', idusuario);

    nombre = user[0].nombre.toUpperCase();

    res.render('index',{
       nombrePagina: 'Inicio',
       nombre
    });
}