import axios from 'axios';
import Swal from 'sweetalert2';
import moment from 'moment';
import pdfMake from 'pdfMake';
import vfsFonts from 'pdfmake/build/vfs_fonts.js';
import FileSaver from 'file-saver';

const barCode = document.getElementById("barcodeCompra");
const body = document.body;

const selectProveedores = document.getElementById('provCompra');
const checkImpCom = document.getElementById('checkImpCom');

const formularioCompra = document.getElementById('formularioCompra');
const formSearchCompra = document.getElementById('searchCompras');

var counter = 1;

if (barCode) {
    body.classList.add("sidebar-collapse");
}

(function () {

    /* =============================================
    SELECT PROVEEDORES ACTIVOS
    =============================================*/
    if (selectProveedores) {

        axios.get('/proveedores_activos')
            .then(function (respuesta) {

                const dataProv = respuesta.data;

                dataProv.forEach(function (valor, indice, array) {

                    var idProv = valor[1];
                    var nameProv = valor[2];

                    $("<option />")
                        .attr("value", idProv)
                        .html(nameProv)
                        .appendTo(provCompra);
                })
            }).catch(() => {
                Swal.fire({
                    icon: 'error',
                    title: 'Hubo un error',
                    text: 'Error en la base de datos'
                })
            })
    }

    /* =============================================
    EVENTO ENTER AGREGAR PRODUCTOS COMPRA
    =============================================*/
    $(barCode).keypress(function (e) {
        //mayor compatibilidad entre navegadores.
        var code = (e.keyCode ? e.keyCode : e.which);
        if (code == 13) {
            buscar();
        }
    });

})();

/* =============================================
AGREGAR PRODUCTOS A DE COMPRA
=============================================*/
function buscar() {

    var codigo = barCode.value;

    if (codigo == '') {

        Swal.fire({
            icon: 'warning',
            title: 'Oops...',
            text: 'Ingrese código de producto!',
        })

    } else {
        var route = '/precio_producto_compra/' + codigo;
        axios.get(route)
            .then(function (respuesta) {

                var dataSet = respuesta.data;

                if (dataSet == 'Empty') {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Oops...',
                        text: 'El producto no existe o esta inactivo!',
                    })
                    barCode.value = "";

                } else {

                    var idProducto = dataSet[0].idproducto;
                    var descripcion = dataSet[0].producto;
                    var stock = dataSet[0].stock_total;
                    var precio = dataSet[0].precio;
                    var marca = dataSet[0].marca;

                    var prodItem = $(".nuevaDescripcionProducto");

                    if (prodItem.length == 0) {

                        newItem(idProducto, descripcion, marca, stock, precio)

                    } else {

                        var indexProd = validListaProductos(idProducto);

                        if (indexProd == -1) {

                            newItem(idProducto, descripcion, marca, stock, precio)

                        } else {

                            var stockInput = document.getElementById(idProducto);
                            var cantActual = stockInput.value;
                            var cantNuevo = parseInt(cantActual) + 1;

                            var idprecioUnit = idProducto + 'a';
                            var idPrecio = idProducto + 'b';

                            updTotProd(idPrecio, cantNuevo, idprecioUnit);

                            stockInput.value = cantNuevo;

                            barCode.value = "";


                        }
                    }
                    // SUMAR TOTAL DE PRECIOS
                    sumarTotalPrecios();

                }
            }).catch(() => {
                Swal.fire({
                    icon: 'error',
                    title: 'Hubo un error',
                    text: 'Error en la base de datos'
                })
            })
    }
}
/* =============================================
INSERTAR NUEVO ITEM
=============================================*/
function newItem(idProducto, descripcion, marca, stock, precio) {

    var t = $('#nuevoProdCompra').DataTable({
        deferRender: true,
        iDisplayLength: 50,
        retrieve: true,
        processing: true,
        fixedHeader: false,
        responsive: false,
        paging: false,
        searching: false,
        ordering: false,
        bInfo: false,
        bLengthChange: false,
        bAutoWidth: false
    });

    t.row.add([
        '<button type="button" idProducto="' + idProducto + '" class="btn btn-danger quitarProducto""><i class="fas fa-trash-alt"></i></button>',
        '<div>' + descripcion + '<input type="hidden" class="form-control nuevaDescripcionProducto" idProducto="' + idProducto + '" id="' + idProducto + 'p"  value="' + descripcion + '">' + '</div>',
        marca,
        '<div>' + precio.toFixed(2) + '<input type="hidden" class="form-control" precioReal="' + precio + '" id="' + idProducto + 'a" name="nuevoPrecio" value="' + precio + '">' + '</div>',
        '<input type="number" idProducto="' + idProducto + '" id="' + idProducto + '" class="form-control text-center nuevaCantidadProducto"  min="1" value="1" stock="' + stock + '" nuevoStock="' + Number(stock - 1) + '" required>',
        '<input type="number" class="form-control text-center nuevoTotalProducto" id="' + idProducto + 'b"  precioReal="' + precio + '" value="' + precio.toFixed(2) + '" readonly >'
    ]).draw(false);

    barCode.value = "";

}

