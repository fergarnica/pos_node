const pool = require('../config/db');
const moment = require('moment');
const fs = require('fs');
const pdfMakePrinter = require('pdfmake/src/printer');
const Excel = require('exceljs');
const formidable = require('formidable');
/* const mv = require('mv'); */
const path = require('path');
const walk = require('walk');

var Roboto = require('../public/fonts/Roboto');

exports.proveedores = async (req, res) => {

    var idUsuario = res.locals.usuario.idusuario;
    var url = req.originalUrl;

    var permiso = await validAccess(idUsuario, url);

    if(permiso>0){

        res.render('modulos/proveedores/proveedores', {
            nombrePagina: 'Proveedores'
        });

    }else{

        res.render('modulos/error/401', {
            nombrePagina: '401 Unauthorized'
        });

    }
    
}

exports.agregarProvForm = async (req, res) => {
    res.render('modulos/proveedores/agregar_proveedor', {
        nombrePagina: 'Agregar Proveedor'
    });
}

exports.cargaProvForm = async (req, res) => {
    res.render('modulos/proveedores/carga_proveedores', {
        nombrePagina: 'Carga masiva de Proveedores'
    });
}

exports.editarProvForm = async (req, res) => {
    res.render('modulos/proveedores/editar_proveedor', {
        nombrePagina: 'Editar Proveedor'
    });
}

exports.clientes = async (req, res) => {

    var idUsuario = res.locals.usuario.idusuario;
    var url = req.originalUrl;

    var permiso = await validAccess(idUsuario, url);

    if(permiso>0){

        res.render('modulos/clientes/clientes', {
            nombrePagina: 'Clientes'
        });

    }else{

        res.render('modulos/error/401', {
            nombrePagina: '401 Unauthorized'
        });
        
    }
    
}

exports.agregarClientesForm = async (req, res) => {
    res.render('modulos/clientes/agregar_cliente', {
        nombrePagina: 'Agregar Cliente'
    });
}

exports.editarCliForm = async (req, res) => {
    res.render('modulos/clientes/editar_cliente', {
        nombrePagina: 'Editar Cliente'
    });
}


exports.agregarProv = async (req, res) => {

    var { proveedor, nombre_proveedor, rfc, razon_social, email, telefono, calle, numero, colonia, municipio, estado, cp, status, fecha_creacion } = req.body;

    if (!rfc) {
        var rfc = null;
    }

    if (!razon_social) {
        var razon_social = null;
    }

    if (!calle) {
        var calle = null;
    }

    if (!numero) {
        var numero = null;
    }

    if (!colonia) {
        var colonia = null;
    }

    if (!municipio) {
        var municipio = null;
    }

    if (!estado) {
        var estado = null;
    }

    if (!cp) {
        var cp = null;
    }

    const newProv = {
        proveedor,
        nombre_proveedor,
        rfc,
        razon_social,
        email,
        telefono,
        calle,
        numero,
        colonia,
        municipio,
        estado,
        cp,
        status,
        fecha_creacion
    };

    const existProv = await pool.query('SELECT * FROM proveedores WHERE proveedor = ?', newProv.proveedor);

    if (existProv.length > 0) {

        res.send('Repetido');

    } else {

        await pool.query('INSERT INTO proveedores SET ?', [newProv]);

        res.status(200).send('Proveedor Creado Correctamente!');
    }

}

