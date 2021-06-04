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
        //no recuerdo la fuente pero lo recomiendan para
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
        var route = '/productos_only/' + codigo;
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
                    var precio = dataSet[0].pre_costo_neto;

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

                    //agregarImpuesto();

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


    // AGRUPAR PRODUCTOS EN FORMATO JSON

    //listarProductos()

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

            console.log('aqui');

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
var idQuitarProducto = [];
localStorage.removeItem("quitarProducto");

$("#formularioCompra").on("click", "button.quitarProducto", function () {

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

    var prodItem = $(".nuevaDescripcionProducto");
    var formaPago = document.getElementById('fPagoCompra').value;

    if (prodItem.length == 0) {
        $("#subtotalCompra").val(0.00);
        $("#totalCompra").val(0.00);
        $("#big_total").html('$ 0.00');
        $('#impuestosBox').empty();
        $('#boxFormaPago').empty();

        if (selectProveedores.value > 0) {
            selectProveedores.value = 0;
            if (selectProveedores.disabled == false) {
                selectProveedores.disabled = true;
            }
        } else {
            if (selectProveedores.disabled == false) {
                selectProveedores.disabled = true;
            }
        }

        if (formaPago > 0) {
            document.getElementById('fPagoCompra').value = 0;

            if (document.getElementById('fPagoCompra').disabled == false) {
                document.getElementById('fPagoCompra').disabled = true;
            }
        }

        if (checkImpCom.disabled == false) {
            checkImpCom.disabled = true;
        }

        if (document.getElementById('checkRed').disabled == false) {
            document.getElementById('checkRed').disabled = true;
        }

        if (checkImpCom.checked == true) {
            checkImpCom.checked = false;
        }

        if (document.getElementById('checkRed').checked == true) {
            document.getElementById('checkRed').checked = false;
        }

        barCode.focus();

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

        //payload.idcaja = 1;
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

        console.log(payload);

        axios.post('/crear_compra', payload)
            .then(function (respuesta) {
                console.log(respuesta);
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