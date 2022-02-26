import axios from 'axios';
import Swal from 'sweetalert2';
import moment from 'moment';

const formCategoria = document.getElementById('formNewcategoria');
const formEditCategoria = document.getElementById('formEditCategoria');
const formNewMarca = document.getElementById('formNewMarca');
const formEditMarca = document.getElementById('formEditMarca');
const formNewPres = document.getElementById('formNewPres');
const formEditPres = document.getElementById('formEditPres');
const formNewProducto = document.getElementById('formNewProducto');
const formEditProducto = document.getElementById('formEditProducto');
const formMovsProd = document.getElementById('formMovsProd');
const formEntradaProd = document.getElementById('formEntradaProd');
const formSalidaProd = document.getElementById('formSalidaProd');
const formHistPrec = document.getElementById('formHistPrec');
const formConfigPrec = document.getElementById('formConfigPrec');
const formAjustePrecio = document.getElementById('formAjustePrecio');

const tblCategorias = document.querySelector('#tbl-categorias');
const tblMarcas = document.querySelector('#tbl-marcas');
const tblPres = document.querySelector('#tbl-presentaciones');
const tblProd = document.querySelector('#tbl-productos');

const mesInv = document.getElementById("mesInv");
const selProd = document.getElementById("selProd");
const motEntrada = document.getElementById("motEntrada");
const motSalida = document.getElementById("motSalida");
const idProdMov = document.getElementById("idProdMov");
const codProducto = document.getElementById("codProducto");
const tipPrecio = document.getElementById("tipPrecio");

const categoriaPermCrear = document.getElementById('categoriaPermCrear');
const marcaPermCrear = document.getElementById('marcaPermCrear');
const presentacionPermCrear = document.getElementById('presentacionPermCrear');
const productoPermCrear = document.getElementById('productoPermCrear');

