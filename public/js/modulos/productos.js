import axios from 'axios';
import Swal from 'sweetalert2';
import moment from 'moment';


const formCategoria = document.getElementById('formNewcategoria');
const formEditCategoria = document.getElementById('formEditCategoria');
const formNewMarca = document.getElementById('formNewMarca');

const tblCategorias = document.querySelector('#tbl-categorias');
const tblMarcas = document.querySelector('#tbl-marcas');


(function () {

    /*=============================================
        Data Table Categorias
    =============================================*/
    if(tblCategorias){
        axios.get('/categorias/all')
            .then(function (respuesta) {

                if (respuesta.data != 'empty') {

                    var dataSet = respuesta.data;

                    $('#tbl-categorias').DataTable({
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
                    type: 'error',
                    title: 'Hubo un error',
                    text: 'Error en la Base de Datos'
                })
            })
    }

    if(tblMarcas){



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
                        type: 'error',
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

    console.log(route);

    axios.get(route)
        .then(function (respuesta) {

            var idCategoria = respuesta.data[0].idcategoria;
            var categoria = respuesta.data[0].categoria;

            $("#editIdCategoria").val(idCategoria);
            $("#editCategoria").val(categoria);

        }).catch(errors => {
            Swal.fire({
                type: 'error',
                title: 'Hubo un error',
                text: 'Error en la Base de Datos'
            })
        })
});

if(formEditCategoria){

    formEditCategoria.addEventListener('submit', function (e) {
        e.preventDefault();

        var idCategoria = document.getElementById("editIdCategoria").value;
        var updCategoria = document.getElementById("editCategoria").value;

        var payload = {};

        payload.newCategoria = updCategoria;

        var route = '/categorias/' + idCategoria;

        console.log(route);
        console.log(payload);

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
                type: 'error',
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
                        type: 'error',
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

            console.log('aqui entramos');
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
                        type: 'error',
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