/* =============================================
VALIDAR LISTA DE LOS PRODUCTOS
=============================================*/
function validListaProductos(idProducto) {

    var arrayProductos = [];
    var prodItem = $(".nuevaDescripcionProducto");

    for (var i = 0; i < prodItem.length; i++) {
        arrayProductos.push({
            "idproducto": parseInt($(prodItem[i]).attr("idProducto")),
            "descripcion": $(prodItem[i]).val()
        })
    }

    var index = arrayProductos.map((el) => el.idproducto).indexOf(parseInt(idProducto));

    return index;

}

/*=============================================
SUMAR TODOS LOS PRECIOS
=============================================*/
function sumarTotalPrecios() {

    var precioItem = $(".nuevoTotalProducto");
    var arraySumaPrecio = [];

    for (var i = 0; i < precioItem.length; i++) {
        arraySumaPrecio.push(Number($(precioItem[i]).val()));
    }

    function sumaArrayPrecios(total, numero) {
        return total + numero;
    }

    var sumaTotalPrecio = arraySumaPrecio.reduce(sumaArrayPrecios);

    $("#subtotalCompra").val(sumaTotalPrecio);
    $("#totalCompra").val(sumaTotalPrecio);

    if (document.getElementById('provCompra').disabled == true) {
        document.getElementById('provCompra').disabled = false;
    }

    $("#big_total").html(currencyFormat(sumaTotalPrecio));

};

/*=============================================
MODIFICAR LA CANTIDAD MANUAL
=============================================*/
$("#formularioCompra").on("change", "input.nuevaCantidadProducto", function () {

    var idProdCam = $(this).attr("idproducto");
    var newId = idProdCam + 'a';
    var cant = $(this).val();

    var precio = document.getElementById(newId);
    var precioFinal = cant * precio.getAttribute("precioReal");

    var newIdTotal = idProdCam + 'b';
    document.getElementById(newIdTotal).value = precioFinal.toFixed(2);

    var nuevoStock = Number($(this).attr("stock")) - $(this).val();

    $(this).attr("nuevoStock", nuevoStock);

    var numComprobante = document.getElementById('numComCompra');
    var divNumTrans = document.getElementById('numTransCom');

    if (numComprobante) {
        numComprobante.value = '';
    }

    if (divNumTrans) {
        divNumTrans.value = '';
    }

    // SUMAR TOTAL DE PRECIOS
    sumarTotalPrecios();
    // AGREGAR IMPUESTO
    agregarImpuesto();

});