exports.mostrarProveedores = async (req, res) => {

    const values = await pool.query('SELECT * FROM proveedores');

    var valuesTotal = values.length;

    //console.log(valuesTotal);
    //console.log(values);

    if (valuesTotal === 0) {

        res.send('empty');

    } else {

        const dataProveedores = [];

        for (var x = 0; x < valuesTotal; x++) {

            conteo = x + 1;
            const arrayProveedores = values[x];

            var botones = "<div class='btn-group'><a type='button' id='btn-editar-prov' rel='nofollow' class='btn btn-warning' href=" + "'/editar_proveedor/" + arrayProveedores.idproveedor + "'" + " idProveedor=" + "'" + arrayProveedores.idproveedor + "'" + "><i class='fas fa-pencil-alt'></i></a><button id='btn-eliminar-prov' class='btn btn-danger' idProveedor=" + "'" + arrayProveedores.idproveedor + "'" + "><i class='fa fa-times'></i></button></div>";

            if (arrayProveedores.status === 0) {
                var status = "<button type='button' id='btn-estatus-prov' class='btn btn-danger btn-sm' estadoProveedor='1' idProveedor=" + "'" + arrayProveedores.idproveedor + "'" + ">Desactivado</button>";
            } else {
                var status = "<button type='button' id='btn-estatus-prov' class='btn btn-success btn-sm' estadoProveedor='0' idProveedor=" + "'" + arrayProveedores.idproveedor + "'" + ">Activado</button>";
            }

            var fechaCreacion = moment(arrayProveedores.fecha_creacion).format('DD/MM/YYYY hh:mm:ss a');

            const obj = [
                conteo,
                arrayProveedores.idproveedor,
                arrayProveedores.proveedor,
                arrayProveedores.nombre_proveedor,
                arrayProveedores.rfc,
                arrayProveedores.razon_social,
                arrayProveedores.email,
                arrayProveedores.telefono,
                arrayProveedores.calle,
                arrayProveedores.numero,
                arrayProveedores.colonia,
                arrayProveedores.municipio,
                arrayProveedores.estado,
                arrayProveedores.cp,
                fechaCreacion,
                status,
                botones
            ];

            dataProveedores.push(obj);
        }

        res.send(dataProveedores);
    }
}

exports.activarProveedor = async (req, res) => {

    //console.log(req.body);

    const { idProveedor, estadoProveedor } = req.body;

    await pool.query('UPDATE proveedores SET status = ? WHERE idproveedor = ?', [estadoProveedor, idProveedor]);

    res.status(200).send('El empleado ha sido actualizado');

}

exports.eliminarProveedor = async (req, res) => {

    let idProveedor = req.params.id;

    var eliminarProveedor = await pool.query('DELETE FROM proveedores WHERE idproveedor = ?', idProveedor);

    if (eliminarProveedor.affectedRows === 1) {
        res.status(200).send('El proveedor ha sido eliminado.');
    } else {
        res.send('Inexistente');
    }

}

exports.mostrarProveedor = async (req, res) => {

    let idProveedor = req.params.id;

    const dataProv = await pool.query('SELECT * FROM proveedores WHERE idproveedor = ?', idProveedor);

    res.status(200).send(dataProv);

}

