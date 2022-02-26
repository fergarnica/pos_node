import axios from 'axios';
import Swal from 'sweetalert2';
import moment from 'moment';
import pdfMake from 'pdfMake';
import vfsFonts from 'pdfmake/build/vfs_fonts.js';
import FileSaver from 'file-saver';
import clienteAxios from '../../../config/axios';
import { OpenStreetMapProvider } from 'leaflet-geosearch';
require('babel-polyfill');

pdfMake.vfs = vfsFonts.pdfMake.vfs;


const formNewProv = document.getElementById('formNewProv');
const formEditProv = document.getElementById('formEditProv');
const formNewClien = document.getElementById('formNewClien');
const formEditClien = document.getElementById('formEditClien');

const provTel = document.getElementById("provTel");
const editProvTel = document.getElementById("editProvTel");
const telCliente = document.getElementById("telCliente");
const telEditCliente = document.getElementById("telEditCliente");

const tblProv = document.querySelector('#tbl-proveedores');
const tblClientes = document.querySelector('#tbl-clientes');
const infoDetProv = document.getElementById('infodet-proveedor');

const contenedorMapa = document.querySelector('.contenedor-mapa');

const provPermCrear = document.getElementById('provPermCrear');
const cliPermCrear = document.getElementById('cliPermCrear');
//const buscador = document.querySelector('#formNewProv');
let marker;