/*=============================================
MODIFICAR LA CANTIDAD AL ACTUALIZAR AUTOMATICO
=============================================*/
function updTotProd(idPrecio, cantNuevo, idprecioUnit) {

    var precioUnit = document.getElementById(idprecioUnit).value;
    var precioTotal = parseInt(precioUnit) * parseInt(cantNuevo);

    var preTotalInput = document.getElementById(idPrecio);
    preTotalInput.value = precioTotal.toFixed(2);

    var numComprobante = document.getElementById('numComCompra');
    var divNumTrans = document.getElementById('numTransCom');

    if (numComprobante) {
        numComprobante.value = '';
    }

    if (divNumTrans) {
        divNumTrans.value = '';
    }

    // SUMAR TOTAL DE PRECIOS
    sumarTotalPrecios();
    // AGREGAR IMPUESTO
    agregarImpuesto();

}
/*=============================================
SELECCIONAR MÉTODO DE PAGO
=============================================*/
$("#fPagoCompra").change(function () {

    var divForPago = document.getElementById('fPagoCompra');
    var fPago = divForPago.value;

    if (fPago == 1) {

        $('#boxFormaPago').empty();

        $("#boxFormaPago").html(
            '<div class="row">' +
            '<div class="col-sm-6 text-center">' +
            '<div class="form-group">' +
            '<label>Comprobante:</label><label style="color:#C20F30">*</label>' +
            '<input type="number" id="numComCompra" class="form-control text-center" required>' +
            '</div>' +
            '</div>' +
            '<div class="col-sm-6 text-center">' +
            '</div>' +
            '</div>')

        if (document.getElementById('regCompra').disabled == true) {
            document.getElementById('regCompra').disabled = false;
        }

        var numComprobante = document.getElementById('numComCompra');
        numComprobante.focus();

    } else {

        if (fPago == 2) {

            $('#boxFormaPago').empty();

            $("#boxFormaPago").html(
                '<div class="row">' +
                '<div class="col-sm-6 text-center">' +
                '<div class="form-group">' +
                '<label># Transacción:</label><label style="color:#C20F30">*</label>' +
                '<input type="number" id="numTransCom" class="form-control text-center" required>' +
                '</div>' +
                '</div>' +
                '<div class="col-sm-6 text-center">' +
                '<div class="form-group">' +
                '<label># Comprobante:</label><label style="color:#C20F30">*</label>' +
                '<input type="number" id="numComCompra" class="form-control text-center" required>' +
                '</div>' +
                '</div>' +
                '</div>')

            if (document.getElementById('regCompra').disabled == true) {
                document.getElementById('regCompra').disabled = false;
            }

            var divNumTrans = document.getElementById('numTransCom');
            divNumTrans.focus();

        } else {

            $('#boxFormaPago').empty();

            if (document.getElementById('regCompra').disabled == false) {
                document.getElementById('regCompra').disabled = true;
            }
        }
    }

});

/*=============================================
FORMA DE PAGO - CAMBIO EN EFECTIVO
=============================================*/
if (selectProveedores) {

    selectProveedores.addEventListener('change', (event) => {

        if (document.getElementById('fPagoCompra').disabled == true) {
            document.getElementById('fPagoCompra').disabled = false;
        }

        if (checkImpCom.disabled == true) {
            checkImpCom.disabled = false;
        }

        if (document.getElementById('checkRed').disabled == true) {
            document.getElementById('checkRed').disabled = false;
        }

    });

}

/*=============================================
CHECK IMPUESTOS
=============================================*/
if (checkImpCom) {

    checkImpCom.addEventListener('change', (event) => {

        if (checkImpCom.checked == true) {

            $('#impuestosBox').empty();

            $("#impuestosBox").html(
                '<div class="row">' +
                '<div class="col-sm-6 text-center">' +
                '<div class="form-group">' +
                '<label>% Impuesto:</label><label style="color:#C20F30">*</label>' +
                '<input type="number" id="impuestoCompra" class="form-control text-center" min="0" max="50" value="0" required>' +
                '</div>' +
                '</div>' +
                '<div class="col-sm-6 text-center">' +
                '<div class="form-group">' +
                '<label>Total Impuesto:</label><label style="color:#C20F30">*</label>' +
                '<input type="number" id="nuevoPrecioImpuesto" class="form-control text-center" value="0" step="0.01" readonly="readonly" required>' +
                '</div>' +
                '</div>' +
                '</div>')


        } else {
            $('#impuestosBox').empty();
            var subtotal = document.getElementById('subtotalCompra').value;
            var boxTotal = document.getElementById('totalCompra');

            boxTotal.value = subtotal;
            $("#big_total").html(currencyFormat(Number(subtotal)));

            var numComprobante = document.getElementById('numComCompra');
            var divNumTrans = document.getElementById('numTransCom');

            if (numComprobante) {
                numComprobante.value = '';
            }

            if (divNumTrans) {
                divNumTrans.value = '';
            }

        }

    })

}
/*=============================================
FUNCIÓN AGREGAR IMPUESTO
=============================================*/
$("#formularioCompra").on("change", "input#impuestoCompra", function () {
    agregarImpuesto();
});