exports.editarProveedor = async (req, res) => {

    var { idproveedor, proveedor, nombre_proveedor, rfc, razon_social, email, telefono, calle, numero, colonia, municipio, estado, cp } = req.body;

    if (!rfc) {
        var rfc = null;
    }

    if (!razon_social) {
        var razon_social = null;
    }

    if (!calle) {
        var calle = null;
    }

    if (!numero) {
        var numero = null;
    }

    if (!colonia) {
        var colonia = null;
    }

    if (!municipio) {
        var municipio = null;
    }

    if (!estado) {
        var estado = null;
    }

    if (!cp) {
        var cp = null;
    }

    var conteo = 0;

    const dataBase = await pool.query('SELECT * FROM proveedores WHERE idproveedor = ?', idproveedor);

    for (var x = 0; x < dataBase.length; x++) {
        const arrayProveedor = dataBase[x];
        var proveedor_base = arrayProveedor.proveedor;
        var nombre_base = arrayProveedor.nombre_proveedor;
        var rfc_base = arrayProveedor.rfc;
        var rs_base = arrayProveedor.razon_social;
        var email_base = arrayProveedor.email;
        var telefono_base = arrayProveedor.telefono;
        var calle_base = arrayProveedor.calle;
        var numero_base = arrayProveedor.numero;
        var colonia_base = arrayProveedor.colonia;
        var municipio_base = arrayProveedor.municipio;
        var estado_base = arrayProveedor.estado;
        var cp_base = arrayProveedor.cp;
    }

    const validProv = await pool.query('SELECT * FROM proveedores WHERE proveedor = ? AND idproveedor != ?', [proveedor, idproveedor]);

    if (validProv.length > 0) {

        res.send('ProvRep');

    } else {

        if (proveedor != proveedor_base) {

            await pool.query('UPDATE proveedores SET proveedor = ? WHERE idproveedor = ?', [proveedor, idproveedor]);
            var conteo = conteo + 1;
        }

        if (nombre_proveedor != nombre_base) {

            await pool.query('UPDATE proveedores SET nombre_proveedor = ? WHERE idproveedor = ?', [nombre_proveedor, idproveedor]);
            var conteo = conteo + 1;
        }

        if (rfc != rfc_base) {

            await pool.query('UPDATE proveedores SET rfc = ? WHERE idproveedor = ?', [rfc, idproveedor]);
            var conteo = conteo + 1;
        }

        if (razon_social != rs_base) {

            await pool.query('UPDATE proveedores SET razon_social = ? WHERE idproveedor = ?', [razon_social, idproveedor]);
            var conteo = conteo + 1;
        }

        if (email != email_base) {

            await pool.query('UPDATE proveedores SET email = ? WHERE idproveedor = ?', [email, idproveedor]);
            var conteo = conteo + 1;
        }

        if (telefono != telefono_base) {

            await pool.query('UPDATE proveedores SET telefono = ? WHERE idproveedor = ?', [telefono, idproveedor]);
            var conteo = conteo + 1;
        }

        if (calle != calle_base) {

            await pool.query('UPDATE proveedores SET calle = ? WHERE idproveedor = ?', [calle, idproveedor]);
            var conteo = conteo + 1;
        }

        if (numero != numero_base) {

            await pool.query('UPDATE proveedores SET numero = ? WHERE idproveedor = ?', [numero, idproveedor]);
            var conteo = conteo + 1;
        }

        if (colonia != colonia_base) {

            await pool.query('UPDATE proveedores SET colonia = ? WHERE idproveedor = ?', [colonia, idproveedor]);
            var conteo = conteo + 1;
        }

        if (municipio != municipio_base) {

            await pool.query('UPDATE proveedores SET municipio = ? WHERE idproveedor = ?', [municipio, idproveedor]);
            var conteo = conteo + 1;
        }

        if (estado != estado_base) {

            await pool.query('UPDATE proveedores SET estado = ? WHERE idproveedor = ?', [estado, idproveedor]);
            var conteo = conteo + 1;
        }

        if (cp != cp_base) {

            await pool.query('UPDATE proveedores SET cp = ? WHERE idproveedor = ?', [cp, idproveedor]);
            var conteo = conteo + 1;
        }

        if (conteo > 0) {

            res.send('Proveedor Actualizado Correctamente');

        } else {
            res.send('Nulos');

        }

    }
}

