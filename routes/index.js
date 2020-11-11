const express = require('express');
const router = express.Router();

const homeController = require('../controllers/homeController');
const usuariosController = require('../controllers/usuariosController');
const authController = require('../controllers/authController');
const configController = require('../controllers/configController');
const productosController = require('../controllers/productosController');


const { isLoggedIn, isNotLogeedIn } = require('../config/auth');



module.exports = function () {

    // Ruta para el home
    router.get('/',
        isLoggedIn,
        homeController.home
    );

    router.get('/usuarios',
        isLoggedIn,
        usuariosController.usuarios
    );

    router.get('/perfiles',
        isLoggedIn,
        usuariosController.perfiles
    );
    //Empleados
    router.get('/empleados',
        isLoggedIn,
        usuariosController.empleados
    );
    router.post('/empleados',
        isLoggedIn,
        usuariosController.agregarEmpleado
    );
    router.get('/agregar_empleado',
        isLoggedIn,
        usuariosController.agregarEmpleadoForm
    );
    router.get('/editar_empleado/:id',
        isLoggedIn,
        usuariosController.editarEmpleadoForm
    );
    router.get('/empleados/all',
        isLoggedIn,
        usuariosController.mostrarEmpleados
    );
    router.post('/empleados/all',
        isLoggedIn,
        usuariosController.mostrarEmpleadosActivos
    );
    router.get('/empleados/:id',
        isLoggedIn,
        usuariosController.mostrarEmpleado
    );
    router.put('/empleados',
        isLoggedIn,
        usuariosController.activarEmpleado
    );
    router.put('/empleados/:id',
        isLoggedIn,
        usuariosController.editarEmpleado
    );
    router.delete('/empleados/:id',
        isLoggedIn,
        usuariosController.eliminarEmpleado
    );
    
    //Perfiles
    router.get('/perfiles/all',
        isLoggedIn,
        usuariosController.mostrarPerfiles
    );
    router.post('/perfiles/all',
        isLoggedIn,
        usuariosController.mostrarPerfilesActivos
    );
    router.get('/perfiles/:id',
        isLoggedIn,
        usuariosController.mostrarPerfil
    );
    router.post('/perfiles',
        isLoggedIn,
        usuariosController.agregarPerfil
    );
    router.put('/perfiles',
        isLoggedIn,
        usuariosController.activarPerfil
    );
    router.put('/perfiles/:id',
        isLoggedIn,
        usuariosController.editarPerfil
    );
    router.delete('/perfiles/:id',
        isLoggedIn,
        usuariosController.eliminarPerfil
    );
    
    //Usuarios
    router.post('/usuarios',
        isLoggedIn,
        usuariosController.agregarUsuario
    );
    router.get('/agregar_usuario',
        isLoggedIn,
        usuariosController.agregarUsuarioForm
    );
    router.get('/editar_usuario/:id',
        isLoggedIn,
        usuariosController.editarUsuarioForm
    );
    router.get('/usuarios/all',
        isLoggedIn,
        usuariosController.mostrarUsuarios
    );
    router.get('/usuarios/:id',
        isLoggedIn,
        usuariosController.mostrarUsuario
    );
    router.put('/usuarios',
        isLoggedIn,
        usuariosController.activarUsuario
    );
    router.put('/usuarios/:id',
        isLoggedIn,
        usuariosController.editarUsuario
    );
    router.delete('/usuarios/:id',
        isLoggedIn,
        usuariosController.eliminarUsuario
    );
    
    //Iniciar Sesión
    router.get('/signin',
        isNotLogeedIn,
        authController.iniciarSesion
    );
    router.post('/signin',
        isNotLogeedIn,
        authController.autenticarUsuario
    );
    
    //Restablecer Contraseña
    router.get('/restablecer',
        isNotLogeedIn,
        authController.formRestablecer
    );
    router.post('/restablecer',
        isNotLogeedIn,
        authController.enviarToken
    );
    router.get('/restablecer/:token',
        isNotLogeedIn,
        authController.validarToken
    );
    router.post('/restablecer/:token',
        isNotLogeedIn,
        authController.actualizarPassword
    );

    //Logout
    router.get('/logout',
        isLoggedIn,
        authController.logout
    );

    router.get('/empresa',
        isLoggedIn,
        configController.empresa
    );

    router.get('/empresa/all',
        isLoggedIn,
        configController.infoEmpresa
    );

    router.post('/empresa',
        isLoggedIn,
        configController.guardarEmpresa
    );
    //Categorias
    router.get('/categorias',
        isLoggedIn,
        productosController.categorias
    );
    router.get('/categorias/all',
        isLoggedIn,
        productosController.mostrarCategorias
    );
    router.post('/categorias',
        isLoggedIn,
        productosController.agregarCategoria
    );
    router.get('/categorias/:id',
        isLoggedIn,
        productosController.mostrarCategoria
    );
    router.put('/categorias/:id',
        isLoggedIn,
        productosController.editarCategoria
    );
    router.put('/categorias',
        isLoggedIn,
        productosController.activarCategoria
    );
    router.delete('/categorias/:id',
        isLoggedIn,
        productosController.eliminarCategoria
    );
    //Marcas
    router.get('/marcas',
        isLoggedIn,
        productosController.marcas
    );
    router.post('/marcas',
        isLoggedIn,
        productosController.agregarMarca
    );
    router.get('/marcas/all',
        isLoggedIn,
        productosController.agregarMarca
    );



    return router;
}
