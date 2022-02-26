const pool = require('../config/db');


exports.home = async (req, res) => {

    var idusuario = res.locals.usuario.idusuario;

    var user = await pool.query('SELECT a.nombre FROM empleados a INNER JOIN usuarios b on a.idempleado=b.idempleado WHERE b.idusuario= ?', idusuario);
    var totProd = await pool.query('SELECT COUNT(idproducto) AS total FROM productos');
    var totCli = await pool.query('SELECT COUNT(idcliente) AS total_cli FROM clientes WHERE status=1');
    var totVent = await pool.query('SELECT COUNT(idnota) AS total_ven FROM ventas WHERE status=1');
    var totProv = await pool.query('SELECT COUNT(idproveedor) AS total_prov FROM proveedores WHERE status=1');
    var toVenSem = await pool.query('SELECT COUNT(idnota) AS total_vtas FROM ventas WHERE DATE(fecha) BETWEEN DATE(NOW())-7 AND DATE(NOW()) AND status=1');
    var porcVta1 = await pool.query('SELECT IFNULL(SUM(total),0) AS suma FROM ventas WHERE status=1 AND DATE(fecha) BETWEEN DATE(NOW())-7 AND DATE(NOW())');
    var porcVta2 = await pool.query('SELECT IFNULL(SUM(total),0) AS suma FROM ventas WHERE status=1 AND DATE(fecha) BETWEEN DATE(NOW())-14 AND DATE(NOW())-8');
    var toVenMes =  await pool.query('call get_vtas_totxmes(?)', 0);
    var toVenMes2 =  await pool.query('call get_vtas_totxmes(?)', 1);

    var porSem1 = porcVta1[0].suma;
    var porSem2 = porcVta2[0].suma;

    var totalMes = toVenMes[0];
    var totalMes2 = toVenMes2[0];

    for (var x = 0; x < totalMes.length; x++) {
        const array = totalMes[x];
        var totalVtasMes = array.suma;
    }

    for (var x = 0; x < totalMes2.length; x++) {
        const array = totalMes2[x];
        var totalVtasMes2 = array.suma;
    }

    if(porSem1 === 0){
        porSem1=1;
    }

    if(porSem2 === 0){
        porSem2=1;
    }

    var porcentaje = ((porSem1*100)/porSem2)-100;

    var porcentajeMes = ((totalVtasMes*100)/totalVtasMes2)-100;
    
    if(porcentaje > 0){
        var porcPos = porcentaje.toFixed(2);
        var porcNeg = null;
    }else{
        var porcPos = null;
        var porcNeg = porcentaje.toFixed(2);
    }


    if(porcentajeMes > 0){
        var porcMesPos = porcentajeMes.toFixed(2);
        var porcMesNeg = null;
    }else{
        var porcMesPos = null;
        var porcMesNeg = porcentajeMes.toFixed(2);
    }

    nombre = user[0].nombre.toUpperCase();
    totalProd = totProd[0].total;
    totalCli = totCli[0].total_cli;
    totalVtas = totVent[0].total_ven;
    totalProvs = totProv[0].total_prov;
    totalVtasSem = toVenSem[0].total_vtas;
    totalMesActual = currencyFormat(totalVtasMes)

    res.render('index', {
        nombrePagina: 'Inicio',
        nombre,
        totalProd,
        totalCli,
        totalVtas,
        totalProvs,
        totalVtasSem,
        porcPos,
        porcNeg,
        porcMesPos,
        porcMesNeg,
        totalMesActual
    });

}

