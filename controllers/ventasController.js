const pool = require('../config/db');
const moment = require('moment');


exports.puntoVenta = async (req, res) => {

    var idusuario = res.locals.usuario.idusuario;

    //var user = await pool.query("SELECT concat(a.nombre,' ', a.ap_paterno) as nombre FROM empleados a INNER JOIN usuarios b on a.idempleado=b.idempleado WHERE b.idusuario= ?", idusuario);

    //nombre = user[0].nombre.toUpperCase();

    res.render('modulos/ventas/punto_venta', {
        nombrePagina: 'Punto de Venta'
        //nombre
    });
}

exports.adminVentas = async (req, res) => {

    res.render('modulos/ventas/admin_ventas', {
        nombrePagina: 'Administrar Ventas'
        //nombre
    });
}

exports.crearVenta = async (req, res) => {

    //console.log(req.body);

    var { idcaja, idcliente, subtotal, impuesto, redondeo, total, forma_pago, num_transaccion, status, fecha } = req.body;

    var objProd = req.body.listaProductos;
    var idusuario = res.locals.usuario.idusuario;

    const valFolio = await pool.query('SELECT IFNULL(MAX(idnota),100)+1 AS numVenta FROM pos_node.ventas');

    for(var x = 0; x < valFolio.length; x++){
        var idnota = valFolio[x].numVenta;
    }

    const newVenta = {
        idnota,
        idcaja, 
        idcliente,
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

    await pool.query('INSERT INTO ventas SET ?', [newVenta]);

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
        
    }

    res.send('OK');

}

exports.consultarVentas = async (req, res) => {

    var {fecInicial, fecFinal, statusVtas} = req.body;

    var inicial = moment(fecInicial,'YYYY/MM/DD').format('YYYY-MM-DD');
    var final = moment(fecFinal,'YYYY/MM/DD').format('YYYY-MM-DD');

    if(statusVtas === null){
        statusVtas=0;
    }

    const values = await pool.query('call pos_node.get_ventasxfecha(?,?,?)', [inicial, final, statusVtas]);

    const results = values[0];
    const totalitems= results.length;

    if (totalitems === 0) {
        res.send('empty');
    }else{

        const dataset = [];

        for (var x = 0; x < results.length; x++) {

            const array = results[x];

            botonDet= "<div class='btn-group'><button type='button' id='btn-detalle-vta' class='btn btn-info' data-toggle='modal' data-target='#modalDetVta' idNota=" + "'" + array.idnota + "'" + "><i class='fas fa-eye'></i></button></div>";

            botones = "<div class='btn-group'><button type='button' id='btn-imprimir-vta' class='btn btn-success' idNota=" + "'" + array.idnota + "'" + "><i class='fas fa-print'></i></button><button id='btn-anular-venta' class='btn btn-danger' idNota=" + "'" + array.idnota + "'" + "><i class='fa fa-times'></i></button></div>";;

            const obj = [
                array.idnota,
                array.idcaja,
                array.cliente,
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

exports.detVentas = async (req, res) => {

    let idNota = req.params.id;

    const results = await pool.query('call pos_node.get_detalleventa(?)',[idNota]);

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