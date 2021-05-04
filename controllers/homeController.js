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

exports.menusActivos = async (req, res) => {

    var idusuario = res.locals.usuario.idusuario;

    //var menus = await pool.query('call get_menus_activos');
    var menus = await pool.query('call pos_node.get_menus_activos_x_user(?)',idusuario);

    const dataMenus = [];

    if (menus.length === 0) {

        res.send('Empty');

    }else{

        for (var x = 0; x < menus.length; x++) {
            const arrayMenus = menus[x];
            dataMenus.push(arrayMenus);
        }

        res.send(dataMenus);

    }

}

exports.submenusActivos = async (req, res) => {

    var idusuario = res.locals.usuario.idusuario;

    //var submenus = await pool.query('call get_submenus_activos');
    var submenus = await pool.query('call pos_node.get_submenus_activos_x_user(?)',idusuario);

    const datasubMenus = [];

    if (submenus.length === 0) {

        res.send('Empty');

    }else{

        for (var x = 0; x < submenus.length; x++) {
            const arraysubMenus = submenus[x];
            datasubMenus.push(arraysubMenus);
        }

        res.send(datasubMenus);

    }

}