(function () {
    /*=============================================
        Data Table Categorias
    =============================================*/
    if (tblCategorias) {
        axios.get('/categorias/all')
            .then(function (respuesta) {

                if (respuesta.data != 'empty') {

                    var dataSet = respuesta.data;

                    $(tblCategorias).DataTable({
                        data: dataSet,
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
                            title: "#"
                        },
                        {
                            title: "ID Categoria"
                        },
                        {
                            title: "Categoria"
                        },
                        {
                            title: "Fecha de Creación"
                        },
                        {
                            title: "Estatus"
                        },
                        {
                            title: "Acciones"
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

    if(categoriaPermCrear){
        
        var permisoCrear = categoriaPermCrear.value;

        if(permisoCrear > 0){
            document.getElementById('btn-agregar-categoria').disabled = false;
        }else{
            document.getElementById('btn-agregar-categoria').disabled = true;
        }

    }

    /*=============================================
        Data Table Marcas
    =============================================*/
    if (tblMarcas) {

        axios.get('/marcas/all')
            .then(function (respuesta) {

                if (respuesta.data != 'empty') {

                    var dataSet = respuesta.data;

                    $(tblMarcas).DataTable({
                        data: dataSet,
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
                            title: "#"
                        },
                        {
                            title: "ID Marca"
                        },
                        {
                            title: "Marca"
                        },
                        {
                            title: "Fecha de Creación"
                        },
                        {
                            title: "Estatus"
                        },
                        {
                            title: "Acciones"
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

    if(marcaPermCrear){
        
        var permisoCrear = marcaPermCrear.value;

        if(permisoCrear > 0){
            document.getElementById('btn-agregar-marca').disabled = false;
        }else{
            document.getElementById('btn-agregar-marca').disabled = true;
        }

    }

    /*=============================================
        Data Table Presentaciones
    =============================================*/
    if (tblPres) {

        axios.get('/presentaciones/all')
            .then(function (respuesta) {

                if (respuesta.data != 'empty') {

                    var dataSet = respuesta.data;

                    $(tblPres).DataTable({
                        data: dataSet,
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
                            title: "#"
                        },
                        {
                            title: "ID Presentación"
                        },
                        {
                            title: "Presentación"
                        },
                        {
                            title: "Abreviatura"
                        },
                        {
                            title: "Fecha de Creación"
                        },
                        {
                            title: "Estatus"
                        },
                        {
                            title: "Acciones"
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

    if(presentacionPermCrear){
        
        var permisoCrear = presentacionPermCrear.value;

        if(permisoCrear > 0){
            document.getElementById('btn-agregar-presentacion').disabled = false;
        }else{
            document.getElementById('btn-agregar-presentacion').disabled = true;
        }

    }

    /*=============================================
        Data Table Productos
    =============================================*/
    if (tblProd) {
        axios.get('/productos/all')
            .then(function (respuesta) {

                if (respuesta.data != 'empty') {

                    var dataSet = respuesta.data;

                    $(tblProd).DataTable({
                        data: dataSet,
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
                        createdRow: function (row, data, dataIndex) {
                            var stock = data[9];
                            //Pintar toda la columna
                            if (stock <= 10 && stock != null) {
                                $(row).find('td:eq(9)').css('background-color', '#FFEAEA');
                            } else if (stock > 10 && stock <= 15) {
                                $(row).find('td:eq(9)').css('background-color', '#FFFBDF');
                            } else {
                                if (stock != null) {
                                    $(row).find('td:eq(9)').css('background-color', '#E7F3F1');
                                }
                            }
                        },
                        columns: [{
                            title: "#"
                        },
                        {
                            title: "Imagen"
                        },
                        {
                            title: "Código"
                        },
                        {
                            title: "Descripción"
                        },
                        {
                            title: "Código de barras"
                        },
                        {
                            title: "Marca"
                        },
                        {
                            title: "Categoria"
                        },
                        {
                            title: "Presentación"
                        },
                        {
                            title: "Proveedor"
                        },
                        {
                            title: "Stock"
                        },
                        {
                            title: "Precio Costo"
                        },
                        {
                            title: "Precio Costo Neto"
                        },
                        {
                            title: "Precio Mayoreo"
                        },
                        {
                            title: "Precio Menudeo"
                        },
                        {
                            title: "Fecha de Alta"
                        },
                        {
                            title: "Status"
                        },
                        {
                            title: "Acciones"
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

    if(productoPermCrear){
        
        var permisoCrear = productoPermCrear.value;

        if(permisoCrear > 0){
            document.getElementById('btn-agregar-producto').disabled = false;
        }else{
            document.getElementById('btn-agregar-producto').disabled = true;
        }

    }

    /*=============================================
    RANGO DE CONSULTA - MES DE INVENTARIO
    =============================================*/
    if (mesInv) {

        $(mesInv).each(function () {
            $(this).datepicker({
                autoclose: true,
                format: "yyyy-mm",
                viewMode: "months",
                minViewMode: "months",
                language: 'es'
            });
            $(this).datepicker('clearDates');
        });

    }

    /*=============================================
    SELECT 2
    =============================================*/
    if (selProd) {
        //$(selProd).select2();

        axios.get('/productos/all')
            .then(function (respuesta) {

                var dataProductos = respuesta.data;

                dataProductos.forEach(function (valor, indice, array) {

                    var idProd = valor[2];
                    var descProd = valor[3];

                    $("<option />")
                        .attr("value", idProd)
                        .html(descProd)
                        .appendTo(selProd);

                })

            }).catch(errors => {
                Swal.fire({
                    icon: 'error',
                    title: 'Hubo un error',
                    text: 'Error en la Base de Datos'
                })
            })
    }


    /*=============================================
    SELECT MOTIVOS
    =============================================*/
    if (motEntrada) {

        axios.get('/motivos_entrada_inv')
            .then(function (respuesta) {

                var dataMotivos = respuesta.data;

                dataMotivos.forEach(function (valor, indice, array) {

                    var idMot = valor[0];
                    var motivo = valor[1];

                    $("<option />")
                        .attr("value", idMot)
                        .html(motivo)
                        .appendTo(motEntrada);

                })

            }).catch(errors => {
                Swal.fire({
                    icon: 'error',
                    title: 'Hubo un error',
                    text: 'Error en la Base de Datos'
                })
            })
    }

    if (motSalida) {

        axios.get('/motivos_salida_inv')
            .then(function (respuesta) {

                var dataMotivos = respuesta.data;

                dataMotivos.forEach(function (valor, indice, array) {

                    var idMot = valor[0];
                    var motivo = valor[1];

                    $("<option />")
                        .attr("value", idMot)
                        .html(motivo)
                        .appendTo(motSalida);

                })

            }).catch(errors => {
                Swal.fire({
                    icon: 'error',
                    title: 'Hubo un error',
                    text: 'Error en la Base de Datos'
                })
            })

    }

})();

/*=============================================
Agregar Categoria
=============================================*/
if (formCategoria) {

    formCategoria.addEventListener('submit', function (e) {
        e.preventDefault();

        var payload = {};

        var categoria = document.getElementById("newCategoria").value;

        payload.categoria = categoria;
        payload.status = 1;
        payload.fecha_creacion = moment().format('YYYY-MM-DD H:mm:ss');

        if (payload.categoria == "") {

            Swal.fire({
                icon: 'warning',
                title: 'Oops...',
                text: 'Es necesario indicar la nueva categoria!',
            })

        } else {

            axios.post('/categorias', payload)
                .then(function (respuesta) {

                    if (respuesta.data == "Repetido") {

                        $('#modalAgregarCategoria').modal('dispose');

                        // Alerta
                        Swal.fire(
                            'La categoria ya existe',
                            'La categoria ingresada ya existe en la base de datos!',
                            'warning'
                        ).then(function (result) {
                            if (result.value) {
                                window.location = "/categorias";
                            }
                        });

                    } else {

                        $("#modalAgregarCategoria").remove();

                        Swal.fire(
                            'Categoria Creada!',
                            respuesta.data,
                            'success'
                        ).then(function (result) {
                            if (result.value) {
                                window.location = "/categorias";
                            }
                        });

                    }
                }).catch(() => {
                    Swal.fire({
                        icon: 'error',
                        title: 'Hubo un error',
                        text: 'No se pudo crear la Categoria'
                    })
                })
        }
    });

}

$('#modalAgregarCategoria').on('shown.bs.modal', function () {
    document.getElementById('newCategoria').focus();
});


/*=============================================
Editar Categoria
=============================================*/
$(document).on("click", "#btn-editar-categoria", function () {

    var idCategoria = $(this).attr("idCategoria");

    var route = '/categorias/' + idCategoria;

    axios.get(route)
        .then(function (respuesta) {

            var idCategoria = respuesta.data[0].idcategoria;
            var categoria = respuesta.data[0].categoria;

            $("#editIdCategoria").val(idCategoria);
            $("#editCategoria").val(categoria);

        }).catch(errors => {
            Swal.fire({
                icon: 'error',
                title: 'Hubo un error',
                text: 'Error en la Base de Datos'
            })
        })
});

if (formEditCategoria) {

    formEditCategoria.addEventListener('submit', function (e) {
        e.preventDefault();

        var idCategoria = document.getElementById("editIdCategoria").value;
        var updCategoria = document.getElementById("editCategoria").value;

        var payload = {};

        payload.newCategoria = updCategoria;

        var route = '/categorias/' + idCategoria;

        axios.put(route, payload)
            .then(function (respuesta) {

                if (respuesta.data == 'Igual') {

                    $('#modalEditarCategoria').modal('dispose');

                    Swal.fire(
                        'Oops...',
                        'No se detectan cambios!',
                        'warning'
                    ).then(function (result) {
                        if (result.value) {
                            window.location = "/categorias";
                        }
                    });

                } else {

                    if (respuesta.data == 'Repetido') {

                        $('#modalEditarCategoria').modal('dispose');

                        Swal.fire(
                            'La categoria ya existe',
                            'La categoria ingresada ya existe en la base de datos!',
                            'warning'
                        ).then(function (result) {
                            if (result.value) {
                                window.location = "/categorias";
                            }
                        });

                    } else {

                        $("#modalEditarCategoria").remove();

                        Swal.fire(
                            'Categoria Actualizada',
                            respuesta.data,
                            'success'
                        ).then(function (result) {
                            if (result.value) {
                                window.location = "/categorias";
                            }
                        });
                    }
                }

            })

    })
}

$('#modalEditarCategoria').on('shown.bs.modal', function () {
    document.getElementById('editCategoria').focus();
});


/*=============================================
Activar/Desactivar Categorias
=============================================*/
$(document).on("click", "#btn-estatus-categoria", function () {

    var idCategoria = $(this).attr("idCategoria");
    var estadoCategoria = $(this).attr("estadoCategoria");

    var payload = {};

    payload.idCategoria = idCategoria;
    payload.estadoCategoria = estadoCategoria;

    axios.put('/categorias', payload)
        .then(function (respuesta) {
            if (window.matchMedia("(max-width:767px)").matches) {

                Swal.fire(
                    'Categoria Actualizada',
                    respuesta.data,
                    'success'
                ).then(function (result) {
                    if (result.value) {
                        window.location = "/categorias";
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

    if (estadoCategoria == 0) {

        $(this).removeClass('btn-success');
        $(this).addClass('btn-danger');
        $(this).html('Desactivado');
        $(this).attr('estadoCategoria', 1);

    } else {

        $(this).addClass('btn-success');
        $(this).removeClass('btn-danger');
        $(this).html('Activado');
        $(this).attr('estadoCategoria', 0);
    }
});

/*=============================================
Eliminar Categoria
=============================================*/
$(document).on("click", "#btn-eliminar-categoria", function () {

    var idCategoria = $(this).attr("idCategoria");

    Swal.fire({
        title: '¿Está seguro de borrar la categoria?',
        text: "¡Si no lo está puede cancelar la acción!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Si, borrar!'
    }).then((result) => {
        if (result.value) {

            var route = '/categorias/' + idCategoria;

            console.log(route);

            axios.delete(route)
                .then(function (respuesta) {
                    //console.log(respuesta);
                    Swal.fire(
                        'Eliminado!',
                        respuesta.data,
                        'success'
                    ).then(function (result) {
                        if (result.value) {
                            window.location = "/categorias";
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
});
/*=============================================
Agregar Marca
=============================================*/
if (formNewMarca) {

    formNewMarca.addEventListener('submit', function (e) {
        e.preventDefault();

        var payload = {};

        var marca = document.getElementById("newMarca").value;

        payload.marca = marca;
        payload.status = 1;
        payload.fecha_creacion = moment().format('YYYY-MM-DD H:mm:ss');

        if (payload.marca == "") {

            Swal.fire({
                icon: 'warning',
                title: 'Oops...',
                text: 'Es necesario indicar la nueva marca!',
            })

        } else {

            axios.post('/marcas', payload)
                .then(function (respuesta) {

                    if (respuesta.data == "Repetido") {

                        $('#modalAgregarMarca').modal('dispose');

                        // Alerta
                        Swal.fire(
                            'La marca ya existe',
                            'La marca que se capturó ya existe en la base de datos!',
                            'warning'
                        ).then(function (result) {
                            if (result.value) {
                                window.location = "/marcas";
                            }
                        });

                    } else {

                        $("#modalAgregarMarca").remove();

                        Swal.fire(
                            'Marca Creada!',
                            respuesta.data,
                            'success'
                        ).then(function (result) {
                            if (result.value) {
                                window.location = "/marcas";
                            }
                        });

                    }
                }).catch(() => {
                    Swal.fire({
                        icon: 'error',
                        title: 'Hubo un error',
                        text: 'No se pudo crear la Marca'
                    })
                })
        }
    });

}

$('#modalAgregarMarca').on('shown.bs.modal', function () {
    document.getElementById('newMarca').focus();
});

/*=============================================
Activar/Desactivar Marcas
=============================================*/
$(document).on("click", "#btn-estatus-marca", function () {

    var idMarca = $(this).attr("idMarca");
    var estadoMarca = $(this).attr("estadoMarca");

    var payload = {};

    payload.idMarca = idMarca;
    payload.estadoMarca = estadoMarca;

    axios.put('/marcas', payload)
        .then(function (respuesta) {
            if (window.matchMedia("(max-width:767px)").matches) {

                Swal.fire(
                    'Marca Actualizada',
                    respuesta.data,
                    'success'
                ).then(function (result) {
                    if (result.value) {
                        window.location = "/marcas";
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

    if (estadoMarca == 0) {

        $(this).removeClass('btn-success');
        $(this).addClass('btn-danger');
        $(this).html('Desactivado');
        $(this).attr('estadoMarca', 1);

    } else {

        $(this).addClass('btn-success');
        $(this).removeClass('btn-danger');
        $(this).html('Activado');
        $(this).attr('estadoMarca', 0);
    }
});


/*=============================================
Editar Marca
=============================================*/
$(document).on("click", "#btn-editar-marca", function () {

    var idMarca = $(this).attr("idMarca");

    var route = '/marcas/' + idMarca;

    axios.get(route)
        .then(function (respuesta) {

            var idMarca = respuesta.data[0].idmarca;
            var marca = respuesta.data[0].marca;

            $("#editIdMarca").val(idMarca);
            $("#editMarca").val(marca);

        }).catch(errors => {
            Swal.fire({
                icon: 'error',
                title: 'Hubo un error',
                text: 'Error en la Base de Datos'
            })
        })
});

if (formEditMarca) {

    formEditMarca.addEventListener('submit', function (e) {
        e.preventDefault();

        var idMarca = document.getElementById("editIdMarca").value;
        var updMarca = document.getElementById("editMarca").value;

        var payload = {};

        payload.newMarca = updMarca;

        var route = '/marcas/' + idMarca;

        axios.put(route, payload)
            .then(function (respuesta) {

                if (respuesta.data == 'Igual') {

                    $('#modalEditarMarca').modal('dispose');

                    Swal.fire(
                        'Oops...',
                        'No se detectan cambios!',
                        'warning'
                    ).then(function (result) {
                        if (result.value) {
                            window.location = "/marcas";
                        }
                    });

                } else {

                    if (respuesta.data == 'Repetido') {

                        $('#modalEditarMarca').modal('dispose');

                        Swal.fire(
                            'La marca ya existe',
                            'La marca ingresada ya existe en la base de datos!',
                            'warning'
                        ).then(function (result) {
                            if (result.value) {
                                window.location = "/marcas";
                            }
                        });

                    } else {

                        $("#modalEditarMarca").remove();

                        Swal.fire(
                            'Marca Actualizada',
                            respuesta.data,
                            'success'
                        ).then(function (result) {
                            if (result.value) {
                                window.location = "/marcas";
                            }
                        });
                    }
                }

            })

    })
}

$('#modalEditarMarca').on('shown.bs.modal', function () {
    document.getElementById('editMarca').focus();
});

/*=============================================
Eliminar Marca
=============================================*/
$(document).on("click", "#btn-eliminar-marca", function () {

    var idMarca = $(this).attr("idMarca");

    Swal.fire({
        title: '¿Está seguro de borrar la marca?',
        text: "¡Si no lo está puede cancelar la acción!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Si, borrar!'
    }).then((result) => {
        if (result.value) {

            var route = '/marcas/' + idMarca;

            axios.delete(route)
                .then(function (respuesta) {
                    //console.log(respuesta);
                    Swal.fire(
                        'Eliminado!',
                        respuesta.data,
                        'success'
                    ).then(function (result) {
                        if (result.value) {
                            window.location = "/marcas";
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
});

/*=============================================
Agregar presentacion
=============================================*/
if (formNewPres) {

    formNewPres.addEventListener('submit', function (e) {
        e.preventDefault();

        var payload = {};

        var presentacion = document.getElementById("newPres").value;
        var abreviatura = document.getElementById("newAbr").value;

        payload.presentacion = presentacion;
        payload.abreviatura = abreviatura;
        payload.status = 1;
        payload.fecha_creacion = moment().format('YYYY-MM-DD H:mm:ss');

        if (payload.presentacion == "") {

            Swal.fire({
                icon: 'warning',
                title: 'Oops...',
                text: 'Es necesario indicar la nueva presentación!',
            })

        } else {

            if (payload.presentacion == "") {

                Swal.fire({
                    icon: 'warning',
                    title: 'Oops...',
                    text: 'Es necesario indicar la abreviatura de la presentación!',
                })

            } else {

                axios.post('/presentaciones', payload)
                    .then(function (respuesta) {

                        if (respuesta.data == "Repetido") {

                            $('#modalAgregarPres').modal('dispose');

                            // Alerta
                            Swal.fire(
                                'La presentación ya existe',
                                'La presentación que se capturó ya existe en la base de datos!',
                                'warning'
                            ).then(function (result) {
                                if (result.value) {
                                    window.location = "/presentaciones";
                                }
                            });

                        } else {

                            if (respuesta.data == "Abreviatura") {

                                $('#modalAgregarPres').modal('dispose');

                                // Alerta
                                Swal.fire(
                                    'La abreviatura ya existe',
                                    'La abreviatura que se capturó ya es utilizada!',
                                    'warning'
                                ).then(function (result) {
                                    if (result.value) {
                                        window.location = "/presentaciones";
                                    }
                                });

                            } else {

                                $("#modalAgregarPres").remove();

                                Swal.fire(
                                    'Presentación Creada!',
                                    respuesta.data,
                                    'success'
                                ).then(function (result) {
                                    if (result.value) {
                                        window.location = "/presentaciones";
                                    }
                                });

                            }

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

}

$('#modalAgregarPres').on('shown.bs.modal', function () {
    document.getElementById('newPres').focus();
});

/*=============================================
Activar/Desactivar Presentaciones
=============================================*/
$(document).on("click", "#btn-estatus-pres", function () {

    var idPres = $(this).attr("idPres");
    var estadoPres = $(this).attr("estadoPres");

    var payload = {};

    payload.idPres = idPres;
    payload.estadoPres = estadoPres;

    axios.put('/presentaciones', payload)
        .then(function (respuesta) {
            if (window.matchMedia("(max-width:767px)").matches) {

                Swal.fire(
                    'Marca Actualizada',
                    respuesta.data,
                    'success'
                ).then(function (result) {
                    if (result.value) {
                        window.location = "/presentaciones";
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

    if (estadoPres == 0) {

        $(this).removeClass('btn-success');
        $(this).addClass('btn-danger');
        $(this).html('Desactivado');
        $(this).attr('estadoPres', 1);

    } else {

        $(this).addClass('btn-success');
        $(this).removeClass('btn-danger');
        $(this).html('Activado');
        $(this).attr('estadoPres', 0);
    }
});
/*=============================================
Editar Presentaciones
=============================================*/
$(document).on("click", "#btn-editar-pres", function () {

    var idPres = $(this).attr("idPres");

    var route = '/presentaciones/' + idPres;

    axios.get(route)
        .then(function (respuesta) {

            var idPres = respuesta.data[0].idpresentacion;
            var presentacion = respuesta.data[0].presentacion;
            var abreviatura = respuesta.data[0].abreviatura;

            $("#idPres").val(idPres);
            $("#editPres").val(presentacion);
            $("#editAbr").val(abreviatura);

        }).catch(errors => {
            Swal.fire({
                icon: 'error',
                title: 'Hubo un error',
                text: 'Error en la Base de Datos'
            })
        })
});

if (formEditPres) {

    formEditPres.addEventListener('submit', function (e) {
        e.preventDefault();

        var idPres = document.getElementById("idPres").value;
        var updPres = document.getElementById("editPres").value;
        var updAbrev = document.getElementById("editAbr").value;

        var payload = {};

        payload.presentacion = updPres;
        payload.abreviatura = updAbrev;

        var route = '/presentaciones/' + idPres;

        axios.put(route, payload)
            .then(function (respuesta) {

                if (respuesta.data == 'Nulos') {

                    $('#modalEditarPres').modal('dispose');

                    Swal.fire(
                        'Oops...',
                        'No se detectan cambios!',
                        'warning'
                    ).then(function (result) {
                        if (result.value) {
                            window.location = "/presentaciones";
                        }
                    });

                } else {

                    $('#modalEditarPres').modal('dispose');

                    if (respuesta.data == 'Abreviatura') {

                        Swal.fire(
                            'Oops...',
                            'La abreviatura que se capturó ya es utilizada!',
                            'warning'
                        ).then(function (result) {
                            if (result.value) {
                                window.location = "/presentaciones";
                            }
                        });

                    } else {

                        if (respuesta.data == 'Repetido') {

                            $('#modalEditarPres').modal('dispose');

                            Swal.fire(
                                'La presentación ya existe',
                                'La presentación ingresada ya existe en la base de datos!',
                                'warning'
                            ).then(function (result) {
                                if (result.value) {
                                    window.location = "/presentaciones";
                                }
                            });

                        } else {

                            $("#modalEditarPres").remove();

                            Swal.fire(
                                'Presentación Actualizada',
                                respuesta.data,
                                'success'
                            ).then(function (result) {
                                if (result.value) {
                                    window.location = "/presentaciones";
                                }
                            });
                        }

                    }

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

$('#modalEditarPres').on('shown.bs.modal', function () {
    document.getElementById('editPres').focus();
});

/*=============================================
Eliminar Presentaciones
=============================================*/
$(document).on("click", "#btn-eliminar-pres", function () {

    var idPres = $(this).attr("idPres");

    Swal.fire({
        title: '¿Está seguro de borrar la presentación?',
        text: "¡Si no lo está puede cancelar la acción!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Si, borrar!'
    }).then((result) => {
        if (result.value) {

            var route = '/presentaciones/' + idPres;

            axios.delete(route)
                .then(function (respuesta) {
                    //console.log(respuesta);
                    Swal.fire(
                        'Eliminado!',
                        respuesta.data,
                        'success'
                    ).then(function (result) {
                        if (result.value) {
                            window.location = "/presentaciones";
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
});

/*=============================================
Agregar Producto
=============================================*/
if (formNewProducto) {

    var routeOne = '/categorias/activas';
    var routeTwo = '/presentaciones/activas';
    var routeThree = '/marcas/activas';
    var routeFour = '/proveedores/activos';

    const requestOne = axios.get(routeOne);
    const requestTwo = axios.get(routeTwo);
    const requestThree = axios.get(routeThree);
    const requestFour = axios.get(routeFour);

    axios.all([requestOne, requestTwo, requestThree, requestFour]).then(axios.spread((...respuesta) => {

        const responseOne = respuesta[0];
        const responseTwo = respuesta[1];
        const responseThree = respuesta[2];
        const responseFour = respuesta[3];

        var dataCategorias = responseOne.data;
        var dataPresentaciones = responseTwo.data;
        var dataMarca = responseThree.data;
        var dataProv = responseFour.data;

        dataCategorias.forEach(function (valor, indice, array) {

            var idCat = valor[1];
            var nameCat = valor[2];

            $("<option />")
                .attr("value", idCat)
                .html(nameCat)
                .appendTo("#catProd");
        })

        dataPresentaciones.forEach(function (valor, indice, array) {

            var idPres = valor[1];
            var namePres = valor[3];

            $("<option />")
                .attr("value", idPres)
                .html(namePres)
                .appendTo("#preProd");
        })

        dataMarca.forEach(function (valor, indice, array) {

            var idMarca = valor[1];
            var nameMarca = valor[2];

            $("<option />")
                .attr("value", idMarca)
                .html(nameMarca)
                .appendTo("#marcaProd");
        })

        dataProv.forEach(function (valor, indice, array) {

            var idProv = valor[1];
            var nameProv = valor[2];

            $("<option />")
                .attr("value", idProv)
                .html(nameProv)
                .appendTo("#provProd");
        })


    }))

    formNewProducto.addEventListener('submit', function (e) {
        e.preventDefault();

        var payload = {};

        var nameProduct = document.getElementById("nameProduct").value;
        var barcodeProduct = document.getElementById("barcodeProduct").value;
        var catProd = document.getElementById("catProd").value;
        var preProd = document.getElementById("preProd").value;
        var marcaProd = document.getElementById("marcaProd").value;
        var provProd = document.getElementById("provProd").value;
        var switchProd = document.getElementById("switchProd").checked;
        var stockProd = document.getElementById("stockProd").value;
        var preCosto = document.getElementById("preCosto").value;
        var preCostoNeto = document.getElementById("preCostoNeto").value;
        var preMayoreo = document.getElementById("preMayoreo").value;
        var preMenudeo = document.getElementById("preMenudeo").value;

        payload.producto = nameProduct;
        payload.bar_code = barcodeProduct;
        payload.idcategoria = catProd;
        payload.idpresentacion = preProd;
        payload.idmarca = marcaProd;
        payload.idproveedor = provProd;
        payload.inventariable = switchProd;
        payload.stock_total = stockProd;
        payload.pre_costo = preCosto;
        payload.pre_costo_neto = preCostoNeto;
        payload.pre_mayoreo = preMayoreo;
        payload.pre_menudeo = preMenudeo;
        payload.status = 1;
        payload.fecha_creacion = moment().format('YYYY-MM-DD H:mm:ss');

        if (payload.producto == "") {
            Swal.fire({
                icon: 'warning',
                title: 'Oops...',
                text: 'Es necesario ingresar el nombre del producto!',
            })
        } else {
            if (payload.idcategoria == "") {
                Swal.fire({
                    icon: 'warning',
                    title: 'Oops...',
                    text: 'Es necesario seleccionar la categoria del producto!',
                })
            } else {
                if (payload.idpresentacion == "") {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Oops...',
                        text: 'Es necesario seleccionar la presentación del producto!',
                    })
                } else {
                    if (payload.idmarca == "") {
                        Swal.fire({
                            icon: 'warning',
                            title: 'Oops...',
                            text: 'Es necesario seleccionar la marca del producto!',
                        })
                    } else {
                        if (payload.inventariable == true && payload.stock_total == "") {
                            Swal.fire({
                                icon: 'warning',
                                title: 'Oops...',
                                text: 'Debe indicar el stock/cantidad del producto!',
                            })
                        } else {
                            if (payload.precio_costo == "") {
                                Swal.fire({
                                    icon: 'warning',
                                    title: 'Oops...',
                                    text: 'Es necesario ingresar el precio costo del producto!',
                                })
                            } else {
                                if (payload.pre_costo_neto == "") {
                                    Swal.fire({
                                        icon: 'warning',
                                        title: 'Oops...',
                                        text: 'Es necesario ingresar el precio costo neto del producto!',
                                    })
                                } else {
                                    if (payload.pre_mayoreo == "") {
                                        Swal.fire({
                                            icon: 'warning',
                                            title: 'Oops...',
                                            text: 'Es necesario ingresar el precio mayoreo del producto!',
                                        })
                                    } else {
                                        if (payload.pre_menudeo == "") {
                                            Swal.fire({
                                                icon: 'warning',
                                                title: 'Oops...',
                                                text: 'Es necesario ingresar el precio menudeo del producto!',
                                            })
                                        } else {
                                            if (parseInt(payload.pre_costo) > parseInt(payload.pre_costo_neto)) {
                                                Swal.fire({
                                                    icon: 'warning',
                                                    title: 'Oops...',
                                                    text: 'El precio costo no puede ser mayor al precio costo neto!',
                                                })
                                            } else {
                                                axios.post('/productos', payload)
                                                    .then(function (respuesta) {
                                                        // Alerta
                                                        Swal.fire(
                                                            'Producto Creado',
                                                            respuesta.data,
                                                            'success'
                                                        ).then(function (result) {
                                                            if (result.value) {
                                                                window.location = "/productos";
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
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    })
}
/*=============================================
AGREGANDO PRECIO DE VENTA MAYOREO
=============================================*/
$("#preCostoNeto").change(function () {

    if ($("#checkPorcenMay").prop("checked")) {

        var valorPorcentaje = $("#porcenPreMay").val();
        var porcentaje = Number(($("#preCostoNeto").val() * valorPorcentaje / 100)) + Number($("#preCostoNeto").val());

        $("#preMayoreo").val(porcentaje);
        $("#preMayoreo").prop("readonly", true);

        $("#editPreMayoreo").val(porcentaje);
        $("#editPreMayoreo").prop("readonly", true);
    }

    if ($("#checkPorcenMen").prop("checked")) {

        var valorPorcentaje = $("#porcenPreMen").val();
        var porcentaje = Number(($("#preCostoNeto").val() * valorPorcentaje / 100)) + Number($("#preCostoNeto").val());

        $("#preMenudeo").val(porcentaje);
        $("#preMenudeo").prop("readonly", true);

        $("#editPreMenudeo").val(porcentaje);
        $("#editPreMenudeo").prop("readonly", true);
    }

})
/*=============================================
CAMBIO DE PORCENTAJE PRECIO MAYOREO
=============================================*/
$("#porcenPreMay").change(function () {

    if ($("#checkPorcenMay").prop("checked")) {

        var valorPorcentaje = $("#porcenPreMay").val();
        var porcentaje = Number(($("#preCostoNeto").val() * valorPorcentaje / 100)) + Number($("#preCostoNeto").val());

        $("#preMayoreo").val(porcentaje);
        $("#preMayoreo").prop("readonly", true);

        $("#editPreMayoreo").val(porcentaje);
        $("#editPreMayoreo").prop("readonly", true);
    }
})

$("#checkPorcenMay").on('change', function (e) {
    if (this.checked) {
        var valorPorcentaje = $("#porcenPreMay").val();
        var porcentaje = Number(($("#preCostoNeto").val() * valorPorcentaje / 100)) + Number($("#preCostoNeto").val());

        $("#preMayoreo").val(porcentaje);
        $("#preMayoreo").prop("readonly", true);

        $("#editPreMayoreo").val(porcentaje);
        $("#editPreMayoreo").prop("readonly", true);

    } else {
        $("#preMayoreo").prop("readonly", false);
        $("#editPreMayoreo").prop("readonly", false);
    }
});
/*=============================================
CAMBIO DE PORCENTAJE PRECIO MENUDEO
=============================================*/
$("#porcenPreMen").change(function () {

    if ($("#checkPorcenMen").prop("checked")) {

        var valorPorcentaje = $("#porcenPreMen").val();
        var porcentaje = Number(($("#preCostoNeto").val() * valorPorcentaje / 100)) + Number($("#preCostoNeto").val());

        $("#preMenudeo").val(porcentaje);
        $("#preMenudeo").prop("readonly", true);

        $("#editPreMenudeo").val(porcentaje);
        $("#editPreMenudeo").prop("readonly", true);
    }
})

$("#checkPorcenMen").on('change', function (e) {
    if (this.checked) {
        var valorPorcentaje = $("#porcenPreMen").val();
        var porcentaje = Number(($("#preCostoNeto").val() * valorPorcentaje / 100)) + Number($("#preCostoNeto").val());

        $("#preMenudeo").val(porcentaje);
        $("#preMenudeo").prop("readonly", true);

        $("#editPreMenudeo").val(porcentaje);
        $("#editPreMenudeo").prop("readonly", true);

    } else {
        $("#preMenudeo").prop("readonly", false);
        $("#editPreMenudeo").prop("readonly", false);
    }
});

/*=============================================
CHECK INVENTARIABLE
=============================================*/
$("#switchProd").on('change', function (e) {
    if (this.checked) {
        //console.log('Checkbox ' + $(e.currentTarget).val() + ' checked');
        $("#stockProd").prop("readonly", false);
    } else {
        //console.log('Checkbox ' + $(e.currentTarget).val() + ' unchecked');
        $("#stockProd").prop("readonly", true);
        $("#stockProd").val(null);

    }
});

/*=============================================
SUBIENDO LA FOTO DEL PRODUCTO
=============================================*/
$("#imgProducto").change(function () {

    var imagen = this.files[0];

    /*=============================================
        VALIDAMOS EL FORMATO DE LA IMAGEN SEA JPG O PNG
        =============================================*/

    if (imagen["type"] != "image/jpeg" && imagen["type"] != "image/png") {

        $("#imgProducto").val("");

        swal({
            title: "Error al subir la imagen",
            text: "¡La imagen debe estar en formato JPG o PNG!",
            type: "error",
            confirmButtonText: "¡Cerrar!"
        });

    } else if (imagen["size"] > 2000000) {

        $("#imgProducto").val("");

        swal({
            title: "Error al subir la imagen",
            text: "¡La imagen no debe pesar más de 2MB!",
            type: "error",
            confirmButtonText: "¡Cerrar!"
        });

    } else {

        var datosImagen = new FileReader;
        datosImagen.readAsDataURL(imagen);

        $(datosImagen).on("load", function (event) {

            var rutaImagen = event.target.result;

            $("#previsualizar").attr("src", rutaImagen);

        })

    }
})

/*=============================================
Subir/Cambiar Imagen
=============================================*/
$(document).on("click", "#btn-imagen-producto", function () {

    var idProd = $(this).attr("idProducto");

    var route = '/productos/imagen/' + idProd;

    axios.get(route)
        .then(function (respuesta) {

            var idProducto = respuesta.data[0].idproducto;
            var imagen = respuesta.data[0].imagen;

            $("#idProducto").val(idProducto);

            if (imagen == null) {
                var rutaImagen = '/uploads/productos/default/anonymous.png';
            } else {
                var rutaImagen = '/uploads/productos/' + imagen;
            }

            $("#previsualizar").attr("src", rutaImagen);

        }).catch(errors => {
            Swal.fire({
                icon: 'error',
                title: 'Hubo un error',
                text: 'Error en la Base de Datos'
            })
        })
});

/*=============================================
Activar/Desactivar Productos
=============================================*/
$(document).on("click", "#btn-estatus-producto", function () {

    var idProd = $(this).attr("idProducto");
    var estadoProducto = $(this).attr("estadoProducto");

    var payload = {};

    payload.idProd = idProd;
    payload.estadoProd = estadoProducto;

    axios.put('/productos', payload)
        .then(function (respuesta) {
            if (window.matchMedia("(max-width:767px)").matches) {

                Swal.fire(
                    'Producto Actualizado',
                    respuesta.data,
                    'success'
                ).then(function (result) {
                    if (result.value) {
                        window.location = "/productos";
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

    if (estadoProducto == 0) {

        $(this).removeClass('btn-success');
        $(this).addClass('btn-danger');
        $(this).html('Desactivado');
        $(this).attr('estadoProducto', 1);

    } else {

        $(this).addClass('btn-success');
        $(this).removeClass('btn-danger');
        $(this).html('Activado');
        $(this).attr('estadoProducto', 0);
    }
});

/*=============================================
Editar Producto
=============================================*/
if (formEditProducto) {

    const url = window.location.pathname;
    const idProducto = url.substring(url.lastIndexOf('/') + 1);

    var routeOne = '/categorias/activas';
    var routeTwo = '/presentaciones/activas';
    var routeThree = '/marcas/activas';
    var routeFour = '/proveedores/activos';
    var routeFive = '/productos/' + idProducto;

    const requestOne = axios.get(routeOne);
    const requestTwo = axios.get(routeTwo);
    const requestThree = axios.get(routeThree);
    const requestFour = axios.get(routeFour);
    const requestFive = axios.get(routeFive);

    axios.all([requestOne, requestTwo, requestThree, requestFour, requestFive]).then(axios.spread((...respuesta) => {

        const responseOne = respuesta[0];
        const responseTwo = respuesta[1];
        const responseThree = respuesta[2];
        const responseFour = respuesta[3];
        const responseFive = respuesta[4];

        var abreviatura = responseFive.data[0].abreviatura;
        var idpresentacion = responseFive.data[0].idpresentacion;
        var bar_code = responseFive.data[0].bar_code;
        var categoria = responseFive.data[0].categoria;
        var idcategoria = responseFive.data[0].idcategoria;
        var marca = responseFive.data[0].marca;
        var idmarca = responseFive.data[0].idmarca;
        var proveedor = responseFive.data[0].proveedor;
        var idproveedor = responseFive.data[0].idproveedor;
        var producto = responseFive.data[0].producto;
        var idproducto = responseFive.data[0].idproducto;
        var pre_costo = responseFive.data[0].pre_costo;
        var pre_costo_neto = responseFive.data[0].pre_costo_neto;
        var pre_mayoreo = responseFive.data[0].pre_mayoreo;
        var pre_menudeo = responseFive.data[0].pre_menudeo;
        var stock = responseFive.data[0].stock_total;

        var dataCategorias = responseOne.data;
        var dataPresentaciones = responseTwo.data;
        var dataMarca = responseThree.data;
        var dataProv = responseFour.data;

        $("#idProducto").val(idproducto);
        $("#editNameProduct").val(producto);
        $("#editBarcode").val(bar_code);
        $("#editStockProd").val(stock);
        $("#editPreCosto").val(pre_costo);
        $("#editPreCostoNeto").val(pre_costo_neto);
        $("#editPreMayoreo").val(pre_mayoreo);
        $("#editPreMenudeo").val(pre_menudeo);

        $("<option />")
            .attr("value", idcategoria)
            .html(categoria)
            .appendTo("#editCatProd");

        $("<option />")
            .attr("value", idpresentacion)
            .html(abreviatura)
            .appendTo("#editPreProd");

        $("<option />")
            .attr("value", idmarca)
            .html(marca)
            .appendTo("#editMarcaProd");

        if (idproveedor != null) {
            $("<option />")
                .attr("value", idproveedor)
                .html(proveedor)
                .appendTo("#editProvProd");
        } else {
            $("<option />")
                .attr("value", '0')
                .html('Seleccione el proveedor')
                .appendTo("#editProvProd");
        }

        dataCategorias.forEach(function (valor, indice, array) {

            var idCat = valor[1];
            var nameCat = valor[2];

            $("<option />")
                .attr("value", idCat)
                .html(nameCat)
                .appendTo("#editCatProd");
        })

        dataPresentaciones.forEach(function (valor, indice, array) {

            var idPres = valor[1];
            var namePres = valor[3];

            $("<option />")
                .attr("value", idPres)
                .html(namePres)
                .appendTo("#editPreProd");
        })

        dataMarca.forEach(function (valor, indice, array) {

            var idMarca = valor[1];
            var nameMarca = valor[2];

            $("<option />")
                .attr("value", idMarca)
                .html(nameMarca)
                .appendTo("#editMarcaProd");
        })

        dataProv.forEach(function (valor, indice, array) {

            var idProv = valor[1];
            var nameProv = valor[2];

            $("<option />")
                .attr("value", idProv)
                .html(nameProv)
                .appendTo("#editProvProd");
        })


    }));

    formEditProducto.addEventListener('submit', function (e) {
        e.preventDefault();

        var payload = {};

        var idproducto = document.getElementById("idProducto").value;
        var nameProduct = document.getElementById("editNameProduct").value;
        var barcodeProduct = document.getElementById("editBarcode").value;
        var catProd = document.getElementById("editCatProd").value;
        var preProd = document.getElementById("editPreProd").value;
        var marcaProd = document.getElementById("editMarcaProd").value;
        var provProd = document.getElementById("editProvProd").value;
        var preCosto = document.getElementById("editPreCosto").value;
        var preCostoNeto = document.getElementById("editPreCostoNeto").value;

        payload.producto = nameProduct;
        payload.bar_code = barcodeProduct;
        payload.idcategoria = catProd;
        payload.idpresentacion = preProd;
        payload.idmarca = marcaProd;
        payload.idproveedor = provProd;
        payload.pre_costo = preCosto;
        payload.pre_costo_neto = preCostoNeto;

        var route = '/productos/' + idproducto;

        axios.put(route, payload)
            .then(function (respuesta) {

                if (respuesta.data == 'Nulos') {

                    Swal.fire(
                        'Oops...',
                        'No se detectan cambios!',
                        'warning'
                    )

                } else {

                    Swal.fire(
                        'Producto Actualizado',
                        respuesta.data,
                        'success'
                    ).then(function (result) {
                        if (result.value) {
                            window.location = "/productos";
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

};

/*=============================================
Movimientos de Productos
=============================================*/
if (formMovsProd) {

    formMovsProd.addEventListener('submit', function (e) {
        e.preventDefault();

        $('#btnMovsProd').html('<span id="loading" class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>Buscando...').addClass('disabled');

        $('#tbl-movs-prod').DataTable().destroy();
        $("#tbl-movs-prod").remove();

        var payload = {};

        var idProduct = document.getElementById('idProduct');

        var idProd = idProduct.value;
        var mesPeri = document.getElementById('mesInv').value;

        var mesSel = paddy((parseInt(mesPeri.split('-')[1]) + 1), 2, 0);

        if (mesSel == 13) {
            var mesSel = paddy((1), 2, 0);
            var anio = parseInt(mesPeri.split('-')[0]) + 1;
        } else {
            var anio = mesPeri.split('-')[0];
        }

        var mesIni = mesPeri + '-01';
        var mesFin = anio + '-' + mesSel + '-01';

        payload.idProd = idProd
        payload.mesIni = mesIni;
        payload.mesFin = mesFin;

        axios.post('movs_productos', payload)
            .then(function (respuesta) {

                $('#btnMovsProd').html('<i class="fa fa-search"></i> Consultar').removeClass('disabled');

                if (respuesta.data == 'empty') {

                    Swal.fire({
                        icon: 'warning',
                        title: '¡No se encontraron movimientos!',
                        text: 'Sin movimientos para el articulo en el mes seleccionado.',
                    })

                } else {

                    var dataMovs = respuesta.data;

                    $("#bodyMovs").append(
                        '<table id="tbl-movs-prod" class="display table-bordered table-striped dt-responsive text-center" cellspacing="0" style="width:100%"> </table>'
                    );

                    var tablaMovs = $("#tbl-movs-prod").DataTable({

                        data: dataMovs,
                        deferRender: true,
                        iDisplayLength: 25,
                        retrieve: true,
                        processing: true,
                        fixedHeader: true,
                        responsive: true,
                        columnDefs: [
                            { orderable: false, targets: '_all'}
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
                            title: "Producto"
                        },
                        {
                            title: "Movimiento"
                        },
                        {
                            title: "Cantidad"
                        },
                        {
                            title: "Stock"
                        },
                        {
                            title: "Fecha"
                        },
                        {
                            title: "Usuario"
                        }
                        ],
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

if (formEntradaProd) {

    formEntradaProd.addEventListener('submit', function (e) {
        e.preventDefault();

        var payload = {};

        var idProduct = document.getElementById('idProduct');

        var idProd = idProduct.value;
        var motivo = motEntrada.value;
        var stockEntrada = document.getElementById('stockEntrada').value;

        payload.idproducto = idProd;
        payload.tipo_mov = 4
        payload.cantidad = stockEntrada;
        payload.idmot_mov = motivo;

        axios.put('/reg_movimiento_inv', payload)
            .then(function (respuesta) {

                if (respuesta.data == 'Ok') {
                    Swal.fire(
                        'Éxito!',
                        'Movimiento registrado correctamente.',
                        'success'
                    ).then(function (result) {
                        if (result.value) {
                            window.location = "/movimientos_productos";
                        }
                    });

                }

            })

    })

}

if (formSalidaProd) {

    formSalidaProd.addEventListener('submit', function (e) {
        e.preventDefault();

        var payload = {};

        var idProduct = document.getElementById('idProduct');

        var idProd = idProduct.value;
        var motivo = motSalida.value;
        var stockSalida = document.getElementById('stockSalida').value;

        payload.idproducto = idProd;
        payload.tipo_mov = 5
        payload.cantidad = stockSalida;
        payload.idmot_mov = motivo;

        axios.put('/reg_movimiento_inv', payload)
            .then(function (respuesta) {

                if (respuesta.data == 'Ok') {
                    Swal.fire(
                        'Éxito!',
                        'Movimiento registrado correctamente.',
                        'success'
                    ).then(function (result) {
                        if (result.value) {
                            window.location = "/movimientos_productos";
                        }
                    });

                }

            })

    })
}

$(idProdMov).change(function () {

    var descProd = document.getElementById('descProd');

    descProd.value = "";

    var idProd = idProdMov.value;


    if (idProd == '') {

        Swal.fire({
            icon: 'warning',
            title: 'Oops...',
            text: 'Ingrese código de producto!',
        })

    } else {

        var route = '/precio_producto_venta/' + idProd;

        axios.get(route)
            .then(function (respuesta) {
                var dataSet = respuesta.data;

                if (dataSet == 'Empty') {

                    Swal.fire({
                        icon: 'warning',
                        title: 'Oops...',
                        text: 'El producto no existe o esta inactivo!',
                    }).then(function (result) {
                        if (result.value) {
                            idProdMov.value = "";
                            idProdMov.focus();
                        }
                    });

                } else {

                    var idProdBase = dataSet[0].idproducto;
                    var descripcion = dataSet[0].producto;

                    var idProducto = document.getElementById('idProduct');

                    idProducto.value = idProdBase;
                    descProd.value = descripcion;

                }

            }).catch(errors => {
                Swal.fire({
                    icon: 'error',
                    title: 'Hubo un error',
                    text: 'Error en la Base de Datos'
                })
            })

    }

});

/*=============================================
Historico de Precios
=============================================*/
if (formHistPrec) {

    formHistPrec.addEventListener('submit', function (e) {
        e.preventDefault();

        $('#btnHistProd').html('<span id="loading" class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>Buscando...').addClass('disabled');

        $('#tbl-hist-prec').DataTable().destroy();
        $("#tbl-hist-prec").remove();

        var payload = {};

        var idProduct = document.getElementById('idProduct').value;
        var tipPrecio = document.getElementById('tipPrecio').value;

        payload.idProd = idProduct;
        payload.tipPrecio = tipPrecio;

        axios.post('historico_precios', payload)
            .then(function (respuesta) {

                $('#btnHistProd').html('<i class="fa fa-search"></i> Consultar').removeClass('disabled');

                if (respuesta.data == 'empty') {

                    Swal.fire({
                        icon: 'warning',
                        title: '¡No se encontraron registros!',
                        text: 'Sin registros para el articulo seleccionado.',
                    })

                } else {

                    var dataHist = respuesta.data;

                    $("#bodyHist").append(
                        '<table id="tbl-hist-prec" class="display table-bordered table-striped dt-responsive text-center" cellspacing="0" style="width:100%"> </table>'
                    );

                    var tablaHist = $("#tbl-hist-prec").DataTable({

                        data: dataHist,
                        deferRender: true,
                        iDisplayLength: 25,
                        retrieve: true,
                        processing: true,
                        fixedHeader: true,
                        responsive: true,
                        columnDefs: [
                            { orderable: false, targets: '_all'}
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
                            title: "Producto"
                        },
                        {
                            title: "Precio"
                        },
                        {
                            title: "Cambio"
                        },
                        {
                            title: "Fecha"
                        },
                        {
                            title: "Usuario"
                        }
                        ],
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
AJUSTE DE PRECIO
=============================================*/
$(codProducto).change(function () {

    var nomProducto = document.getElementById('nomProducto');
    var oldPrecio = document.getElementById('oldPrecio');
    var tipoPrec = document.getElementById('tipPrecio');

    var tipPrecio = tipoPrec.value;

    nomProducto.value = "";
    oldPrecio.value = "";

    var idProd = codProducto;

    if (tipPrecio == "") {

        Swal.fire({
            icon: 'warning',
            title: 'Oops...',
            text: 'Debe seleccionar el tipo de precio a ajustar!',
        }).then(function (result) {
            if (result.value) {
                idProd.value = "";
                tipoPrec.focus();
            }
        });
    } else {

        if (idProd.value == '') {

            Swal.fire({
                icon: 'warning',
                title: 'Oops...',
                text: 'Ingrese código de producto!',
            })

        } else {

            var payload = {};

            payload.idProd = idProd.value;
            payload.tipoPrecio = tipPrecio;

            axios.post('/precio_ajuste_producto', payload)
                .then(function (respuesta) {
                    console.log(respuesta);
                    var dataSet = respuesta.data;

                    if (dataSet == 'Empty') {

                        Swal.fire({
                            icon: 'warning',
                            title: 'Oops...',
                            text: 'El producto no existe o esta inactivo!',
                        }).then(function (result) {
                            if (result.value) {
                                idProd.value = "";
                            }
                        });

                    } else {

                        var idProdBase = dataSet[0].idproducto;
                        var descripcion = dataSet[0].producto;
                        var precioProd = dataSet[0].precio;

                        var idProducto = document.getElementById('idProducto');

                        idProducto.value = idProdBase;
                        nomProducto.value = descripcion;
                        oldPrecio.value = precioProd;

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

});

$(tipPrecio).change(function () {

    var nomProducto = document.getElementById('nomProducto');
    var oldPrecio = document.getElementById('oldPrecio');
    var newPrecio = document.getElementById('newPrecio');

    nomProducto.value = "";
    oldPrecio.value = "";
    newPrecio.value = "";
    codProducto.value = "";
    codProducto.focus();

});

if (formAjustePrecio) {

    formAjustePrecio.addEventListener('submit', function (e) {
        e.preventDefault();

        var payload = {};

        var tipoPrecio = tipPrecio.value;
        var idProducto = document.getElementById('idProducto').value;
        var oldPrecio = document.getElementById('oldPrecio').value;
        var newPrecio = document.getElementById('newPrecio').value;

        payload.tipoPrecio = tipoPrecio;
        payload.idProducto = idProducto;
        payload.oldPrecio = oldPrecio;
        payload.newPrecio = newPrecio;

        console.log(payload);
        axios.post('/ajusta_precio', payload)
            .then(function (respuesta) {

                if (respuesta.data == 'Ok') {

                    Swal.fire(
                        'Éxito!',
                        'Ajuste realizado correctamente.',
                        'success'
                    ).then(function (result) {
                        if (result.value) {
                            window.location = "/productos";
                        }
                    });

                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Hubo un error',
                        text: 'Error en la Base de Datos'
                    }).then(function (result) {
                        if (result.value) {
                            window.location = "/ajuste_precios";
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
CONFIGURAR PRECIOS
=============================================*/
if (formConfigPrec) {

    formConfigPrec.addEventListener('submit', function (e) {
        e.preventDefault();

        $('#btnConfigProd').html('<span id="loading" class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>Buscando...').addClass('disabled');

        $('#tbl-config-prec').DataTable().destroy();
        $("#tbl-config-prec").remove();

        var idProduct = document.getElementById('idProduct').value;

        if (idProduct == '') {

            Swal.fire({
                icon: 'warning',
                title: 'Oops...',
                text: 'Es necesario ingresar ID de producto o Código de Barras!',
            })

        } else {

            var route = '/get_precios/' + idProduct;

            axios.get(route)
                .then(function (respuesta) {

                    $('#btnConfigProd').html('<i class="fa fa-search"></i> Consultar').removeClass('disabled');

                    if (respuesta.data == 'Empty') {

                        Swal.fire({
                            icon: 'warning',
                            title: 'Oops...',
                            text: 'El producto no existe!',
                        }).then(function (result) {
                            if (result.value) {
                                window.location = "/configurar_precios";
                            }
                        });

                    } else {

                        var dataConfig = respuesta.data;

                        $("#bodyConfig").append(
                            '<table id="tbl-config-prec" class="display table-bordered table-striped dt-responsive text-center" cellspacing="0" style="width:100%"> </table>'
                        );

                        var tablaConfig = $("#tbl-config-prec").DataTable({

                            data: dataConfig,
                            deferRender: true,
                            iDisplayLength: 25,
                            retrieve: true,
                            processing: true,
                            fixedHeader: true,
                            responsive: true,
                            columnDefs: [
                                { orderable: false, targets: '_all'}
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
                                title: "Tipo Precio"
                            },
                            {
                                title: "Precio"
                            },
                            {
                                title: "Acción"
                            }
                            ],
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

    })

    $(idProdMov).change(function () {

        $('#tbl-config-prec').DataTable().destroy();
        $("#tbl-config-prec").remove();
    
    });

}

$(document).on("change", ".radioPrec", function () {

    var idPrec = $(this).attr("idPrec");
    var idProduct = document.getElementById('idProduct').value;
    var payload = {};

    payload.idprecio = idPrec;
    payload.idproducto = idProduct;

    axios.put('/configurar_precios', payload)
        .then(function (respuesta) {

            if (respuesta.data == 'Ok') {
                Swal.fire({
                    position: 'top-end',
                    icon: 'success',
                    title: 'Cambios guardados!',
                    showConfirmButton: false,
                    timer: 1000
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

function paddy(num, padlen, padchar) {
    var pad_char = typeof padchar !== 'undefined' ? padchar : '0';
    var pad = new Array(1 + padlen).join(pad_char);
    return (pad + num).slice(-pad.length);
}