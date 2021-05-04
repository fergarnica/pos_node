import axios from 'axios';
import Swal from 'sweetalert2';
import moment from 'moment';

const barCode = document.getElementById("barcodeVenta");
const body = document.body;

const selectClientes = document.getElementById('clienteVenta');
const checkImp = document.getElementById('checkImp');

const formularioVenta = document.getElementById('formularioVenta');
const formSearchVtas = document.getElementById('searchVentas');


if (barCode) {
    body.classList.add("sidebar-collapse");
}

(function () {

    if (selectClientes) {

        axios.get('/clientes_activos')
            .then(function (respuesta) {

                const dataClientes = respuesta.data;

                dataClientes.forEach(function (valor, indice, array) {

                    var idCli = valor[1];
                    var nameCli = valor[2];

                    $("<option />")
                        .attr("value", idCli)
                        .html(nameCli)
                        .appendTo(selectClientes);
                })
            })
    }

})();

$(document).ready(function () {
    $("#barcodeVenta").keypress(function (e) {
        //no recuerdo la fuente pero lo recomiendan para
        //mayor compatibilidad entre navegadores.
        var code = (e.keyCode ? e.keyCode : e.which);
        if (code == 13) {
            buscar();
        }
    });
});
/* =============================================
AGREGAR PRODUCTOS A VENDER
=============================================*/
function buscar() {

    var codigo = document.getElementById("barcodeVenta").value;

    if (codigo == '') {

        Swal.fire({
            icon: 'warning',
            title: 'Oops...',
            text: 'Ingrese código de producto!',
        })

    } else {
        var route = '/precio_productos/' + codigo;
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
                    var precio = dataSet[0].pre_mayoreo;

                    var prodItem = $(".nuevaDescripcionProducto");

                    if (prodItem.length == 0) {

                        newItem(idProducto, descripcion, stock, precio)

                    } else {

                        var indexProd = validListaProductos(idProducto);

                        if (indexProd == -1) {

                            newItem(idProducto, descripcion, stock, precio)

                        } else {

                            var stockInput = document.getElementById(idProducto);
                            var cantActual = stockInput.value;
                            var cantNuevo = parseInt(cantActual) + 1;

                            if (cantNuevo > stock) {

                                barCode.value = "";

                                Swal.fire({
                                    icon: 'warning',
                                    title: 'La cantidad supera el Stock',
                                    text: "¡Sólo existen " + stock + " unidades!"
                                });

                            } else {

                                var idprecioUnit = idProducto + 'a';
                                var idPrecio = idProducto + 'b';

                                updTotProd(idPrecio, cantNuevo, idprecioUnit);

                                stockInput.value = cantNuevo;

                                barCode.value = "";
                            }

                        }
                    }
                    sumarTotalPrecios();

                    agregarImpuesto();

                }
            })
    }
}

