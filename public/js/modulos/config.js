import axios from 'axios';
import Swal from 'sweetalert2';

const formEmpresa = document.getElementById('form-empresa');
const searchPermisos = document.getElementById('searchPermisos');
const searchPermisosxUser = document.getElementById('searchPermisosxUser');

(function () {

    if (formEmpresa) {

        axios.get('/empresa/all')
            .then(function (respuesta) {

                if (respuesta.data != 'Empty') {

                    var nombreEmpresa = respuesta.data[0].nombre_empresa;
                    var razonSocial = respuesta.data[0].razon_social;
                    var webSite = respuesta.data[0].web_site;

                    $("#nameEmpresa").val(nombreEmpresa);
                    $("#razonSocial").val(razonSocial);
                    $("#webSite").val(webSite);

                }
            }).catch(errors => {
                Swal.fire({
                    icon: 'error',
                    title: 'Hubo un error',
                    text: 'Error en la Base de Datos'
                })
            })
    }

})();

if (formEmpresa) {

    formEmpresa.addEventListener('submit', function (e) {
        e.preventDefault();

        var payload = {};

        var nombreEmpresa = document.getElementById("nameEmpresa").value;
        var razonSocial = document.getElementById("razonSocial").value;
        var webSite = document.getElementById("webSite").value;

        if (nombreEmpresa == "") {
            Swal.fire({
                icon: 'warning',
                title: 'Oops...',
                text: 'Es necesario indicar el nombre de la empresal!',
            })
        } else {
            if (razonSocial == "") {
                Swal.fire({
                    icon: 'warning',
                    title: 'Oops...',
                    text: 'Es necesario indicar la razón social de la empresal!',
                })

            } else {

                payload.nombre_empresa = nombreEmpresa;
                payload.razon_social = razonSocial;
                payload.web_site = webSite;

                axios.post('/empresa', payload)
                    .then(function (respuesta) {

                        if (respuesta.data == 'Creado') {

                            Swal.fire(
                                'Empresa Creada',
                                'La información de la empresa se guardó correctamente!',
                                'success'
                            ).then(function (result) {
                                if (result.value) {
                                    window.location = "/empresa";
                                }
                            });

                        } else {
                            if (respuesta.data == 'Actualizado') {

                                Swal.fire(
                                    'Empresa Editada',
                                    'La información de la empresa se editó correctamente!',
                                    'success'
                                ).then(function (result) {
                                    if (result.value) {
                                        window.location = "/empresa";
                                    }
                                });

                            } else {

                                Swal.fire({
                                    icon: 'warning',
                                    title: 'Oops...',
                                    text: 'No se detectaron cambios!'
                                })
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

if (searchPermisos) {

    var payload = {};

    payload.status = 1;

    axios.post('/perfiles/all', payload)
        .then(function (respuesta) {

            var dataPerfil = respuesta.data;

            dataPerfil.forEach(function (valor, indice, array) {

                var idPerfil = valor[1];
                var nombrePerfil = valor[2];

                $("<option />")
                    .attr("value", idPerfil)
                    .html(nombrePerfil)
                    .appendTo("#userPerfil");
            });
        })

    searchPermisos.addEventListener('submit', function (e) {
        e.preventDefault();

        $('#btnSearchPermisos').html('<span id="loading" class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>Buscando...').addClass('disabled');

        $('#tbl-perm-perfil').DataTable().destroy();
        $("#tbl-perm-perfil").remove();

        var perfilUser = document.getElementById("userPerfil").value;

        var route = '/permiso_x_perfil/' + perfilUser;

        axios.get(route,)
            .then(function (respuesta) {

                $('#btnSearchPermisos').html('<i class="fa fa-search"></i> Consultar').removeClass('disabled');

                $("#bodyPermPerfil").append(
                    '<table id="tbl-perm-perfil" class="display table-bordered table-striped dt-responsive text-center" cellspacing="0" style="width:100%"> </table>'
                );

                const tblPermPerfil = document.querySelector('#tbl-perm-perfil');

                if (tblPermPerfil) {
                    var dataSet = respuesta.data;

                    $(tblPermPerfil).DataTable({
                        data: dataSet,
                        deferRender: true,
                        iDisplayLength: 50,
                        retrieve: true,
                        processing: true,
                        fixedHeader: true,
                        responsive: true,
                        searching: false,
                        columnDefs: [{
                            targets: "_all",
                            sortable: false
                        }],
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
                            var idpadre = data[7];
                            //Pintar toda la columna
                            if (idpadre == 0) {
                                $('td', row).css('background-color', '#D6EAF8');
                                $(row).find('td:eq(2)').css('font-weight', 'bold');
                            }
                        },
                        columns: [{
                            title: "Orden"
                        },
                        {
                            title: "ID Menú"
                        },
                        {
                            title: "Menú"
                        },
                        {
                            title: "Acceso"
                        },
                        {
                            title: "Crear"
                        },
                        {
                            title: "Editar"
                        },
                        {
                            title: "Eliminar"
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
}

$("#userPerfil").change(function () {

    $('#tbl-perm-perfil').DataTable().destroy();
    $("#tbl-perm-perfil").remove();

});

$(document).on("change", ".checkAcceso", function () {

    var idCheck = null;
    var idMenu = $(this).attr("idMenu");
    var idCheck = $(this).attr('id');
    var idPadre = $(this).attr("idPadre");
    var idPerfil = document.getElementById('userPerfil').value;
    var idCheckCrear = idCheck.trim() + 'c';
    var idCheckEditar = idCheck.trim() + 'e';
    var idCheckEliminar = idCheck.trim() + 'el';
    var permiso = 'accesar';
    var payload = {};

    const checkAcceso = document.getElementById(idCheck);

    if (checkAcceso.checked == true) {

        var acceso = 1;

        if (idPadre > 0) {

            if (document.getElementById(idCheckCrear).disabled == true) {
                document.getElementById(idCheckCrear).disabled = false;
            }

            if (document.getElementById(idCheckEditar).disabled == true) {
                document.getElementById(idCheckEditar).disabled = false;
            }

            if (document.getElementById(idCheckEliminar).disabled == true) {
                document.getElementById(idCheckEliminar).disabled = false;
            }

        }

    } else {

        var acceso = 0;

        if (idPadre > 0) {

            if (document.getElementById(idCheckCrear).disabled == false) {
                document.getElementById(idCheckCrear).disabled = true;
            }

            if (document.getElementById(idCheckEditar).disabled == false) {
                document.getElementById(idCheckEditar).disabled = true;
            }

            if (document.getElementById(idCheckEliminar).disabled == false) {
                document.getElementById(idCheckEliminar).disabled = true;
            }

            if (document.getElementById(idCheckCrear).checked == true) {
                document.getElementById(idCheckCrear).checked = false;
            }

            if (document.getElementById(idCheckEditar).checked == true) {
                document.getElementById(idCheckEditar).checked = false;
            }

            if (document.getElementById(idCheckEliminar).checked == true) {
                document.getElementById(idCheckEliminar).checked = false;
            }

        }

    }

    payload.idmenu = idMenu;
    payload.idperfil = idPerfil;
    payload.acceso = acceso;
    payload.permiso = permiso;

    axios.put('/permiso_x_perfil', payload)
        .then(function (respuesta) {

            Swal.fire({
                position: 'top-end',
                icon: 'success',
                title: 'Cambios guardados!',
                showConfirmButton: false,
                timer: 1000
            })

        }).catch(errors => {
            Swal.fire({
                icon: 'error',
                title: 'Hubo un error',
                text: 'Error en la Base de Datos'
            })
        })

});

$(document).on("change", ".checkCrear", function () {

    var idMenu = $(this).attr("idMenu");
    var idCheckCrear = $(this).attr('id');
    var idPerfil = document.getElementById('userPerfil').value;
    var permiso = 'crear';
    var payload = {};

    const checkCrear = document.getElementById(idCheckCrear);

    if (checkCrear.checked == true) {
        var acceso = 1;
    } else {
        var acceso = 0;
    }

    payload.idmenu = idMenu;
    payload.idperfil = idPerfil;
    payload.acceso = acceso;
    payload.permiso = permiso;

    axios.put('/permiso_x_perfil', payload)
        .then(function (respuesta) {

            if (respuesta.data != 'Error') {

                Swal.fire({
                    position: 'top-end',
                    icon: 'success',
                    title: 'Cambios guardados!',
                    showConfirmButton: false,
                    timer: 1000
                });

            } else {

                Swal.fire({
                    position: 'top-end',
                    icon: 'error',
                    title: 'Error al actualizar!',
                    showConfirmButton: false,
                    timer: 1000
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

$(document).on("change", ".checkEditar", function () {

    var idMenu = $(this).attr("idMenu");
    var idCheckEditar = $(this).attr('id');
    var idPerfil= document.getElementById('userPerfil').value;
    var permiso = 'editar';
    var payload = {};

    const checkEditar = document.getElementById(idCheckEditar);

    if (checkEditar.checked == true) {
        var acceso = 1;
    } else {
        var acceso = 0;
    }

    payload.idmenu = idMenu;
    payload.idperfil = idPerfil;
    payload.acceso = acceso;
    payload.permiso = permiso;

    axios.put('/permiso_x_perfil', payload)
        .then(function (respuesta) {

            if (respuesta.data != 'Error') {

                Swal.fire({
                    position: 'top-end',
                    icon: 'success',
                    title: 'Cambios guardados!',
                    showConfirmButton: false,
                    timer: 1000
                });

            } else {

                Swal.fire({
                    position: 'top-end',
                    icon: 'error',
                    title: 'Error al actualizar!',
                    showConfirmButton: false,
                    timer: 1000
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

$(document).on("change", ".checkEliminar", function () {

    var idMenu = $(this).attr("idMenu");
    var idCheckEliminar = $(this).attr('id');
    var idPerfil = document.getElementById('userPerfil').value;
    var permiso = 'eliminar';
    var payload = {};

    const checkEliminar = document.getElementById(idCheckEliminar);

    if (checkEliminar.checked == true) {
        var acceso = 1;
    } else {
        var acceso = 0;
    }

    payload.idmenu = idMenu;
    payload.idperfil = idPerfil;
    payload.acceso = acceso;
    payload.permiso = permiso;

    axios.put('/permiso_x_perfil', payload)
        .then(function (respuesta) {

            if (respuesta.data != 'Error') {

                Swal.fire({
                    position: 'top-end',
                    icon: 'success',
                    title: 'Cambios guardados!',
                    showConfirmButton: false,
                    timer: 1000
                });

            } else {

                Swal.fire({
                    position: 'top-end',
                    icon: 'error',
                    title: 'Error al actualizar!',
                    showConfirmButton: false,
                    timer: 1000
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


if (searchPermisosxUser) {
    var payload = {};

    payload.status = 1;

    axios.post('/usuarios/all', payload)
        .then(function (respuesta) {

            var dataUsuario = respuesta.data;

            dataUsuario.forEach(function (valor, indice, array) {

                var idUsuario = valor[1];
                var nombreUsuario = valor[2];

                $("<option />")
                    .attr("value", idUsuario)
                    .html(nombreUsuario)
                    .appendTo("#userName");
            });
        }).catch(errors => {
            Swal.fire({
                icon: 'error',
                title: 'Hubo un error',
                text: 'Error en la Base de Datos'
            })
        })

    searchPermisosxUser.addEventListener('submit', function (e) {
        e.preventDefault();

        $('#btnPermisosxUser').html('<span id="loading" class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>Buscando...').addClass('disabled');

        $('#tbl-perm-user').DataTable().destroy();
        $("#tbl-perm-user").remove();

        var nameUser = document.getElementById("userName").value;

        var route = '/permiso_x_usuario/' + nameUser;

        axios.get(route,)
            .then(function (respuesta) {

                $('#btnPermisosxUser').html('<i class="fa fa-search"></i> Consultar').removeClass('disabled');

                $("#bodyPermUser").append(
                    '<table id="tbl-perm-user" class="display table-bordered table-striped dt-responsive text-center" cellspacing="0" style="width:100%"> </table>'
                );

                const tblPermUser = document.querySelector('#tbl-perm-user');

                if (tblPermUser) {
                    var dataSet = respuesta.data;

                    $(tblPermUser).DataTable({
                        data: dataSet,
                        deferRender: true,
                        iDisplayLength: 50,
                        retrieve: true,
                        processing: true,
                        fixedHeader: true,
                        responsive: true,
                        searching: false,
                        columnDefs: [{
                            targets: "_all",
                            sortable: false
                        }],
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
                            var idpadre = data[7];
                            //Pintar toda la columna
                            if (idpadre == 0) {
                                $('td', row).css('background-color', '#D6EAF8');
                                $(row).find('td:eq(2)').css('font-weight', 'bold');
                            }
                        },
                        columns: [{
                            title: "Orden"
                        },
                        {
                            title: "ID Menú"
                        },
                        {
                            title: "Menú"
                        },
                        {
                            title: "Acceso"
                        },
                        {
                            title: "Crear"
                        },
                        {
                            title: "Editar"
                        },
                        {
                            title: "Eliminar"
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
}

$("#userName").change(function () {

    $('#tbl-perm-user').DataTable().destroy();
    $("#tbl-perm-user").remove();

});

$(document).on("change", ".checkAccesoUser", function () {

    var idCheck = null;
    var idMenu = $(this).attr("idMenu");
    var idPadre = $(this).attr("idPadre");
    var idCheck = $(this).attr('id');
    var idUser = document.getElementById('userName').value;
    var idCheckCrear = idCheck.trim() + 'c';
    var idCheckEditar = idCheck.trim() + 'e';
    var idCheckEliminar = idCheck.trim() + 'el';
    var permiso = 'accesar';
    var payload = {};

    const checkAcceso = document.getElementById(idCheck);

    if (checkAcceso.checked == true) {

        var acceso = 1;

        if (idPadre > 0) {

            if (document.getElementById(idCheckCrear).disabled == true) {
                document.getElementById(idCheckCrear).disabled = false;
            }

            if (document.getElementById(idCheckEditar).disabled == true) {
                document.getElementById(idCheckEditar).disabled = false;
            }

            if (document.getElementById(idCheckEliminar).disabled == true) {
                document.getElementById(idCheckEliminar).disabled = false;
            }

        }

    } else {

        var acceso = 0;

        if (idPadre > 0) {

            if (document.getElementById(idCheckCrear).disabled == false) {
                document.getElementById(idCheckCrear).disabled = true;
            }

            if (document.getElementById(idCheckEditar).disabled == false) {
                document.getElementById(idCheckEditar).disabled = true;
            }

            if (document.getElementById(idCheckEliminar).disabled == false) {
                document.getElementById(idCheckEliminar).disabled = true;
            }

            if (document.getElementById(idCheckCrear).checked == true) {
                document.getElementById(idCheckCrear).checked = false;
            }

            if (document.getElementById(idCheckEditar).checked == true) {
                document.getElementById(idCheckEditar).checked = false;
            }

            if (document.getElementById(idCheckEliminar).checked == true) {
                document.getElementById(idCheckEliminar).checked = false;
            }

        }

    }

    payload.idmenu = idMenu;
    payload.idusuario = idUser;
    payload.acceso = acceso;
    payload.permiso = permiso;

    axios.put('/permiso_x_usuario', payload)
        .then(function (respuesta) {

            Swal.fire({
                position: 'top-end',
                icon: 'success',
                title: 'Cambios guardados!',
                showConfirmButton: false,
                timer: 1000
            });

        }).catch(errors => {
            Swal.fire({
                icon: 'error',
                title: 'Hubo un error',
                text: 'Error en la Base de Datos'
            })
        })

});

$(document).on("change", ".checkCrearxUser", function () {

    var idMenu = $(this).attr("idMenu");
    var idCheckCrear = $(this).attr('id');
    var idUser = document.getElementById('userName').value;
    var permiso = 'crear';
    var payload = {};

    const checkCrear = document.getElementById(idCheckCrear);

    if (checkCrear.checked == true) {
        var acceso = 1;
    } else {
        var acceso = 0;
    }

    payload.idmenu = idMenu;
    payload.idusuario = idUser;
    payload.acceso = acceso;
    payload.permiso = permiso;

    axios.put('/permiso_x_usuario', payload)
        .then(function (respuesta) {

            if (respuesta.data != 'Error') {

                Swal.fire({
                    position: 'top-end',
                    icon: 'success',
                    title: 'Cambios guardados!',
                    showConfirmButton: false,
                    timer: 1000
                });

            } else {

                Swal.fire({
                    position: 'top-end',
                    icon: 'error',
                    title: 'Error al actualizar!',
                    showConfirmButton: false,
                    timer: 1000
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

$(document).on("change", ".checkEditarxUser", function () {

    var idMenu = $(this).attr("idMenu");
    var idCheckEditar = $(this).attr('id');
    var idUser = document.getElementById('userName').value;
    var permiso = 'editar';
    var payload = {};

    const checkEditar = document.getElementById(idCheckEditar);

    if (checkEditar.checked == true) {
        var acceso = 1;
    } else {
        var acceso = 0;
    }

    payload.idmenu = idMenu;
    payload.idusuario = idUser;
    payload.acceso = acceso;
    payload.permiso = permiso;

    axios.put('/permiso_x_usuario', payload)
        .then(function (respuesta) {

            if (respuesta.data != 'Error') {

                Swal.fire({
                    position: 'top-end',
                    icon: 'success',
                    title: 'Cambios guardados!',
                    showConfirmButton: false,
                    timer: 1000
                });

            } else {

                Swal.fire({
                    position: 'top-end',
                    icon: 'error',
                    title: 'Error al actualizar!',
                    showConfirmButton: false,
                    timer: 1000
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

$(document).on("change", ".checkEliminarxUser", function () {

    var idMenu = $(this).attr("idMenu");
    var idCheckEliminar = $(this).attr('id');
    var idUser = document.getElementById('userName').value;
    var permiso = 'eliminar';
    var payload = {};

    const checkEliminar = document.getElementById(idCheckEliminar);

    if (checkEliminar.checked == true) {
        var acceso = 1;
    } else {
        var acceso = 0;
    }

    payload.idmenu = idMenu;
    payload.idusuario = idUser;
    payload.acceso = acceso;
    payload.permiso = permiso;

    axios.put('/permiso_x_usuario', payload)
        .then(function (respuesta) {

            if (respuesta.data != 'Error') {

                Swal.fire({
                    position: 'top-end',
                    icon: 'success',
                    title: 'Cambios guardados!',
                    showConfirmButton: false,
                    timer: 1000
                });

            } else {

                Swal.fire({
                    position: 'top-end',
                    icon: 'error',
                    title: 'Error al actualizar!',
                    showConfirmButton: false,
                    timer: 1000
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