function agregarImpuesto() {

    var boxImpuesto = document.getElementById('impuestoCompra');

    if (boxImpuesto) {

        var impuesto = boxImpuesto.value;
        var precioTotal = document.getElementById('subtotalCompra').value;

        var precioImpuesto = Number(precioTotal * impuesto / 100);

        var totalConImpuesto = Number(precioImpuesto) + Number(precioTotal);

        document.getElementById('nuevoPrecioImpuesto').value = precioImpuesto;
        document.getElementById('totalCompra').value = totalConImpuesto;
        $("#big_total").html(currencyFormat(totalConImpuesto));

        var numComprobante = document.getElementById('numComCompra');
        var divNumTrans = document.getElementById('numTransCom');

        if (numComprobante) {
            numComprobante.value = '';
        }

        if (divNumTrans) {
            divNumTrans.value = '';
        }

    }

}

/*=============================================
FUNCIÓN REDONDEAR
=============================================*/
function redondear(num, decimales = 2) {
    var signo = (num >= 0 ? 1 : -1);
    num = num * signo;
    if (decimales === 0) //con 0 decimales
        return signo * Math.round(num);
    // round(x * 10 ^ decimales)
    num = num.toString().split('e');
    num = Math.round(+(num[0] + 'e' + (num[1] ? (+num[1] + decimales) : decimales)));
    // x * 10 ^ (-decimales)
    num = num.toString().split('e');
    return signo * (num[0] + 'e' + (num[1] ? (+num[1] - decimales) : -decimales));
}
/*=============================================
FUNCIÓN FORMATO DE MONEDA
=============================================*/
function currencyFormat(value) {
    return '$ ' + value.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}

/*=============================================
QUITAR PRODUCTOS DE LA COMPRA
=============================================*/
$("#formularioCompra").on("click", "button.quitarProducto", function () {

    var row = $(this).closest("tr").get(0);
    var oTable = $('#nuevoProdCompra').dataTable();
    oTable.fnDeleteRow(oTable.fnGetPosition(row));

    var totalItems = oTable.fnGetData().length;

    if (totalItems == 0) {

        $("#subtotalCompra").val(0.00);
        $("#totalCompra").val(0.00);
        $("#big_total").html('$ 0.00');
        $('#impuestosBox').empty();
        $('#boxFormaPago').empty();
        $(oTable).remove();

        window.location = "/registrar_compra";

    } else {

        // SUMAR TOTAL DE PRECIOS
        sumarTotalPrecios();
        // AGREGAR IMPUESTO
        agregarImpuesto();

    }

});

/*=============================================
LISTAR TODOS LOS PRODUCTOS
=============================================*/
function listarProductos() {

    var listaProductos = [];

    var descripcion = $(".nuevaDescripcionProducto");

    var cantidad = $(".nuevaCantidadProducto");

    var precio = $(".nuevoTotalProducto");

    for (var i = 0; i < descripcion.length; i++) {

        var idArticulo = $(descripcion[i]).attr("idProducto");

        listaProductos.push({
            "idproducto": idArticulo,
            "descripcion": $(descripcion[i]).val(),
            "cantidad": $(cantidad[i]).val(),
            "stock": $(cantidad[i]).attr("nuevoStock"),
            "precio": $(precio[i]).attr("precioReal"),
            "total": $(precio[i]).val()
        })

    }


    return listaProductos;

}


