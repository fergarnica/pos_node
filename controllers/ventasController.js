const pool = require('../config/db');
const moment = require('moment');
const fs = require('fs');
const pdfMakePrinter = require('pdfmake/src/printer');
const Excel = require('exceljs');
const path = require('path');
const walk = require('walk');

var Roboto = require('../public/fonts/Roboto');

exports.puntoVenta = async (req, res) => {

    var idUsuario = res.locals.usuario.idusuario;
    var url = req.originalUrl;

    var permiso = await validAccess(idUsuario, url);

    var existCaja = await pool.query('SELECT count(idcaja) AS exist FROM cajas WHERE idusuario=?', idUsuario);
    var user = await pool.query('SELECT a.nombre FROM empleados a INNER JOIN usuarios b on a.idempleado=b.idempleado WHERE b.idusuario= ?', idUsuario);

    var cuentaCaja = existCaja[0].exist;
    var nombre = user[0].nombre;

    if (permiso > 0) {

        if (cuentaCaja === 1) {

            var cajaActiva = await pool.query('SELECT idcaja, idcorte FROM cajas WHERE idusuario=?', idUsuario);
            var idCaja = cajaActiva[0].idcaja;
            var idCorte = cajaActiva[0].idcorte;

            var infoPagos = await pool.query('SELECT monto_inicial, IFNULL(ventas_efectivo,0) AS ventas_efectivo, ventas_tarjeta, IFNULL(ingreso_efectivo,0) AS ingreso_efectivo, IFNULL(retiro_efectivo,0) AS retiro_efectivo FROM cortes_cajas WHERE idcaja=? AND idcorte=? AND idusuario=? AND status=1', [idCaja, idCorte, idUsuario]);

            var montoIni = infoPagos[0].monto_inicial;
            var ventasEfec = infoPagos[0].ventas_efectivo;
            var ingresoEfec = infoPagos[0].ingreso_efectivo;
            var retiroEfec = infoPagos[0].retiro_efectivo;

            var montoEfec = montoIni + ventasEfec + ingresoEfec - retiroEfec;

            res.render('modulos/ventas/punto_venta', {
                nombrePagina: 'Punto de Venta',
                idCaja,
                idCorte,
                nombre,
                montoEfec
            });

        } else {

            res.render('modulos/ventas/seleccionar_caja', {
                nombrePagina: 'Punto de Venta'
            });

        }

    } else {

        res.render('modulos/error/401', {
            nombrePagina: '401 Unauthorized'
        });

    }

}

exports.adminVentas = async (req, res) => {

    var idUsuario = res.locals.usuario.idusuario;
    var url = req.originalUrl;

    var permiso = await validAccess(idUsuario, url);

    if (permiso > 0) {

        res.render('modulos/ventas/admin_ventas', {
            nombrePagina: 'Administrar Ventas'
        });

    } else {

        res.render('modulos/error/401', {
            nombrePagina: '401 Unauthorized'
        });

    }

}

exports.adminCajas = async (req, res) => {

    var idUsuario = res.locals.usuario.idusuario;
    var url = req.originalUrl;

    var permiso = await validAccess(idUsuario, url);

    if (permiso > 0) {

        res.render('modulos/ventas/admin_cajas', {
            nombrePagina: 'Administrar Cajas'
        });

    } else {

        res.render('modulos/error/401', {
            nombrePagina: '401 Unauthorized'
        });

    }

}

exports.crearVenta = async (req, res) => {

    var { idcliente, subtotal, impuesto, redondeo, total, monto, cambio, forma_pago, num_transaccion, status, fecha } = req.body;

    var objProd = req.body.listaProductos;
    var idusuario = res.locals.usuario.idusuario;
    var tipoMov = 2;
    var idMotivo = 0;

    var caja = await pool.query('SELECT idcaja FROM cajas WHERE idusuario=?', idusuario);

    for (var i = 0; i < caja.length; i++) {
        var idcaja = caja[i].idcaja;
    }

    var folioCorte = await pool.query('SELECT idcorte FROM cajas WHERE idusuario= ? AND idcaja=?', [idusuario, idcaja]);

    var valFolio = await pool.query('SELECT IFNULL(MAX(idnota),100)+1 AS numVenta FROM ventas WHERE idcaja=?', idcaja);

    for (var x = 0; x < valFolio.length; x++) {
        var idnota = valFolio[x].numVenta;
    }

    for (var x = 0; x < folioCorte.length; x++) {
        var idcorte = folioCorte[x].idcorte;
    }

    const newVenta = {
        idnota,
        idcaja,
        idcorte,
        idcliente,
        idusuario,
        subtotal,
        impuesto,
        redondeo,
        total,
        monto,
        cambio,
        forma_pago,
        num_transaccion,
        status,
        fecha
    };

    await pool.query('INSERT INTO ventas SET ?', [newVenta]);

    await pool.query('call sp_reg_vta_cortecaja(?,?,?,?,?)', [idcaja, idcorte, forma_pago, total, idusuario]);

    for (var x = 0; x < objProd.length; x++) {

        var det_num = x + 1;

        var idproducto = objProd[x].idproducto;
        var descripcion = objProd[x].descripcion;
        var cantidad = objProd[x].cantidad;
        var stock = objProd[x].stock;
        var precio = objProd[x].precio;
        var total = objProd[x].total;

        const newDetVenta = {
            idnota,
            idcaja,
            idproducto,
            det_num,
            cantidad,
            precio,
            total
        };

        await pool.query('INSERT INTO det_vtas SET ?', [newDetVenta]);

        await pool.query('call sp_ajuste_inv(?,?,?,?,?)', [newDetVenta.idproducto, idMotivo, cantidad, tipoMov, idusuario]);


    }

    res.send('OK');

}

