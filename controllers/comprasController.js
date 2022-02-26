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

exports.adminCompras = async (req, res) => {

    var idUsuario = res.locals.usuario.idusuario;
    var url = req.originalUrl;

    var permiso = await validAccess(idUsuario, url);

    if(permiso>0){

        res.render('modulos/compras/admin_compras', {
            nombrePagina: 'Administrar Compras'
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

exports.consultarCompras = async (req, res) => {

    var { fecInicial, fecFinal, statusCmpas } = req.body;

    var inicial = moment(fecInicial, 'YYYY/MM/DD').format('YYYY-MM-DD');
    var final = moment(fecFinal, 'YYYY/MM/DD').format('YYYY-MM-DD');

    if (statusCmpas === null) {
        statusCmpas = 0;
    }

    const values = await pool.query('call get_comprasxfecha(?,?,?)', [inicial, final, statusCmpas]);

    const results = values[0];
    const totalitems = results.length;

    
    if (totalitems === 0) {
        res.send('empty');
    } else {

        const dataset = [];

        for (var x = 0; x < results.length; x++) {

            const array = results[x];

            botonDet = "<div class='btn-group'><button type='button' id='btn-detalle-cmpa' class='btn btn-info' data-toggle='modal' data-target='#modalDetCmpa' idCompra=" + "'" + array.idcompra + "' idComprobante=" + "'" + array.num_comprobante + "'" + "><i class='fas fa-eye'></i></button></div>";

            if(array.estatus === 'Vigente'){
                botones = "<div class='btn-group'><button type='button' id='btn-imprimir-cmpa' class='btn btn-success' idCompra=" + "'" + array.idcompra + "'" + "><i class='fas fa-print'></i></button><button id='btn-anular-compra' class='btn btn-danger' idCompra=" + "'" + array.idcompra + "' idComprobante=" + "'" + array.num_comprobante + "'" + "><i class='fa fa-times'></i></button></div>";
            }else{
                botones = "<div class='btn-group'><button type='button' id='btn-imprimir-cmpa' class='btn btn-success' idCompra=" + "'" + array.idcompra + "'" + "><i class='fas fa-print'></i></button></div>";
            }

            const obj = [
                array.idcompra,
                array.num_comprobante,
                array.proveedor,
                array.usuario,
                array.f_pago,
                array.subtotal,
                array.total,
                array.estatus,
                moment(array.fecha).format('YYYY-MM-DD h:mm:ss a'),
                botonDet,
                botones
            ];

            dataset.push(obj);

        }
        res.send(dataset);
    }

}

exports.detCompras = async (req, res) => {

    var { idCompra, idComprobante } = req.body;

    const results = await pool.query('call get_detallecompra(?,?)', [idCompra, idComprobante]);

    const dataCompra = results[0];

    const dataset = [];

    for (var x = 0; x < dataCompra.length; x++) {

        const array = dataCompra[x];

        const obj = [
            array.det_num,
            array.idproducto,
            array.producto,
            array.cantidad,
            array.precio,
            array.total
        ];

        dataset.push(obj);

    }

    res.status(200).send(dataset);

}

exports.anularCompra = async (req, res) => {

    var { idCompra, idComprobante, idMotivo } = req.body;

    var idUsuario = res.locals.usuario.idusuario;

    var q = await pool.query('call sp_anula_compra(?,?,?,?)',[idCompra, idComprobante, idMotivo, idUsuario]);
    
    var rowsAff = q.affectedRows;

    if(rowsAff>0){
        res.send('Ok');
    }
    res.send('Ok')

}

exports.exportCompras = async (req, res) => {

    eval(req.body.content);

    var user = res.locals.usuario.usuario;
    userName = user.toUpperCase();

    var { fecInicial, fecFinal, statusComp } = req.body;

    var inicial = moment(fecInicial, 'YYYY/MM/DD').format('YYYY-MM-DD');
    var final = moment(fecFinal, 'YYYY/MM/DD').format('YYYY-MM-DD');

    if (statusComp === null) {
        statusComp = 0;
    }

    const values = await pool.query('call get_comprasxfecha(?,?,?)', [inicial, final, statusComp]);

    const results = values[0];
    const totalitems = results.length;

    if (totalitems === 0) {

        res.send('empty')

    } else {

        const dataCompras = [];

        for (var x = 0; x < results.length; x++) {

            const arrayCompras = results[x];
            
            var fechaCompra = moment(arrayCompras.fecha).format('DD/MM/YYYY hh:mm a');

            const obj = {
                idcompra: arrayCompras.idcompra,
                num_comprobante: arrayCompras.num_comprobante,
                proveedor: arrayCompras.proveedor,
                usuario: arrayCompras.usuario,
                forma_pago: arrayCompras.f_pago,
                subtotal: arrayCompras.subtotal,
                total: arrayCompras.total,
                status: arrayCompras.estatus,
                fecha_compra: fechaCompra
            };

            dataCompras.push(obj);
        }

        var workbook = new Excel.Workbook();

        workbook.views = [
            {
                x: 0, y: 0, width: 10000, height: 20000,
                firstSheet: 0, activeTab: 1, visibility: 'visible'
            }
        ];
        var worksheet = workbook.addWorksheet('Ventas');

        worksheet.columns = [
            { header: 'ID Compra', width: 10 },
            { header: 'ID Comprobante', width: 18 },
            { header: 'Proveedor', width: 40 },
            { header: 'Usuario', width: 25 },
            { header: 'Forma de Pago', width: 32 },
            { header: 'Subtotal', width: 25 },
            { header: 'Total', width: 25 },
            { header: 'Estatus', width: 15 },
            { header: 'Fecha Venta', width: 25 }
        ];

        // set cell alignment to top-left, middle-center, bottom-right
        worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getCell('B1').alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getCell('C1').alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getCell('D1').alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getCell('E1').alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getCell('F1').alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getCell('G1').alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getCell('H1').alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getCell('I1').alignment = { vertical: 'middle', horizontal: 'center' };
        // for the wannabe graphic designers out there
        worksheet.getCell('A1').font = { bold: true };
        worksheet.getCell('B1').font = { bold: true };
        worksheet.getCell('C1').font = { bold: true };
        worksheet.getCell('D1').font = { bold: true };
        worksheet.getCell('E1').font = { bold: true };
        worksheet.getCell('F1').font = { bold: true };
        worksheet.getCell('G1').font = { bold: true };
        worksheet.getCell('H1').font = { bold: true };
        worksheet.getCell('I1').font = { bold: true };

        // set single thin border around
        worksheet.getCell('A1').border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };

        worksheet.getCell('B1').border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };

        worksheet.getCell('C1').border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };

        worksheet.getCell('D1').border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };

        worksheet.getCell('E1').border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };

        worksheet.getCell('F1').border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };

        worksheet.getCell('G1').border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };

        worksheet.getCell('H1').border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };

        worksheet.getCell('I1').border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };

        var i;

        for (i = 0; i < dataCompras.length; i++) {

            const row = worksheet.getRow(2 + i);
            const ventas = dataCompras[i];

            row.getCell(1).value = ventas.idcompra;
            row.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
            row.getCell(1).border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            row.getCell(2).value = ventas.num_comprobante;
            row.getCell(2).alignment = { vertical: 'middle', horizontal: 'center' };
            row.getCell(2).border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            row.getCell(3).value = ventas.proveedor;
            row.getCell(3).alignment = { vertical: 'middle', horizontal: 'center' };
            row.getCell(3).border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            row.getCell(4).value = ventas.usuario;
            row.getCell(4).alignment = { vertical: 'middle', horizontal: 'center' };
            row.getCell(4).border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            row.getCell(5).value = ventas.forma_pago;
            row.getCell(5).alignment = { vertical: 'middle', horizontal: 'center' };
            row.getCell(5).border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            row.getCell(6).value = ventas.subtotal;
            row.getCell(6).alignment = { vertical: 'middle', horizontal: 'center' };
            row.getCell(6).border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            row.getCell(7).value = ventas.total;
            row.getCell(7).alignment = { vertical: 'middle', horizontal: 'center' };
            row.getCell(7).border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            row.getCell(8).value = ventas.status;
            row.getCell(8).alignment = { vertical: 'middle', horizontal: 'center' };
            row.getCell(8).border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            row.getCell(9).value = ventas.fecha_compra;
            row.getCell(9).alignment = { vertical: 'middle', horizontal: 'center' };
            row.getCell(9).border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            row.commit();

        }

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader("Content-Disposition", "attachment; filename=" + "Reporte_Ventas.xlsx");
        workbook.xlsx.write(res)
            .then(function (data) {
                res.end();
                console.log('File write done........');
            });
        
    }

}