/*=============================================
REGISTRAR COMPRA
=============================================*/
if (formularioCompra) {

    formularioCompra.addEventListener('submit', function (e) {
        e.preventDefault();

        var payload = {};
        var boxImpuesto = document.getElementById('impuestoCompra');
        var numTrans = document.getElementById('numTransCom');

        if (boxImpuesto) {
            var impuesto = document.getElementById('nuevoPrecioImpuesto').value;
        } else {
            var impuesto = null;
        }

        if (numTrans) {
            var numTransaccion = document.getElementById('numTransCom').value;
        } else {
            var numTransaccion = null;
        }

        var provCompra = document.getElementById('provCompra').value;
        var fPagoCompra = document.getElementById('fPagoCompra').value;
        var listaProductos = listarProductos();
        var subtotalCompra = document.getElementById('subtotalCompra').value;
        var totalCompra = document.getElementById('totalCompra').value;
        var numComCompra = document.getElementById('numComCompra').value;

        payload.idproveedor = provCompra;
        payload.num_comprobante = numComCompra;
        payload.subtotal = subtotalCompra;
        payload.impuesto = impuesto;
        payload.redondeo = 0;
        payload.total = totalCompra;
        payload.forma_pago = fPagoCompra;
        payload.num_transaccion = numTransaccion;
        payload.status = 1;
        payload.fecha = moment().format('YYYY-MM-DD H:mm:ss');
        payload.listaProductos = listaProductos;

        axios.post('/crear_compra', payload)
            .then(function (respuesta) {
                
                if (respuesta.data == 'OK') {

                    // Alerta
                    Swal.fire(
                        'Compra Registrada!',
                        'Se registró la compra correctamente',
                        'success'
                    ).then(function (result) {
                        if (result.value) {
                            window.location = "/registrar_compra";
                        }
                    });


                } else {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Oops...',
                        text: 'Hubo un error!',
                    })
                }

            }).catch(errors => {
                Swal.fire({
                    icon: 'error',
                    title: 'Hubo un error',
                    text: 'Error en la Base de Datos'
                })
            })

    })
}
/*=============================================
CONSULTA DE COMPRAS
=============================================*/
if (formSearchCompra) {

    formSearchCompra.addEventListener('submit', function (e) {
        e.preventDefault();

        $('#btnSearchCompras').html('<span id="loading" class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>Buscando...').addClass('disabled');

        $('#tbl-admin-compras').DataTable().destroy();
        $("#tbl-admin-compras").remove();
        $("#btnOpcComp").remove();
        $("#bodyCompras").remove();

        var payload = {};

        var periodoCmpas = document.getElementById("reservation").value;
        var statusCmpas = document.getElementById("statusComp").value;

        var fecInicial = periodoCmpas.split('-')[0];
        var fecFinal = periodoCmpas.split('-')[1];

        if (statusCmpas == "") {
            statusCmpas = null;
        }

        payload.fecInicial = fecInicial;
        payload.fecFinal = fecFinal;
        payload.statusCmpas = statusCmpas;

        axios.post('/consultar_compras', payload)
            .then(function (respuesta) {

                $('#btnSearchCompras').html('<i class="fa fa-search"></i> Consultar').removeClass('disabled');

                if (respuesta.data == 'empty') {

                    Swal.fire(
                        '¡Sin registros!',
                        '¡No existen registros con los filtros seleccionados!',
                        'error'
                    );

                } else {

                    var dataCmpas = respuesta.data;

                    $("#cardCompras").append(
                        '<div class="card-body" id="bodyCompras">' +
                        '</div>'
                    );

                    $("#bodyCompras").append(
                        '<div id="btnOpcComp" class="d-flex">' +
                        '<div class="btn-group ml-auto">' +
                        '<button type="button" id="btn-opciones-compras" class="btn btn-info dropdown-toggle btn-sm" data-toggle="dropdown"data-display="static" aria-haspopup="true" aria-expanded="false">Opciones</button>' +
                        '<div class="dropdown-menu dropdown-menu-right dropdown-menu-lg-left">' +
                        '<button id="btn-export-compra" class="dropdown-item"><i class="fas fa-file-excel"></i> Exportar</button>' +
                        '<button id="btn-print-compra" class="dropdown-item"><i class="fas fa-print"></i> Imprimir</button>' +
                        '</div>' +
                        '</div>' +
                        '</div>' +
                        '<br>'
                    );

                    $("#bodyCompras").append(
                        '<table id="tbl-admin-compras" class="display table-bordered table-striped dt-responsive text-center" cellspacing="0" style="width:100%"> </table>'
                    );

                    $('#footerCompra').remove();

                    var tablaCompras = $("#tbl-admin-compras").DataTable({

                        data: dataCmpas,
                        deferRender: true,
                        iDisplayLength: 25,
                        retrieve: true,
                        processing: true,
                        fixedHeader: true,
                        responsive: true,
                        language: {

                            "sProcessing": "Procesando...",
                            "sLengthMenu": "Mostrar _MENU_ registros",
                            "sZeroRecords": "No se encontraron resultados",
                            "sEmptyTable": "Ningún dato disponible en esta tabla",
                            "sInfo": "Mostrando registros del _START_ al _END_ de un total de _TOTAL_",
                            "sInfoEmpty": "Mostrando registros del 0 al 0 de un total de 0",
                            "sInfoFiltered": "(filtrado de un total de _MAX_ registros)",
                            "sInfoPostFix": "",
                            "sSearch": "Buscar:",
                            "sUrl": "",
                            "sInfoThousands": ",",
                            "sLoadingRecords": "Cargando...",
                            "oPaginate": {
                                "sFirst": "Primero",
                                "sLast": "Último",
                                "sNext": "Siguiente",
                                "sPrevious": "Anterior"
                            },
                            "oAria": {
                                "sSortAscending": ": Activar para ordenar la columna de manera ascendente",
                                "sSortDescending": ": Activar para ordenar la columna de manera descendente"
                            }

                        },
                        columns: [{
                            title: "# Compra"
                        },
                        {
                            title: "# Comprobante"
                        },
                        {
                            title: "Proveedor"
                        },
                        {
                            title: "Usuario"
                        },
                        {
                            title: "Forma de pago"
                        },
                        {
                            title: "Subtotal", render: $.fn.dataTable.render.number(',', '.', 2)
                        },
                        {
                            title: "GranTotal", render: $.fn.dataTable.render.number(',', '.', 2)
                        },
                        {
                            title: "Estatus"
                        },
                        {
                            title: "Fecha Venta"
                        },
                        {
                            title: "Detalle"
                        },
                        {
                            title: "Acciones"
                        }
                        ]/*,
                        dom: '<lf<t>ip>',
                        footerCallback: function (row, data, start, end, display) {
                            var api = this.api(), data;

                            // Remove the formatting to get integer data for summation
                            var intVal = function (i) {
                                return typeof i === 'string' ?
                                    i.replace(/[\$,]/g, '') * 1 :
                                    typeof i === 'number' ?
                                        i : 0;
                            };

                            // Total todas las paginas
                            var total = api
                                .column(6)
                                .data()
                                .reduce(function (a, b) {
                                    return intVal(a) + intVal(b);
                                }, 0);

                            //Total monto por pagina  
                            var pageTotal = api
                                .column(6, { page: 'current' })
                                .data()
                                .reduce(function (a, b) {
                                    return intVal(a) + intVal(b);
                                }, 0);

                            //Formato de moneda
                            var totalGlobal = currencyFormat(total);
                            var totalxPagina = currencyFormat(pageTotal);

                            $('#footerVenta').remove();



                            if (window.matchMedia("(max-width:767px)").matches) {

                                $('#tbl-admin-ventas').append('<tfoot id="footerVenta" class="text-center"><tr class="totalPrice"><th></th><th></th></tr></tfoot>');


                                $('#footerVenta').find('th').eq(0).html("Total:");
                                $('#footerVenta').find('th').eq(1).html(totalxPagina + '<br/> (' + totalGlobal + ' total)');

                            } else {

                                $('#tbl-admin-ventas').append('<tfoot id="footerVenta" class="text-center"><tr class="totalPrice"><th></th><th></th><th></th><th></th><th></th><th></th><th></th></tr></tfoot>');

                                $('#footerVenta').find('th').eq(0).html("Total:");
                                $('#footerVenta').find('th').eq(6).html(totalxPagina + '<br/> (' + totalGlobal + ' total)');

                            }
                        }*/

                    })

                }

            })

    })
}
/*=============================================
DETALLE DE COMPRA
=============================================*/
$(document).on("click", "#btn-detalle-cmpa", function () {

    $('#table_detcmpas').DataTable().destroy();
    $("#table_detcmpas").remove();
    $("#bodyDetCmpa").append(
        '<table id="table_detcmpas" class="display table-bordered table-striped dt-responsive text-center" cellspacing="0" style="width:100%"> </table>'
    );

    var payload = {};

    var idCompra = $(this).attr("idCompra");
    var idComprobante = $(this).attr("idComprobante");

    payload.idCompra = idCompra;
    payload.idComprobante = idComprobante;

    axios.post('/det_compras', payload)
        .then(function (respuesta) {

            const tblDetCmpas = document.querySelector('#table_detcmpas');

            if (tblDetCmpas) {
                var dataSet = respuesta.data;

                $(tblDetCmpas).DataTable({
                    data: dataSet,
                    deferRender: true,
                    iDisplayLength: 25,
                    retrieve: true,
                    processing: true,
                    fixedHeader: true,
                    responsive: true,
                    searching: false,
                    language: {

                        "sProcessing": "Procesando...",
                        "sLengthMenu": "Mostrar _MENU_ registros",
                        "sZeroRecords": "No se encontraron resultados",
                        "sEmptyTable": "Ningún dato disponible en esta tabla",
                        "sInfo": "Mostrando registros del _START_ al _END_ de un total de _TOTAL_",
                        "sInfoEmpty": "Mostrando registros del 0 al 0 de un total de 0",
                        "sInfoFiltered": "(filtrado de un total de _MAX_ registros)",
                        "sInfoPostFix": "",
                        "sSearch": "Buscar:",
                        "sUrl": "",
                        "sInfoThousands": ",",
                        "sLoadingRecords": "Cargando...",
                        "oPaginate": {
                            "sFirst": "Primero",
                            "sLast": "Último",
                            "sNext": "Siguiente",
                            "sPrevious": "Anterior"
                        },
                        "oAria": {
                            "sSortAscending": ": Activar para ordenar la columna de manera ascendente",
                            "sSortDescending": ": Activar para ordenar la columna de manera descendente"
                        }

                    },
                    columns: [{
                        title: "#"
                    },
                    {
                        title: "ID Producto"
                    },
                    {
                        title: "Descripción"
                    },
                    {
                        title: "Cantidad"
                    },
                    {
                        title: "Precio Unitario", render: $.fn.dataTable.render.number(',', '.', 2)
                    },
                    {
                        title: "Total", render: $.fn.dataTable.render.number(',', '.', 2)
                    }
                    ]
                });

            }
        }).catch(errors => {
            Swal.fire({
                icon: 'error',
                title: 'Hubo un error',
                text: 'Error en la Base de Datos'
            })
        })

})