exports.consultarVentas = async (req, res) => {

    var { fecInicial, fecFinal, statusVtas } = req.body;

    var inicial = moment(fecInicial, 'YYYY/MM/DD').format('YYYY-MM-DD');
    var final = moment(fecFinal, 'YYYY/MM/DD').format('YYYY-MM-DD');

    if (statusVtas === null) {
        statusVtas = 0;
    }

    const values = await pool.query('call get_ventasxfecha(?,?,?)', [inicial, final, statusVtas]);

    const results = values[0];
    const totalitems = results.length;

    if (totalitems === 0) {
        res.send('empty');
    } else {

        const dataset = [];

        for (var x = 0; x < results.length; x++) {

            const array = results[x];

            botonDet = "<div class='btn-group'><button type='button' id='btn-detalle-vta' class='btn btn-info' data-toggle='modal' data-target='#modalDetVta' idNota=" + "'" + array.idnota + "' idCaja=" + "'" + array.idcaja + "'" + "><i class='fas fa-eye'></i></button></div>";

            if (array.estatus === 'Vigente') {
                botones = "<div class='btn-group'><button type='button' id='btn-imprimir-vta' class='btn btn-success' idNota=" + "'" + array.idnota + "'" + "><i class='fas fa-print'></i></button><button id='btn-anular-venta' class='btn btn-danger' idNota=" + "'" + array.idnota + "' idCaja=" + "'" + array.idcaja + "'" + "><i class='fa fa-times'></i></button></div>";
            } else {
                botones = "<div class='btn-group'><button type='button' id='btn-imprimir-vta' class='btn btn-success' idNota=" + "'" + array.idnota + "'" + "><i class='fas fa-print'></i></button></div>";
            }

            const obj = [
                array.idnota,
                array.idcaja,
                array.idcorte,
                array.cliente,
                array.usuario,
                array.f_pago,
                array.subtotal,
                array.impuesto,
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

exports.detVentas = async (req, res) => {

    var { idNota, idCaja } = req.body;

    const results = await pool.query('call get_detalleventa(?,?)', [idNota, idCaja]);

    const dataVenta = results[0];

    const dataset = [];

    for (var x = 0; x < dataVenta.length; x++) {

        const array = dataVenta[x];

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

exports.anularVenta = async (req, res) => {

    var { idNota, idCaja, idMotivo } = req.body;

    var idUsuario = res.locals.usuario.idusuario;

    var q = await pool.query('call sp_anula_venta(?,?,?,?)', [idNota, idCaja, idMotivo, idUsuario]);

    var rowsAff = q.affectedRows;

    if (rowsAff > 0) {
        res.send('Ok');
    }

}

exports.exportVentas = async (req, res) => {

    eval(req.body.content);

    var user = res.locals.usuario.usuario;
    userName = user.toUpperCase();

    var { fecInicial, fecFinal, statusVtas } = req.body;

    var inicial = moment(fecInicial, 'YYYY/MM/DD').format('YYYY-MM-DD');
    var final = moment(fecFinal, 'YYYY/MM/DD').format('YYYY-MM-DD');

    if (statusVtas === null) {
        statusVtas = 0;
    }

    const values = await pool.query('call get_ventasxfecha(?,?,?)', [inicial, final, statusVtas]);

    const results = values[0];
    const totalitems = results.length;

    if (totalitems === 0) {

        res.send('empty')

    } else {

        const dataVendedores = [];

        for (var x = 0; x < results.length; x++) {

            const arrayVentas = results[x];

            var fechaVenta = moment(arrayVentas.fecha).format('DD/MM/YYYY hh:mm a');

            const obj = {
                idnota: arrayVentas.idnota,
                idcaja: arrayVentas.idcaja,
                idcorte: arrayVentas.idcorte,
                cliente: arrayVentas.cliente,
                usuario: arrayVentas.usuario,
                forma_pago: arrayVentas.f_pago,
                subtotal: arrayVentas.subtotal,
                impuesto: arrayVentas.impuesto,
                total: arrayVentas.total,
                status: arrayVentas.estatus,
                fecha_venta: fechaVenta
            };

            dataVendedores.push(obj);
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
            { header: 'ID Venta', width: 10 },
            { header: 'ID Caja', width: 10 },
            { header: 'Num Corte', width: 12 },
            { header: 'Cliente', width: 40 },
            { header: 'Usuario', width: 25 },
            { header: 'Forma de Pago', width: 32 },
            { header: 'Subtotal', width: 25 },
            { header: 'Comisión', width: 25 },
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
        worksheet.getCell('J1').alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getCell('K1').alignment = { vertical: 'middle', horizontal: 'center' };

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
        worksheet.getCell('J1').font = { bold: true };
        worksheet.getCell('K1').font = { bold: true };

        //currency format
        worksheet.getColumn(7).numFmt = '$#,##0.00;[Red]-$#,##0.00';
        worksheet.getColumn(8).numFmt = '$#,##0.00;[Red]-$#,##0.00';
        worksheet.getColumn(9).numFmt = '$#,##0.00;[Red]-$#,##0.00';

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

        worksheet.getCell('J1').border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };

        worksheet.getCell('K1').border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };

        var i;

        for (i = 0; i < dataVendedores.length; i++) {

            const row = worksheet.getRow(2 + i);
            const ventas = dataVendedores[i];

            row.getCell(1).value = ventas.idnota;
            row.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
            row.getCell(1).border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            row.getCell(2).value = ventas.idcaja;
            row.getCell(2).alignment = { vertical: 'middle', horizontal: 'center' };
            row.getCell(2).border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            row.getCell(3).value = ventas.idcorte;
            row.getCell(3).alignment = { vertical: 'middle', horizontal: 'center' };
            row.getCell(3).border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            row.getCell(4).value = ventas.cliente;
            row.getCell(4).alignment = { vertical: 'middle', horizontal: 'center' };
            row.getCell(4).border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            row.getCell(5).value = ventas.usuario;
            row.getCell(5).alignment = { vertical: 'middle', horizontal: 'center' };
            row.getCell(5).border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            row.getCell(6).value = ventas.forma_pago;
            row.getCell(6).alignment = { vertical: 'middle', horizontal: 'center' };
            row.getCell(6).border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            row.getCell(7).value = ventas.subtotal;
            row.getCell(7).alignment = { vertical: 'middle', horizontal: 'center' };
            row.getCell(7).border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            row.getCell(8).value = ventas.impuesto;
            row.getCell(8).alignment = { vertical: 'middle', horizontal: 'center' };
            row.getCell(8).border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            row.getCell(9).value = ventas.total;
            row.getCell(9).alignment = { vertical: 'middle', horizontal: 'center' };
            row.getCell(9).border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            row.getCell(10).value = ventas.status;
            row.getCell(10).alignment = { vertical: 'middle', horizontal: 'center' };
            row.getCell(10).border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            row.getCell(11).value = ventas.fecha_venta;
            row.getCell(11).alignment = { vertical: 'middle', horizontal: 'center' };
            row.getCell(11).border = {
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
                //console.log('File write done........');
            });

    }

}

exports.imprimirVentas = async (req, res) => {

    eval(req.body.content);

    var user = res.locals.usuario.usuario;
    userName = user.toUpperCase();

    var { fecInicial, fecFinal, statusVtas } = req.body;

    var inicial = moment(fecInicial, 'YYYY/MM/DD').format('YYYY-MM-DD');
    var final = moment(fecFinal, 'YYYY/MM/DD').format('YYYY-MM-DD');

    if (statusVtas === null) {
        statusVtas = 0;
    }

    const values = await pool.query('call get_ventasxfecha(?,?,?)', [inicial, final, statusVtas]);

    const results = values[0];
    const totalitems = results.length;

    if (totalitems === 0) {

        res.send('empty')

    } else {

        const dataVendedores = [];

        for (var x = 0; x < results.length; x++) {

            const arrayVentas = results[x];

            var fechaVenta = moment(arrayVentas.fecha).format('DD/MM/YYYY hh:mm a');

            const obj = {
                idnota: arrayVentas.idnota,
                idcaja: arrayVentas.idcaja,
                idcorte: arrayVentas.idcorte,
                cliente: arrayVentas.cliente,
                usuario: arrayVentas.usuario,
                forma_pago: arrayVentas.f_pago,
                subtotal: currencyFormat(arrayVentas.subtotal),
                impuesto: currencyFormat(arrayVentas.impuesto),
                total: currencyFormat(arrayVentas.total),
                status: arrayVentas.estatus,
                fecha_venta: fechaVenta
            };

            dataVendedores.push(obj);
        }

        var fecha_actual = moment().format('DD/MM/YYYY');
        var fecini = moment(inicial).format('DD/MM/YYYY');
        var fecfin = moment(final).format('DD/MM/YYYY');


        var docDefinition = {
            info: {
                title: 'Ventas'
            },
            pageSize: 'LETTER',
            pageOrientation: 'landscape',
            pageMargins: [40, 40, 40, 40],
            content: [
                { text: 'REPORTE DE VENTAS', style: 'header' },
                { text: '(' + fecini + ' - ' + fecfin + ')', alignment: 'center', fontSize: 10 },
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
                    dataVendedores,
                    // Columns display order
                    ['idnota', 'idcaja', 'idcorte', 'cliente', 'usuario', 'forma_pago', 'subtotal', 'impuesto', 'total', 'status', 'fecha_venta'],
                    // Custom columns widths
                    // ['6%', '12%', '15%','15%','12%', '12%', '12%','12%','12%'],
                    // Show headers?
                    true,
                    // Custom headers
                    [{ text: 'ID Venta', fillColor: '#CCCCCC', color: 'black', alignment: 'center', alignmentChild: 'center', style: 'tableHeader' },
                    { text: 'ID Caja', fillColor: '#CCCCCC', color: 'black', alignment: 'center', alignmentChild: 'center', style: 'tableHeader' },
                    { text: 'Num Corte', fillColor: '#CCCCCC', color: 'black', alignment: 'center', alignmentChild: 'center', style: 'tableHeader' },
                    { text: 'Cliente', fillColor: '#CCCCCC', color: 'black', alignment: 'center', alignmentChild: 'center', style: 'tableHeader' },
                    { text: 'Usuario', fillColor: '#CCCCCC', color: 'black', alignment: 'center', alignmentChild: 'center', style: 'tableHeader' },
                    { text: 'Forma de Pago', fillColor: '#CCCCCC', color: 'black', alignment: 'center', alignmentChild: 'center', style: 'tableHeader' },
                    { text: 'Subtotal', fillColor: '#CCCCCC', color: 'black', alignment: 'center', alignmentChild: 'center', style: 'tableHeader' },
                    { text: 'Comisión', fillColor: '#CCCCCC', color: 'black', alignment: 'center', alignmentChild: 'center', style: 'tableHeader' },
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

exports.totVtasSem = async (req, res) => {

    var day1 = moment().format('YYYY-MM-DD');
    var day2 = moment().subtract(1, 'days').format('YYYY-MM-DD');
    var day3 = moment().subtract(2, 'days').format('YYYY-MM-DD');
    var day4 = moment().subtract(3, 'days').format('YYYY-MM-DD');
    var day5 = moment().subtract(4, 'days').format('YYYY-MM-DD');
    var day6 = moment().subtract(5, 'days').format('YYYY-MM-DD');
    var day7 = moment().subtract(6, 'days').format('YYYY-MM-DD');

    var day8 = moment().subtract(7, 'days').format('YYYY-MM-DD');
    var day9 = moment().subtract(8, 'days').format('YYYY-MM-DD');
    var day10 = moment().subtract(9, 'days').format('YYYY-MM-DD');
    var day11 = moment().subtract(10, 'days').format('YYYY-MM-DD');
    var day12 = moment().subtract(11, 'days').format('YYYY-MM-DD');
    var day13 = moment().subtract(12, 'days').format('YYYY-MM-DD');
    var day14 = moment().subtract(13, 'days').format('YYYY-MM-DD');

    var sumDay1 = await pool.query('call get_vtas_tot(?)', day1);
    var sumDay2 = await pool.query('call get_vtas_tot(?)', day2);
    var sumDay3 = await pool.query('call get_vtas_tot(?)', day3);
    var sumDay4 = await pool.query('call get_vtas_tot(?)', day4);
    var sumDay5 = await pool.query('call get_vtas_tot(?)', day5);
    var sumDay6 = await pool.query('call get_vtas_tot(?)', day6);
    var sumDay7 = await pool.query('call get_vtas_tot(?)', day7);

    var sumDay8 = await pool.query('call get_vtas_tot(?)', day8);
    var sumDay9 = await pool.query('call get_vtas_tot(?)', day9);
    var sumDay10 = await pool.query('call get_vtas_tot(?)', day10);
    var sumDay11 = await pool.query('call get_vtas_tot(?)', day11);
    var sumDay12 = await pool.query('call get_vtas_tot(?)', day12);
    var sumDay13 = await pool.query('call get_vtas_tot(?)', day13);
    var sumDay14 = await pool.query('call get_vtas_tot(?)', day14);

    var dataDay1 = sumDay1[0];
    var dataDay2 = sumDay2[0];
    var dataDay3 = sumDay3[0];
    var dataDay4 = sumDay4[0];
    var dataDay5 = sumDay5[0];
    var dataDay6 = sumDay6[0];
    var dataDay7 = sumDay7[0];

    var dataDay8 = sumDay8[0];
    var dataDay9 = sumDay9[0];
    var dataDay10 = sumDay10[0];
    var dataDay11 = sumDay11[0];
    var dataDay12 = sumDay12[0];
    var dataDay13 = sumDay13[0];
    var dataDay14 = sumDay14[0];

    for (var x = 0; x < dataDay1.length; x++) {
        const array = dataDay1[x];
        var sumaDay1 = array.suma;
    }

    for (var x = 0; x < dataDay2.length; x++) {
        const array = dataDay2[x];
        var sumaDay2 = array.suma;
    }

    for (var x = 0; x < dataDay3.length; x++) {
        const array = dataDay3[x];
        var sumaDay3 = array.suma;
    }

    for (var x = 0; x < dataDay4.length; x++) {
        const array = dataDay4[x];
        var sumaDay4 = array.suma;
    }

    for (var x = 0; x < dataDay5.length; x++) {
        const array = dataDay5[x];
        var sumaDay5 = array.suma;
    }

    for (var x = 0; x < dataDay6.length; x++) {
        const array = dataDay6[x];
        var sumaDay6 = array.suma;
    }

    for (var x = 0; x < dataDay7.length; x++) {
        const array = dataDay7[x];
        var sumaDay7 = array.suma;
    }

    for (var x = 0; x < dataDay8.length; x++) {
        const array = dataDay8[x];
        var sumaDay8 = array.suma;
    }

    for (var x = 0; x < dataDay9.length; x++) {
        const array = dataDay9[x];
        var sumaDay9 = array.suma;
    }

    for (var x = 0; x < dataDay10.length; x++) {
        const array = dataDay10[x];
        var sumaDay10 = array.suma;
    }

    for (var x = 0; x < dataDay11.length; x++) {
        const array = dataDay11[x];
        var sumaDay11 = array.suma;
    }

    for (var x = 0; x < dataDay12.length; x++) {
        const array = dataDay12[x];
        var sumaDay12 = array.suma;
    }

    for (var x = 0; x < dataDay13.length; x++) {
        const array = dataDay13[x];
        var sumaDay13 = array.suma;
    }

    for (var x = 0; x < dataDay14.length; x++) {
        const array = dataDay14[x];
        var sumaDay14 = array.suma;
    }

    var dataSem = [[sumaDay7, sumaDay6, sumaDay5, sumaDay4, sumaDay3, sumaDay2, sumaDay1], [sumaDay14, sumaDay13, sumaDay12, sumaDay11, sumaDay10, sumaDay9, sumaDay8]];

    res.send(dataSem);

}

exports.totVtasMes = async (req, res) => {

    var sumMes1 = await pool.query('call get_vtas_totxmes(?)', 0);
    var sumMes2 = await pool.query('call get_vtas_totxmes(?)', 1);
    var sumMes3 = await pool.query('call get_vtas_totxmes(?)', 2);
    var sumMes4 = await pool.query('call get_vtas_totxmes(?)', 3);
    var sumMes5 = await pool.query('call get_vtas_totxmes(?)', 4);
    var sumMes6 = await pool.query('call get_vtas_totxmes(?)', 5);
    var sumMes7 = await pool.query('call get_vtas_totxmes(?)', 6);

    var sumMes8 = await pool.query('call get_vtas_totxmes(?)', 12);
    var sumMes9 = await pool.query('call get_vtas_totxmes(?)', 13);
    var sumMes10 = await pool.query('call get_vtas_totxmes(?)', 14);
    var sumMes11 = await pool.query('call get_vtas_totxmes(?)', 15);
    var sumMes12 = await pool.query('call get_vtas_totxmes(?)', 16);
    var sumMes13 = await pool.query('call get_vtas_totxmes(?)', 17);
    var sumMes14 = await pool.query('call get_vtas_totxmes(?)', 18);

    var dataMes1 = sumMes1[0];
    var dataMes2 = sumMes2[0];
    var dataMes3 = sumMes3[0];
    var dataMes4 = sumMes4[0];
    var dataMes5 = sumMes5[0];
    var dataMes6 = sumMes6[0];
    var dataMes7 = sumMes7[0];

    var dataMes8 = sumMes8[0];
    var dataMes9 = sumMes9[0];
    var dataMes10 = sumMes10[0];
    var dataMes11 = sumMes11[0];
    var dataMes12 = sumMes12[0];
    var dataMes13 = sumMes13[0];
    var dataMes14 = sumMes14[0];

    for (var x = 0; x < dataMes1.length; x++) {
        const array = dataMes1[x];
        var sumaMes1 = array.suma;
        var cantMes1 = array.cantidad;
    }

    for (var x = 0; x < dataMes2.length; x++) {
        const array = dataMes2[x];
        var sumaMes2 = array.suma;
        var cantMes2 = array.cantidad;
    }

    for (var x = 0; x < dataMes3.length; x++) {
        const array = dataMes3[x];
        var sumaMes3 = array.suma;
        var cantMes3 = array.cantidad;
    }

    for (var x = 0; x < dataMes4.length; x++) {
        const array = dataMes4[x];
        var sumaMes4 = array.suma;
        var cantMes4 = array.cantidad;
    }

    for (var x = 0; x < dataMes5.length; x++) {
        const array = dataMes5[x];
        var sumaMes5 = array.suma;
        var cantMes5 = array.cantidad;
    }

    for (var x = 0; x < dataMes6.length; x++) {
        const array = dataMes6[x];
        var sumaMes6 = array.suma;
        var cantMes6 = array.cantidad;
    }

    for (var x = 0; x < dataMes7.length; x++) {
        const array = dataMes7[x];
        var sumaMes7 = array.suma;
        var cantMes7 = array.cantidad;
    }

    for (var x = 0; x < dataMes8.length; x++) {
        const array = dataMes8[x];
        var sumaMes8 = array.suma;
        var cantMes8 = array.cantidad;
    }

    for (var x = 0; x < dataMes9.length; x++) {
        const array = dataMes9[x];
        var sumaMes9 = array.suma;
        var cantMes9 = array.cantidad;
    }

    for (var x = 0; x < dataMes10.length; x++) {
        const array = dataMes10[x];
        var sumaMes10 = array.suma;
        var cantMes10 = array.cantidad;
    }

    for (var x = 0; x < dataMes11.length; x++) {
        const array = dataMes11[x];
        var sumaMes11 = array.suma;
        var cantMes11 = array.cantidad;
    }

    for (var x = 0; x < dataMes12.length; x++) {
        const array = dataMes12[x];
        var sumaMes12 = array.suma;
        var cantMes12 = array.cantidad;
    }

    for (var x = 0; x < dataMes13.length; x++) {
        const array = dataMes13[x];
        var sumaMes13 = array.suma;
        var cantMes13 = array.cantidad;
    }

    for (var x = 0; x < dataMes14.length; x++) {
        const array = dataMes14[x];
        var sumaMes14 = array.suma;
        var cantMes14 = array.cantidad;
    }

    var dataMes = [[sumaMes7, sumaMes6, sumaMes5, sumaMes4, sumaMes3, sumaMes2, sumaMes1], [sumaMes14, sumaMes13, sumaMes12, sumaMes11, sumaMes10, sumaMes9, sumaMes8], [cantMes7, cantMes6, cantMes5, cantMes4, cantMes3, cantMes2, cantMes1], [cantMes14, cantMes13, cantMes12, cantMes11, cantMes10, cantMes9, cantMes8]];

    res.send(dataMes);

}

exports.mostrarCajas = async (req, res) => {

    var infoCajas = await pool.query('SELECT a.idcaja, a.idcorte, a.status, a.idusuario, c.nombre_completo FROM cajas a LEFT JOIN usuarios b ON a.idusuario=b.idusuario LEFT JOIN empleados c ON b.idempleado=c.idempleado');

    if (infoCajas.length === 0) {
        res.send('empty');
    } else {

        const dataCajas = [];

        for (var x = 0; x < infoCajas.length; x++) {

            conteo = x + 1;
            const arrayCajas = infoCajas[x];

            const obj = [
                conteo,
                arrayCajas.idcaja,
                arrayCajas.idcorte,
                arrayCajas.status,
                arrayCajas.idusuario,
                arrayCajas.nombre_completo
            ];

            dataCajas.push(obj);
        }

        res.send(dataCajas);
    }

}

exports.agregarCaja = async (req, res) => {

    var valFolio = await pool.query('SELECT IFNULL(MAX(idcaja),100)+1 AS caja FROM cajas');

    for (var x = 0; x < valFolio.length; x++) {
        var idcaja = valFolio[x].caja;
    }

    var newCaja = {
        idcaja
    }

    await pool.query('INSERT INTO cajas SET ?', [newCaja]);

    res.status(200).send('Ok');

}

exports.abrirCaja = async (req, res) => {

    var idusuario = res.locals.usuario.idusuario;

    var { idCaja, montoIni } = req.body;

    var idcaja = idCaja;
    var monto_inicial = montoIni;

    var fecha_apertura = moment().format('YYYY-MM-DD h:mm:ss');
    var status = 1;

    var maxCorte = await pool.query('SELECT IFNULL(MAX(idcorte),0)+1 AS folioCorte FROM cortes_cajas WHERE idcaja=?', idcaja);

    for (var x = 0; x < maxCorte.length; x++) {
        var idcorte = maxCorte[x].folioCorte;
    }

    var q = await pool.query('UPDATE cajas SET idusuario=?, idcorte=?, status=1 WHERE idcaja=?', [idusuario, idcorte, idcaja]);

    var rowsAff = q.affectedRows;

    if (rowsAff > 0) {

        const newCorte = {
            idcorte,
            idcaja,
            fecha_apertura,
            monto_inicial,
            idusuario,
            status
        }

        var q = await pool.query('INSERT INTO cortes_cajas SET ?', [newCorte]);

        var rowsAff = q.affectedRows;

        if (rowsAff > 0) {
            res.send('Ok');
        }
    }
}

/* exports.retEfectivoPag = async (req, res) => {

    res.render('modulos/ventas/retiro_efectivo', {
        nombrePagina: 'Retiro de efectivo'
    });

} */

exports.retiroEfectivo = async (req, res) => {

    let { importe/*, den_1000_mxn, den_500_mxn, den_200_mxn, den_100_mxn, den_50_mxn, den_20_mxn, den_10_mxn, den_5_mxn, den_2_mxn, den_1_mxn, den_50c_mxn*/ } = req.body;

    var idusuario = res.locals.usuario.idusuario;
    var fecha_retiro = moment().format('YYYY-MM-DD h:mm:ss');

    var caja = await pool.query('SELECT idcaja FROM cajas WHERE idusuario=?', idusuario);

    for (var i = 0; i < caja.length; i++) {
        var idcaja = caja[i].idcaja;
    }

    var folioCorte = await pool.query('SELECT idcorte FROM cajas WHERE idusuario= ? AND idcaja=?', [idusuario, idcaja]);

    for (var x = 0; x < folioCorte.length; x++) {
        var idcorte = folioCorte[x].idcorte;
    }

    var valFolio = await pool.query('SELECT IFNULL(MAX(idretiro),0)+1 AS numRetiro FROM retiros WHERE idcaja=?', idcaja);

    for (var x = 0; x < valFolio.length; x++) {
        var idretiro = valFolio[x].numRetiro;
    }

    var newRetiro = {
        idretiro,
        idcaja,
        idcorte,
        importe,
        idusuario,
        fecha_retiro
    }

    /*var newRetDet = {
        idretiro,
        idcaja,
        den_1000_mxn,
        den_500_mxn,
        den_200_mxn,
        den_100_mxn,
        den_50_mxn,
        den_20_mxn,
        den_10_mxn,
        den_5_mxn,
        den_2_mxn,
        den_1_mxn,
        den_50c_mxn
    }*/

    await pool.query('INSERT INTO retiros SET ?', [newRetiro]);

    // await pool.query('INSERT INTO retiros_det SET ?', [newRetDet]);

    await pool.query('call sp_reg_retiro_cortecaja(?,?,?,?)', [idcaja, idcorte, importe, idusuario]);

    res.send('Ok');

}

/* exports.ingEfectivoPag = async (req, res) => {

    res.render('modulos/ventas/ingreso_efectivo', {
        nombrePagina: 'Ingreso de efectivo'
    });

} */

exports.ingresoEfectivo = async (req, res) => {

    let { importe/*, den_1000_mxn, den_500_mxn, den_200_mxn, den_100_mxn, den_50_mxn, den_20_mxn, den_10_mxn, den_5_mxn, den_2_mxn, den_1_mxn, den_50c_mxn*/ } = req.body;

    var idusuario = res.locals.usuario.idusuario;
    var fecha_ingreso = moment().format('YYYY-MM-DD h:mm:ss');

    var caja = await pool.query('SELECT idcaja FROM cajas WHERE idusuario=?', idusuario);

    for (var i = 0; i < caja.length; i++) {
        var idcaja = caja[i].idcaja;
    }

    var folioCorte = await pool.query('SELECT idcorte FROM cajas WHERE idusuario= ? AND idcaja=?', [idusuario, idcaja]);

    for (var x = 0; x < folioCorte.length; x++) {
        var idcorte = folioCorte[x].idcorte;
    }

    var valFolio = await pool.query('SELECT IFNULL(MAX(idingreso),0)+1 AS numIngreso FROM ingresos_efectivo WHERE idcaja=?', idcaja);

    for (var x = 0; x < valFolio.length; x++) {
        var idingreso = valFolio[x].numIngreso;
    }

    var newIngreso = {
        idingreso,
        idcaja,
        idcorte,
        importe,
        idusuario,
        fecha_ingreso
    }

    /* var newIngDet = {
        idingreso,
        idcaja,
        den_1000_mxn,
        den_500_mxn,
        den_200_mxn,
        den_100_mxn,
        den_50_mxn,
        den_20_mxn,
        den_10_mxn,
        den_5_mxn,
        den_2_mxn,
        den_1_mxn,
        den_50c_mxn
    } */

    await pool.query('INSERT INTO ingresos_efectivo SET ?', [newIngreso]);

    //await pool.query('INSERT INTO ingresos_efectivo_det SET ?', [newIngDet]);

    await pool.query('call sp_reg_ingreso_cortecaja(?,?,?,?)', [idcaja, idcorte, importe, idusuario]);

    res.send('Ok');

}

/*exports.corteCajaPag = async (req, res) => {

    var idusuario = res.locals.usuario.idusuario;

    var cajaInfo = await pool.query('SELECT idcaja, idcorte FROM cajas WHERE idusuario=?', idusuario);

    for (var i = 0; i < cajaInfo.length; i++) {
        var idcaja = cajaInfo[i].idcaja;
        var idcorte = cajaInfo[i].idcorte;
    }

    var infoPagos = await pool.query('SELECT monto_inicial, ventas_efectivo, ventas_tarjeta, ingreso_efectivo, retiro_efectivo FROM cortes_cajas WHERE idcaja=? AND idcorte=? AND idusuario=? AND status=1', [idcaja, idcorte, idusuario]);

    for (var i = 0; i < infoPagos.length; i++) {
        var monto_ini = infoPagos[i].monto_inicial;
        var ventas_efec = infoPagos[i].ventas_efectivo;
        var ventas_tarj = infoPagos[i].ventas_tarjeta;
        var ingreso_efec = infoPagos[i].ingreso_efectivo;
        var retiro_efec = infoPagos[i].retiro_efectivo;
    }

    if (!ventas_efec) {
        var ventas_efec = 0;
    }

    if (!ventas_tarj) {
        var ventas_tarj = 0;
    }

    if (!ingreso_efec) {
        var ingreso_efec = 0;
    }

    if (!retiro_efec) {
        var retiro_efec = 0;
    }

    var sumMontoIdeal = monto_ini + ventas_efec + ingreso_efec - retiro_efec;

    var montoIdeal = currencyFormat(sumMontoIdeal);

    var monto_inicial = currencyFormat(monto_ini);
    var ventas_efectivo = currencyFormat(ventas_efec);
    var ventas_tarjeta = currencyFormat(ventas_tarj);
    var ingreso_efectivo = currencyFormat(ingreso_efec);
    var retiro_efectivo = currencyFormat(retiro_efec);

    res.render('modulos/ventas/corte_caja', {
        nombrePagina: 'Corte de caja',
        monto_inicial,
        ventas_efectivo,
        ventas_tarjeta,
        ingreso_efectivo,
        retiro_efectivo,
        montoIdeal,
        sumMontoIdeal
    });

}*/

exports.corteCajaInfo = async (req, res) => {

    const idUsuario = res.locals.usuario.idusuario;

    const { idcaja, idcorte } = req.body;

    var infoCaja = await pool.query('call get_info_corte_caja(?,?,?)', [idcaja, idcorte, idUsuario]);

    var infoMontos = infoCaja[0];

    const dataCaja = [];

    if(infoMontos.length > 0){

        for(var i = 0; i < infoMontos.length; i++){

            const obj = [
                infoMontos[i].idx,
                infoMontos[i].leyend,
                currencyFormat(infoMontos[i].monto)
            ]
            
            dataCaja.push(obj);

        }

        res.send(dataCaja);
        
    }else{
        res.send('Empty');
    }

}

exports.corteCaja = async (req, res) => {

    let { importe, diferencia/*, den_1000_mxn, den_500_mxn, den_200_mxn, den_100_mxn, den_50_mxn, den_20_mxn, den_10_mxn, den_5_mxn, den_2_mxn, den_1_mxn, den_50c_mxn*/ } = req.body;

    var idusuario = res.locals.usuario.idusuario;
    var fecha_corte = moment().format('YYYY-MM-DD h:mm:ss');
    var tipo = 2;

    var caja = await pool.query('SELECT idcaja FROM cajas WHERE idusuario=?', idusuario);

    for (var i = 0; i < caja.length; i++) {
        var idcaja = caja[i].idcaja;
    }

    var folioCorte = await pool.query('SELECT idcorte FROM cajas WHERE idusuario= ? AND idcaja=?', [idusuario, idcaja]);

    for (var x = 0; x < folioCorte.length; x++) {
        var idcorte = folioCorte[x].idcorte;
    }

    /*var newCorteDet = {
        idcorte,
        idcaja,
        den_1000_mxn,
        den_500_mxn,
        den_200_mxn,
        den_100_mxn,
        den_50_mxn,
        den_20_mxn,
        den_10_mxn,
        den_5_mxn,
        den_2_mxn,
        den_1_mxn,
        den_50c_mxn,
        tipo
    }*/

    var status = 2;

    await pool.query('UPDATE cortes_cajas SET fecha_corte=?, monto_final = ?, diferencia=? , status=? WHERE idcorte=? AND idcaja=?', [fecha_corte, importe, diferencia, status, idcorte, idcaja]);

    //await pool.query('INSERT INTO cortes_cajas_det SET ?', [newCorteDet]);

    await pool.query('UPDATE cajas SET idcorte=NULL, idusuario=NULL, status=0 WHERE idcaja=?', idcaja);

    res.send('Ok');

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
            //widths: witdhsDef,
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