const { IgnorePlugin } = require('webpack');
const pool = require('../config/db');


exports.empresa = async (req, res) => {

    var idUsuario = res.locals.usuario.idusuario;
    var url = req.originalUrl;

    var permiso = await validAccess(idUsuario, url);

    if (permiso > 0) {

        res.render('modulos/empresa', {
            nombrePagina: 'Empresa'
        });

    } else {

        res.render('modulos/error/401', {
            nombrePagina: '401 Unauthorized'
        });

    }

}

exports.infoEmpresa = async (req, res) => {

    var empresa = await pool.query('SELECT * FROM empresa');

    const dataEmpresa = [];

    if (empresa.length === 0) {

        res.send('Empty');

    } else {

        for (var x = 0; x < empresa.length; x++) {
            const arrayEmpresa = empresa[x];
            dataEmpresa.push(arrayEmpresa);
        }

        res.send(dataEmpresa);

    }

}

exports.guardarEmpresa = async (req, res) => {

    const { nombre_empresa, razon_social, web_site } = req.body;
    var conteo = 0;

    const newEmpresa = {
        nombre_empresa,
        razon_social,
        web_site
    };

    var infoEmpresa = await pool.query('SELECT * FROM empresa');


    if (infoEmpresa.length === 0) {

        await pool.query('INSERT INTO empresa SET ?', [newEmpresa]);

        res.status(200).send('Creado');

    } else {

        for (var x = 0; x < infoEmpresa.length; x++) {
            const arrayEmpresa = infoEmpresa[x];
            var empresa_base = arrayEmpresa.nombre_empresa;
            var razon_social_base = arrayEmpresa.razon_social;
            var web_site_base = arrayEmpresa.web_site;
        }

        if (nombre_empresa !== empresa_base) {
            await pool.query('UPDATE empresa SET nombre_empresa = ?', [nombre_empresa]);
            var conteo = conteo + 1;
        }

        if (razon_social !== razon_social_base) {
            await pool.query('UPDATE empresa SET razon_social = ?', [razon_social]);
            var conteo = conteo + 1;
        }

        if (web_site !== web_site_base) {
            await pool.query('UPDATE empresa SET web_site = ?', [web_site]);
            var conteo = conteo + 1;
        }

        if (conteo > 0) {

            res.send('Actualizado');

        } else {
            res.send('Nulos');

        }


    }

}

exports.permisos = async (req, res) => {

    var idUsuario = res.locals.usuario.idusuario;
    var url = req.originalUrl;

    var permiso = await validAccess(idUsuario, url);

    if (permiso > 0) {

        res.render('modulos/menu/permisos_xperfil', {
            nombrePagina: 'Permisos'
        });

    } else {

        res.render('modulos/error/401', {
            nombrePagina: '401 Unauthorized'
        });

    }
}

