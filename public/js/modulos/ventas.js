import axios from 'axios';
import Swal from 'sweetalert2';
import moment from 'moment';
import pdfMake from 'pdfMake';
import vfsFonts from 'pdfmake/build/vfs_fonts.js';
import FileSaver from 'file-saver';

pdfMake.vfs = vfsFonts.pdfMake.vfs;

const barCode = document.getElementById("barcodeVenta");
const body = document.body;

const selectClientes = document.getElementById('clienteVenta');
const checkImp = document.getElementById('checkImp');

const formularioVenta = document.getElementById('formularioVenta');
const formSearchVtas = document.getElementById('searchVentas');
const formAbrirCaja = document.getElementById('formAbrirCaja');
const formNewRetiro = document.getElementById('formNewRetiro');
const formNewIngreso = document.getElementById('formNewIngreso');
const formCorteCaja = document.getElementById('formCorteCaja');
const formSearchArt = document.getElementById('formSearchArt');

const divCajas = document.getElementById("mostrarCajas");
const divRetiros = document.getElementById("bodyRetiros");
const divIngresos = document.getElementById("bodyIngresos");
const divCorteCaja = document.getElementById("bodyCorteCaja");

const tblCajas = document.querySelector('#tbl-admin-cajas');

if (barCode) {
    body.classList.add("sidebar-collapse");
}