/* =============================================
INSERTAR NUEVO ITEM
=============================================*/
function newItem(idProducto, descripcion, stock, precio) {

    $("#nuevoProducto").append(
        '<div class="row">' +
        '<div class="col-4">' +
        '<div class="input-group">' +
        '<div class="input-group-prepend">' +
        '<button type="button" idProducto="' + idProducto + '" class="btn btn-danger quitarProducto""><i class="fas fa-times"></i></button>' +
        '</div>' +
        '<input type="text" class="form-control nuevaDescripcionProducto" idProducto="' + idProducto + '" name="agregarProducto" value="' + descripcion + '" readonly required>' +
        '</div>' +
        '</div>' +
        '<div class="col-3">' +
        '<div class="input-group">' +
        '<div class="input-group-prepend">' +
        '<span class="input-group-text"><i class="fas fa-dollar-sign"></i></span>' +
        '</div>' +
        '<input type="text" class="form-control text-right" precioReal="' + precio + '" id="' + idProducto + 'a" name="nuevoPrecio" value="' + precio + '" readonly required>' +
        '</div>' +
        '</div>' +
        '<div class="col-2">' +
        '<input type="number" idProducto="' + idProducto + '" id="' + idProducto + '" class="form-control text-center nuevaCantidadProducto" name="nuevaCantidadProducto" min="1" value="1" stock="' + stock + '" nuevoStock="' + Number(stock - 1) + '" required>' +
        '</div>' +
        '<div class="col-3 ingresoPrecio">' +
        '<div class="input-group">' +
        '<div class="input-group-prepend">' +
        '<span class="input-group-text"><i class="fas fa-dollar-sign"></i></span>' +
        '</div>' +
        '<input type="text" class="form-control text-right nuevoTotalProducto" id="' + idProducto + 'b"  precioReal="' + precio + '" value="' + precio + '" readonly required>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<p></p>')

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

    $("#subtotalVenta").val(sumaTotalPrecio);
    $("#totalVenta").val(sumaTotalPrecio);

    if (document.getElementById('clienteVenta').disabled == true) {
        document.getElementById('clienteVenta').disabled = false;
    }

    $("#big_total").html(currencyFormat(sumaTotalPrecio));

};

/*=============================================
MODIFICAR LA CANTIDAD MANUAL
=============================================*/
$("#formularioVenta").on("change", "input.nuevaCantidadProducto", function () {

    var precio = $(this).parent().parent().children(".ingresoPrecio").children().children(".nuevoTotalProducto");
    var precioFinal = $(this).val() * precio.attr("precioReal");
    precio.val(precioFinal);

    var nuevoStock = Number($(this).attr("stock")) - $(this).val();

    $(this).attr("nuevoStock", nuevoStock);

    if (Number($(this).val()) > Number($(this).attr("stock"))) {

        /*=============================================
        SI LA CANTIDAD ES SUPERIOR AL STOCK REGRESAR VALORES INICIALES
        =============================================*/
        $(this).val(1);

        var precioFinal = $(this).val() * precio.attr("precioReal");

        precio.val(precioFinal);

        sumarTotalPrecios();

        Swal.fire({
            icon: 'warning',
            title: 'La cantidad supera el Stock',
            text: "¡Sólo existen " + $(this).attr("stock") + " unidades!"
        });

        return;

    }

    var divEfectivoRec = document.getElementById('efectivoRecibido');
    var divNuevoCambio = document.getElementById('nuevoCambio');
    var divNumTrans = document.getElementById('numTrans');

    if (divEfectivoRec) {
        divEfectivoRec.value = '';
    }

    if (divNuevoCambio) {
        divNuevoCambio.value = '';
    }

    if (divNumTrans) {
        divNumTrans.value = '';
    }

    // SUMAR TOTAL DE PRECIOS
    sumarTotalPrecios();

    // AGREGAR IMPUESTO
    agregarImpuesto();

    // AGRUPAR PRODUCTOS EN FORMATO JSON

    //listarProductos()

});
/*=============================================
MODIFICAR LA CANTIDAD AL ACTUALIZAR AUTOMATICO
=============================================*/
function updTotProd(idPrecio, cantNuevo, idprecioUnit) {

    var precioUnit = document.getElementById(idprecioUnit).value;
    var precioTotal = parseInt(precioUnit) * parseInt(cantNuevo);

    var preTotalInput = document.getElementById(idPrecio);
    preTotalInput.value = precioTotal;

    var divEfectivoRec = document.getElementById('efectivoRecibido');
    var divNuevoCambio = document.getElementById('nuevoCambio');
    var divNumTrans = document.getElementById('numTrans');

    if (divEfectivoRec) {
        divEfectivoRec.value = '';
    }

    if (divNuevoCambio) {
        divNuevoCambio.value = '';
    }

    if (divNumTrans) {
        divNumTrans.value = '';
    }

    // SUMAR TOTAL DE PRECIOS
    sumarTotalPrecios();
    // AGREGAR IMPUESTO
    agregarImpuesto();


    // AGRUPAR PRODUCTOS EN FORMATO JSON

    //listarProductos()

}
/*=============================================
SELECCIONAR MÉTODO DE PAGO
=============================================*/
$("#formaPago").change(function () {

    var divForPago = document.getElementById('formaPago');
    var fPago = divForPago.value;

    if (fPago == 1) {

        $('#boxFormaPago').empty();

        $("#boxFormaPago").html(
            '<div class="row">' +
            '<div class="col-sm-6 text-center">' +
            '<div class="form-group">' +
            '<label>Recibido:</label><label style="color:#C20F30">*</label>' +
            '<input type="number" id="efectivoRecibido" class="form-control text-center" required>' +
            '</div>' +
            '</div>' +
            '<div class="col-sm-6 text-center">' +
            '<div class="form-group">' +
            '<label>Cambio:</label>' +
            '<input type="number" id="nuevoCambio" class="form-control text-center" readonly="readonly" required>' +
            '</div>' +
            '</div>' +
            '</div>')

        var divEfectivoRec = document.getElementById('efectivoRecibido');
        divEfectivoRec.focus();

    } else {

        if (fPago == 2) {

            $('#boxFormaPago').empty();

            $("#boxFormaPago").html(
                '<div class="row">' +
                '<div class="col-sm-6 text-center">' +
                '<div class="form-group">' +
                '<label># Transacción:</label><label style="color:#C20F30">*</label>' +
                '<input type="number" id="numTrans" class="form-control text-center" required>' +
                '</div>' +
                '</div>' +
                '<div class="col-sm-6 text-center">' +
                '</div>' +
                '</div>')

            if (document.getElementById('cobrarVenta').disabled == true) {
                document.getElementById('cobrarVenta').disabled = false;
            }

            var divNumTrans = document.getElementById('numTrans');
            divNumTrans.focus();

        } else {
            $('#boxFormaPago').empty();

            if (document.getElementById('cobrarVenta').disabled == false) {
                document.getElementById('cobrarVenta').disabled = true;
            }
        }
    }

});