/*=============================================
Eliminar/Cancelar Compra
=============================================*/
$(document).on("click", "#btn-anular-compra", function () {

    Swal.fire({
        title: '¿Está seguro de anular la compra?',
        text: "¡Si no lo está puede cancelar la acción!",
        icon: 'warning',
        input: 'select',
        inputPlaceholder: 'Seleccione el motivo',
        inputOptions: {
            1: 'Devolución',
            2: 'Reclamación',
            3: 'Error cajero'
        },
        inputValidator: (value) => {
            return new Promise((resolve) => {
                if (value === '') {
                    resolve('Debes seleccionar un motivo de anulación')
                } else {
                    resolve()
                }
            })
        },
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Si, anular!'
    }).then((result) => {

        if (result.value) {

            var payload = {};

            var idCompra = $(this).attr("idCompra");
            var idComprobante = $(this).attr("idComprobante");

            payload.idCompra = idCompra;
            payload.idComprobante = idComprobante;
            payload.idMotivo = result.value;

            axios.put('/anular_compra', payload)
                .then(function (respuesta) {

                    if (respuesta.data == 'Ok') {
                        Swal.fire(
                            'Compra Anulada!',
                            'La compra fue anulada correctamente',
                            'success'
                        ).then(function (result) {
                            if (result.value) {
                                window.location = "/admin_compras";
                            }
                        });

                    }

                })
        }

    })
})