exports.imprimirCompras = async (req, res) => {

    eval(req.body.content);

    var user = res.locals.usuario.usuario;
    userName = user.toUpperCase();

    var { fecInicial, fecFinal, statusComp } = req.body;

    var inicial = moment(fecInicial, 'YYYY/MM/DD').format('YYYY-MM-DD');
    var final = moment(fecFinal, 'YYYY/MM/DD').format('YYYY-MM-DD');

    if (statusComp === null) {
        statusComp = 0;
    }
    const values = await pool.query('call get_comprasxfecha(?,?,?)', [inicial, final, statusComp]);

    const results = values[0];
    const totalitems = results.length;

    if (totalitems === 0) {

        res.send('empty')

    } else {

        const dataCompras = [];

        for (var x = 0; x < results.length; x++) {

            const arrayCompras = results[x];
            
            var fechaCompra = moment(arrayCompras.fecha).format('DD/MM/YYYY hh:mm a');

            const obj = {
                idcompra: arrayCompras.idcompra,
                num_comprobante: arrayCompras.num_comprobante,
                proveedor: arrayCompras.proveedor,
                usuario: arrayCompras.usuario,
                forma_pago: arrayCompras.f_pago,
                subtotal: currencyFormat(arrayCompras.subtotal),
                total: currencyFormat(arrayCompras.total),
                status: arrayCompras.estatus,
                fecha_compra: fechaCompra
            };

            dataCompras.push(obj);
        }

        var fecha_actual = moment().format('DD/MM/YYYY');
        var fecini = moment(inicial).format('DD/MM/YYYY');
        var fecfin = moment(final).format('DD/MM/YYYY');
        

        var docDefinition = {
            info: {
                title: 'Compras'
            },
            pageSize: 'LETTER',
            pageOrientation: 'landscape',
            pageMargins: [40, 40, 40, 40],
            content: [
                { text: 'REPORTE DE COMPRAS', style: 'header' },
                { text: '('+fecini+' - '+fecfin+')', alignment: 'center', fontSize: 10 },
                {
                    columns: [
                        {
                            text: `Impreso por: ${userName}`, style: 'small'
                        },
                        {
                            text: `Fecha: ${fecha_actual}`, alignment: 'right', style: 'small'
                        }
                    ]
                },
                { text: ' ' },
                table(
                    // External data
                    dataCompras,
                    // Columns display order
                    ['idcompra', 'num_comprobante', 'proveedor', 'usuario', 'forma_pago', 'subtotal', 'total', 'status','fecha_compra'],
                    // Custom columns widths
                    // ['6%', '12%', '15%','15%','12%', '12%', '12%','12%','12%'],
                    // Show headers?
                    true,
                    // Custom headers
                    [{ text: 'ID Compra', fillColor: '#CCCCCC', color: 'black', alignment: 'center', alignmentChild: 'center', style: 'tableHeader' },
                    { text: 'ID Comprobante', fillColor: '#CCCCCC', color: 'black', alignment: 'center', alignmentChild: 'center', style: 'tableHeader' },
                    { text: 'Proveedor', fillColor: '#CCCCCC', color: 'black', alignment: 'center', alignmentChild: 'center', style: 'tableHeader' },
                    { text: 'Usuario', fillColor: '#CCCCCC', color: 'black', alignment: 'center', alignmentChild: 'center', style: 'tableHeader' },
                    { text: 'Forma de Pago', fillColor: '#CCCCCC', color: 'black', alignment: 'center', alignmentChild: 'center', style: 'tableHeader' },
                    { text: 'Subtotal', fillColor: '#CCCCCC', color: 'black', alignment: 'center', alignmentChild: 'center', style: 'tableHeader' },
                    { text: 'Total', fillColor: '#CCCCCC', color: 'black', alignment: 'center', alignmentChild: 'center', style: 'tableHeader' },
                    { text: 'Estatus', fillColor: '#CCCCCC', color: 'black', alignment: 'center', alignmentChild: 'center', style: 'tableHeader' },
                    { text: 'Fecha Venta', fillColor: '#CCCCCC', color: 'black', alignment: 'center', alignmentChild: 'center', style: 'tableHeader' }
                    ],
                    // Custom layout, use '' for no layout
                    '')
            ],
            styles: {
                header: {
                    fontSize: 16,
                    bold: true,
                    alignment: 'center'
                },
                subheader: {
                    fontSize: 12,
                    bold: true
                },
                quote: {
                    italics: true
                },
                small: {
                    fontSize: 8
                },
                superMargin: {
                    margin: [20, 0, 40, 0],
                    fontSize: 15
                },
                tableHeader: {
                    bold: true
                }
            },
            footer: function (currentPage, pageCount) {
                return [{ text: 'Pagina ' + currentPage.toString() + ' de ' + pageCount, alignment: 'center' }];
            }
        }

        createPdfBinary(docDefinition, function (binary) {
            res.contentType('application/pdf');
            res.send(binary);
        }, function (error) {
            res.send('ERROR:' + error);
        });
    }

}