exports.permisosxPerfil = async (req, res) => {

    let idPerfil = req.params.id;

    var dataPermisos = await pool.query('call get_permisos_xperfil(?)', idPerfil);

    const results = dataPermisos[0];

    const dataset = [];

    for (var x = 0; x < results.length; x++) {

        const array = results[x];

        if (array.acceso === 1) {

            var checkBoxAcceso = "<input type='checkbox' class='checkAcceso' idPadre=" + "'" + array.id_padre + "'" + " idMenu=" + "'" + array.idmenu + "'" + " id=" + "'" + array.idmenu + "c' checked" + ">";

            if (array.id_padre === 0) {
                var checkBoxCrear = null;
                var checkBoxEditar = null;
                var checkBoxEliminar = null;
            } else {
                if (array.crear === 1) {
                    var checkBoxCrear = "<input type='checkbox' class='checkCrear' idMenu=" + "'" + array.idmenu + "'" + " id=" + "'" + array.idmenu + "cc' checked" + ">";
                } else {
                    var checkBoxCrear = "<input type='checkbox' class='checkCrear' idMenu=" + "'" + array.idmenu + "'" + " id=" + "'" + array.idmenu + "cc' " + ">";
                }

                if (array.editar === 1) {
                    var checkBoxEditar = "<input type='checkbox' class='checkEditar' idMenu=" + "'" + array.idmenu + "'" + " id=" + "'" + array.idmenu + "ce' checked" + ">";
                } else {
                    var checkBoxEditar = "<input type='checkbox' class='checkEditar' idMenu=" + "'" + array.idmenu + "'" + " id=" + "'" + array.idmenu + "ce' " + ">";
                }

                if (array.eliminar === 1) {
                    var checkBoxEliminar = "<input type='checkbox' class='checkEliminar' idMenu=" + "'" + array.idmenu + "'" + " id=" + "'" + array.idmenu + "cel' checked" + ">";
                } else {
                    var checkBoxEliminar = "<input type='checkbox' class='checkEliminar' idMenu=" + "'" + array.idmenu + "'" + " id=" + "'" + array.idmenu + "cel' " + ">";
                }

            }


        } else {

            var checkBoxAcceso = "<input type='checkbox' class='checkAcceso' idPadre=" + "'" + array.id_padre + "'" + " idMenu=" + "'" + array.idmenu + "'" + " id=" + "'" + array.idmenu + "c' " + ">";

            if (array.id_padre === 0) {
                var checkBoxCrear = null;
                var checkBoxEditar = null;
                var checkBoxEliminar = null;
            } else {
                var checkBoxCrear = "<input type='checkbox' class='checkCrear' idMenu=" + "'" + array.idmenu + "'" + " id=" + "'" + array.idmenu + "cc' " + " disabled>";
                var checkBoxEditar = "<input type='checkbox' class='checkEditar' idMenu=" + "'" + array.idmenu + "'" + " id=" + "'" + array.idmenu + "ce' " + " disabled>";
                var checkBoxEliminar = "<input type='checkbox' class='checkEliminar' idMenu=" + "'" + array.idmenu + "'" + " id=" + "'" + array.idmenu + "cel' " + " disabled>";
            }

        }

        const obj = [
            array.new_orden,
            array.idmenu,
            array.menu,
            checkBoxAcceso,
            checkBoxCrear,
            checkBoxEditar,
            checkBoxEliminar,
            array.id_padre
        ];

        dataset.push(obj);
    }

    res.send(dataset)

}

exports.activarPermxPerfil = async (req, res) => {

    var { idmenu, idperfil, acceso, permiso } = req.body;

    if (permiso === 'accesar') {

        var crear = 0;
        var editar = 0;
        var eliminar = 0;

        const newPermiso = {
            idmenu,
            idperfil,
            acceso,
            crear,
            editar,
            eliminar
        };

        var countExist = await pool.query('SELECT COUNT(1) AS cuenta FROM permisos_xperfil WHERE idmenu=? and idperfil=?', [idmenu, idperfil]);

        var exist = countExist[0].cuenta;

        if (exist === 0) {

            await pool.query('INSERT INTO permisos_xperfil SET ?', [newPermiso]);

            res.send('Insertado');

        } else {

            if (newPermiso.acceso === 0) {
                await pool.query('UPDATE permisos_xperfil SET acceso = ?, crear = ?, editar = ?, eliminar = ? WHERE idmenu = ? AND idperfil=?', [newPermiso.acceso, newPermiso.crear, newPermiso.editar, newPermiso.eliminar, newPermiso.idmenu, newPermiso.idperfil]);
            } else {
                await pool.query('UPDATE permisos_xperfil SET acceso = ? WHERE idmenu = ? AND idperfil=?', [newPermiso.acceso, newPermiso.idmenu, newPermiso.idperfil]);
            }

            res.send('Actualizado');

        }

    }

    if (permiso === 'crear') {

        var countExist = await pool.query('SELECT COUNT(1) AS cuenta FROM permisos_xperfil WHERE idmenu=? and idperfil=?', [idmenu, idperfil]);

        var exist = countExist[0].cuenta;

        if (exist === 1) {

            await pool.query('UPDATE permisos_xperfil SET crear = ? WHERE idmenu = ? AND idperfil=?', [acceso, idmenu, idperfil]);

            res.send('Actualizado');

        } else {
            res.send('Error');
        }

    }
    
    if(permiso === 'editar'){

        var countExist = await pool.query('SELECT COUNT(1) AS cuenta FROM permisos_xperfil WHERE idmenu=? and idperfil=?', [idmenu, idperfil]);

        var exist = countExist[0].cuenta;

        if (exist === 1) {

            await pool.query('UPDATE permisos_xperfil SET editar = ? WHERE idmenu = ? AND idperfil=?', [acceso, idmenu, idperfil]);

            res.send('Actualizado');

        } else {
            res.send('Error');
        }

    }

    if (permiso === 'eliminar') {

        var countExist = await pool.query('SELECT COUNT(1) AS cuenta FROM permisos_xperfil WHERE idmenu=? and idperfil=?', [idmenu, idperfil]);

        var exist = countExist[0].cuenta;

        if (exist === 1) {

            await pool.query('UPDATE permisos_xperfil SET eliminar = ? WHERE idmenu = ? AND idperfil=?', [acceso, idmenu, idperfil]);

            res.send('Actualizado');

        } else {
            res.send('Error');
        }

    }

}