$("#reservation").change(function () {

    $('#tbl-admin-compras').DataTable().destroy();
    $("#tbl-admin-compras").remove();
    $("#btnOpcComp").remove();

});
/*=============================================
Exportar Compra
=============================================*/
$(document).on("click", "#btn-export-compra", function () {

    $('#btn-opciones-compras').html('<span id="loading" class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>Exportando...').addClass('disabled');

    var payload = {};
    var periodoComp = document.getElementById("reservation").value;
    var statusComp = document.getElementById("statusComp").value;

    if (statusComp == "") {
        statusComp = null;
    }

    var fecInicial = periodoComp.split('-')[0];
    var fecFinal = periodoComp.split('-')[1];

    payload.fecInicial = fecInicial;
    payload.fecFinal = fecFinal;
    payload.statusComp = statusComp;

    axios.post('/exportar_compras', payload, {
        responseType: 'blob'
    }).then(function (respuesta) {

        var data = respuesta.data;

        $('#btn-opciones-compras').html('Opciones').removeClass('disabled');

        if (data) {

            var blob = new Blob([data], { type: 'vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8' });
            FileSaver.saveAs(blob, 'reporte_compras.xlsx');

        } else {

            Swal.fire({
                icon: 'warning',
                title: 'Oops...',
                text: 'No existen registros!',
            })

        }

    }).catch(() => {
        Swal.fire({
            icon: 'error',
            title: 'Hubo un error',
            text: 'Error en la base de datos!'
        }).then(function (result) {
            if (result.value) {
                window.location = "/admin_compras";
            }
        });
    });

})

