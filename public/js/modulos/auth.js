import axios from 'axios';
import Swal from 'sweetalert2';



const pagLogin = document.getElementById("login");
const pagReset = document.getElementById("reset");
const pagnewPass = document.getElementById("new-password");
const divContent = document.getElementById("content");
const body = document.body;


if(pagLogin){
    body.classList.add("register-page");
    divContent.classList.remove("wrapper");
}


if(pagReset){
    body.classList.add("register-page");
    divContent.classList.remove("wrapper");

    pagReset.addEventListener('submit', function (e) {
        e.preventDefault();

        var payload = {};
        var emailUser = document.getElementById("email-reset-pass").value;

        payload.emailUser = emailUser;

        if(payload.emailUser == ""){
            Swal.fire({
                icon: 'warning',
                title: 'Oops...',
                text: 'Es necesario ingresar su correo electronico!',
            })
        }else{

            axios.post('/restablecer', payload)
                .then(function (respuesta) {

                    if(respuesta.data == 'Inexistente'){
                        Swal.fire({
                            icon: 'warning',
                            title: 'Oops...',
                            text: 'El correo electronico no pertenece a ningún usuario!',
                        })
                    }else{

                        Swal.fire(
                            'Correo Enviado',
                            'Se envió un correo electrónico con el enlace para restablecer la contraseña!',
                            'success'
                        ).then(function (result) {
                            if (result.value) {
                                window.location = "/signin";
                            }
                        });


                    }
                })
        }

    });
}

if(pagnewPass){
    body.classList.add("register-page");
    divContent.classList.remove("wrapper");

    pagnewPass.addEventListener('submit', function (e) {
        e.preventDefault();

        const url = window.location.pathname;
        const idToken = url.substring(url.lastIndexOf('/') + 1);

        const route = '/restablecer/' + idToken;

        var payload = {};
        var newPassword = document.getElementById("reset-pass").value;

        payload.newPassword = newPassword;

        if(payload.newPassword == ""){
            Swal.fire({
                icon: 'warning',
                title: 'Oops...',
                text: 'Es necesario ingresar la nueva contraseña!',
            })
        }else{

            axios.post(route, payload)
                .then(function (respuesta) {

                    if(respuesta.data == 'Expiro'){

                        Swal.fire({
                            icon: 'warning',
                            title: 'Oops...',
                            text: 'El enlace ha expirado!',
                        })


                    }else{

                        Swal.fire(
                            respuesta.data,
                            'La contraseña se ha actualizado correctamente!',
                            'success'
                        ).then(function (result) {
                            if (result.value) {
                                window.location = "/signin";
                            }
                        });


                    }
                })
        }
    })


}