exports.permisosxUsuario = async (req, res) => {

    var idUsuario = res.locals.usuario.idusuario;
    var url = req.originalUrl;

    var permiso = await validAccess(idUsuario, url);

    if (permiso > 0) {

        res.render('modulos/menu/permisos_xusuario', {
            nombrePagina: 'Permisos'
        });

    } else {

        res.render('modulos/error/401', {
            nombrePagina: '401 Unauthorized'
        });

    }

}

exports.getpermisosxUsuario = async (req, res) => {

    let idUser = req.params.id;

    var dataPermisos = await pool.query('call get_permisos_xusuario(?)', idUser);

    const results = dataPermisos[0];

    const dataset = [];

    for (var x = 0; x < results.length; x++) {

        const array = results[x];

        if (array.acceso === 1) {

            var checkBoxAcceso = "<input type='checkbox' class='checkAccesoUser' idPadre=" + "'" + array.id_padre + "'" + " idMenu=" + "'" + array.idmenu + "'" + " id=" + "'" + array.idmenu + "u' checked" + ">";

            if (array.id_padre === 0) {
                var checkBoxCrear = null;
                var checkBoxEditar = null;
                var checkBoxEliminar = null;
            } else {
                if (array.crear === 1) {
                    var checkBoxCrear = "<input type='checkbox' class='checkCrearxUser' idMenu=" + "'" + array.idmenu + "'" + " id=" + "'" + array.idmenu + "uc' checked" + ">";
                } else {
                    var checkBoxCrear = "<input type='checkbox' class='checkCrearxUser' idMenu=" + "'" + array.idmenu + "'" + " id=" + "'" + array.idmenu + "uc' " + ">";
                }

                if (array.editar === 1) {
                    var checkBoxEditar = "<input type='checkbox' class='checkEditarxUser' idMenu=" + "'" + array.idmenu + "'" + " id=" + "'" + array.idmenu + "ue' checked" + ">";
                } else {
                    var checkBoxEditar = "<input type='checkbox' class='checkEditarxUser' idMenu=" + "'" + array.idmenu + "'" + " id=" + "'" + array.idmenu + "ue' " + ">";
                }

                if (array.eliminar === 1) {
                    var checkBoxEliminar = "<input type='checkbox' class='checkEliminarxUser' idMenu=" + "'" + array.idmenu + "'" + " id=" + "'" + array.idmenu + "uel' checked" + ">";
                } else {
                    var checkBoxEliminar = "<input type='checkbox' class='checkEliminarxUser' idMenu=" + "'" + array.idmenu + "'" + " id=" + "'" + array.idmenu + "uel' " + ">";
                }

            }


        } else {

            var checkBoxAcceso = "<input type='checkbox' class='checkAccesoUser' idPadre=" + "'" + array.id_padre + "'" + " idMenu=" + "'" + array.idmenu + "'" + " id=" + "'" + array.idmenu + "u' " + ">";

            if (array.id_padre === 0) {
                var checkBoxCrear = null;
                var checkBoxEditar = null;
                var checkBoxEliminar = null;
            } else {
                var checkBoxCrear = "<input type='checkbox' class='checkCrearxUser' idMenu=" + "'" + array.idmenu + "'" + " id=" + "'" + array.idmenu + "uc' " + " disabled>";
                var checkBoxEditar = "<input type='checkbox' class='checkEditarxUser' idMenu=" + "'" + array.idmenu + "'" + " id=" + "'" + array.idmenu + "ue' " + " disabled>";
                var checkBoxEliminar = "<input type='checkbox' class='checkEliminarxUser' idMenu=" + "'" + array.idmenu + "'" + " id=" + "'" + array.idmenu + "uel' " + " disabled>";
            }

        }

        const obj = [
            array.new_orden,
            array.idmenu,
            array.menu,
            checkBoxAcceso,
            checkBoxCrear,
            checkBoxEditar,
            checkBoxEliminar,
            array.id_padre
        ];

        dataset.push(obj);
    }

    res.send(dataset)

}


