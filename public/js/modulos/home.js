import axios from 'axios';
import Swal from 'sweetalert2';

const menuLateral = document.getElementById('menu-lateral');

const tblMenus = document.querySelector('#tbl-menus');
const tblProdMes = document.querySelector('#table-prod-mes');

const formNewMenu = document.getElementById('formNewMenu');
const formNewSubMenu = document.getElementById('formNewSubMenu');
const formEditMenu = document.getElementById('formEditMenu');

const salesChartSem = document.querySelector('#ventas-chart-sem');
const salesChartMes = document.querySelector('#ventas-chart-mes');
const salesCharTot = document.querySelector('#revenue-chart-canvas');

const menusPermCrear = document.getElementById('menusPermCrear');

(function () {

    if (menuLateral) {

        var divMenu = document.getElementById('menu-lateral');

        /*var numberOfChildren = divMenu.getElementsByTagName('*').length;
        console.log(numberOfChildren);*/

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
                        iDisplayLength: 50,
                        retrieve: true,
                        processing: true,
                        fixedHeader: true,
                        responsive: true,
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

    if(menusPermCrear){
        
        var permisoCrear = menusPermCrear.value;

        if(permisoCrear > 0){
            document.getElementById('btn-agregar-menu').disabled = false;
        }else{
            document.getElementById('btn-agregar-menu').disabled = true;
        }

    }

    if (tblProdMes) {

        axios.get('/prod_vend_mes')
            .then(function (respuesta) {

                if (respuesta.data != 'empty') {

                    var dataSet = respuesta.data;

                    $(tblProdMes).DataTable({
                        data: dataSet,
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
                        bAutoWidth: false,
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
                        columns: [{
                            title: "ID"
                        },
                        {
                            title: "Producto"
                        },
                        {
                            title: "Cantidad"
                        },
                        {
                            title: "Ingreso"
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

    /*=============================================
     Chart Ventas x Dia
    =============================================*/
    if (salesChartSem) {

        axios.get('/tot_vtas_semana')
            .then(function (respuesta) {

                var dataSem1 = respuesta.data[0];
                var dataSem2 = respuesta.data[1];

                var ticksStyle = {
                    fontColor: '#495057',
                    fontStyle: 'bold'
                }

                var mode = 'index';
                var intersect = true;

                var d = new Date();
                var currentDay = d.getDate();

                var diasLabels = diasSemana(currentDay);

                // eslint-disable-next-line no-unused-vars
                var ventasChart = new Chart(salesChartSem, {
                    data: {
                        labels: diasLabels,
                        datasets: [{
                            type: 'line',
                            data: dataSem1,
                            backgroundColor: 'transparent',
                            borderColor: '#007bff',
                            pointBorderColor: '#007bff',
                            pointBackgroundColor: '#007bff',
                            fill: false
                            // pointHoverBackgroundColor: '#007bff',
                            // pointHoverBorderColor    : '#007bff'
                        },
                        {
                            type: 'line',
                            data: dataSem2,
                            backgroundColor: 'tansparent',
                            borderColor: '#ced4da',
                            pointBorderColor: '#ced4da',
                            pointBackgroundColor: '#ced4da',
                            fill: false
                            // pointHoverBackgroundColor: '#ced4da',
                            // pointHoverBorderColor    : '#ced4da'
                        }]
                    },
                    options: {
                        maintainAspectRatio: false,
                        responsive: true,
                        tooltips: {
                            mode: mode,
                            intersect: intersect
                        },
                        hover: {
                            mode: mode,
                            intersect: intersect
                        },
                        legend: {
                            display: false
                        },
                        scales: {
                            yAxes: [{
                                // display: false,
                                gridLines: {
                                    display: true,
                                    lineWidth: '4px',
                                    color: 'rgba(0, 0, 0, .2)',
                                    zeroLineColor: 'transparent'
                                },
                                /* ticks: $.extend({
                                    beginAtZero: true,
                                    suggestedMax: 200
                                }, ticksStyle) */
                                ticks: $.extend({
                                    beginAtZero: true,

                                    // Include a dollar sign in the ticks
                                    callback: function (value) {
                                        if (value >= 1000) {
                                            value /= 1000
                                            value += 'k'
                                        }

                                        return '$' + value
                                    }
                                }, ticksStyle)
                            }],
                            xAxes: [{
                                display: true,
                                gridLines: {
                                    display: false
                                },
                                ticks: ticksStyle
                            }]
                        }
                    }
                })

            });

    }

    /*=============================================
     Chart Ventas x Mes
    =============================================*/
    if (salesChartMes) {

        axios.get('/tot_vtas_mes')
            .then(function (respuesta) {

                var dataMes1 = respuesta.data[0];
                var dataMes2 = respuesta.data[1];

                var month = moment().month();

                var labelsMes = labelMeses(month);

                // eslint-disable-next-line no-unused-vars
                var ticksStyle = {
                    fontColor: '#495057',
                    fontStyle: 'bold'
                }

                var mode = 'index';
                var intersect = true;

                var salesChart = new Chart(salesChartMes, {
                    type: 'bar',
                    data: {
                        labels: labelsMes,
                        datasets: [
                            {
                                backgroundColor: '#007bff',
                                borderColor: '#007bff',
                                data: dataMes1
                            },
                            {
                                backgroundColor: '#ced4da',
                                borderColor: '#ced4da',
                                data: dataMes2
                            }
                        ]
                    },
                    options: {
                        maintainAspectRatio: false,
                        tooltips: {
                            mode: mode,
                            intersect: intersect
                        },
                        hover: {
                            mode: mode,
                            intersect: intersect
                        },
                        legend: {
                            display: false
                        },
                        scales: {
                            yAxes: [{
                                // display: false,
                                gridLines: {
                                    display: true,
                                    lineWidth: '4px',
                                    color: 'rgba(0, 0, 0, .2)',
                                    zeroLineColor: 'transparent'
                                },
                                ticks: $.extend({
                                    beginAtZero: true,

                                    // Include a dollar sign in the ticks
                                    callback: function (value) {
                                        if (value >= 1000) {
                                            value /= 1000
                                            value += 'k'
                                        }

                                        return '$' + value
                                    }
                                }, ticksStyle)
                            }],
                            xAxes: [{
                                display: true,
                                gridLines: {
                                    display: false
                                },
                                ticks: ticksStyle
                            }]
                        }
                    }
                })

            })



    }

    if (salesCharTot) {
        axios.get('/tot_vtas_mes')
            .then(function (respuesta) {

                var dataAnio1 = respuesta.data[2];
                var dataAnio2 = respuesta.data[3];

                var month = moment().month();

                var labelsMes = labelMeses(month);

                const ctx = document.getElementById('revenue-chart-canvas').getContext('2d');

                var salesChartOptions = {
                    maintainAspectRatio: false,
                    responsive: true,
                    scales: {
                        xAxes: [{
                            gridLines: {
                                display: false
                            }
                        }],
                        yAxes: [{
                            gridLines: {
                                display: false
                            }
                        }]
                    }
                }

                const myChart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: labelsMes,
                        datasets: [
                            {
                                label: 'Año actual',
                                backgroundColor: 'rgba(60,141,188,0.9)',
                                borderColor: 'rgba(60,141,188,0.8)',
                                pointRadius: false,
                                pointColor: '#3b8bba',
                                pointStrokeColor: 'rgba(60,141,188,1)',
                                pointHighlightFill: '#fff',
                                pointHighlightStroke: 'rgba(60,141,188,1)',
                                data: dataAnio1
                            },
                            {
                                label: 'Año anterior',
                                backgroundColor: 'rgba(210, 214, 222, 1)',
                                borderColor: 'rgba(210, 214, 222, 1)',
                                pointRadius: false,
                                pointColor: 'rgba(210, 214, 222, 1)',
                                pointStrokeColor: '#c1c7d1',
                                pointHighlightFill: '#fff',
                                pointHighlightStroke: 'rgba(220,220,220,1)',
                                data: dataAnio2
                            }
                        ]
                    },
                    options: salesChartOptions
                });


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

    axios.put('/menus', payload)
        .then(function (respuesta) {

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

if (formEditMenu) {
    formEditMenu.addEventListener('submit', function (e) {
        e.preventDefault();

        var idMenu = document.getElementById('newidMenuUpd').value;
        var newNameMenu = document.getElementById('newMenuUpd').value;
        var newUrlMenu = document.getElementById('newUrlUpd').value;
        var newIconoMenu = document.getElementById('newIconoUpd').value;

        var payload = {};

        payload.idmenu = idMenu;
        payload.nombre_menu = newNameMenu;
        payload.url = newUrlMenu;
        payload.icono = newIconoMenu;

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
ELIMINAR MENU/SUBMENU
=============================================*/
$(document).on("click", "#btn-eliminar-menu", function () {

    var idPadre = $(this).attr("idPadre");

    if (idPadre == 0) {

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

            if (result.value) {

                var idMenu = $(this).attr("idMenu");

                var route = '/menus/' + idMenu;

                axios.delete(route)
                    .then(function (respuesta) {

                        if (respuesta.data != 'Inexistente') {
                            Swal.fire(
                                'Menú eliminado!',
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
            }
        })

    } else {

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

            if (result.value) {

                var idMenu = $(this).attr("idMenu");

                var route = '/submenus/' + idMenu;

                axios.delete(route)
                    .then(function (respuesta) {

                        if (respuesta.data != 'Inexistente') {
                            Swal.fire(
                                'Submenú eliminado!',
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
            }
        })
    }

})


function diaDeSemana(fechaDia) {

    var dias = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];
    var fecha = new Date();

    if (fechaDia <= 0) {
        //console.log(fechaDia);
        var mes = fecha.getMonth();
        var ano = fecha.getFullYear(); //obteniendo año

        var lastDay = new Date(ano, mes, 0);

        var numberDay = lastDay.getDate();

        var dia = numberDay + fechaDia;


    } else {
        var mes = fecha.getMonth() + 1; //obteniendo mes
        var dia = fechaDia;
        var ano = fecha.getFullYear(); //obteniendo año

    }

    if (dia < 10) {
        dia = '0' + dia; //agrega cero si el menor de 10
    }

    if (mes < 10) {
        mes = '0' + mes //agrega cero si el menor de 10
    }

    var fec = mes + "/" + dia + "/" + ano;
    var day = new Date(fec).getDay();

    return dias[day];
}


function diasSemana(diaActual) {

    var labelDays = [diaDeSemana((diaActual - 6)), diaDeSemana((diaActual - 5)), diaDeSemana((diaActual - 4)), diaDeSemana((diaActual - 3)), diaDeSemana((diaActual - 2)), diaDeSemana((diaActual - 1)), diaDeSemana(diaActual)];

    return labelDays;
}

function descripcionMes(numMes) {

    var meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

    return meses[numMes];

}

function labelMeses(numMes) {

    var mes1 = numMes;
    var mes2 = numMes - 1;
    var mes3 = numMes - 2;
    var mes4 = numMes - 3;
    var mes5 = numMes - 4;
    var mes6 = numMes - 5;
    var mes7 = numMes - 6;

    if (mes2 === -1) {
        mes2 = 11;
    }

    if (mes3 === -1) {
        mes3 = 11;
    } else if (mes3 === -2) {
        mes3 = 10;
    }

    if (mes4 === -1) {
        mes4 = 11;
    } else if (mes4 === -2) {
        mes4 = 10;
    } else if (mes4 === -3) {
        mes4 = 9;
    }

    if (mes5 === -1) {
        mes5 = 11;
    } else if (mes5 === -2) {
        mes5 = 10;
    } else if (mes5 === -3) {
        mes5 = 9;
    } else if (mes5 === -4) {
        mes5 = 8;
    }

    if (mes6 === -1) {
        mes6 = 11;
    } else if (mes6 === -2) {
        mes6 = 10;
    } else if (mes6 === -3) {
        mes6 = 9;
    } else if (mes6 === -4) {
        mes6 = 8;
    } else if (mes6 === -5) {
        mes6 = 7;
    }

    if (mes7 === -1) {
        mes7 = 11;
    } else if (mes7 === -2) {
        mes7 = 10;
    } else if (mes7 === -3) {
        mes7 = 9;
    } else if (mes7 === -4) {
        mes7 = 8;
    } else if (mes7 === -5) {
        mes7 = 7;
    } else if (mes7 === -6) {
        mes7 = 6;
    }

    var labelMonths = [descripcionMes((mes7)), descripcionMes((mes6)), descripcionMes((mes5)), descripcionMes((mes4)), descripcionMes((mes3)), descripcionMes((mes2)), descripcionMes((mes1))];

    return labelMonths;

}


/*=============================================
FUNCIÓN PARA GENERAR COOKIES
=============================================*/

/* function crearCookie(nombre, valor, diasExpedicion){

    var hoy = new Date();
  
    hoy.setTime(hoy.getTime() + (diasExpedicion * 24 * 60 * 60 * 1000));
  
    var fechaExpedicion = "expires=" + hoy.toUTCString();
  
    document.cookie = nombre + "=" + valor + "; " + fechaExpedicion;
  
  } */

