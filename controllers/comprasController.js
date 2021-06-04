const pool = require('../config/db');
const moment = require('moment');
const fs = require('fs');
const pdfMakePrinter = require('pdfmake/src/printer');
const Excel = require('exceljs');
const path = require('path');
const walk = require('walk');

var Roboto = require('../public/fonts/Roboto');


exports.regCompra = async (req, res) => {

    var idUsuario = res.locals.usuario.idusuario;
    var url = req.originalUrl;

    var permiso = await validAccess(idUsuario, url);

    if(permiso>0){

        res.render('modulos/compras/registrar_compra', {
            nombrePagina: 'Registrar Compra'
        });

    }else{

        res.render('modulos/error/401', {
            nombrePagina: '401 Unauthorized'
        });

    }

}

exports.crearCompra = async (req, res) => {

    var { idproveedor, num_comprobante, subtotal, impuesto, redondeo, total, forma_pago, num_transaccion, status, fecha } = req.body;

    var objProd = req.body.listaProductos;
    var idusuario = res.locals.usuario.idusuario;
    var tipoMov = 6;
    var idMotivo = 0;

    const valFolio = await pool.query('SELECT IFNULL(MAX(idcompra),100)+1 AS numCompra FROM compras');

    for (var x = 0; x < valFolio.length; x++) {
        var idcompra = valFolio[x].numCompra;
    }

    const newCompra = {
        idcompra,
        num_comprobante,
        idproveedor,
        idusuario,
        subtotal,
        impuesto,
        redondeo,
        total,
        forma_pago,
        num_transaccion,
        status,
        fecha
    };

    await pool.query('INSERT INTO compras SET ?', [newCompra]);

    for (var x = 0; x < objProd.length; x++) {

        var det_num = x + 1;

        var idproducto = objProd[x].idproducto;
        var descripcion = objProd[x].descripcion;
        var cantidad = objProd[x].cantidad;
        var stock = objProd[x].stock;
        var precio = objProd[x].precio;
        var total = objProd[x].total;

        const newDetCompra = {
            idcompra,
            idproducto,
            det_num,
            cantidad,
            precio,
            total
        };

        await pool.query('INSERT INTO det_compras SET ?', [newDetCompra]);
        
        await pool.query('call sp_ajuste_inv(?,?,?,?,?)',[newDetCompra.idproducto,idMotivo,cantidad,tipoMov,idusuario]);

    }

    res.send('OK');

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