exports.activarPermxUser = async (req, res) => {

    var { idmenu, idusuario, acceso, permiso } = req.body;

    if (permiso === 'accesar') {

        var crear = 0;
        var editar = 0;
        var eliminar = 0;

        const newPermiso = {
            idmenu,
            idusuario,
            acceso,
            crear,
            editar,
            eliminar
        };

        var countExist = await pool.query('SELECT COUNT(1) AS cuenta FROM permisos_xusuario WHERE idmenu=? and idusuario=?', [idmenu, idusuario]);

        var exist = countExist[0].cuenta;

        if (exist === 0) {

            await pool.query('INSERT INTO permisos_xusuario SET ?', [newPermiso]);

            res.send('Insertado');

        } else {

            if (newPermiso.acceso === 0) {
                await pool.query('UPDATE permisos_xusuario SET acceso = ?, crear = ?, editar = ?, eliminar = ? WHERE idmenu = ? AND idusuario=?', [newPermiso.acceso, newPermiso.crear, newPermiso.editar, newPermiso.eliminar, newPermiso.idmenu, newPermiso.idusuario]);
            } else {
                await pool.query('UPDATE permisos_xusuario SET acceso = ? WHERE idmenu = ? AND idusuario=?', [newPermiso.acceso, newPermiso.idmenu, newPermiso.idusuario]);
            }

            res.send('Actualizado');

        }

    }

    if (permiso === 'crear') {

        var countExist = await pool.query('SELECT COUNT(1) AS cuenta FROM permisos_xusuario WHERE idmenu=? and idusuario=?', [idmenu, idusuario]);

        var exist = countExist[0].cuenta;

        if (exist === 1) {

            await pool.query('UPDATE permisos_xusuario SET crear = ? WHERE idmenu = ? AND idusuario=?', [acceso, idmenu, idusuario]);

            res.send('Actualizado');

        } else {
            res.send('Error');
        }

    }

    if (permiso === 'editar') {

        var countExist = await pool.query('SELECT COUNT(1) AS cuenta FROM permisos_xusuario WHERE idmenu=? and idusuario=?', [idmenu, idusuario]);

        var exist = countExist[0].cuenta;

        if (exist === 1) {

            await pool.query('UPDATE permisos_xusuario SET editar = ? WHERE idmenu = ? AND idusuario=?', [acceso, idmenu, idusuario]);

            res.send('Actualizado');

        } else {
            res.send('Error');
        }

    }

    if (permiso === 'eliminar') {

        var countExist = await pool.query('SELECT COUNT(1) AS cuenta FROM permisos_xusuario WHERE idmenu=? and idusuario=?', [idmenu, idusuario]);

        var exist = countExist[0].cuenta;

        if (exist === 1) {

            await pool.query('UPDATE permisos_xusuario SET eliminar = ? WHERE idmenu = ? AND idusuario=?', [acceso, idmenu, idusuario]);

            res.send('Actualizado');

        } else {
            res.send('Error');
        }

    }

}

async function validAccess(idUsuario, url) {

    var permiso = 0;

    var idPerfilQry = await pool.query('SELECT idperfil FROM usuarios WHERE idusuario=?', idUsuario);
    var idMenuQry = await pool.query('SELECT idmenu FROM menu WHERE url=?', url);

    var idPerfil = idPerfilQry[0].idperfil;
    var idMenu = idMenuQry[0].idmenu;

    var validPermU = await pool.query('SELECT COUNT(1) as cuenta FROM permisos_xusuario WHERE idmenu=? AND idusuario=? AND acceso=1', [idMenu, idUsuario]);
    var validPermP = await pool.query('SELECT COUNT(1) as cuenta FROM permisos_xperfil WHERE idmenu=? AND idperfil=? AND acceso=1', [idMenu, idPerfil]);

    var permiso = permiso + validPermU[0].cuenta + validPermP[0].cuenta;

    return permiso

}