/*=============================================
FORMA DE PAGO - CAMBIO EN EFECTIVO
=============================================*/
$("#formularioVenta").on("change", "input#efectivoRecibido", function () {

    var divEfectivoRec = document.getElementById('efectivoRecibido');
    var efectivoRec = divEfectivoRec.value;
    var totalVenta = document.getElementById('totalVenta').value;
    var divCambio = document.getElementById('nuevoCambio');

    if (Number(totalVenta) > Number(efectivoRec)) {

        Swal.fire({
            icon: 'warning',
            title: 'Efectivo ingresado insuficiente',
            text: "¡El efectivo ingresado es menor a la venta!"
        }).then(function (result) {

            if (document.getElementById('cobrarVenta').disabled == false) {
                document.getElementById('cobrarVenta').disabled = true;
            }

            divEfectivoRec.value = '';
            divEfectivoRec.focus();
        });

    } else {

        var cambio = efectivoRec - totalVenta;

        divCambio.value = cambio;

        if (document.getElementById('cobrarVenta').disabled == true) {
            document.getElementById('cobrarVenta').disabled = false;
        }

    }
});

if (selectClientes) {

    selectClientes.addEventListener('change', (event) => {

        if (document.getElementById('formaPago').disabled == true) {
            document.getElementById('formaPago').disabled = false;
        }

        if (document.getElementById('checkImp').disabled == true) {
            document.getElementById('checkImp').disabled = false;
        }

        if (document.getElementById('checkRed').disabled == true) {
            document.getElementById('checkRed').disabled = false;
        }

    });

}