exports.printProveedores = async (req, res) => {

    eval(req.body.content);

    var user = res.locals.usuario.usuario;

    userName = user.toUpperCase();

    const values = await pool.query('SELECT * FROM proveedores');

    if (values.length === 0) {

        res.send('empty');

    } else {

        const dataProveedores = [];

        for (var x = 0; x < values.length; x++) {

            conteo = x + 1;
            const arrayProveedores = values[x];


            if (arrayProveedores.status === 0) {
                var status = 'Inactivo';
            } else {
                var status = 'Activo';
            }

            var fechaCreacion = moment(arrayProveedores.fecha_creacion).format('DD/MM/YYYY');

            var rfc = arrayProveedores.rfc;
            var razon_social = arrayProveedores.razon_social;

            if (!rfc) {
                var rfc = ' ';
            }

            if (!razon_social) {
                var razon_social = ' ';
            }

            const obj = {
                //d = conteo,
                id: arrayProveedores.idproveedor,
                proveedor: arrayProveedores.proveedor,
                contacto: arrayProveedores.nombre_proveedor,
                rfc: rfc,
                //rs: razon_social,
                email: arrayProveedores.email,
                telefono: arrayProveedores.telefono,
                status: status,
                alta: fechaCreacion
            };

            dataProveedores.push(obj);
        }

        var fecha_actual = moment().format('DD/MM/YYYY hh:mm a');
        var docDefinition = {
            info: {
                title: 'Proveedores'
            },
            pageSize: 'LETTER',
            pageOrientation: 'landscape',
            pageMargins: [40, 40, 40, 40],
            content: [
                { text: 'REPORTE DE PROVEEDORES', style: 'header' },
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
                    dataProveedores,
                    // Columns display order
                    ['id', 'proveedor', 'contacto', 'rfc', /*'rs',*/ 'email', 'telefono', 'status', 'alta'],
                    // Custom columns widths
                    // ['6%', '12%', '15%','15%','12%', '12%', '12%','12%','12%'],
                    // Show headers?
                    true,
                    // Custom headers
                    [{ text: 'ID', fillColor: '#CCCCCC', color: 'black', alignment: 'center', alignmentChild: 'center', style: 'tableHeader' },
                    { text: 'Proveedor', fillColor: '#CCCCCC', color: 'black', alignment: 'center', alignmentChild: 'center', style: 'tableHeader' },
                    { text: 'Contacto', fillColor: '#CCCCCC', color: 'black', alignment: 'center', alignmentChild: 'center', style: 'tableHeader' },
                    { text: 'RFC', fillColor: '#CCCCCC', color: 'black', alignment: 'center', alignmentChild: 'center', style: 'tableHeader' },
                    //{ text: 'Razón Social', fillColor: '#CCCCCC', color: 'black', alignment: 'center', alignmentChild: 'center', style: 'tableHeader' },
                    { text: 'Email', fillColor: '#CCCCCC', color: 'black', alignment: 'center', alignmentChild: 'center', style: 'tableHeader' },
                    { text: 'Telefono', fillColor: '#CCCCCC', color: 'black', alignment: 'center', alignmentChild: 'center', style: 'tableHeader' },
                    { text: 'Status', fillColor: '#CCCCCC', color: 'black', alignment: 'center', alignmentChild: 'center', style: 'tableHeader' },
                    { text: 'Fecha Alta', fillColor: '#CCCCCC', color: 'black', alignment: 'center', alignmentChild: 'center', style: 'tableHeader' }

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

exports.exportProveedores = async (req, res) => {

    const values = await pool.query('SELECT * FROM proveedores');

    if (values.length === 0) {

        res.send('empty');

    } else {

        const dataProveedores = [];

        for (var x = 0; x < values.length; x++) {

            conteo = x + 1;
            const arrayProveedores = values[x];


            if (arrayProveedores.status === 0) {
                var status = 'Inactivo';
            } else {
                var status = 'Activo';
            }

            var fechaCreacion = moment(arrayProveedores.fecha_creacion).format('DD/MM/YYYY');

            var rfc = arrayProveedores.rfc;
            var razon_social = arrayProveedores.razon_social;

            if (!rfc) {
                var rfc = ' ';
            }

            if (!razon_social) {
                var razon_social = ' ';
            }

            const obj = {
                //d = conteo,
                id: arrayProveedores.idproveedor,
                proveedor: arrayProveedores.proveedor,
                contacto: arrayProveedores.nombre_proveedor,
                rfc: rfc,
                rs: razon_social,
                email: arrayProveedores.email,
                telefono: arrayProveedores.telefono,
                status: status,
                alta: fechaCreacion
            };

            dataProveedores.push(obj);
        }

        var workbook = new Excel.Workbook();

        workbook.views = [
            {
                x: 0, y: 0, width: 10000, height: 20000,
                firstSheet: 0, activeTab: 1, visibility: 'visible'
            }
        ];
        var worksheet = workbook.addWorksheet('Proveedores');
        worksheet.columns = [
            { header: 'ID', width: 10 },
            { header: 'Proveedor', width: 32 },
            { header: 'Contacto', width: 32 },
            { header: 'R.F.C.', width: 25 },
            { header: 'Razón Social', width: 32 },
            { header: 'Email', width: 32 },
            { header: 'Telefono', width: 24 },
            { header: 'Estatus', width: 10 },
            { header: 'Fecha Alta', width: 15 }
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

        for (i = 0; i < dataProveedores.length; i++) {

            const row = worksheet.getRow(2 + i);
            const provider = dataProveedores[i];

            row.getCell(1).value = provider.id;
            row.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
            row.getCell(1).border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            row.getCell(2).value = provider.proveedor;
            row.getCell(2).alignment = { vertical: 'middle', horizontal: 'center' };
            row.getCell(2).border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            row.getCell(3).value = provider.contacto;
            row.getCell(3).alignment = { vertical: 'middle', horizontal: 'center' };
            row.getCell(3).border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            row.getCell(4).value = provider.rfc;
            row.getCell(4).alignment = { vertical: 'middle', horizontal: 'center' };
            row.getCell(4).border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            row.getCell(5).value = provider.rs;
            row.getCell(5).alignment = { vertical: 'middle', horizontal: 'center' };
            row.getCell(5).border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            row.getCell(6).value = provider.email;
            row.getCell(6).alignment = { vertical: 'middle', horizontal: 'center' };
            row.getCell(6).border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            row.getCell(7).value = provider.telefono;
            row.getCell(7).alignment = { vertical: 'middle', horizontal: 'center' };
            row.getCell(7).border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            row.getCell(8).value = provider.status;
            row.getCell(8).alignment = { vertical: 'middle', horizontal: 'center' };
            row.getCell(8).border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            row.getCell(9).value = provider.alta;
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
        res.setHeader("Content-Disposition", "attachment; filename=" + "Report.xlsx");
        workbook.xlsx.write(res)
            .then(function (data) {
                res.end();
                console.log('File write done........');
            });
    }
}

exports.agregarCliente = async (req, res) => {

    var { cliente, rfc, email, telefono, status, fecha_creacion } = req.body;

    if (!rfc) {
        var rfc = null;
    }

    if (!email) {
        var email = null;
    }

    if (!telefono) {
        var telefono = null;
    }

    const newCliente = {
        cliente,
        rfc,
        email,
        telefono,
        status,
        fecha_creacion
    };

    const existCliente = await pool.query('SELECT * FROM clientes WHERE cliente = ?', newCliente.cliente);

    if (existCliente.length > 0) {

        res.send('Repetido');

    } else {

        await pool.query('INSERT INTO clientes SET ?', [newCliente]);

        res.status(200).send('Cliente Creado Correctamente!');
    }
}

exports.mostrarClientes = async (req, res) => {

    const values = await pool.query('SELECT * FROM clientes');

    var valuesTotal = values.length;

    //console.log(valuesTotal);
    //console.log(values);

    if (valuesTotal === 0) {

        res.send('empty');

    } else {

        const dataClientes = [];

        for (var x = 0; x < valuesTotal; x++) {

            conteo = x + 1;
            const arrayClientes = values[x];

            var botones = "<div class='btn-group'><a type='button' id='btn-editar-cli' rel='nofollow' class='btn btn-warning' href=" + "'/editar_cliente/" + arrayClientes.idcliente + "'" + " idCliente=" + "'" + arrayClientes.idcliente + "'" + "><i class='fas fa-pencil-alt'></i></a><button id='btn-eliminar-cli' class='btn btn-danger' idCliente=" + "'" + arrayClientes.idcliente + "'" + "><i class='fa fa-times'></i></button></div>";

            if (arrayClientes.status === 0) {
                var status = "<button type='button' id='btn-estatus-cli' class='btn btn-danger btn-sm' estadoCliente='1' idCliente=" + "'" + arrayClientes.idcliente + "'" + ">Desactivado</button>";
            } else {
                var status = "<button type='button' id='btn-estatus-cli' class='btn btn-success btn-sm' estadoCliente='0' idCliente=" + "'" + arrayClientes.idcliente + "'" + ">Activado</button>";
            }

            var fechaCreacion = moment(arrayClientes.fecha_creacion).format('DD/MM/YYYY hh:mm:ss a');

            const obj = [
                conteo,
                arrayClientes.idcliente,
                arrayClientes.cliente,
                arrayClientes.rfc,
                arrayClientes.email,
                arrayClientes.telefono,
                fechaCreacion,
                status,
                botones
            ];

            dataClientes.push(obj);
        }

        res.send(dataClientes);
    }
}

exports.activarCliente = async (req, res) => {

    //console.log(req.body);

    const { idCliente, estadoCliente } = req.body;

    await pool.query('UPDATE clientes SET status = ? WHERE idcliente = ?', [estadoCliente, idCliente]);

    res.status(200).send('El cliente ha sido actualizado');

}

exports.eliminarCliente = async (req, res) => {

    let idCliente = req.params.id;

    var eliminarCliente = await pool.query('DELETE FROM clientes WHERE idcliente = ?', idCliente);

    if (eliminarCliente.affectedRows === 1) {
        res.status(200).send('El cliente ha sido eliminado.');
    } else {
        res.send('Inexistente');
    }

}

exports.mostrarCliente = async (req, res) => {

    let idCliente = req.params.id;

    const dataCliente = await pool.query('SELECT * FROM clientes WHERE idcliente = ?', idCliente);

    res.status(200).send(dataCliente);

}

exports.clientesActivos =  async (req, res) => {

    const clientes = await pool.query('SELECT * FROM clientes WHERE status = 1');

    var clientesTotal = clientes.length;

    if (clientesTotal === 0) {

        res.send('empty');

    } else {

        const dataClientes = [];

        for (var x = 0; x < clientesTotal; x++) {

            conteo = x + 1;
            const arrayClientes = clientes[x];

            var fecha = moment(arrayClientes.fecha_creacion).format('YYYY-MM-DD hh:mm:ss a');

            const obj = [
                conteo,
                arrayClientes.idcliente,
                arrayClientes.cliente,
                arrayClientes.status,
                fecha
            ];

            dataClientes.push(obj);
        }

        res.send(dataClientes);
    }

}

exports.editarCliente = async (req, res) => {

    var { idcliente, cliente, rfc, email, telefono } = req.body;

    if (!rfc) {
        var rfc = null;
    }

    if (!email) {
        var email = null;
    }

    if (!telefono) {
        var telefono = null;
    }

    var conteo = 0;

    const dataBase = await pool.query('SELECT * FROM clientes WHERE idcliente = ?', idcliente);

    for (var x = 0; x < dataBase.length; x++) {
        const arrayCliente = dataBase[x];
        var cliente_base = arrayCliente.cliente;
        var rfc_base = arrayCliente.rfc;
        var email_base = arrayCliente.email;
        var telefono_base = arrayCliente.telefono;
    }

    const validCliente = await pool.query('SELECT * FROM clientes WHERE cliente = ? AND idcliente != ?', [cliente, idcliente]);

    if (validCliente.length > 0) {

        res.send('CliRep');

    } else {

        if (cliente != cliente_base) {

            await pool.query('UPDATE clientes SET cliente = ? WHERE idcliente = ?', [cliente, idcliente]);
            var conteo = conteo + 1;
        }

        if (rfc != rfc_base) {

            await pool.query('UPDATE clientes SET rfc = ? WHERE idcliente = ?', [rfc, idcliente]);
            var conteo = conteo + 1;
        }

        if (email != email_base) {

            await pool.query('UPDATE clientes SET email = ? WHERE idcliente = ?', [email, idcliente]);
            var conteo = conteo + 1;
        }

        if (telefono != telefono_base) {

            await pool.query('UPDATE clientes SET telefono = ? WHERE idcliente = ?', [telefono, idcliente]);
            var conteo = conteo + 1;
        }

        if (conteo > 0) {

            res.send('Cliente Actualizado Correctamente');

        } else {

            res.send('Nulos');

        }

    }
}

exports.getProvActivos = async (req, res) => {

    const proveedores = await pool.query('SELECT * FROM proveedores WHERE status= 1');

    var proveedoresTotal = proveedores.length;

    if (proveedoresTotal === 0) {

        res.send('empty');

    } else {

        const dataProveedores = [];

        for (var x = 0; x < proveedoresTotal; x++) {

            conteo = x + 1;
            const arrayProveedores = proveedores[x];

            var fecha = moment(arrayProveedores.fecha_creacion).format('YYYY-MM-DD hh:mm:ss a');

            const obj = [
                conteo,
                arrayProveedores.idproveedor,
                arrayProveedores.proveedor,
                arrayProveedores.status,
                fecha
            ];

            dataProveedores.push(obj);
        }

        res.send(dataProveedores);
    }

}


/* exports.layoutProveedores = async (req, res) => {

    var workbook = new Excel.Workbook();

    workbook.views = [
        {
            x: 0, y: 0, width: 10000, height: 20000,
            firstSheet: 0, activeTab: 1, visibility: 'visible'
        }
    ];
    var worksheet = workbook.addWorksheet('Proveedores');
    worksheet.columns = [
        { header: 'Proveedor', width: 32 },
        { header: 'Contacto', width: 32 },
        { header: 'R.F.C.', width: 25 },
        { header: 'Razón Social', width: 32 },
        { header: 'Email', width: 32 },
        { header: 'Telefono', width: 24 },
        { header: 'Calle', width: 25 },
        { header: 'Número', width: 15 },
        { header: 'Colonia', width: 25 },
        { header: 'Municipio', width: 25 },
        { header: 'Estado', width: 25 },
        { header: 'C.P.', width: 15 }
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
    worksheet.getCell('L1').alignment = { vertical: 'middle', horizontal: 'center' };
    // for the wannabe graphic designers out there
    worksheet.getCell('A1').font = { bold: true, 'color': { 'argb': 'C20F30' } };
    worksheet.getCell('B1').font = { bold: true, 'color': { 'argb': 'C20F30' } };
    worksheet.getCell('C1').font = { bold: true };
    worksheet.getCell('D1').font = { bold: true };
    worksheet.getCell('E1').font = { bold: true, 'color': { 'argb': 'C20F30' } };
    worksheet.getCell('F1').font = { bold: true, 'color': { 'argb': 'C20F30' } };
    worksheet.getCell('G1').font = { bold: true };
    worksheet.getCell('H1').font = { bold: true };
    worksheet.getCell('I1').font = { bold: true };
    worksheet.getCell('J1').font = { bold: true };
    worksheet.getCell('K1').font = { bold: true };
    worksheet.getCell('L1').font = { bold: true };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader("Content-Disposition", "attachment; filename=" + "Report.xlsx");
    workbook.xlsx.write(res)
        .then(function (data) {
            res.end();
            console.log('File write done........');
        });

} */

/* exports.importProveedores = async (req, res) => {

    var form = new formidable.IncomingForm();

    let nameFile;

    form.parse(req, function (err, fields, files) {

        nameFile = files.filetoupload.name;
        var oldpath = files.filetoupload.path;
        var newpath = __dirname + "/../public/uploads/proveedores/carga/" + files.filetoupload.name;

        mv(oldpath, newpath, function (err) {
            if (err) throw err;

        });

    })

    res.write('¡Archivo cargado y movido!');
    res.end();
} */

/* exports.cargaProveedores = async (req, res) => {

    const { fileName } = req.body;

    console.log(fileName);

    var filePath = path.join(__dirname, '/../public/uploads/proveedores/carga/');

    var fileLocation = filePath + fileName;

    console.log(fileLocation);

    const workbook = new Excel.Workbook();


    workbook.xlsx.readFile(fileLocation).then(function (e) {
        console.log('aqui');
        const worksheet = workbook.getWorksheet('Proveedores');
        //const table = 'ciq.ntp_rnc';
        const cat = [];

        worksheet.eachRow(function (row, rowNumber) {
            if (rowNumber >= 2) {
                const rowData = row.values;
                items.push(rowData);
                console.log('leyendo...')
            }
        });
        console.log(items);

    })

    const walker = walk.walk(`../public/uploads/proveedores/carga/`, {});
    walker.on("file", function (root, fileStarts, next) {

        const fileLocation = `${root}${path.sep}${fileName}`;

        console.log(fileLocation);

        const workbook = new Excel.Workbook();

        workbook.xlsx.readFile(fileLocation).then(function (e) {
            console.log('aqui');
            const worksheet = workbook.getWorksheet('Proveedores');
            //const table = 'ciq.ntp_rnc';
            const cat = [];

            worksheet.eachRow(function (row, rowNumber) {
                if (rowNumber >= 3) {
                    const rowData = row.values;
                    items.push(rowData);
                    console.log('leyendo...')
                }
            });
            console.log(items);

        })

    })


    res.send('ok');
} */

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