function createPdfBinary(pdfDoc, callback) {

    var printer = new pdfMakePrinter(Roboto);

    var doc = printer.createPdfKitDocument(pdfDoc);
    //doc.pipe(fs.createWriteStream('pdfs/basics.pdf'));

    var chunks = [];
    var result;

    doc.on('data', function (chunk) {
        chunks.push(chunk);
    });
    doc.on('end', function () {
        result = Buffer.concat(chunks);
        callback('data:application/pdf;base64,' + result.toString('base64'));
    });
    doc.end();

}

// Table body builder
function buildTableBody(data, columns, showHeaders, headers) {
    var body = [];
    // Inserting headers
    if (showHeaders) {
        body.push(headers);
    }

    // Inserting items from external data array
    data.forEach(function (row) {
        var dataRow = [];
        var i = 0;

        columns.forEach(function (column) {
            dataRow.push({ text: Object.byString(row, column), alignment: headers[i].alignmentChild });
            i++;
        })
        body.push(dataRow);

    });

    return body;
}

// Func to return generated table
function table(data, columns,/* witdhsDef, */showHeaders, headers, layoutDef) {
    return {
        table: {
            headerRows: 1,
            //width:['auto','*','*'],
            fontSize: 8,
            body: buildTableBody(data, columns, showHeaders, headers)
        },
        layout: layoutDef
    };
}

Object.byString = function (o, s) {
    s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    s = s.replace(/^\./, '');           // strip a leading dot
    var a = s.split('.');
    for (var i = 0, n = a.length; i < n; ++i) {
        var k = a[i];
        if (k in o) {
            o = o[k];
        } else {
            return;
        }
    }
    return o;
}

function currencyFormat(value) {
	return '$' + value.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
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