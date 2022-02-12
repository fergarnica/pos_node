const express = require('express');
const router = express.Router();

const homeController = require('../controllers/homeController');
const usuariosController = require('../controllers/usuariosController');
const authController = require('../controllers/authController');
const configController = require('../controllers/configController');
const productosController = require('../controllers/productosController');
const tercerosController = require('../controllers/tercerosController');
const ventasController = require('../controllers/ventasController');
const comprasController = require('../controllers/comprasController');

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
    router.post('/usuarios/all',
        isLoggedIn,
        usuariosController.mostrarUsuariosActivos
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

    //Cambiar contraseña
    router.get('/cambiar_password',
        isLoggedIn,
        authController.formChangePassword
    );
    router.put('/cambiar_password',
        isLoggedIn,
        authController.cambiarPassword
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
    router.get('/categorias/activas',
        isLoggedIn,
        productosController.getCategoriasActivas
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
        productosController.mostrarMarcas
    );
    router.get('/marcas/activas',
        isLoggedIn,
        productosController.getMarcasActivas
    );
    router.put('/marcas',
        isLoggedIn,
        productosController.activarMarca
    );
    router.get('/marcas/:id',
        isLoggedIn,
        productosController.mostrarMarca
    );
    router.put('/marcas/:id',
        isLoggedIn,
        productosController.editarMarca
    );
    router.delete('/marcas/:id',
        isLoggedIn,
        productosController.eliminarMarca
    );

    //Proveedores
    router.get('/proveedores',
        isLoggedIn,
        tercerosController.proveedores
    );
    router.get('/agregar_proveedor',
        isLoggedIn,
        tercerosController.agregarProvForm
    );
    router.get('/carga_masiva_proveedores',
        isLoggedIn,
        tercerosController.cargaProvForm
    );
    router.post('/proveedores',
        isLoggedIn,
        tercerosController.agregarProv
    );
    router.get('/proveedores/all',
        isLoggedIn,
        tercerosController.mostrarProveedores
    );
    router.get('/proveedores/activos',
        isLoggedIn,
        tercerosController.getProvActivos
    );
    router.get('/editar_proveedor/:id',
        isLoggedIn,
        tercerosController.editarProvForm
    );
    router.put('/proveedores',
        isLoggedIn,
        tercerosController.activarProveedor
    );
    router.delete('/proveedores/:id',
        isLoggedIn,
        tercerosController.eliminarProveedor
    );
    router.get('/proveedores/:id',
        isLoggedIn,
        tercerosController.mostrarProveedor
    );
    router.put('/proveedores/:id',
        isLoggedIn,
        tercerosController.editarProveedor
    );
    router.get('/print_proveedores',
        isLoggedIn,
        tercerosController.printProveedores
    );
    router.get('/export_proveedores',
        isLoggedIn,
        tercerosController.exportProveedores
    );
    router.get('/proveedores_activos',
        isLoggedIn,
        tercerosController.proveedoresActivos
    );
    router.get('/detalle_proveedor/:id',
        isLoggedIn,
        tercerosController.detalleProv
    );
    /* router.get('/layout_proveedores',
        isLoggedIn,
        tercerosController.layoutProveedores
    );
    router.post('/import_proveedores',
        isLoggedIn,
        tercerosController.importProveedores
    );
    router.post('/carga_proveedores',
        isLoggedIn,
        tercerosController.cargaProveedores
    ); */

    //Clientes
    router.get('/clientes',
        isLoggedIn,
        tercerosController.clientes
    );
    router.get('/agregar_cliente',
        isLoggedIn,
        tercerosController.agregarClientesForm
    );
    router.post('/clientes',
        isLoggedIn,
        tercerosController.agregarCliente
    );
    router.get('/clientes/all',
        isLoggedIn,
        tercerosController.mostrarClientes
    );
    router.put('/clientes',
        isLoggedIn,
        tercerosController.activarCliente
    );
    router.delete('/clientes/:id',
        isLoggedIn,
        tercerosController.eliminarCliente
    );
    router.get('/editar_cliente/:id',
        isLoggedIn,
        tercerosController.editarCliForm
    );
    router.get('/clientes/:id',
        isLoggedIn,
        tercerosController.mostrarCliente
    );
    router.put('/clientes/:id',
        isLoggedIn,
        tercerosController.editarCliente
    );
    router.get('/clientes_activos',
        isLoggedIn,
        tercerosController.clientesActivos
    );

    //Productos
    router.get('/productos',
        isLoggedIn,
        productosController.productos
    );
    router.get('/agregar_producto',
        isLoggedIn,
        productosController.agregarProdForm
    );
    router.post('/productos',
        isLoggedIn,
        /* productosController.subirImgProductos, */
        productosController.agregarProducto
    );
    router.get('/productos/all',
        isLoggedIn,
        productosController.mostrarProductos
    );
    router.get('/productos/imagen/:id',
        isLoggedIn,
        productosController.mostrarImgProducto
    );
    router.post('/productos/uploadImg',
        isLoggedIn,
        productosController.subirImgProductos,
        productosController.agregarImgProducto
    );
    router.put('/productos',
        isLoggedIn,
        productosController.activarProducto
    );
    router.get('/editar_producto/:id',
        isLoggedIn,
        productosController.editarProdForm
    );
    router.get('/productos/:id',
        isLoggedIn,
        productosController.mostrarProducto
    );
    router.put('/productos/:id',
        isLoggedIn,
        productosController.editarProducto
    );
    router.get('/precio_producto_venta/:id',
        isLoggedIn,
        productosController.precioProducto
    );
    router.get('/precio_producto_compra/:id',
        isLoggedIn,
        productosController.precioProductoCompra
    );
    router.get('/movimientos_productos',
    isLoggedIn,
    productosController.movimientosProductos
    );
    router.post('/movs_productos',
        isLoggedIn,
        productosController.movsProductos
    );
    router.get('/entrada_productos',
    isLoggedIn,
    productosController.entradaProductosForm
    );
    router.get('/salida_productos',
    isLoggedIn,
    productosController.salidaProductosForm
    );
    router.get('/motivos_entrada_inv',
    isLoggedIn,
    productosController.motivosEntradaInv
    );
    router.get('/motivos_salida_inv',
    isLoggedIn,
    productosController.motivosSalidaInv
    );
    router.put('/reg_movimiento_inv',
    isLoggedIn,
    productosController.regMovInv
    );
    router.get('/historico_precios',
    isLoggedIn,
    productosController.historicoPrecios
    );
    router.post('/historico_precios',
    isLoggedIn,
    productosController.getHistPrecios
    );
    router.get('/ajuste_precios',
    isLoggedIn,
    productosController.ajustePrecios
    );
    router.post('/precio_ajuste_producto',
    isLoggedIn,
    productosController.getPrecioAjuste
    );
    router.post('/ajusta_precio',
    isLoggedIn,
    productosController.ajustaPrecio
    );
    router.get('/configurar_precios',
    isLoggedIn,
    productosController.configuraPrecios
    );
    router.get('/get_precios/:id',
    isLoggedIn,
    productosController.getPreciosConfig
    );
    router.put('/configurar_precios',
    isLoggedIn,
    productosController.configPrecioProd
    );
    router.get('/prod_vend_mes',
    isLoggedIn,
    productosController.getProdVendMes
    );

    //Presentaciones
    router.get('/presentaciones',
        isLoggedIn,
        productosController.presentaciones
    );
    router.post('/presentaciones',
        isLoggedIn,
        productosController.agregarPresentacion
    );
    router.get('/presentaciones/all',
        isLoggedIn,
        productosController.mostrarPresentaciones
    );
    router.get('/presentaciones/activas',
        isLoggedIn,
        productosController.getPresentacionActivas
    );
    router.put('/presentaciones',
        isLoggedIn,
        productosController.activarPresentacion
    );
    router.get('/presentaciones/:id',
        isLoggedIn,
        productosController.mostrarPresentacion
    );
    router.put('/presentaciones/:id',
        isLoggedIn,
        productosController.editarPresentacion
    );
    router.delete('/presentaciones/:id',
        isLoggedIn,
        productosController.eliminarPresentacion
    );

    router.get('/punto_venta',
        isLoggedIn,
        ventasController.puntoVenta
    );
    router.post('/crear_venta',
        isLoggedIn,
        ventasController.crearVenta
    );
    router.get('/admin_ventas',
        isLoggedIn,
        ventasController.adminVentas
    );
    router.post('/consultar_ventas',
        isLoggedIn,
        ventasController.consultarVentas
    );
    router.post('/det_ventas',
        isLoggedIn,
        ventasController.detVentas
    );
    router.post('/tipopago_ventas',
        isLoggedIn,
        ventasController.tipoPagoVenta
    );
    router.post('/exportar_ventas',
        isLoggedIn,
        ventasController.exportVentas
    );
    router.post('/imprimir_ventas',
        isLoggedIn,
        ventasController.imprimirVentas
    );
    router.put('/anular_venta',
        isLoggedIn,
        ventasController.anularVenta
    );
    router.get('/tot_vtas_semana',
        isLoggedIn,
        ventasController.totVtasSem
    );
    router.get('/tot_vtas_mes',
        isLoggedIn,
        ventasController.totVtasMes
    );
    router.get('/cajas',
        isLoggedIn,
        ventasController.mostrarCajas
    );
    router.post('/cajas',
        isLoggedIn,
        ventasController.agregarCaja
    );
    router.put('/abrir_caja',
        isLoggedIn,
        ventasController.abrirCaja
    );
    /* router.get('/retiro_efectivo',
        isLoggedIn,
        ventasController.retEfectivoPag
    ); */
    router.post('/realizar_retiro',
        isLoggedIn,
        ventasController.retiroEfectivo
    );
    /* router.get('/ingreso_efectivo',
        isLoggedIn,
        ventasController.ingEfectivoPag
    ); */
    router.post('/realizar_ingreso',
        isLoggedIn,
        ventasController.ingresoEfectivo
    );
    /*router.get('/corte_caja',
        isLoggedIn,
        ventasController.corteCajaPag
    );*/
    router.post('/corte_caja',
        isLoggedIn,
        ventasController.corteCaja
    );
    router.get('/admin_cajas',
        isLoggedIn,
        ventasController.adminCajas
    );
    router.post('/info_corte_caja',
        isLoggedIn,
        ventasController.corteCajaInfo
    );
    
    
    router.get('/menus',
        isLoggedIn,
        homeController.menus
    );
    router.get('/menus_activos',
        isLoggedIn,
        homeController.menusActivos
    );
    router.get('/submenus_activos',
        isLoggedIn,
        homeController.submenusActivos
    );
    router.get('/menus/all',
        isLoggedIn,
        homeController.mostrarMenus
    );
    router.put('/menus',
        isLoggedIn,
        homeController.activarMenus
    );
    router.get('/agregar_menu',
        isLoggedIn,
        homeController.formAgregarMenu
    );
    router.post('/menus',
        isLoggedIn,
        homeController.agregarMenu
    );
    router.get('/agregar_submenu/:id',
        isLoggedIn,
        homeController.formAgregarSubmenu
    );
    router.post('/submenus',
        isLoggedIn,
        homeController.agregarSubMenu
    );
    router.get('/editar_menu/:id',
        isLoggedIn,
        homeController.formEditarMenu
    );
    router.put('/menus/:id',
        isLoggedIn,
        homeController.editarMenu
    );
    router.delete('/menus/:id',
        isLoggedIn,
        homeController.eliminarMenu
    );
    router.delete('/submenus/:id',
        isLoggedIn,
        homeController.eliminarSubmenu
    );

    router.get('/registrar_compra',
        isLoggedIn,
        comprasController.regCompra
    );
    router.post('/crear_compra',
        isLoggedIn,
        comprasController.crearCompra
    );
    router.get('/admin_compras',
        isLoggedIn,
        comprasController.adminCompras
    );
    router.post('/consultar_compras',
        isLoggedIn,
        comprasController.consultarCompras
    );
    router.post('/det_compras',
        isLoggedIn,
        comprasController.detCompras
    );
    router.put('/anular_compra',
        isLoggedIn,
        comprasController.anularCompra
    );
    router.post('/exportar_compras',
        isLoggedIn,
        comprasController.exportCompras
    );
    router.post('/imprimir_compras',
        isLoggedIn,
        comprasController.imprimirCompras
    );
    

    router.get('/permisos_por_perfil',
        isLoggedIn,
        configController.permisos
    );
    router.get('/permiso_x_perfil/:id',
        isLoggedIn,
        configController.permisosxPerfil
    );
    router.put('/permiso_x_perfil',
        isLoggedIn,
        configController.activarPermxPerfil
    );
    router.get('/permisos_por_usuario',
        isLoggedIn,
        configController.permisosxUsuario
    );
    router.get('/permiso_x_usuario/:id',
        isLoggedIn,
        configController.getpermisosxUsuario
    );
    router.put('/permiso_x_usuario',
        isLoggedIn,
        configController.activarPermxUser
    );

    router.get('/not_found',
        isLoggedIn,
        authController.notFound
    );



    return router;
}
