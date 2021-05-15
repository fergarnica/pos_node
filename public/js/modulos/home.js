import axios from 'axios';
import Swal from 'sweetalert2';

const menuLateral = document.getElementById('menu-lateral');

const tblMenus = document.querySelector('#tbl-menus');

const formNewMenu = document.getElementById('formNewMenu');
const formNewSubMenu = document.getElementById('formNewSubMenu');
const formEditMenu = document.getElementById('formEditMenu');

(function () {

    if (menuLateral) {

        var routeOne = '/menus_activos';
        var routeTwo = '/submenus_activos';

        const requestOne = axios.get(routeOne);
        const requestTwo = axios.get(routeTwo);

        axios.all([requestOne, requestTwo]).then(axios.spread((...respuesta) => {

            const responseOne = respuesta[0];
            const responseTwo = respuesta[1];

            const menu = responseOne.data[0];
            const submenu = responseTwo.data[0];

            crearMenu(menu);
            crearSubMenu(submenu);

        }))
    }
    /*=============================================
        Data Table Menus
    =============================================*/
    if (tblMenus) {

        axios.get('/menus/all')
            .then(function (respuesta) {

                if (respuesta.data != 'empty') {

                    var dataSet = respuesta.data;

                    $(tblMenus).DataTable({
                        data: dataSet,
                        deferRender: true,
                        iDisplayLength: 25,
                        retrieve: true,
                        processing: true,
                        fixedHeader: true,
                        responsive: true,
                        columnDefs:[{
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
                        columns: [{
                            title: "#"
                        },
                        {
                            title: "ID Menú"
                        },
                        {
                            title: "Orden"
                        },
                        {
                            title: "Menú"
                        },
                        {
                            title: "Url"
                        },
                        {
                            title: "Icono"
                        },
                        {
                            title: "Estatus"
                        },
                        {
                            title: "Acciones"
                        }
                        ],
                        createdRow: function (row, data, dataIndex) {
                            var idpadre = data[8];
                            //Pintar toda la columna
                            if (idpadre == 0) {
                                $('td', row).css('background-color', '#D6EAF8');
                                $(row).find('td:eq(3)').css('font-weight', 'bold');
                            }
                        },
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
})();


function crearMenu(menu) {
    for (var i = 0; i < menu.length; i++) {
        var menus = menu[i];
        var idMenu = menus.idmenu;
        var nombre_menu = menus.menu;
        var url = menus.url;
        var classNameA = '"nav-link"';
        var classNameIcon = '"nav-icon ' + menus.icono + ' "';

        if (menus.num_hijos == null) {
            var classNameLi = '"nav-item"';
            $(".nav-lateral").append("<li id=" + idMenu + " class=" + classNameLi + ">" + "<a href=" + url + " class=" + classNameA + ">" + "<i class=" + classNameIcon + "></i>" + "<p>" + nombre_menu + "</p>" + "</a>" + "</li>");
        } else {
            var classNameLi = '"nav-item has-treeview"';
            var classNameTree = '"fas fa-angle-left right"';
            $(".nav-lateral").append("<li id=" + idMenu + " class=" + classNameLi + ">" + "<a href=" + url + " class=" + classNameA + ">" + "<i class=" + classNameIcon + "></i>" + "<p>" + nombre_menu + "<i class=" + classNameTree + "></i>" + "</p>" + "</a>" + "</li>");
        }
    }
}

function crearSubMenu(submenu) {
    var id_anterior = 0;

    for (var i = 0; i < submenu.length; i++) {

        var submenus = submenu[i];
        var submenu_nombre = submenus.submenu;

        if (submenu_nombre != null) {
            var id_menu = submenus.idmenu;
            var url_submenu = submenus.url_submenu;
            var classNameLi = '"nav-item"';
            var classNameA = '"nav-link"';
            var classNameIcon = '"nav-icon ' + submenus.icono_submenu + ' "';

            if (id_menu != id_anterior) {
                //agregamos un <ul> el cual va hacer el contenedor del submenu
                id_anterior = id_menu;
                $("#" + id_menu).append('<ul class="nav nav-treeview"></ul>');

            }
            //agregamos los item al submenu
            $("#" + id_menu + " ul").append("<li class= " + classNameLi + ">" + "<a href=" + url_submenu + " class=" + classNameA + ">" + "<i class=" + classNameIcon + "></i>" + "<p>" + submenu_nombre + "</li>");
        }
    }
}

/*=============================================
Activar/Desactivar Menus
=============================================*/
$(document).on("click", "#btn-estatus-menu", function () {

    var idMenu = $(this).attr("idMenu");
    var estadoMenu = $(this).attr("estadoMenu");

    var payload = {};

    payload.idMenu = idMenu;
    payload.estadoMenu = estadoMenu;

    console.log(payload);

    axios.put('/menus', payload)
        .then(function (respuesta) {

            console.log(respuesta);
            if (window.matchMedia("(max-width:767px)").matches) {

                Swal.fire(
                    'Menú Actualizado',
                    respuesta.data,
                    'success'
                ).then(function (result) {
                    if (result.value) {
                        window.location = "/menus";
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

    if (estadoMenu == 0) {

        $(this).removeClass('btn-success');
        $(this).addClass('btn-danger');
        $(this).html('Desactivado');
        $(this).attr('estadoMenu', 1);

    } else {

        $(this).addClass('btn-success');
        $(this).removeClass('btn-danger');
        $(this).html('Activado');
        $(this).attr('estadoMenu', 0);
    }
});

if (formNewMenu) {

    formNewMenu.addEventListener('submit', function (e) {
        e.preventDefault();

        var newidMenu = document.getElementById('newidMenu').value;
        var neworden = document.getElementById('neworden').value;
        var newMenu = document.getElementById('newMenu').value;
        var newUrl = document.getElementById('newUrl').value;
        var newIcono = document.getElementById('newIcono').value;

        var payload = {};

        payload.idmenu = newidMenu;
        payload.menu_nombre = newMenu;
        payload.id_padre = 0;
        payload.orden = neworden;
        payload.url = newUrl;
        payload.icono = newIcono;
        payload.status = 1;

        axios.post('/menus', payload)
            .then(function (respuesta) {

                if (respuesta.data == "Repetido") {

                    // Alerta
                    Swal.fire(
                        'El menú ya existe',
                        'El menú ingresado ya existe en la base de datos!',
                        'warning'
                    );

                } else {

                    Swal.fire(
                        'Menú Creado!',
                        respuesta.data,
                        'success'
                    ).then(function (result) {
                        if (result.value) {
                            window.location = "/menus";
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

if (formNewSubMenu) {

    formNewSubMenu.addEventListener('submit', function (e) {
        e.preventDefault();

        var newidSubMenu = document.getElementById('newidSubMenu').value;
        var newordenSub = document.getElementById('newordenSub').value;
        var newSubMenu = document.getElementById('newSubMenu').value;
        var newUrlSub = document.getElementById('newUrlSub').value;
        var newIconoSub = document.getElementById('newIconoSub').value;
        var idPadre = document.getElementById('idPadre').value;

        var payload = {};

        payload.idmenu = newidSubMenu;
        payload.menu_nombre = newSubMenu;
        payload.id_padre = idPadre;
        payload.orden = newordenSub;
        payload.url = newUrlSub;
        payload.icono = newIconoSub;
        payload.status = 1;

        axios.post('/submenus', payload)
            .then(function (respuesta) {

                if (respuesta.data == "Repetido") {

                    // Alerta
                    Swal.fire(
                        'El submenú ya existe',
                        'El submenú ingresado ya existe en la base de datos!',
                        'warning'
                    );

                } else {

                    Swal.fire(
                        'Submenú Creado!',
                        respuesta.data,
                        'success'
                    ).then(function (result) {
                        if (result.value) {
                            window.location = "/menus";
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

if(formEditMenu){
    formEditMenu.addEventListener('submit', function (e) {
        e.preventDefault();

        var idMenu = document.getElementById('newidMenuUpd').value;
        var newNameMenu = document.getElementById('newMenuUpd').value;
        var newUrlMenu = document.getElementById('newUrlUpd').value;
        var newIconoMenu = document.getElementById('newIconoUpd').value;

        var payload = {};

        payload.idmenu= idMenu;
        payload.nombre_menu= newNameMenu;
        payload.url= newUrlMenu;
        payload.icono= newIconoMenu;

        var route = '/menus/' + idMenu;

        axios.put(route, payload)
            .then(function (respuesta) {
                
                if (respuesta.data == 'Nulos') {

                    Swal.fire({
                        icon: 'warning',
                        title: 'Oops...',
                        text: 'No se detectaron cambios!',
                    })

                } else {

                    if (respuesta.data == 'MenuRep') {

                        Swal.fire(
                            'El menú ya existe',
                            'El menú capturado ya existe en la base de datos!',
                            'warning'
                        )

                    } else {

                        Swal.fire(
                            'Menú Actualizado!',
                            respuesta.data,
                            'success'
                        ).then(function (result) {
                            if (result.value) {
                                window.location = "/menus";
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
    })
}

/*=============================================
DETALLE DE VENTA
=============================================*/
$(document).on("click", "#btn-eliminar-menu", function () {

    var idPadre = $(this).attr("idPadre");

    console.log(idPadre);

    if(idPadre == 0){

        Swal.fire({
            title: '¿Está seguro de eliminar el menú?',
            text: "¡Se eliminarán tambien los submenús relacionados!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            cancelButtonText: 'Cancelar',
            confirmButtonText: 'Si, eliminar!'
        }).then((result) => {
    
            /* if (result.value) {
    
                var payload = {};
    
                var idNota = $(this).attr("idNota");
                var idCaja = $(this).attr("idCaja");
    
                payload.idNota = idNota;
                payload.idCaja = idCaja;
    
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
            } */
        })

    }else{

        Swal.fire({
            title: '¿Está seguro de eliminar el Submenú?',
            text: "¡Si no lo está puede cancelar la acción!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            cancelButtonText: 'Cancelar',
            confirmButtonText: 'Si, eliminar!'
        }).then((result) => {
    
            /* if (result.value) {
    
                var payload = {};
    
                var idNota = $(this).attr("idNota");
                var idCaja = $(this).attr("idCaja");
    
                payload.idNota = idNota;
                payload.idCaja = idCaja;
    
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
            } */
        })

    }

    
})