/*=============================================
CHECK IMPUESTOS
=============================================*/
if (checkImp) {

    checkImp.addEventListener('change', (event) => {

        if (checkImp.checked == true) {

            $('#impuestosBox').empty();

            $("#impuestosBox").html(
                '<div class="row">' +
                '<div class="col-sm-6 text-center">' +
                '<div class="form-group">' +
                '<label>% Impuesto:</label><label style="color:#C20F30">*</label>' +
                '<input type="number" id="impuestoVenta" class="form-control text-center" min="0" max="50" value="0" required>' +
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
            var subtotal = document.getElementById('subtotalVenta').value;
            var boxTotal = document.getElementById('totalVenta');

            boxTotal.value = subtotal;
            $("#big_total").html(currencyFormat(Number(subtotal)));

            var divEfectivoRec = document.getElementById('efectivoRecibido');
            var divNuevoCambio = document.getElementById('nuevoCambio');
            var divNumTrans = document.getElementById('numTrans');

            if (divEfectivoRec) {
                divEfectivoRec.value = '';
            }

            if (divNuevoCambio) {
                divNuevoCambio.value = '';
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
$("#formularioVenta").on("change", "input#impuestoVenta", function () {
    agregarImpuesto();
});

function agregarImpuesto() {

    var boxImpuesto = document.getElementById('impuestoVenta');

    if (boxImpuesto) {

        var impuesto = boxImpuesto.value;
        var precioTotal = document.getElementById('subtotalVenta').value;

        var precioImpuesto = Number(precioTotal * impuesto / 100);

        var totalConImpuesto = Number(precioImpuesto) + Number(precioTotal);

        document.getElementById('nuevoPrecioImpuesto').value = precioImpuesto;
        document.getElementById('totalVenta').value = totalConImpuesto;
        $("#big_total").html(currencyFormat(totalConImpuesto));

        var divEfectivoRec = document.getElementById('efectivoRecibido');
        var divNuevoCambio = document.getElementById('nuevoCambio');
        var divNumTrans = document.getElementById('numTrans');

        if (divEfectivoRec) {
            divEfectivoRec.value = '';
        }

        if (divNuevoCambio) {
            divNuevoCambio.value = '';
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
QUITAR PRODUCTOS DE LA VENTA
=============================================*/
var idQuitarProducto = [];
localStorage.removeItem("quitarProducto");

$("#formularioVenta").on("click", "button.quitarProducto", function () {

    $(this).parent().parent().parent().parent().remove();
    var idProducto = $(this).attr("idProducto");

    /*=============================================
    ALMACENAR EN EL LOCALSTORAGE EL ID DEL PRODUCTO A QUITAR
    =============================================*/

    if (localStorage.getItem("quitarProducto") == null) {
        idQuitarProducto = [];
    } else {
        idQuitarProducto.concat(localStorage.getItem("quitarProducto"))
    }

    idQuitarProducto.push({ "idProducto": idProducto });

    localStorage.setItem("quitarProducto", JSON.stringify(idQuitarProducto));

    /* var divProductos = document.getElementById('nuevoProducto');
     console.log(divProductos);
     console.log(divProductos.length);*/
    var prodItem = $(".nuevaDescripcionProducto");
    var formaPago = document.getElementById('formaPago').value;
    var cliActual = document.getElementById('clienteVenta').value;

    if (prodItem.length == 0) {
        $("#subtotalVenta").val(0.00);
        $("#totalVenta").val(0.00);
        $("#big_total").html('$ 0.00');
        $('#impuestosBox').empty();
        $('#boxFormaPago').empty();

        /*if (document.getElementById('formaPago').disabled == false) {
            document.getElementById('formaPago').disabled = true;
        }*/

        if (cliActual > 0) {
            document.getElementById('clienteVenta').value = 0;
            if (document.getElementById('clienteVenta').disabled == false) {
                document.getElementById('clienteVenta').disabled = true;
            }
        }

        if (formaPago > 0) {
            document.getElementById('formaPago').value = 0;

            if (document.getElementById('formaPago').disabled == false) {
                document.getElementById('formaPago').disabled = true;
            }
        }

        if (document.getElementById('checkImp').disabled == false) {
            document.getElementById('checkImp').disabled = true;
        }

        if (document.getElementById('checkRed').disabled == false) {
            document.getElementById('checkRed').disabled = true;
        }

        if (document.getElementById('checkImp').checked == true) {
            document.getElementById('checkImp').checked = false;
        }

        if (document.getElementById('checkRed').checked == true) {
            document.getElementById('checkRed').checked = false;
        }

        document.getElementById('barcodeVenta').focus();

    } else {
        // SUMAR TOTAL DE PRECIOS
        sumarTotalPrecios()
        // AGREGAR IMPUESTO
        agregarImpuesto()

    }
});

/*=============================================
CREAR VENTA
=============================================*/
if (formularioVenta) {

    formularioVenta.addEventListener('submit', function (e) {
        e.preventDefault();

        var payload = {};

        var boxImpuesto = document.getElementById('impuestoVenta');
        var numTrans = document.getElementById('numTrans');

        if (boxImpuesto) {
            var impuesto = document.getElementById('nuevoPrecioImpuesto').value;
        } else {
            var impuesto = null;
        }

        if (numTrans) {
            var numTransaccion = document.getElementById('numTrans').value;
        } else {
            var numTransaccion = null;
        }

        var clienteVenta = document.getElementById('clienteVenta').value;
        var formaPago = document.getElementById('formaPago').value;
        var listaProductos = listarProductos();
        var subtotalVenta = document.getElementById('subtotalVenta').value;
        var totalVenta = document.getElementById('totalVenta').value;

        payload.idcaja = 1;
        payload.idcliente = clienteVenta;
        payload.subtotal = subtotalVenta;
        payload.impuesto = impuesto;
        payload.redondeo = 0;
        payload.total = totalVenta;
        payload.forma_pago = formaPago;
        payload.num_transaccion = numTransaccion;
        payload.status = 1;
        payload.fecha = moment().format('YYYY-MM-DD H:mm:ss');
        payload.listaProductos = listaProductos;

        //console.log(payload);

        axios.post('/crear_venta', payload)
            .then(function (respuesta) {

                if (respuesta.data == 'OK') {

                    // Alerta
                    Swal.fire(
                        'Venta Realizada!',
                        'Se realizó la venta correctamente',
                        'success'
                    ).then(function (result) {
                        if (result.value) {
                            window.location = "/punto_venta";
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
                    type: 'error',
                    title: 'Hubo un error',
                    text: 'Error en la Base de Datos'
                })
            })
    })
}

/*=============================================
LISTAR TODOS LOS PRODUCTOS
=============================================*/
function listarProductos() {

    var listaProductos = [];

    var descripcion = $(".nuevaDescripcionProducto");

    var cantidad = $(".nuevaCantidadProducto");

    var precio = $(".nuevoTotalProducto");

    for (var i = 0; i < descripcion.length; i++) {

        listaProductos.push({
            "idproducto": $(descripcion[i]).attr("idProducto"),
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
RANGO DE FECHAS - REPORTE DE VENTAS
=============================================*/
$('#reservation').daterangepicker();
//Date range picker with time picker
$('#reservation').daterangepicker({
    startDate: moment(),
    endDate: moment(),
    locale: {
        format: 'YYYY/MM/DD',
        daysOfWeek: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'],
        monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre',
            'Diciembre']
    }
});

/*=============================================
CONSULTA DE VENTAS
=============================================*/
if (formSearchVtas) {

    formSearchVtas.addEventListener('submit', function (e) {
        e.preventDefault();

        $('#btnSearchVtas').html('<span id="loading" class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>Buscando...').addClass('disabled');

        $('#tbl-admin-ventas').DataTable().destroy();
        $("#tbl-admin-ventas").remove();
        $("#btnOpciones").remove();


        var payload = {};

        var periodoVtas = document.getElementById("reservation").value;
        var statusVtas = document.getElementById("statusVtas").value;

        var fecInicial = periodoVtas.split('-')[0];
        var fecFinal = periodoVtas.split('-')[1];

        if (statusVtas == "") {
            statusVtas = null;
        }

        payload.fecInicial = fecInicial;
        payload.fecFinal = fecFinal;
        payload.statusVtas = statusVtas;

        axios.post('/consultar_ventas', payload)
            .then(function (respuesta) {

                $('#btnSearchVtas').html('<i class="fa fa-search"></i> Consultar').removeClass('disabled');

                if (respuesta.data == 'empty') {

                    Swal.fire(
                        '¡Sin registros!',
                        '¡No existen registros en el rango seleccionado!',
                        'error'
                    );

                } else {


                    var dataVtas = respuesta.data;

                    $("#bodyVtas").append(
                        '<div id="btnOpciones" class="d-flex">' +
                        '<div class="btn-group ml-auto">' +
                        '<button type="button" class="btn btn-info dropdown-toggle btn-sm" data-toggle="dropdown"data-display="static" aria-haspopup="true" aria-expanded="false">Opciones</button>' +
                        '<div class="dropdown-menu dropdown-menu-right dropdown-menu-lg-left">' +
                        '<button id="btn-export-venta" class="dropdown-item"><i class="fas fa-file-excel"></i> Exportar</button>' +
                        '<button id="btn-print-venta" class="dropdown-item"><i class="fas fa-print"></i> Imprimir</button>' +
                        '</div>' +
                        '</div>' +
                        '</div>' +
                        '<br>'
                    );

                    $("#bodyVtas").append(
                        '<table id="tbl-admin-ventas" class="display table-bordered table-striped dt-responsive text-center" cellspacing="0" style="width:100%"> </table>'
                    );

                    $('#footerVenta').remove();

                    var tablaVentas = $("#tbl-admin-ventas").DataTable({

                        data: dataVtas,
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
                            title: "# Nota"
                        },
                        {
                            title: "# Caja"
                        },
                        {
                            title: "Cliente"
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
                        ],
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

                            $('#footerVenta').remove();
                            $('#tbl-admin-ventas').append('<tfoot id="footerVenta" class="text-center"><tr class="totalPrice"><th></th><th></th><th></th><th></th><th></th><th></th><th></th></tr></tfoot>');

                            //Formato de moneda
                            var totalGlobal = currencyFormat(total);
                            var totalxPagina = currencyFormat(pageTotal);

                            $('#footerVenta').find('th').eq(0).html("Total:");
                            $('#footerVenta').find('th').eq(6).html(totalxPagina + '<br/> (' + totalGlobal + ' total)');
                        }


                    })

                    tablaVentas.on('responsive-resize', function (e, datatable, columns) {
                        $('#footerVenta').remove();
                    });
                }

            })

    })

}

/*=============================================
DETALLE DE VENTA
=============================================*/
$(document).on("click", "#btn-detalle-vta", function () {

    $('#table_detvtas').DataTable().destroy();
    $("#table_detvtas").remove();
    $("#bodyDetalle").append(
        '<table id="table_detvtas" class="display table-bordered table-striped dt-responsive text-center" cellspacing="0" style="width:100%"> </table>'
    );

    var idNota = $(this).attr("idNota");

    console.log(idNota);

    var route = '/det_ventas/' + idNota;

    axios.get(route)
        .then(function (respuesta) {

            const tblDetVtas = document.querySelector('#table_detvtas');

            if (tblDetVtas) {
                var dataSet = respuesta.data;

                $(tblDetVtas).DataTable({
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
                type: 'error',
                title: 'Hubo un error',
                text: 'Error en la Base de Datos'
            })
        })
});

$("#reservation").change(function () {

    $('#tbl-admin-ventas').DataTable().destroy();
    $("#tbl-admin-ventas").remove();
    $("#btnOpciones").remove();
    
});
