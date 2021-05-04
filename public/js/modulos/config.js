import axios from 'axios';
import Swal from 'sweetalert2';

const formEmpresa = document.getElementById('form-empresa');

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
                    type: 'error',
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
                            type: 'error',
                            title: 'Hubo un error',
                            text: 'Error en la Base de Datos'
                        })
                    })
            }
        }
    })

}