(function () {

    if (tblProv) {

        axios.get('/proveedores/all')
            .then(function (respuesta) {

                if (respuesta.data != 'empty') {

                    document.getElementById('btn-opciones-prov').disabled = false;

                    var dataSet = respuesta.data;

                    $(tblProv).DataTable({
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
                            title: "ID Proveedor"
                        },
                        {
                            title: "Proveedor"
                        },
                        {
                            title: "Nombre de Contacto"
                        },
                        {
                            title: "RFC"
                        },
                        {
                            title: "Razón Social"
                        },
                        {
                            title: "Correo Electronico"
                        },
                        {
                            title: "Número Telefónico"
                        },
                        {
                            title: "Calle"
                        },
                        {
                            title: "Número de Calle"
                        },
                        {
                            title: "Colonia"
                        },
                        {
                            title: "Municipio"
                        },
                        {
                            title: "Estado"
                        },
                        {
                            title: "Código Postal"
                        },
                        {
                            title: "Fecha de Alta en Sistema"
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

    if(provPermCrear){
        
        var permisoCrear = provPermCrear.value;

        if(permisoCrear > 0){
            document.getElementById('btn-agregar-proveedor').disabled = false;
        }else{
            document.getElementById('btn-agregar-proveedor').disabled = true;
        }

    }

    if (tblClientes) {

        axios.get('/clientes/all')
            .then(function (respuesta) {

                if (respuesta.data != 'empty') {

                    var dataSet = respuesta.data;

                    $(tblClientes).DataTable({
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
                            title: "ID Cliente"
                        },
                        {
                            title: "Cliente"
                        },
                        {
                            title: "RFC"
                        },
                        {
                            title: "Correo Electronico"
                        },
                        {
                            title: "Número Telefónico"
                        },
                        {
                            title: "Fecha de Alta en Sistema"
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

    if(cliPermCrear){
        
        var permisoCrear = cliPermCrear.value;

        if(permisoCrear > 0){
            document.getElementById('btn-agregar-cliente').disabled = false;
        }else{
            document.getElementById('btn-agregar-cliente').disabled = true;
        }

    }


})();

if (provTel) {
    var im = new Inputmask("(99)99-99-99-99");
    im.mask(provTel);
}

if (editProvTel) {
    var im = new Inputmask("(99)99-99-99-99");
    im.mask(editProvTel);
}

if (telCliente) {
    var im = new Inputmask("(99)99-99-99-99");
    im.mask(telCliente);
}

if (telEditCliente) {
    var im = new Inputmask("(99)99-99-99-99");
    im.mask(telEditCliente);
}

/*=============================================
Crear Proveedor
=============================================*/
if (formNewProv) {

    formNewProv.addEventListener('input', buscarDireccion);

    formNewProv.addEventListener('submit', function (e) {
        e.preventDefault();

        var empProv = document.getElementById("empProv").value;
        var nomProv = document.getElementById("nomProv").value;
        var rfcProv = document.getElementById("rfcProv").value;
        var rsProv = document.getElementById("rsProv").value;
        var provEmail = document.getElementById("provEmail").value;
        var provTel = document.getElementById("provTel").value;
        var nameCalleProveedor = document.getElementById("nameCalleProveedor").value;
        var numCalleProv = document.getElementById("numCalleProv").value;
        var munProv = document.getElementById("munProv").value;
        var cpProv = document.getElementById("cpProv").value;
        var colProv = document.getElementById("colProv").value;
        var estadoProv = document.getElementById("estadoProv").value;

        var payload = {};

        payload.proveedor = empProv;
        payload.nombre_proveedor = nomProv;
        payload.rfc = rfcProv;
        payload.razon_social = rsProv;
        payload.email = provEmail;
        payload.telefono = provTel;
        payload.calle = nameCalleProveedor;
        payload.numero = numCalleProv;
        payload.colonia = colProv;
        payload.municipio = munProv;
        payload.estado = estadoProv;
        payload.cp = cpProv;
        payload.status = 1;
        payload.fecha_creacion = moment().format('YYYY-MM-DD H:mm:ss');

        axios.post('/proveedores', payload)
            .then(function (respuesta) {
                console.log(respuesta);

                if (respuesta.data == 'Repetido') {

                    Swal.fire({
                        icon: 'warning',
                        title: 'Oops...',
                        text: 'El proveedor capturado ya existe en la base de datos!',
                    })

                } else {

                    // Alerta
                    Swal.fire(
                        'Proveedor Creado',
                        respuesta.data,
                        'success'
                    ).then(function (result) {
                        if (result.value) {
                            window.location = "/proveedores";
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

async function buscarDireccion(e) {

    if (e.target.id == 'cpProv') {

        document.getElementById('estadoProv').value = '';
        document.getElementById('munProv').value = '';
        document.getElementById('nameCalleProveedor').value = '';
        document.getElementById('numCalleProv').value = '';

        removeOptions(document.getElementById('colProv'));

        if (e.target.value.length == 5) {

            var cp = e.target.value;

            var route = 'cp_buscar/' + cp;
            var routeColonias = 'colonias_por_cp/' + cp;

            const cpConsulta = await clienteAxios.get(route);

            if (cpConsulta.data.ok == true) {

                //console.log(cpConsulta.data.response[0]);
                var estado = cpConsulta.data.response[0].estado;
                var mnpio = cpConsulta.data.response[0].municipio;

                document.getElementById('estadoProv').value = estado;
                document.getElementById('munProv').value = mnpio;

                const cpConsultaColonias = await clienteAxios.get(routeColonias);

                var colonias = cpConsultaColonias.data.response.colonias;

                colonias.forEach(function (valor, indice, array) {

                    var colonia = valor;

                    $("<option />")
                        .attr("value", colonia)
                        .html(colonia)
                        .appendTo("#colProv");

                })


            } else {

                Swal.fire({
                    icon: 'error',
                    title: cpConsulta.data.err.message + '!',
                    text: 'El CP ingresado no existe, validar.'
                }).then(function (result) {
                    if (result.value) {
                        document.getElementById('cpProv').value = '';
                        document.getElementById('estadoProv').value = '';
                        document.getElementById('munProv').value = '';
                        document.getElementById('nameCalleProveedor').value = '';
                        document.getElementById('numCalleProv').value = '';
                        removeOptions(document.getElementById('colProv'));
                    }
                });

            }

        }

    } else if (e.target.id == 'editCpProv') {

        document.getElementById('editEstadoProv').value = '';
        document.getElementById('editMunProv').value = '';
        document.getElementById('editCalleProveedor').value = '';
        document.getElementById('editNumCalleProv').value = '';

        removeOptions(document.getElementById('editColProv'));

        if (e.target.value.length == 5) {

            var cp = e.target.value;

            var route = 'cp_buscar/' + cp;
            var routeColonias = 'colonias_por_cp/' + cp;

            const cpConsulta = await clienteAxios.get(route);

            if (cpConsulta.data.ok == true) {

                //console.log(cpConsulta.data.response[0]);
                var estado = cpConsulta.data.response[0].estado;
                var mnpio = cpConsulta.data.response[0].municipio;

                document.getElementById('editEstadoProv').value = estado;
                document.getElementById('editMunProv').value = mnpio;

                const cpConsultaColonias = await clienteAxios.get(routeColonias);

                var colonias = cpConsultaColonias.data.response.colonias;

                colonias.forEach(function (valor, indice, array) {

                    var colonia = valor;

                    $("<option />")
                        .attr("value", colonia)
                        .html(colonia)
                        .appendTo("#editColProv");

                })


            } else {

                Swal.fire({
                    icon: 'error',
                    title: cpConsulta.data.err.message + '!',
                    text: 'El CP ingresado no existe, validar.'
                }).then(function (result) {
                    if (result.value) {
                        document.getElementById('editCpProv').value = '';
                        document.getElementById('editEstadoProv').value = '';
                        document.getElementById('editMunProv').value = '';
                        document.getElementById('editCalleProveedor').value = '';
                        document.getElementById('editNumCalleProv').value = '';
                        removeOptions(document.getElementById('editColProv'));
                    }
                });

            }

        }
    }

}

function removeOptions(selectElement) {
    var i, L = selectElement.options.length - 1;
    for (i = L; i >= 0; i--) {
        selectElement.remove(i);
    }
}


/*=============================================
Activar/Desactivar Proveedor
=============================================*/
$(document).on("click", "#btn-estatus-prov", function () {

    var idProveedor = $(this).attr("idProveedor");
    var estadoProveedor = $(this).attr("estadoProveedor");

    var payload = {};

    payload.idProveedor = idProveedor;
    payload.estadoProveedor = estadoProveedor;

    axios.put('/proveedores', payload)
        .then(function (respuesta) {
            if (window.matchMedia("(max-width:767px)").matches) {

                Swal.fire(
                    'Proveedor Actualizado',
                    respuesta.data,
                    'success'
                ).then(function (result) {
                    if (result.value) {
                        window.location = "/proveedores";
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

    if (estadoProveedor == 0) {

        $(this).removeClass('btn-success');
        $(this).addClass('btn-danger');
        $(this).html('Desactivado');
        $(this).attr('estadoProveedor', 1);

    } else {

        $(this).addClass('btn-success');
        $(this).removeClass('btn-danger');
        $(this).html('Activado');
        $(this).attr('estadoProveedor', 0);
    }
});

/*=============================================
Eliminar Proveedor
=============================================*/
$(document).on("click", "#btn-eliminar-prov", function () {

    var idProveedor = $(this).attr("idProveedor");

    Swal.fire({
        title: '¿Está seguro de borrar el perfil?',
        text: "¡Si no lo está puede cancelar la acción!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Si, borrar!'
    }).then((result) => {
        if (result.value) {

            var route = '/proveedores/' + idProveedor;

            axios.delete(route)
                .then(function (respuesta) {
                    //console.log(respuesta);
                    Swal.fire(
                        'Eliminado!',
                        respuesta.data,
                        'success'
                    ).then(function (result) {
                        if (result.value) {
                            window.location = "/proveedores";
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
Editar Proveedor
=============================================*/
if (formEditProv) {

    const url = window.location.pathname;
    const idProveedor = url.substring(url.lastIndexOf('/') + 1);

    var route = '/proveedores/' + idProveedor;

    axios.get(route)
        .then(function (respuesta) {

            var idProv = respuesta.data[0].idproveedor;
            var proveedor = respuesta.data[0].proveedor;
            var nombre = respuesta.data[0].nombre_proveedor;
            var rfc = respuesta.data[0].rfc;
            var razon_social = respuesta.data[0].razon_social;
            var email = respuesta.data[0].email;
            var telefono = respuesta.data[0].telefono;
            var calle = respuesta.data[0].calle;
            var numero = respuesta.data[0].numero;
            var colonia = respuesta.data[0].colonia;
            var municipio = respuesta.data[0].municipio;
            var estado = respuesta.data[0].estado;
            var cp = respuesta.data[0].cp;

            $("#idProv").val(idProv);
            $("#editProv").val(proveedor);
            $("#editNomProv").val(nombre);
            $("#editRfcProv").val(rfc);
            $("#editRsProv").val(razon_social);
            $("#provEmail").val(email);
            $("#editProvTel").val(telefono);
            $("#editCalleProveedor").val(calle);
            $("#editNumCalleProv").val(numero);
            $("#editMunProv").val(municipio);
            $("#editEstadoProv").val(estado);
            $("#editCpProv").val(cp);

            $("<option />")
                .attr("value", colonia)
                .html(colonia)
                .appendTo("#editColProv");

        }).catch(() => {
            Swal.fire({
                icon: 'error',
                title: 'Hubo un error',
                text: 'Error en la base de datos!'
            }).then(function (result) {
                if (result.value) {
                    window.location = "/proveedores";
                }
            });
        });

    formEditProv.addEventListener('input', buscarDireccion);

    formEditProv.addEventListener('submit', function (e) {
        e.preventDefault();

        var idProveedor = document.getElementById("idProv").value;
        var proveedor = document.getElementById("editProv").value;
        var nombre = document.getElementById("editNomProv").value;
        var rfc = document.getElementById("editRfcProv").value;
        var razon_social = document.getElementById("editRsProv").value;
        var email = document.getElementById("provEmail").value;
        var telefono = document.getElementById("editProvTel").value;
        var calle = document.getElementById("editCalleProveedor").value;
        var numero = document.getElementById("editNumCalleProv").value;
        var colonia = document.getElementById("editColProv").value;
        var municipio = document.getElementById("editMunProv").value;
        var estado = document.getElementById("editEstadoProv").value;
        var cp = document.getElementById("editCpProv").value;

        var payload = {};

        payload.idproveedor = idProveedor;
        payload.proveedor = proveedor;
        payload.nombre_proveedor = nombre;
        payload.rfc = rfc;
        payload.razon_social = razon_social;
        payload.email = email;
        payload.telefono = telefono;
        payload.calle = calle;
        payload.numero = numero;
        payload.colonia = colonia;
        payload.municipio = municipio;
        payload.estado = estado;
        payload.cp = cp;

        var route = '/proveedores/' + idProveedor;

        axios.put(route, payload)
            .then(function (respuesta) {

                if (respuesta.data == 'Nulos') {

                    Swal.fire({
                        icon: 'warning',
                        title: 'Oops...',
                        text: 'No se detectaron cambios!',
                    })

                } else {

                    if (respuesta.data == 'ProvRep') {

                        Swal.fire(
                            'El proveedor ya existe',
                            'El proveedor capturado ya existe en la base de datos!',
                            'warning'
                        )

                    } else {

                        Swal.fire(
                            'Proveedor Actualizado!',
                            respuesta.data,
                            'success'
                        ).then(function (result) {
                            if (result.value) {
                                window.location = "/proveedores";
                            }
                        });

                    }
                }
            }).catch(() => {
                Swal.fire({
                    icon: 'error',
                    title: 'Hubo un error',
                    text: 'No se pudo recuperar la información del Proveedor'
                }).then(function (result) {
                    if (result.value) {
                        window.location = "/proveedores";
                    }
                });
            });
    })
}

/*=============================================
Imprimir Proveedores
=============================================*/
$(document).on("click", "#btn-print-prov", function () {

    $('#btn-opciones-prov').html('<span id="loading" class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>Imprimiendo..').addClass('disabled');

    //$('#btn-print-prov').html('<span id="loading" class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>Imprimiendo..').addClass('disabled');

    axios.get('/print_proveedores')
        .then(function (respuesta) {

            var data = respuesta.data;

            if (data.length > 0) {

                $('#btn-opciones-prov').html('Opciones').removeClass('disabled');

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
                    window.location = "/proveedores";
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
Exportar Proveedores
=============================================*/
$(document).on("click", "#btn-export-prov", function () {

    $('#btn-opciones-prov').html('<span id="loading" class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>Exportando...').addClass('disabled');

    axios.get('/export_proveedores', {
        responseType: 'blob'
    })
        .then(function (respuesta) {

            var data = respuesta.data;

            if (data) {

                $('#btn-opciones-prov').html('Opciones').removeClass('disabled');

                var blob = new Blob([data], { type: 'vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8' });
                FileSaver.saveAs(blob, 'proveedores.xlsx');

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
                    window.location = "/proveedores";
                }
            });
        });

})

/*=============================================
Crear Cliente
=============================================*/
if (formNewClien) {

    formNewClien.addEventListener('submit', function (e) {
        e.preventDefault();


        var nomCliente = document.getElementById("nomCliente").value;
        var rfcCliente = document.getElementById("rfcCliente").value;
        var mailCliente = document.getElementById("mailCliente").value;
        var telCliente = document.getElementById("telCliente").value;

        var payload = {};

        payload.cliente = nomCliente;
        payload.rfc = rfcCliente;
        payload.email = mailCliente;
        payload.telefono = telCliente;
        payload.status = 1;
        payload.fecha_creacion = moment().format('YYYY-MM-DD H:mm:ss');

        axios.post('/clientes', payload)
            .then(function (respuesta) {

                if (respuesta.data == 'Repetido') {

                    Swal.fire({
                        icon: 'warning',
                        title: 'Oops...',
                        text: 'El cliente capturado ya existe en la base de datos!',
                    })

                } else {

                    // Alerta
                    Swal.fire(
                        'Cliente Creado',
                        respuesta.data,
                        'success'
                    ).then(function (result) {
                        if (result.value) {
                            window.location = "/clientes";
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
Activar/Desactivar Cliente
=============================================*/
$(document).on("click", "#btn-estatus-cli", function () {

    var idCliente = $(this).attr("idCliente");
    var estadoCliente = $(this).attr("estadoCliente");

    var payload = {};

    payload.idCliente = idCliente;
    payload.estadoCliente = estadoCliente;

    axios.put('/clientes', payload)
        .then(function (respuesta) {
            if (window.matchMedia("(max-width:767px)").matches) {

                Swal.fire(
                    'Cliente Actualizado',
                    respuesta.data,
                    'success'
                ).then(function (result) {
                    if (result.value) {
                        window.location = "/clientes";
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

    if (estadoCliente == 0) {

        $(this).removeClass('btn-success');
        $(this).addClass('btn-danger');
        $(this).html('Desactivado');
        $(this).attr('estadoCliente', 1);

    } else {

        $(this).addClass('btn-success');
        $(this).removeClass('btn-danger');
        $(this).html('Activado');
        $(this).attr('estadoCliente', 0);
    }
});

/*=============================================
Eliminar Cliente
=============================================*/
$(document).on("click", "#btn-eliminar-cli", function () {

    var idCliente = $(this).attr("idCliente");

    Swal.fire({
        title: '¿Está seguro de eliminar al cliente?',
        text: "¡Si no lo está puede cancelar la acción!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Si, borrar!'
    }).then((result) => {
        if (result.value) {

            var route = '/clientes/' + idCliente;

            axios.delete(route)
                .then(function (respuesta) {
                    //console.log(respuesta);
                    if (respuesta.data == 'Inexistente') {

                        Swal.fire({
                            icon: 'warning',
                            title: 'Oops...',
                            text: 'El cliente no existe en la base de datos!',
                        })


                    } else {

                        Swal.fire(
                            'Eliminado!',
                            respuesta.data,
                            'success'
                        ).then(function (result) {
                            if (result.value) {
                                window.location = "/clientes";
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
});

/*=============================================
Editar Cliente
=============================================*/
if (formEditClien) {

    const url = window.location.pathname;
    const idCliente = url.substring(url.lastIndexOf('/') + 1);

    var route = '/clientes/' + idCliente;

    axios.get(route)
        .then(function (respuesta) {

            console.log(respuesta);
            var idCliente = respuesta.data[0].idcliente;
            var cliente = respuesta.data[0].cliente;
            var rfc = respuesta.data[0].rfc;
            var email = respuesta.data[0].email;
            var telefono = respuesta.data[0].telefono;

            $("#idCliente").val(idCliente);
            $("#nomEditCliente").val(cliente);
            $("#rfcEditCliente").val(rfc);
            $("#mailEditCliente").val(email);
            $("#telEditCliente").val(telefono);

        }).catch(errors => {
            Swal.fire({
                icon: 'error',
                title: 'Hubo un error',
                text: 'Error en la Base de Datos'
            })
        })

    formEditClien.addEventListener('submit', function (e) {
        e.preventDefault();

        var idCliente = document.getElementById("idCliente").value;
        var cliente = document.getElementById("nomEditCliente").value;
        var rfc = document.getElementById("rfcEditCliente").value;
        var email = document.getElementById("mailEditCliente").value;
        var telefono = document.getElementById("telEditCliente").value;

        var payload = {};

        payload.idcliente = idCliente;
        payload.cliente = cliente;
        payload.rfc = rfc;
        payload.email = email;
        payload.telefono = telefono;

        var route = '/clientes/' + idCliente;

        axios.put(route, payload)
            .then(function (respuesta) {

                if (respuesta.data == 'Nulos') {

                    Swal.fire({
                        icon: 'warning',
                        title: 'Oops...',
                        text: 'No se detectaron cambios!',
                    })

                } else {

                    if (respuesta.data == 'CliRep') {

                        Swal.fire(
                            'El cliente ya existe',
                            'El cliente capturado ya existe en la base de datos!',
                            'warning'
                        )

                    } else {

                        Swal.fire(
                            'Cliente Actualizado!',
                            respuesta.data,
                            'success'
                        ).then(function (result) {
                            if (result.value) {
                                window.location = "/clientes";
                            }
                        });

                    }
                }

            })
    })

}

/*=============================================
Importar Proveedores
=============================================*/
/* $('#inputFileProv').on('change', function () {
    //get the file name
    var fileName = $(this).val();
    console.log(fileName);
    //replace the "Choose a file" label
    $(this).next('.custom-file-label').html(fileName);
});

$(document).on("click", "#btn-layout-prov", function () {

    axios.get('/layout_proveedores', {
        responseType: 'blob'
    })
        .then(function (respuesta) {
            console.log(respuesta);

            var data = respuesta.data;

            var blob = new Blob([data], { type: 'vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8' });
            FileSaver.saveAs(blob, 'plantilla_proveedores.xlsx');

        })
})


function s2ab(s) {
    var buf = new ArrayBuffer(s.length);
    var view = new Uint8Array(buf);
    for (var i = 0; i != s.length; ++i)
        view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
} */

/* if (cargaProv) {

    $('#btnCargaProv').addClass('disabled');

    let selectedFile;

    cargaProv.addEventListener("change", function (e) {
        selectedFile = e.target.files[0];

        if (selectedFile) {
            let fileReader = new FileReader();
            fileReader.readAsBinaryString(selectedFile);
            fileReader.onload = (event) => {
                var data = event.target.result;
                var filename = selectedFile.name;
                var binary = "";
                var bytes = new Uint8Array(e.target.result);
                var length = bytes.byteLength;
                for (var i = 0; i < length; i++) {
                    binary += String.fromCharCode(bytes[i]);
                }
                var workbook = XLSX.read(binary, { type: 'binary', cellDates: true, cellStyles: true });
                var wopts = { bookType: 'xlsx', bookSST: false, type: 'base64' };
                var wbout = XLSX.write(workbook, wopts);
                var blob = new Blob([s2ab(atob(wbout))], { type: 'application/octet-stream' });
                var formData = new FormData();
                formData.append('filetoupload', blob, filename);
                axios.post('/import_proveedores', formData)
                    .then(function (respuesta) {
                        console.log('aqui');
                        $('#btnCargaProv').removeClass('disabled');
                    })

            }
            //fileReader.readAsArrayBuffer(selectedFile);
        }

    })

    formCargaProv.addEventListener('submit', function (e) {
        e.preventDefault();

        if (selectedFile) {

            var payload = {};

            var fileName= selectedFile.name;

            payload.fileName = fileName;

            axios.post('/carga_proveedores', payload)
                    .then(function (respuesta) {
                        console.log(respuesta);
                    })
        }
    })
} */


if(infoDetProv){

    const url = window.location.pathname;
    const idProv = url.substring(url.lastIndexOf('/') + 1);

    var route = '/proveedores/' + idProv;

    axios.get(route)
        .then(function (respuesta) {

            var idProveedor = respuesta.data[0].idproveedor;
            var proveedor = respuesta.data[0].proveedor;
            var nombre_contacto = respuesta.data[0].nombre_proveedor;
            var rfc = respuesta.data[0].rfc;
            var razon_social = respuesta.data[0].razon_social;
            var email = respuesta.data[0].email;
            var telefono = respuesta.data[0].telefono;
            var calle = respuesta.data[0].calle;
            var numero = respuesta.data[0].numero;
            var colonia = respuesta.data[0].colonia;
            var municipio = respuesta.data[0].municipio;
            var estado = respuesta.data[0].estado;
            var cp = respuesta.data[0].cp;
            var dir = calle + ' ' + municipio + ' ' + estado;
            var direccion = calle + ' ' +  numero + ', ' + colonia + ', ' + municipio + ', ' + estado + ', ' + cp;

            $(infoDetProv).append(
                '<div class="row">'+
                '<div class="col-12">'+
                '<h2>'+ proveedor +'</h2>'+
                '</div>'+
                '</div>'+
                '<div class="row">'+
                '<div class="col-12">'+
                '<h5>'+ razon_social +'</h5>'+
                '</div>'+
                '</div>'+
                '<hr>'+
                '<br>'+
                '<dl class="row">'+
                '<dt class="col-sm-2">Contacto:</dt>'+
                '<dd class="col-sm-10">'+ nombre_contacto +'</dd>'+
                '<dt class="col-sm-2">E-mail:</dt>'+
                '<dd class="col-sm-10">'+ email +'</dd>'+
                '<dt class="col-sm-2">Telefono:</dt>'+
                '<dd class="col-sm-10">'+ telefono +'</dd>'+
                '<dt class="col-sm-2">Dirección:</dt>'+
                '<dd class="col-sm-10">'+ direccion +'</dd>'+
                '</dl>'+
                '<br>'
            );


            if (contenedorMapa) {

                /*SE INICIALIZA MAPA*/
                var lat = 19.617831;
                var lng = -99.231266;
            
                var map = L.map('map').setView([lat, lng], 12);
            
                L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributor',
                    //other attributes.
                }).addTo(map);
            
                const provider = new OpenStreetMapProvider();
            
                provider.search({ query: dir }).then((resultado) => {
            
                    if (resultado.length > 0) {
            
                        map.setView(resultado[0].bounds[0], 15)
            
                        marker = new L.marker(resultado[0].bounds[0], {
            
                        })
                            .addTo(map);
                    }
            
                })
            
            }

        })


}