exports.menusActivos = async (req, res) => {

    var idusuario = res.locals.usuario.idusuario;

    //var menus = await pool.query('call get_menus_activos');
    var menus = await pool.query('call get_menus_activos_x_user(?)', idusuario);

    const dataMenus = [];

    if (menus.length === 0) {

        res.send('Empty');

    } else {

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
    var submenus = await pool.query('call get_submenus_activos_x_user(?)', idusuario);

    const datasubMenus = [];

    if (submenus.length === 0) {

        res.send('Empty');

    } else {

        for (var x = 0; x < submenus.length; x++) {
            const arraysubMenus = submenus[x];
            datasubMenus.push(arraysubMenus);
        }

        res.send(datasubMenus);

    }

}

exports.menus = async (req, res) => {

    var idUsuario = res.locals.usuario.idusuario;
    var url = req.originalUrl;

    var permiso = await validAccess(idUsuario, url);
    var permisoCrear = await validaPermisoCrear(idUsuario, url);

    if(permiso>0){

        res.render('modulos/menu/menus', {
            nombrePagina: 'Menús',
            permisoCrear
        });

    }else{

        res.render('modulos/error/401', {
            nombrePagina: '401 Unauthorized'
        });

    }

}

exports.mostrarMenus = async (req, res) => {

    const values = await pool.query('call get_all_menus');
    var idUsuario = res.locals.usuario.idusuario;

    const results = values[0];

    var valuesTotal = results.length;

    if (valuesTotal === 0) {

        res.send('empty');

    } else {

        const dataMenus = [];
        const route = '/menus';

        var permisoEditar = await validaPermisoEditar(idUsuario, route);
        var permisoEliminar = await validaPermisoEliminar(idUsuario, route);
        var permisoCrear = await validaPermisoCrear(idUsuario, route);

        for (var x = 0; x < valuesTotal; x++) {

            conteo = x + 1;
            const arrayMenus = results[x];

            var botonCrear = "";

            if(permisoEditar > 0){

                var botonEditar = "<a type='button' id='btn-editar-menu' class='btn btn-warning' href=" + "'/editar_menu/" + arrayMenus.idmenu + "'" + " idMenu=" + "'" + arrayMenus.idmenu + "'" + "><i class='fas fa-pencil-alt'></i></a>";

                if (arrayMenus.status === 0) {
                    var status = "<button type='button' id='btn-estatus-menu' class='btn btn-danger btn-sm' estadoMenu='1' idMenu=" + "'" + arrayMenus.idmenu + "'" + ">Desactivado</button>";
                } else {
                    var status = "<button type='button' id='btn-estatus-menu' class='btn btn-success btn-sm' estadoMenu='0' idMenu=" + "'" + arrayMenus.idmenu + "'" + ">Activado</button>";
                }

            }else{

                var botonEditar = "<button type='button' id='btn-editar-menu' class='btn btn-warning' idMenu=" + "'" + arrayMenus.idmenu + "' disabled" + "><i class='fas fa-pencil-alt'></i></button>";

                if (arrayMenus.status === 0) {
                    var status = "<button type='button' id='btn-estatus-menu' class='btn btn-danger btn-sm' estadoMenu='1' idMenu=" + "'" + arrayMenus.idmenu + "' disabled" + ">Desactivado</button>";
                } else {
                    var status = "<button type='button' id='btn-estatus-menu' class='btn btn-success btn-sm' estadoMenu='0' idMenu=" + "'" + arrayMenus.idmenu + "' disabled" + ">Activado</button>";
                }

            }

            if(permisoEliminar > 0){
                var botonEliminar = "<button id='btn-eliminar-menu' class='btn btn-danger' idMenu=" + "'" + arrayMenus.idmenu + "'" + " idPadre=" + "'" + arrayMenus.id_padre + "'" +"><i class='fa fa-times'></i></button>";
            }else{
                var botonEliminar = "<button id='btn-eliminar-menu' class='btn btn-danger' idMenu=" + "'" + arrayMenus.idmenu + "'" + " idPadre=" + "'" + arrayMenus.id_padre + "' disabled" +"><i class='fa fa-times'></i></button>";
            }

            if (arrayMenus.id_padre === 0) {
                if(permisoCrear > 0){
                    var botonCrear = "<a id='btn-agregar-submenu' class='btn btn-info' href=" + "'/agregar_submenu/" + arrayMenus.idmenu + "'" + " idMenu=" + "'" + arrayMenus.idmenu + "'" + "'" + "><i class='fa fa-plus'></i></a>";
                }else{
                    var botonCrear = "<button id='btn-agregar-submenu' class='btn btn-info' idMenu=" + "'" + arrayMenus.idmenu + "'" + "' disabled" + "><i class='fa fa-plus'></i></button>";
                }
            }

            var botones = "<div class='btn-group'>" + botonCrear + botonEditar + botonEliminar + "</div>";

            const obj = [
                conteo,
                arrayMenus.idmenu,
                arrayMenus.new_orden,
                arrayMenus.menu,
                arrayMenus.url,
                arrayMenus.icono,
                status,
                botones,
                arrayMenus.id_padre
            ];

            dataMenus.push(obj);
        }

        res.send(dataMenus);
    }

}

exports.activarMenus = async (req, res) => {

    const { idMenu, estadoMenu } = req.body;

    await pool.query('UPDATE menu SET status = ? WHERE idmenu = ?', [estadoMenu, idMenu]);

    res.status(200).send('El menú ha sido actualizado');

}

exports.formAgregarMenu = async (req, res) => {

    var newIdMenu = await pool.query('SELECT IFNULL(MAX(idmenu),0)+1 as idmenu FROM menu');

    var newOrden = await pool.query('SELECT IFNULL(MAX(orden),0)+1 as orden FROM menu WHERE id_padre=0');

    var idmenu = newIdMenu[0].idmenu;
    var orden = newOrden[0].orden;

    res.render('modulos/menu/agregar_menu', {
        nombrePagina: 'Agregar Menú',
        idmenu,
        orden
    });
}

exports.agregarMenu = async (req, res) => {

    var { idmenu, menu_nombre, id_padre, orden, url, icono, status } = req.body;

    const newMenu = {
        idmenu,
        menu_nombre,
        id_padre,
        orden,
        url,
        icono,
        status
    };

    const existMenu = await pool.query('SELECT * FROM menu WHERE menu_nombre = ?', newMenu.menu_nombre);

    if (existMenu.length > 0) {
        res.send('Repetido');
    } else {
        await pool.query('INSERT INTO menu SET ?', [newMenu]);

        res.status(200).send('Menú creado Correctamente');
    }
}

exports.formAgregarSubmenu = async (req, res) => {

    var idMenuPadre = req.params.id;

    var nombreMenuPadre = await pool.query('SELECT menu_nombre FROM menu WHERE idmenu=?', idMenuPadre);
    var newOrdenSub = await pool.query('SELECT IFNULL(MAX(orden),0) +1 AS orden FROM menu WHERE id_padre=?', idMenuPadre);
    var newIdMenu = await pool.query('SELECT MAX(idmenu)+1 as idmenu FROM menu');

    var menuPadre = nombreMenuPadre[0].menu_nombre;
    var newOrden = newOrdenSub[0].orden;
    var idmenu = newIdMenu[0].idmenu;

    res.render('modulos/menu/agregar_submenu', {
        nombrePagina: 'Agregar Submenú',
        menuPadre,
        newOrden,
        idmenu,
        idMenuPadre
    });
}

exports.agregarSubMenu = async (req, res) => {

    var { idmenu, menu_nombre, id_padre, orden, url, icono, status } = req.body;

    const newMenu = {
        idmenu,
        menu_nombre,
        id_padre,
        orden,
        url,
        icono,
        status
    };

    const existMenu = await pool.query('SELECT * FROM menu WHERE menu_nombre = ?', newMenu.menu_nombre);

    if (existMenu.length > 0) {
        res.send('Repetido');
    } else {
        await pool.query('INSERT INTO menu SET ?', [newMenu]);

        res.status(200).send('Submenú creado Correctamente');
    }
}

exports.formEditarMenu = async (req, res) => {

    var idMenu = req.params.id;

    var nombreMenu = await pool.query('SELECT menu_nombre FROM menu WHERE idmenu=?', idMenu);
    var ordenMenu = await pool.query('SELECT orden FROM menu WHERE idmenu=?', idMenu);
    var ordenMenu = await pool.query('SELECT orden FROM menu WHERE idmenu=?', idMenu);
    var urlMenu = await pool.query('SELECT url FROM menu WHERE idmenu=?', idMenu);
    var iconoMenu = await pool.query('SELECT icono FROM menu WHERE idmenu=?', idMenu);

    var nameMenu = nombreMenu[0].menu_nombre;
    var orden = ordenMenu[0].orden;
    var url = urlMenu[0].url;
    var icono = iconoMenu[0].icono;

    res.render('modulos/menu/editar_menu', {
        nombrePagina: 'Editar Menú',
        nameMenu,
        orden,
        idMenu,
        url,
        icono
    });
}

exports.editarMenu = async (req, res) => {

    var { idmenu, nombre_menu, url, icono } = req.body;

    var conteo = 0;

    const dataBase = await pool.query('SELECT * FROM menu WHERE idmenu = ?', idmenu);

    for (var x = 0; x < dataBase.length; x++) {
        const arrayCliente = dataBase[x];
        var menu_nombre_base = arrayCliente.menu_nombre;
        var url_base = arrayCliente.url;
        var icono_base = arrayCliente.icono;
    }

    const validMenu = await pool.query('SELECT * FROM menu WHERE menu_nombre = ? AND idmenu != ?', [nombre_menu, idmenu]);

    if (validMenu.length > 0) {

        res.send('MenuRep');

    } else {

        if (nombre_menu != menu_nombre_base) {
            await pool.query('UPDATE menu SET menu_nombre = ? WHERE idmenu = ?', [nombre_menu, idmenu]);
            var conteo = conteo + 1;
        }

        if (url != url_base) {
            await pool.query('UPDATE menu SET url = ? WHERE idmenu = ?', [url, idmenu]);
            var conteo = conteo + 1;
        }

        if (icono != icono_base) {
            await pool.query('UPDATE menu SET icono = ? WHERE idmenu = ?', [icono, idmenu]);
            var conteo = conteo + 1;
        }

        if (conteo > 0) {
            res.send('Menu Actualizado Correctamente');
        } else {
            res.send('Nulos');
        }
    }
}

exports.eliminarMenu = async (req, res) => {

    var idMenu = req.params.id;

    var eliminarMenu = await pool.query('DELETE FROM menu WHERE idmenu = ?', idMenu);

    if (eliminarMenu.affectedRows === 1) {
        await pool.query('DELETE FROM menu WHERE id_padre = ?', idMenu);
        res.status(200).send('El menú ha sido eliminado.');
    } else {
        res.send('Inexistente');
    }
    
}

exports.eliminarSubmenu = async (req, res) => {

    var idMenu = req.params.id;

    var eliminarSubmenu = await pool.query('DELETE FROM menu WHERE idmenu = ?', idMenu);

    if (eliminarSubmenu.affectedRows === 1) {
        res.status(200).send('El submenú ha sido eliminado.');
    } else {
        res.send('Inexistente');
    }
 
}


async function validAccess(idUsuario, url){

    var permiso = 0;

    var idPerfilQry = await pool.query('SELECT idperfil FROM usuarios WHERE idusuario=?',idUsuario);
    var idMenuQry = await pool.query('SELECT idmenu FROM menu WHERE url=?',url);

    var idPerfil = idPerfilQry[0].idperfil;
    var idMenu = idMenuQry[0].idmenu;

    var validPermU = await pool.query('SELECT COUNT(1) as cuenta FROM permisos_xusuario WHERE idmenu=? AND idusuario=? AND acceso=1',[idMenu, idUsuario]);
    var validPermP = await pool.query('SELECT COUNT(1) as cuenta FROM permisos_xperfil WHERE idmenu=? AND idperfil=? AND acceso=1',[idMenu,idPerfil]);
    
    var permiso = permiso + validPermU[0].cuenta + validPermP[0].cuenta;

    return permiso

}

async function validaPermisoCrear(idUsuario, route) {

    var permiso = 0;

    var idPerfilQry = await pool.query('SELECT idperfil FROM usuarios WHERE idusuario=?', idUsuario);
    var idMenuQry = await pool.query('SELECT idmenu FROM menu WHERE url=?', route);

    var idPerfil = idPerfilQry[0].idperfil;
    var idMenu = idMenuQry[0].idmenu;

    var validPermU = await pool.query('SELECT COUNT(1) as cuenta FROM permisos_xusuario WHERE idmenu=? AND idusuario=? AND crear=1', [idMenu, idUsuario]);
    var validPermP = await pool.query('SELECT COUNT(1) as cuenta FROM permisos_xperfil WHERE idmenu=? AND idperfil=? AND crear=1', [idMenu, idPerfil]);

    var permiso = permiso + validPermU[0].cuenta + validPermP[0].cuenta;

    return permiso;

}

async function validaPermisoEditar(idUsuario, route) {

    var permiso = 0;

    var idPerfilQry = await pool.query('SELECT idperfil FROM usuarios WHERE idusuario=?', idUsuario);
    var idMenuQry = await pool.query('SELECT idmenu FROM menu WHERE url=?', route);

    var idPerfil = idPerfilQry[0].idperfil;
    var idMenu = idMenuQry[0].idmenu;

    var validPermU = await pool.query('SELECT COUNT(1) as cuenta FROM permisos_xusuario WHERE idmenu=? AND idusuario=? AND editar=1', [idMenu, idUsuario]);
    var validPermP = await pool.query('SELECT COUNT(1) as cuenta FROM permisos_xperfil WHERE idmenu=? AND idperfil=? AND editar=1', [idMenu, idPerfil]);

    var permiso = permiso + validPermU[0].cuenta + validPermP[0].cuenta;

    return permiso;

}

async function validaPermisoEliminar(idUsuario, route) {

    var permiso = 0;

    var idPerfilQry = await pool.query('SELECT idperfil FROM usuarios WHERE idusuario=?', idUsuario);
    var idMenuQry = await pool.query('SELECT idmenu FROM menu WHERE url=?', route);

    var idPerfil = idPerfilQry[0].idperfil;
    var idMenu = idMenuQry[0].idmenu;

    var validPermU = await pool.query('SELECT COUNT(1) as cuenta FROM permisos_xusuario WHERE idmenu=? AND idusuario=? AND eliminar=1', [idMenu, idUsuario]);
    var validPermP = await pool.query('SELECT COUNT(1) as cuenta FROM permisos_xperfil WHERE idmenu=? AND idperfil=? AND eliminar=1', [idMenu, idPerfil]);

    var permiso = permiso + validPermU[0].cuenta + validPermP[0].cuenta;

    return permiso;

}

function currencyFormat(value) {
    return '$' + value.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}