(function () {

    /*=============================================
        Data Table Perfiles
    =============================================*/
    if (tblCajas) {

        axios.get('/cajas')
            .then(function (respuesta) {

                if (respuesta.data != 'empty') {

                    var dataSet = respuesta.data;

                    $(tblCajas).DataTable({
                        data: dataSet,
                        deferRender: true,
                        iDisplayLength: 25,
                        retrieve: true,
                        processing: true,
                        fixedHeader: true,
                        responsive: true,
                        columnDefs: [
                            { orderable: false, targets: '_all' }
                        ],
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
                            title: "ID Caja"
                        },
                        {
                            title: "# Corte"
                        },
                        {
                            title: "Estatus"
                        },
                        {
                            title: "ID Cajero"
                        },
                        {
                            title: "Nombre Cajero"
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

    }

    /* =============================================
    SELECT CLIENTES ACTIVOS
    =============================================*/
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
            }).catch(() => {
                Swal.fire({
                    icon: 'error',
                    title: 'Hubo un error',
                    text: 'Error en la base de datos'
                })
            })
    }

    /* =============================================
    EVENTO ENTER AGREGAR PRODUCTOS VENTA
    =============================================*/
    $(barCode).keypress(function (e) {
        //no recuerdo la fuente pero lo recomiendan para
        //mayor compatibilidad entre navegadores.
        var code = (e.keyCode ? e.keyCode : e.which);
        if (code == 13) {
            buscar();
        }
    });

    /* =============================================
    SELECCIONAR CAJA
    =============================================*/
    if (divCajas) {

        body.classList.add("sidebar-collapse");

        axios.get('/cajas')
            .then(function (respuesta) {

                var dataSet = respuesta.data;

                for (var i = 0; i < dataSet.length; i++) {

                    if (dataSet[i][4] == null) {
                        var uso = 'DISPONIBLE';
                        var status = 'Cerrada';
                        var textColor = 'danger';
                        var btnColor = 'success';
                        var cardColor = 'bg-gradient-success';
                        var opDisabled = null;
                    } else {

                        var uso = 'EN USO';
                        var btnColor = 'secondary';
                        var cardColor = 'bg-gradient-secondary';
                        var opDisabled = 'disabled';

                        if (dataSet[i][3] == 0) {
                            var status = 'Cerrada';
                            var textColor = 'danger';
                        } else {
                            var status = 'Abierta';
                            var textColor = 'success';
                        }

                    }

                    $(divCajas).append(
                        '<div class="col-12 col-sm-6 col-md-4 d-flex align-items-stretch flex-column">' +
                        '<div class="card bg-light">' +
                        '<div class="card-header ' + cardColor + ' text-bold border-bottom-0">' +
                        'CAJA-' + dataSet[i][1] +
                        '<div class="card-tools">' +
                        '<i class="fas fa-cash-register"></i>' +
                        '</div>' +
                        '</div>' +
                        '<div class="card-body pt-0">' +
                        '<div class="row">' +
                        '<div class="col-12">' +
                        '<p></p>' +
                        '<h2 class="lead"><b>' + uso + '</b></h2>' +
                        '<p class="text-' + textColor + ' text-sm"><b>' + status + '</b></p>' +
                        '</div>' +
                        '</div>' +
                        '</div>' +
                        '<div class="card-footer">' +
                        '<div class="text-right">' +
                        '<button class="btn btn-' + btnColor + ' btn-sm" data-toggle="modal" id="btn-abrir-caja" idCaja="' + dataSet[i][1] + '" data-target="#modalAbrirCaja" ' + opDisabled + '>' +
                        '<i class="fas fa-donate"></i> Abrir' +
                        '</button>' +
                        '</div>' +
                        '</div>' +
                        '</div>' +
                        '</div>'
                    )

                }

            })

    }

    if (divRetiros) {

        body.classList.add("sidebar-collapse");

        /* =============================================
        TABLA RETIROS
        =============================================*/
        $('#tbl-detalle-retiro').DataTable({
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

    }

    if (divIngresos) {

        body.classList.add("sidebar-collapse");

        /* =============================================
        TABLA RETIROS
        =============================================*/
        $('#tbl-detalle-ingreso').DataTable({
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

    }

    if (divCorteCaja) {

        body.classList.add("sidebar-collapse");

        /* =============================================
        TABLA DETALLE CORTE
        =============================================*/
        $('#tbl-info-cortecaja').DataTable({
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

        /* =============================================
        TABLA CORTE CAJA
        =============================================*/
        $('#tbl-det-cortecaja').DataTable({
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

    }


})();
/* =============================================
AGREGAR PRODUCTOS A VENDER
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
        var route = '/precio_producto_venta/' + codigo;
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

                            /*if (cantNuevo > stock) {

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
                            }*/

                            var idprecioUnit = idProducto + 'a';
                            var idArt = idProducto;

                            updTotProd(idArt, cantNuevo, idprecioUnit);

                            stockInput.value = cantNuevo;

                            barCode.value = "";

                        }
                    }
                    sumarTotalPrecios();

                    agregarImpuesto();

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

    var t = $('#nuevoProdVenta').DataTable({
        deferRender: true,
        iDisplayLength: 50,
        retrieve: true,
        processing: true,
        fixedHeader: false,
        responsive: true,
        paging: false,
        searching: false,
        ordering: false,
        bInfo: false,
        bLengthChange: false,
        bAutoWidth: false
    });

    t.row.add([
        '<button type="button" idProducto="' + idProducto + '" class="btn btn-sm btn-danger quitarProducto""><i class="fas fa-trash-alt"></i></button>',
        '<div>' + descripcion + '<input type="hidden" class="form-control nuevaDescripcionProducto" idProducto="' + idProducto + '" id="' + idProducto + 'p"  value="' + descripcion + '">' + '</div>',
        marca,
        '<div>' + currencyFormat(precio) + '<input type="hidden" class="form-control" precioReal="' + precio + '" id="' + idProducto + 'a" name="nuevoPrecio" value="' + precio + '">' + '</div>',
        '<input type="number" idProducto="' + idProducto + '" id="' + idProducto + '" class="form-control text-center nuevaCantidadProducto"  min="1" value="1" stock="' + stock + '" nuevoStock="' + Number(stock - 1) + '" required>',
        '<div><b id="' + idProducto + 'total">' + currencyFormat(precio) + '</b><input type="hidden" class="form-control text-center nuevoTotalProducto" id="' + idProducto + 'b"  precioReal="' + precio + '" value="' + precio + '">' + '</div>'
    ]).draw(false);

    barCode.value = "";

    var divEfectivoRec = document.getElementById('efectivoRecibido');
    var divNuevoCambio = document.getElementById('nuevoCambio');
    var divNumTrans = document.getElementById('numTrans');

    if (divEfectivoRec) {
        divEfectivoRec.value = '';
    }

    if (divNuevoCambio) {
        divNuevoCambio.value = '';
        $("#totalCambio").html('$ -.--');
    }

    if (divNumTrans) {
        divNumTrans.value = '';
    }

    if (document.getElementById('cobrarVenta').disabled == false) {
        document.getElementById('cobrarVenta').disabled = true;
    }

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

    var divMontoDebitado = document.getElementById('montoDebitado');

    if (divMontoDebitado) {
        divMontoDebitado.value = sumaTotalPrecio;

        if (document.getElementById('cobrarVenta').disabled == true) {
            document.getElementById('cobrarVenta').disabled = false;
        }

    }

    $("#big_subtotal").html(currencyFormat(sumaTotalPrecio));
    $("#big_total").html(currencyFormat(sumaTotalPrecio));

};

/*=============================================
MODIFICAR LA CANTIDAD MANUAL
=============================================*/
$("#formularioVenta").on("change", "input.nuevaCantidadProducto", function () {

    var idProdCam = $(this).attr("idproducto");
    var newId = idProdCam + 'a';
    var cant = $(this).val();

    var precio = document.getElementById(newId);
    var precioFinal = cant * precio.getAttribute("precioReal");

    var newIdTotal = idProdCam + 'b';
    document.getElementById(newIdTotal).value = precioFinal;

    var etiqTotal = '#' + idProdCam + 'total';
    $(etiqTotal).html(currencyFormat(precioFinal));

    var nuevoStock = Number($(this).attr("stock")) - $(this).val();

    $(this).attr("nuevoStock", nuevoStock);

    var divEfectivoRec = document.getElementById('efectivoRecibido');
    var divNuevoCambio = document.getElementById('nuevoCambio');
    var divNumTrans = document.getElementById('numTrans');

    if (divEfectivoRec) {
        divEfectivoRec.value = '';
    }

    if (divNuevoCambio) {
        divNuevoCambio.value = '';
        $("#totalCambio").html('$ -.--');
    }

    if (divNumTrans) {
        divNumTrans.value = '';
    }

    if (document.getElementById('cobrarVenta').disabled == false) {
        document.getElementById('cobrarVenta').disabled = true;
    }

    // SUMAR TOTAL DE PRECIOS
    sumarTotalPrecios();
    // AGREGAR IMPUESTO
    agregarImpuesto();

});
/*=============================================
MODIFICAR LA CANTIDAD AL ACTUALIZAR AUTOMATICO
=============================================*/
function updTotProd(idArt, cantNuevo, idprecioUnit) {

    var idPrecio = idArt + 'b'

    var precioUnit = document.getElementById(idprecioUnit).value;
    var precioTotal = parseInt(precioUnit) * parseInt(cantNuevo);

    var preTotalInput = document.getElementById(idPrecio);
    preTotalInput.value = precioTotal;

    var etiqTotal = '#' + idArt + 'total';
    $(etiqTotal).html(currencyFormat(precioTotal));

    var divEfectivoRec = document.getElementById('efectivoRecibido');
    var divNuevoCambio = document.getElementById('nuevoCambio');
    var divNumTrans = document.getElementById('numTrans');

    if (divEfectivoRec) {
        divEfectivoRec.value = '';
    }

    if (divNuevoCambio) {
        divNuevoCambio.value = '';
        $("#totalCambio").html('$ -.--');
    }

    if (divNumTrans) {
        divNumTrans.value = '';
    }

    if (document.getElementById('cobrarVenta').disabled == false) {
        document.getElementById('cobrarVenta').disabled = true;
    }

    // SUMAR TOTAL DE PRECIOS
    sumarTotalPrecios();
    // AGREGAR IMPUESTO
    agregarImpuesto();

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
            '<input type="number" id="efectivoRecibido" step="0.01" class="form-control text-center" required>' +
            '</div>' +
            '</div>' +
            '<div class="col-sm-6 text-center">' +
            '<div class="form-group">' +
            '<label>Cambio:</label>' +
            '<input type="hidden" id="nuevoCambio" class="form-control text-center" readonly="readonly" required>' +
            '<h4 id="totalCambio">$ -.--</h4>' +
            '</div>' +
            '</div>' +
            '</div>'
        )

        var divEfectivoRec = document.getElementById('efectivoRecibido');
        divEfectivoRec.focus();

    } else {

        if (fPago == 2) {

            var totalVentaActual = document.getElementById('totalVenta').value;

            $('#boxFormaPago').empty();

            $("#boxFormaPago").html(
                '<div class="row">' +
                '<div class="col-sm-6 text-center">' +
                '<div class="form-group">' +
                '<label>Monto Debitado:</label><label style="color:#C20F30">*</label>' +
                '<input type="number" id="montoDebitado" step="0.01" class="form-control text-center" readonly="readonly" value=' + totalVentaActual + ' required>' +
                '</div>' +
                '</div>' +
                '<div class="col-sm-6 text-center">' +
                '<div class="form-group">' +
                '<label># Transacción:</label><label style="color:#C20F30">*</label>' +
                '<input type="number" id="numTrans" class="form-control text-center" required>' +
                '</div>' +
                '</div>' +
                '</div>'
            )

            if (document.getElementById('cobrarVenta').disabled == true) {
                document.getElementById('cobrarVenta').disabled = false;
            }

            var divNumTrans = document.getElementById('numTrans');
            divNumTrans.focus();

        } else {

            if (fPago == 3) {

                $("#boxFormaPago").html(
                    '<div class="row">' +
                    '<div class="col-sm-6 text-center">' +
                    '<div class="form-group">' +
                    '<label>Monto Debitado:</label><label style="color:#C20F30">*</label>' +
                    '<input type="number" id="montoDebitado" step="0.01" class="form-control text-center" required>' +
                    '</div>' +
                    '</div>' +
                    '<div class="col-sm-6 text-center">' +
                    '<div class="form-group">' +
                    '<label># Transacción:</label><label style="color:#C20F30">*</label>' +
                    '<input type="number" id="numTrans" class="form-control text-center" required>' +
                    '</div>' +
                    '</div>' +
                    '</div>' +
                    '<div class="row">' +
                    '<div class="col-sm-6 text-center">' +
                    '<div class="form-group">' +
                    '<label>Recibido:</label><label style="color:#C20F30">*</label>' +
                    '<input type="number" id="efectivoRecibido" step="0.01" class="form-control text-center" required>' +
                    '</div>' +
                    '</div>' +
                    '<div class="col-sm-6 text-center">' +
                    '<div class="form-group">' +
                    '<label>Cambio:</label>' +
                    '<input type="hidden" id="nuevoCambio" class="form-control text-center" readonly="readonly" required>' +
                    '<h4 id="totalCambio">$ -.--</h4>' +
                    '</div>' +
                    '</div>' +
                    '</div>'
                )

                var divMontoDebitado = document.getElementById('montoDebitado');
                divMontoDebitado.focus();

            } else {

                $('#boxFormaPago').empty();

                if (document.getElementById('cobrarVenta').disabled == false) {
                    document.getElementById('cobrarVenta').disabled = true;
                }

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
    var formaPago = document.getElementById('formaPago').value;

    if (formaPago == 1) {

        if (Number(totalVenta) > Number(efectivoRec)) {

            Swal.fire({
                icon: 'warning',
                title: 'Efectivo ingresado insuficiente',
                text: "¡El efectivo ingresado es menor a la venta!"
            }).then(function (result) {

                if (document.getElementById('cobrarVenta').disabled == false) {
                    document.getElementById('cobrarVenta').disabled = true;
                }

                divCambio.value = '';
                $("#totalCambio").html('$ -.--');
                divEfectivoRec.value = '';
                divEfectivoRec.focus();
            });

        } else {

            var cambio = efectivoRec - totalVenta;

            divCambio.value = cambio;
            $("#totalCambio").html(currencyFormat(cambio));

            if (document.getElementById('cobrarVenta').disabled == true) {
                document.getElementById('cobrarVenta').disabled = false;
            }

        }

    } else {

        if (formaPago == 3) {

            var montoDebitado = document.getElementById('montoDebitado').value;

            var montoTotal = Number(efectivoRec) + Number(montoDebitado);

            if (Number(totalVenta) > Number(montoTotal)) {

                Swal.fire({
                    icon: 'warning',
                    title: 'Monto insuficiente',
                    text: "¡El monto ingresado es menor a la venta!"
                }).then(function (result) {

                    if (document.getElementById('cobrarVenta').disabled == false) {
                        document.getElementById('cobrarVenta').disabled = true;
                    }

                    divCambio.value = '';
                    $("#totalCambio").html('$ -.--');
                    divEfectivoRec.value = '';
                    divEfectivoRec.focus();
                });

            } else {

                var cambio = montoTotal - totalVenta;

                divCambio.value = cambio;
                $("#totalCambio").html(currencyFormat(cambio));

                if (document.getElementById('cobrarVenta').disabled == true) {
                    document.getElementById('cobrarVenta').disabled = false;
                }

            }

        }


    }


});

/*=============================================
FORMA DE PAGO - CAMBIO EN EFECTIVO
=============================================*/
$("#formularioVenta").on("change", "input#montoDebitado", function () {

    var divEfectivoRec = document.getElementById('efectivoRecibido');
    var divCambio = document.getElementById('nuevoCambio');
    var divMontoDebitado = document.getElementById('montoDebitado');
    var totalVenta = document.getElementById('totalVenta').value;
    var montoDebitado = divMontoDebitado.value;
    var formaPago = document.getElementById('formaPago').value;

    if (formaPago == 3) {

        if (Number(montoDebitado) >= Number(totalVenta)) {

            Swal.fire({
                icon: 'warning',
                title: 'Atención',
                text: "¡El monto debitado no puede ser mayor o igual al total de la venta!"
            }).then(function (result) {

                if (document.getElementById('cobrarVenta').disabled == false) {
                    document.getElementById('cobrarVenta').disabled = true;
                }

                divCambio.value = '';
                $("#totalCambio").html('$ -.--');
                divEfectivoRec.value = '';
                divMontoDebitado.value = '';
                divMontoDebitado.focus();

            });

        } else {

            var montoTotal = Number(divEfectivoRec.value) + Number(montoDebitado);

            var cambio = montoTotal - totalVenta;

            divCambio.value = cambio;
            $("#totalCambio").html(currencyFormat(cambio));

            if (document.getElementById('cobrarVenta').disabled == true) {
                document.getElementById('cobrarVenta').disabled = false;
            }

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
                '<input type="number" id="impuestoVenta" class="form-control text-center" min="0" max="50" required>' +
                '</div>' +
                '</div>' +
                '<div class="col-sm-6 text-center">' +
                '<div class="form-group">' +
                '<label>Total Impuesto:</label>' +
                '<input type="hidden" id="nuevoPrecioImpuesto" class="form-control text-center" value="0" step="0.01" readonly="readonly" required>' +
                '<h4 id="totalComision">$ -.--</h4>' +
                '</div>' +
                '</div>' +
                '</div>')

            document.getElementById('impuestoVenta').focus();

        } else {
            $('#impuestosBox').empty();
            var subtotal = document.getElementById('subtotalVenta').value;
            var boxTotal = document.getElementById('totalVenta');
            var formaPago = document.getElementById('formaPago').value;

            boxTotal.value = subtotal;
            $("#big_total").html(currencyFormat(Number(subtotal)));

            var divEfectivoRec = document.getElementById('efectivoRecibido');
            var divNuevoCambio = document.getElementById('nuevoCambio');
            var divNumTrans = document.getElementById('numTrans');
            var divMontoDebitado = document.getElementById('montoDebitado');

            if (divEfectivoRec) {
                divEfectivoRec.value = '';

            }

            if (divNuevoCambio) {
                divNuevoCambio.value = '';
                $("#totalCambio").html('$ -.--');
            }

            if (divNumTrans) {
                divNumTrans.value = '';
            }

            if (formaPago == 2) {

                if (divMontoDebitado) {
                    divMontoDebitado.value = subtotal;
                    divNumTrans.focus();
                }
    
            } else {
    
                if (divMontoDebitado) {
                    divMontoDebitado.value = '';
                    divMontoDebitado.focus();
                } else {
                    divEfectivoRec.focus();
                }
    
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

        var formaPago = document.getElementById('formaPago').value;

        var impuesto = boxImpuesto.value;
        var precioTotal = document.getElementById('subtotalVenta').value;

        var precioImpuesto = Number(precioTotal * impuesto / 100);

        var totalConImpuesto = Number(precioImpuesto) + Number(precioTotal);

        document.getElementById('nuevoPrecioImpuesto').value = precioImpuesto;
        document.getElementById('totalVenta').value = totalConImpuesto;

        $("#totalComision").html(currencyFormat(precioImpuesto));
        $("#big_total").html(currencyFormat(totalConImpuesto));

        var divEfectivoRec = document.getElementById('efectivoRecibido');
        var divNuevoCambio = document.getElementById('nuevoCambio');
        var divNumTrans = document.getElementById('numTrans');
        var divMontoDebitado = document.getElementById('montoDebitado');

        if (divEfectivoRec) {
            divEfectivoRec.value = '';

        }

        if (divNuevoCambio) {
            divNuevoCambio.value = '';
            $("#totalCambio").html('$ -.--');
        }

        if (divNumTrans) {
            divNumTrans.value = '';
        }

        if (formaPago == 2) {

            if (divMontoDebitado) {
                divMontoDebitado.value = totalConImpuesto;
                divNumTrans.focus();
            }

        } else {

            if (divMontoDebitado) {
                divMontoDebitado.value = '';
                divMontoDebitado.focus();
            } else {
                divEfectivoRec.focus();
            }

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

    var row = $(this).closest("tr").get(0);
    var oTable = $('#nuevoProdVenta').dataTable();
    oTable.fnDeleteRow(oTable.fnGetPosition(row));

    var totalItems = oTable.fnGetData().length;

    if (totalItems == 0) {

        $("#subtotalCompra").val(0.00);
        $("#totalCompra").val(0.00);
        $("#big_total").html('$ 0.00');
        $('#impuestosBox').empty();
        $('#boxFormaPago').empty();
        $(oTable).remove();

        window.location = "/punto_venta";

    } else {

        // SUMAR TOTAL DE PRECIOS
        sumarTotalPrecios();
        // AGREGAR IMPUESTO
        agregarImpuesto();

    }

});

/*=============================================
CREAR VENTA
=============================================*/
if (formularioVenta) {

    formularioVenta.addEventListener('submit', function (e) {
        e.preventDefault();

        Swal.fire({
            title: '¿Está seguro de querer procesar esta venta?',
            text: "¡Si no lo está puede cancelar la acción!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            cancelButtonText: 'Cancelar',
            confirmButtonText: 'Aceptar'
        }).then((result) => {
            if (result.value) {

                var payload = {};
                var boxImpuesto = document.getElementById('impuestoVenta');
                var numTrans = document.getElementById('numTrans');

                if (boxImpuesto) {
                    var impuesto = document.getElementById('nuevoPrecioImpuesto').value;
                } else {
                    var impuesto = 0.00;
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
                var tipoPago = listarFormasPago(formaPago);

                var cambioTotal = 0;
                var montoTotal = 0;

                for (var i = 0; i < tipoPago.length; i++) {

                    cambioTotal = Number(cambioTotal) + Number(tipoPago[i].cambio);
                    montoTotal = Number(montoTotal) + Number(tipoPago[i].monto);

                }

                if (Number(totalVenta) > Number(montoTotal)) {

                    Swal.fire({
                        icon: 'warning',
                        title: 'Efectivo ingresado insuficiente',
                        text: "¡El efectivo ingresado es menor a la venta!"
                    }).then(function (result) {

                        if (document.getElementById('cobrarVenta').disabled == false) {
                            document.getElementById('cobrarVenta').disabled = true;
                        }
                        var divCambio = document.getElementById('nuevoCambio');

                        divCambio.value = '';
                        $("#totalCambio").html('$ -.--');
                        divEfectivoRec.value = '';
                        divEfectivoRec.focus();
                    });

                } else {

                    payload.idcliente = clienteVenta;
                    payload.subtotal = subtotalVenta;
                    payload.impuesto = impuesto;
                    payload.redondeo = 0;
                    payload.total = totalVenta;
                    payload.monto = montoTotal;
                    payload.cambio = cambioTotal;
                    payload.listaTipoPago = tipoPago;
                    payload.num_transaccion = numTransaccion;
                    payload.status = 1;
                    payload.fecha = moment().format('YYYY-MM-DD H:mm:ss');
                    payload.listaProductos = listaProductos;

                    axios.post('/crear_venta', payload)
                        .then(function (respuesta) {

                            if (respuesta.data == 'OK') {

                                // Alerta
                                Swal.fire({
                                    icon: 'success',
                                    title: 'Venta Realizada!',
                                    text: 'Se realizó la venta correctamente.',
                                    allowOutsideClick: false
                                }).then(function (result) {
                                    if (result.value) {
                                        window.location = "/punto_venta";
                                    }
                                });


                            } else {
                                Swal.fire({
                                    icon: 'warning',
                                    title: 'Oops...',
                                    text: 'Hubo un error!'
                                })
                            }

                        }).catch(errors => {
                            Swal.fire({
                                icon: 'error',
                                title: 'Hubo un error',
                                text: 'Error en la Base de Datos'
                            })
                        })

                }
            }

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
LISTAR FORMAS DE PAGO
=============================================*/
function listarFormasPago(fpago) {

    var listaFormasPago = [];

    if (fpago == 1) {

        var efectivo = document.getElementById('efectivoRecibido').value;
        var cambio = document.getElementById('nuevoCambio').value;
        var consecutivo = 1;

        listaFormasPago.push({
            "tpa_num": consecutivo,
            "forma_pago": fpago,
            "monto": efectivo,
            "cambio": cambio,
            "num_transaccion": null
        })


    } else {

        if (fpago == 2) {

            var montoDebitado = document.getElementById('montoDebitado').value;
            var numTrans = document.getElementById('numTrans').value;
            var cambio = 0.00;
            var consecutivo = 1;

            listaFormasPago.push({
                "tpa_num": consecutivo,
                "forma_pago": fpago,
                "monto": montoDebitado,
                "cambio": cambio,
                "num_transaccion": numTrans
            })


        } else {

            if (fpago == 3) {

                var montoDebitado = document.getElementById('montoDebitado').value;
                var efectivo = document.getElementById('efectivoRecibido').value;
                var numTrans = document.getElementById('numTrans').value;
                var cambio = document.getElementById('nuevoCambio').value;

                listaFormasPago.push({
                    "tpa_num": 1,
                    "forma_pago": 1,
                    "monto": efectivo,
                    "cambio": cambio,
                    "num_transaccion": null

                })

                listaFormasPago.push({
                    "tpa_num": 2,
                    "forma_pago": 2,
                    "monto": montoDebitado,
                    "cambio": 0.00,
                    "num_transaccion": numTrans
                })

            }

        }
    }

    return listaFormasPago;

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
        $("#bodyVtas").remove();

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
                        '¡No existen registros con los filtros seleccionados!',
                        'error'
                    );

                } else {

                    var dataVtas = respuesta.data;

                    $("#cardVentas").append(
                        '<div class="card-body" id="bodyVtas">' +
                        '</div>'
                    );

                    $("#bodyVtas").append(
                        '<div id="btnOpciones" class="d-flex">' +
                        '<div class="btn-group ml-auto">' +
                        '<button type="button" id="btn-opciones-ventas" class="btn btn-info dropdown-toggle btn-sm" data-toggle="dropdown"data-display="static" aria-haspopup="true" aria-expanded="false">Opciones</button>' +
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
                            title: "# Corte"
                        },
                        {
                            title: "Cliente"
                        },
                        {
                            title: "Usuario"
                        },
                        {
                            title: "Subtotal", render: $.fn.dataTable.render.number(',', '.', 2)
                        },
                        {
                            title: "Comisión", render: $.fn.dataTable.render.number(',', '.', 2)
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
                            title: "Tipo Pago"
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
                                .column(7)
                                .data()
                                .reduce(function (a, b) {
                                    return intVal(a) + intVal(b);
                                }, 0);

                            //Total monto por pagina  
                            var pageTotal = api
                                .column(7, { page: 'current' })
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

                                $('#tbl-admin-ventas').append('<tfoot id="footerVenta" class="text-center"><tr class="totalPrice"><th></th><th></th><th></th><th></th><th></th><th></th><th></th><th></th><th></th></tr></tfoot>');

                                $('#footerVenta').find('th').eq(0).html("Total:");
                                $('#footerVenta').find('th').eq(7).html(totalxPagina + '<br/> (' + totalGlobal + ' total)');

                            }
                        }

                    })

                    //$('#footerVenta').remove();
                }

            }).catch(() => {
                Swal.fire({
                    icon: 'error',
                    title: 'Hubo un error',
                    text: 'Error en la base de datos'
                })
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

    var payload = {};

    var idNota = $(this).attr("idNota");
    var idCaja = $(this).attr("idCaja");

    payload.idNota = idNota;
    payload.idCaja = idCaja;

    axios.post('/det_ventas', payload)
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
                    bPaginate: false,
                    info: false,
                    columnDefs: [
                        { orderable: false, targets: '_all' }
                    ],
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
});

/*=============================================
FORMA PAGO VENTA
=============================================*/
$(document).on("click", "#btn-tipopago-vta", function () {

    $('#table_tipo_pago').DataTable().destroy();
    $("#table_tipo_pago").remove();
    $("#bodyTipopago").append(
        '<table id="table_tipo_pago" class="display table-bordered table-striped dt-responsive text-center" cellspacing="0" style="width:100%"> </table>'
    );

    var payload = {};

    var idNota = $(this).attr("idNota");
    var idCaja = $(this).attr("idCaja");

    payload.idNota = idNota;
    payload.idCaja = idCaja;

    console.log(payload);

    axios.post('/tipopago_ventas', payload)
        .then(function (respuesta) {

            const tblTipoPagoVtas = document.querySelector('#table_tipo_pago');

            if (tblTipoPagoVtas) {
                var dataSet = respuesta.data;

                $(tblTipoPagoVtas).DataTable({
                    data: dataSet,
                    deferRender: true,
                    iDisplayLength: 25,
                    retrieve: true,
                    processing: true,
                    fixedHeader: true,
                    responsive: true,
                    searching: false,
                    bPaginate: false,
                    info: false,
                    columnDefs: [
                        { orderable: false, targets: '_all' }
                    ],
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
                        title: "# Caja"
                    },
                    {
                        title: "# Nota"
                    },
                    {
                        title: "Forma de Pago"
                    },
                    {
                        title: "Monto", render: $.fn.dataTable.render.number(',', '.', 2)
                    },
                    {
                        title: "Cambio", render: $.fn.dataTable.render.number(',', '.', 2)
                    },
                    {
                        title: "Total", render: $.fn.dataTable.render.number(',', '.', 2)
                    },
                    {
                        title: "# Transacción"
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
});

$("#reservation").change(function () {

    $('#tbl-admin-ventas').DataTable().destroy();
    $("#tbl-admin-ventas").remove();
    $("#btnOpciones").remove();

});

/*=============================================
Exportar Venta
=============================================*/
$(document).on("click", "#btn-export-venta", function () {

    $('#btn-opciones-ventas').html('<span id="loading" class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>Exportando...').addClass('disabled');

    var payload = {};
    var periodoVtas = document.getElementById("reservation").value;
    var statusVtas = document.getElementById("statusVtas").value;

    if (statusVtas == "") {
        statusVtas = null;
    }

    var fecInicial = periodoVtas.split('-')[0];
    var fecFinal = periodoVtas.split('-')[1];

    payload.fecInicial = fecInicial;
    payload.fecFinal = fecFinal;
    payload.statusVtas = statusVtas;

    axios.post('/exportar_ventas', payload, {
        responseType: 'blob'
    }).then(function (respuesta) {

        var data = respuesta.data;

        $('#btn-opciones-ventas').html('Opciones').removeClass('disabled');

        if (data) {

            var blob = new Blob([data], { type: 'vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8' });
            FileSaver.saveAs(blob, 'reporte_ventas.xlsx');

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
                window.location = "/admin_ventas";
            }
        });
    });

});

/*=============================================
Imprimir Venta
=============================================*/
$(document).on("click", "#btn-print-venta", function () {

    $('#btn-opciones-ventas').html('<span id="loading" class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>Imprimiendo...').addClass('disabled');

    var payload = {};
    var periodoVtas = document.getElementById("reservation").value;
    var statusVtas = document.getElementById("statusVtas").value;

    if (statusVtas == "") {
        statusVtas = null;
    }

    var fecInicial = periodoVtas.split('-')[0];
    var fecFinal = periodoVtas.split('-')[1];

    payload.fecInicial = fecInicial;
    payload.fecFinal = fecFinal;
    payload.statusVtas = statusVtas;


    axios.post('/imprimir_ventas', payload)
        .then(function (respuesta) {

            $('#btn-opciones-ventas').html('Opciones').removeClass('disabled');

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
                    window.location = "/admin_ventas";
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
/*=============================================
Eliminar/Cancelar Venta
=============================================*/
$(document).on("click", "#btn-anular-venta", function () {

    Swal.fire({
        title: '¿Está seguro de anular la venta?',
        text: "¡Si no lo está puede cancelar la acción!",
        icon: 'warning',
        input: 'select',
        inputPlaceholder: 'Seleccione el motivo',
        inputOptions: {
            1: 'Error Sistema',
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

            var idNota = $(this).attr("idNota");
            var idCaja = $(this).attr("idCaja");

            payload.idNota = idNota;
            payload.idCaja = idCaja;
            payload.idMotivo = result.value;

            axios.put('/anular_venta', payload)
                .then(function (respuesta) {

                    if (respuesta.data == 'Ok') {
                        Swal.fire(
                            'Venta Anulada!',
                            'La venta fue anulada correctamente',
                            'success'
                        ).then(function (result) {
                            if (result.value) {
                                window.location = "/admin_ventas";
                            }
                        });

                    }
                }).catch(errors => {
                    Swal.fire({
                        icon: 'error',
                        title: 'Hubo un error',
                        text: 'Error en la Base de Datos'
                    })
                })
        }
    })

})

/*=============================================
Abrir caja
=============================================*/
$('#modalAbrirCaja').on('shown.bs.modal', function () {
    document.getElementById('montoApertura').focus();
});

$(document).on("click", "#btn-abrir-caja", function () {

    var idCaja = $(this).attr("idCaja");

    $("#idCajaAbrir").val(idCaja);

});

if (formAbrirCaja) {

    formAbrirCaja.addEventListener('submit', function (e) {
        e.preventDefault();

        var payload = {};
        var idCaja = document.getElementById('idCajaAbrir').value;
        var montoIni = document.getElementById('montoApertura').value;

        payload.idCaja = idCaja;
        payload.montoIni = montoIni;

        axios.put('/abrir_caja', payload)
            .then(function (respuesta) {

                if (respuesta.data == 'Ok') {

                    $('#modalAbrirCaja').modal('dispose');

                    Swal.fire({
                        title: 'Exito!',
                        text: 'Caja abierta correctamente!',
                        icon: 'success',
                        allowOutsideClick: false
                    }).then(function (result) {
                        if (result.value) {
                            window.location = "/punto_venta";
                        }
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

}

/*=============================================
RETIRO DE EFECTIVO
=============================================*/
if (formNewRetiro) {

    formNewRetiro.addEventListener('submit', function (e) {
        e.preventDefault();

        var payload = {};

        var efectivoCaja = Number.parseFloat(document.getElementById('efectivoCaja').value);
        var montoRetiro = Number.parseFloat(document.getElementById('montoRetiro').value);

        if (efectivoCaja >= montoRetiro) {

            payload.importe = montoRetiro;

            axios.post('/realizar_retiro', payload)
                .then(function (respuesta) {

                    if (respuesta.data == 'Ok') {

                        $("#modalRetirarEfec").remove();

                        Swal.fire({
                            title: 'Exito!',
                            text: 'Retiro de efectivo registrado correctamente!',
                            icon: 'success',
                            allowOutsideClick: false
                        }).then(function (result) {
                            if (result.value) {
                                window.location = "/punto_venta";
                            }
                        });
                    }

                }).catch(errors => {
                    Swal.fire({
                        icon: 'error',
                        title: 'Hubo un error',
                        text: 'Error en la Base de Datos'
                    })
                })

        } else {

            document.getElementById('montoRetiro').value = '';
            document.getElementById('montoRetiro').focus();

            $('#modalRetirarEfec').modal('dispose');

            Swal.fire({
                icon: 'warning',
                title: 'Efectivo insuficiente',
                text: 'El efectivo disponible en caja es menor al monto que se desea retirar!',
                allowOutsideClick: false
            })

        }
        /* var cantRet1000 = document.getElementById('cantRet1000').value;
        var cantRet500 = document.getElementById('cantRet500').value;
        var cantRet200 = document.getElementById('cantRet200').value;
        var cantRet100 = document.getElementById('cantRet100').value;
        var cantRet50 = document.getElementById('cantRet50').value;
        var cantRet20 = document.getElementById('cantRet20').value;
        var cantRet10 = document.getElementById('cantRet10').value;
        var cantRet5 = document.getElementById('cantRet5').value;
        var cantRet2 = document.getElementById('cantRet2').value;
        var cantRet1 = document.getElementById('cantRet1').value;
        var cantRet50c = document.getElementById('cantRet50c').value; */

        /* if (cantRet1000 == '') {
            var cantRet1000 = null;
        }

        if (cantRet500 == '') {
            var cantRet500 = null;
        }

        if (cantRet200 == '') {
            var cantRet200 = null;
        }

        if (cantRet100 == '') {
            var cantRet100 = null;
        }

        if (cantRet50 == '') {
            var cantRet50 = null;
        }

        if (cantRet20 == '') {
            var cantRet20 = null;
        }

        if (cantRet10 == '') {
            var cantRet10 = null;
        }

        if (cantRet5 == '') {
            var cantRet5 = null;
        }

        if (cantRet2 == '') {
            var cantRet2 = null;
        }

        if (cantRet1 == '') {
            var cantRet1 = null;
        }

        if (cantRet50c == '') {
            var cantRet50c = null;
        }
 */

        /* payload.den_1000_mxn = cantRet1000;
        payload.den_500_mxn = cantRet500;
        payload.den_200_mxn = cantRet200;
        payload.den_100_mxn = cantRet100;
        payload.den_50_mxn = cantRet50;
        payload.den_20_mxn = cantRet20;
        payload.den_10_mxn = cantRet10;
        payload.den_5_mxn = cantRet5;
        payload.den_2_mxn = cantRet2;
        payload.den_1_mxn = cantRet1;
        payload.den_50c_mxn = cantRet50c; */


    })

}

$('#modalRetirarEfec').on('shown.bs.modal', function () {
    document.getElementById('montoRetiro').focus();
});

/*=============================================
INGRESO DE EFECTIVO
=============================================*/
if (formNewIngreso) {

    formNewIngreso.addEventListener('submit', function (e) {
        e.preventDefault();

        var payload = {};

        var montoIngreso = document.getElementById('montoIngreso').value;
        /* var cantIng1000 = document.getElementById('cantIng1000').value;
        var cantIng500 = document.getElementById('cantIng500').value;
        var cantIng200 = document.getElementById('cantIng200').value;
        var cantIng100 = document.getElementById('cantIng100').value;
        var cantIng50 = document.getElementById('cantIng50').value;
        var cantIng20 = document.getElementById('cantIng20').value;
        var cantIng10 = document.getElementById('cantIng10').value;
        var cantIng5 = document.getElementById('cantIng5').value;
        var cantIng2 = document.getElementById('cantIng2').value;
        var cantIng1 = document.getElementById('cantIng1').value;
        var cantIng50c = document.getElementById('cantIng50c').value; */

        /* if (cantIng1000 == '') {
            var cantIng1000 = null;
        }

        if (cantIng500 == '') {
            var cantIng500 = null;
        }

        if (cantIng200 == '') {
            var cantIng200 = null;
        }

        if (cantIng100 == '') {
            var cantIng100 = null;
        }

        if (cantIng50 == '') {
            var cantIng50 = null;
        }

        if (cantIng20 == '') {
            var cantIng20 = null;
        }

        if (cantIng10 == '') {
            var cantIng10 = null;
        }

        if (cantIng5 == '') {
            var cantIng5 = null;
        }

        if (cantIng2 == '') {
            var cantIng2 = null;
        }

        if (cantIng1 == '') {
            var cantIng1 = null;
        }

        if (cantIng50c == '') {
            var cantIng50c = null;
        } */

        payload.importe = montoIngreso;
        /* payload.den_1000_mxn = cantIng1000;
        payload.den_500_mxn = cantIng500;
        payload.den_200_mxn = cantIng200;
        payload.den_100_mxn = cantIng100;
        payload.den_50_mxn = cantIng50;
        payload.den_20_mxn = cantIng20;
        payload.den_10_mxn = cantIng10;
        payload.den_5_mxn = cantIng5;
        payload.den_2_mxn = cantIng2;
        payload.den_1_mxn = cantIng1;
        payload.den_50c_mxn = cantIng50c; */

        axios.post('/realizar_ingreso', payload)
            .then(function (respuesta) {

                if (respuesta.data == 'Ok') {

                    $("#modalIngresarEfec").remove();

                    Swal.fire(
                        'Exito!',
                        'Ingreso de efectivo registrado correctamente!',
                        'success'
                    ).then(function (result) {
                        if (result.value) {
                            window.location = "/punto_venta";
                        }
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

}

$('#modalIngresarEfec').on('shown.bs.modal', function () {
    document.getElementById('montoIngreso').focus();
});

/*=============================================
CORTE DE CAJA
=============================================*/
$(document).on("click", "#corteCajaBtn", function () {

    $('#tbl-info-cortecaja').DataTable().destroy();
    $("#tbl-info-cortecaja").remove();
    $("#bodyDetCorte").append(
        '<table id="tbl-info-cortecaja" class="display table-bordered table-striped dt-responsive text-center" cellspacing="0" style="width:100%"> </table>'
    );

    var payload = {};

    var idInfoCaja = $(this).attr("idBtn");

    var idCaja = idInfoCaja.split('-')[0];
    var idCorte = idInfoCaja.split('-')[1];

    payload.idcaja = idCaja;
    payload.idcorte = idCorte;

    axios.post('/info_corte_caja', payload)
        .then(function (respuesta) {

            const tblCorte = document.querySelector('#tbl-info-cortecaja');

            if (tblCorte) {

                var dataSet = respuesta.data;

                $(tblCorte).DataTable({
                    data: dataSet,
                    deferRender: true,
                    iDisplayLength: 25,
                    retrieve: true,
                    processing: true,
                    fixedHeader: true,
                    responsive: true,
                    searching: false,
                    bPaginate: false,
                    info: false,
                    columnDefs: [
                        { orderable: false, targets: '_all' }
                    ],
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
                    createdRow: function (row, data, dataIndex) {
                        var indx = data[0];
                        //Pintar toda la columna
                        if (indx === 6) {
                            $(row).find('td:eq(0)').css('background-color', '#E7F3F1');
                            $(row).find('td:eq(1)').css('background-color', '#E7F3F1');
                            $(row).find('td:eq(2)').css('background-color', '#E7F3F1');
                        }
                    },
                    columns: [{
                        title: "#"
                    }, {
                        title: "Concepto"
                    },
                    {
                        title: "Detalles"
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

});

$('#modalCorteCaja').on('shown.bs.modal', function () {
    document.getElementById('montoCierre').focus();
});


if (formCorteCaja) {

    formCorteCaja.addEventListener('submit', function (e) {
        e.preventDefault();

        var payload = {};

        var montoCierre = Number.parseFloat(document.getElementById('montoCierre').value);
        var sumaMonto = Number.parseFloat(document.getElementById('efectivoCaja').value);

        /*var cantCorte1000 = document.getElementById('cantCorte1000').value;
        var cantCorte500 = document.getElementById('cantCorte500').value;
        var cantCorte200 = document.getElementById('cantCorte200').value;
        var cantCorte100 = document.getElementById('cantCorte100').value;
        var cantCorte50 = document.getElementById('cantCorte50').value;
        var cantCorte20 = document.getElementById('cantCorte20').value;
        var cantCorte10 = document.getElementById('cantCorte10').value;
        var cantCorte5 = document.getElementById('cantCorte5').value;
        var cantCorte2 = document.getElementById('cantCorte2').value;
        var cantCorte1 = document.getElementById('cantCorte1').value;
        var cantCorte50c = document.getElementById('cantCorte50c').value;*/

        var diferencia = montoCierre - sumaMonto;

        /*if (cantCorte1000 == '') {
            var cantCorte1000 = null;
        }

        if (cantCorte500 == '') {
            var cantCorte500 = null;
        }

        if (cantCorte200 == '') {
            var cantCorte200 = null;
        }

        if (cantCorte100 == '') {
            var cantCorte100 = null;
        }

        if (cantCorte50 == '') {
            var cantCorte50 = null;
        }

        if (cantCorte20 == '') {
            var cantCorte20 = null;
        }

        if (cantCorte10 == '') {
            var cantCorte10 = null;
        }

        if (cantCorte5 == '') {
            var cantCorte5 = null;
        }

        if (cantCorte2 == '') {
            var cantCorte2 = null;
        }

        if (cantCorte1 == '') {
            var cantCorte1 = null;
        }

        if (cantCorte50c == '') {
            var cantCorte50c = null;
        }*/

        payload.importe = montoCierre;
        /*payload.den_1000_mxn = cantCorte1000;
        payload.den_500_mxn = cantCorte500;
        payload.den_200_mxn = cantCorte200;
        payload.den_100_mxn = cantCorte100;
        payload.den_50_mxn = cantCorte50;
        payload.den_20_mxn = cantCorte20;
        payload.den_10_mxn = cantCorte10;
        payload.den_5_mxn = cantCorte5;
        payload.den_2_mxn = cantCorte2;
        payload.den_1_mxn = cantCorte1;
        payload.den_50c_mxn = cantCorte50c;*/
        payload.diferencia = diferencia;

        Swal.fire({
            title: '¿Está seguro de realizar el corte de caja?',
            text: "¡Si no lo está puede cancelar la acción!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            cancelButtonText: 'Cancelar',
            confirmButtonText: 'Si, cerrar!'
        }).then((result) => {
            if (result.value) {

                axios.post('/corte_caja', payload)
                    .then(function (respuesta) {

                        $("#modalCorteCaja").remove();

                        Swal.fire({
                            title: 'Exito!',
                            text: 'La caja se cerró correctamente!',
                            icon: 'success',
                            allowOutsideClick: false
                        }).then(function (result) {
                            if (result.value) {
                                window.location = "/punto_venta";
                            }
                        });

                    }).catch(errors => {
                        Swal.fire({
                            icon: 'error',
                            title: 'Hubo un error',
                            text: 'Error en la Base de Datos'
                        })
                    })
            }
        })


    })

}
/*=============================================
NUEVA CAJA
=============================================*/
$(document).on("click", "#btn-agregar-caja", function () {

    Swal.fire({
        title: '¿Está seguro de agregar una nueva caja?',
        text: "¡Si no lo está puede cancelar la acción!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Si, agregar!'
    }).then((result) => {
        if (result.value) {

            axios.post('/cajas')
                .then(function (respuesta) {

                    Swal.fire(
                        'Exito!',
                        'Se agregó correctamente la caja!',
                        'success'
                    ).then(function (result) {
                        if (result.value) {
                            window.location = "/admin_cajas";
                        }
                    });

                }).catch(errors => {
                    Swal.fire({
                        icon: 'error',
                        title: 'Hubo un error',
                        text: 'Error en la Base de Datos'
                    })
                })
        }
    })
})

/*=============================================
CONSULTAR ARTICULO
=============================================*/
$('#modalSearchProd').on('shown.bs.modal', function () {
    document.getElementById('codBarArt').focus();
});

if (formSearchArt) {

    formSearchArt.addEventListener('submit', function (e) {
        e.preventDefault();

        $("#bodyDetProducto").remove();

        var idArt = document.getElementById('codBarArt').value;

        var route = '/productos/' + idArt;

        axios.get(route)
            .then(function (respuesta) {

                if (respuesta.data.length > 0) {

                    $("#modalSearchProd").removeClass('fade').modal('hide');
                    $("#modalVerProd").modal("show");
                    document.getElementById('codBarArt').value = '';

                    var dataSet = respuesta.data[0];

                    if (dataSet.bar_code == '') {
                        var codBar = '------'
                    } else {
                        var codBar = dataSet.bar_code;
                    }

                    $("#ver-producto").append(
                        '<div id="bodyDetProducto">' +
                        '<div class="row">' +
                        '<div class="col-sm-12">' +
                        '<h2>' + dataSet.idproducto + ' / ' + dataSet.producto + '</h2>' +
                        '</div>' +
                        '</div>' +
                        '<hr>' +
                        '<div class="row">' +
                        '<div class="col-sm-7">' +
                        '<dl class="row">' +
                        '<dt class="col-sm-4">Código Barras:</dt>' +
                        '<dd class="col-sm-8">' + codBar + '</dd>' +
                        '<dt class="col-sm-4">Marca:</dt>' +
                        '<dd class="col-sm-8">' + dataSet.marca + '</dd>' +
                        '<dt class="col-sm-4">Categoria:</dt>' +
                        '<dd class="col-sm-8">' + dataSet.categoria + '</dd >' +
                        '<dt class="col-sm-4">Proveedor:</dt>' +
                        '<dd class="col-sm-8">' + dataSet.proveedor + '</dd>' +
                        '</dl>' +
                        '</div>' +
                        '<div class="col-sm-5">' +
                        '<dl class="row">' +
                        '<dt class="col-sm-4">Stock:</dt>' +
                        '<dd class="col-sm-8">' + dataSet.stock_total + '</dd>' +
                        '<dt class="col-sm-4">Mayoreo:</dt>' +
                        '<dd class="col-sm-8">' + currencyFormat(dataSet.pre_mayoreo) + '</dd>' +
                        '<dt class="col-sm-4">Menudeo:</dt>' +
                        '<dd class="col-sm-8">' + currencyFormat(dataSet.pre_menudeo) + '</dd >' +
                        '<dt class="col-sm-4">Alta:</dt>' +
                        '<dd class="col-sm-8">' + moment(dataSet.fecha_creacion).format('DD/MM/YYYY hh:mm a') + '</dd>' +
                        '</dl>' +
                        '</div>' +
                        '</div>' +
                        '</div>'
                    );

                } else {

                    Swal.fire({
                        icon: 'warning',
                        title: 'Oops...',
                        text: 'El producto no existe o esta inactivo!',
                    })

                }

            }).catch(errors => {
                Swal.fire({
                    icon: 'error',
                    title: 'Hubo un error',
                    text: 'Error en la Base de Datos'
                })
            })

    });

}