/*=============================================
Imprimir Venta
=============================================*/
$(document).on("click", "#btn-print-compra", function () {

    $('#btn-opciones-compras').html('<span id="loading" class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>Imprimiendo...').addClass('disabled');

    var payload = {};
    var periodoComp = document.getElementById("reservation").value;
    var statusComp = document.getElementById("statusComp").value;

    if (statusComp == "") {
        statusComp = null;
    }

    var fecInicial = periodoComp.split('-')[0];
    var fecFinal = periodoComp.split('-')[1];

    payload.fecInicial = fecInicial;
    payload.fecFinal = fecFinal;
    payload.statusComp = statusComp;

    axios.post('/imprimir_compras', payload)
        .then(function (respuesta) {

            $('#btn-opciones-compras').html('Opciones').removeClass('disabled');

            var data = respuesta.data;

            if (data.length > 0) {

                var type = 'application/pdf';
                const blobURL = URL.createObjectURL(pdfBlobConversion(data, type));
                const theWindow = window.open(blobURL);
                const theDoc = theWindow.document;
                const theScript = document.createElement('script');
                function injectThis() {
                    window.print();
                }
                theScript.innerHTML = 'window.onload = ${injectThis.toString()};';
                theDoc.body.appendChild(theScript);

            } else {

                Swal.fire({
                    icon: 'warning',
                    title: 'Oops...',
                    text: 'No existen registros!',
                })

            }

        }).catch(() => {
            Swal.fire({
                icon: 'error',
                title: 'Hubo un error',
                text: 'Error en la base de datos!'
            }).then(function (result) {
                if (result.value) {
                    window.location = "/admin_compras";
                }
            });
        });
})

//converts base64 to blob type for windows
function pdfBlobConversion(b64Data, contentType) {
    contentType = contentType || '';
    var sliceSize = 512;
    b64Data = b64Data.replace(/^[^,]+,/, '');
    b64Data = b64Data.replace(/\s/g, '');
    var byteCharacters = window.atob(b64Data);
    var byteArrays = [];

    for (var offset = 0; offset < byteCharacters.length; offset = offset + sliceSize) {
        var slice = byteCharacters.slice(offset, offset + sliceSize);

        var byteNumbers = new Array(slice.length);
        for (var i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        var byteArray = new Uint8Array(byteNumbers);

        byteArrays.push(byteArray);
    }

    var blob = new Blob(byteArrays, { type: contentType });
    return blob;
}