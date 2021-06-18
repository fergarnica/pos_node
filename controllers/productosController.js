const pool = require('../config/db');
const moment = require('moment');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const fs = require("fs");
const { Console } = require('console');
const { cssNumber } = require('jquery');

exports.subirImgProductos = (req, res, next) => {
    upload(req, res, function (error) {
        if (error) {
            if (error instanceof multer.MulterError) {
                if (error.code === 'LIMIT_FILE_SIZE') {
                    req.flash('error', 'El archivo es muy grande: Máximo 100kb ');
                } else {
                    req.flash('error', error.message);
                }
            } else {
                req.flash('error', error.message);
            }
            return;
        } else {
            return next();
        }
    });
}
// Opciones de Multer
const configuracionMulter = {
    limits: { fileSize: 200000 },
    storage: fileStorage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, __dirname + '../../public/uploads/productos');
        },
        filename: (req, file, cb) => {
            const extension = file.mimetype.split('/')[1];
            const uuid = uuidv4();
            const nameFile = `${uuid}.${extension}`
            cb(null, nameFile);
        }
    }),
    fileFilter(req, file, cb) {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
            // el callback se ejecuta como true o false : true cuando la imagen se acepta
            cb(null, true);
        } else {
            cb(new Error('Formato No Válido'));
        }
    }
}

const upload = multer(configuracionMulter).single('imagen');

exports.categorias = async (req, res) => {

    var idUsuario = res.locals.usuario.idusuario;
    var url = req.originalUrl;

    var permiso = await validAccess(idUsuario, url);

    if(permiso>0){

        res.render('modulos/productos/categorias', {
            nombrePagina: 'Categorias'
        });

    }else{

        res.render('modulos/error/401', {
            nombrePagina: '401 Unauthorized'
        });

    }

}

exports.agregarCategoria = async (req, res) => {

    const { categoria, status, fecha_creacion } = req.body;

    var valFolio = await pool.query('SELECT IFNULL(MAX(idcategoria),0)+1 AS idcat FROM categorias');

    for (var x = 0; x < valFolio.length; x++) {
        var idcategoria = valFolio[x].idcat;
    }

    const newCategoria = {
        idcategoria,
        categoria,
        status,
        fecha_creacion
    };

    const existCategoria = await pool.query('SELECT * FROM categorias WHERE categoria = ?', newCategoria.categoria);

    if (existCategoria.length > 0) {
        res.send('Repetido');

    } else {

        await pool.query('INSERT INTO categorias SET ?', [newCategoria]);

        res.status(200).send('Categoria Creada Correctamente');
    }
}

exports.mostrarCategorias = async (req, res) => {

    const values = await pool.query('SELECT * FROM categorias');

    var valuesTotal = values.length;

    if (valuesTotal === 0) {

        res.send('empty');

    } else {

        const dataCategorias = [];

        for (var x = 0; x < valuesTotal; x++) {

            conteo = x + 1;
            const arrayCategorias = values[x];
            var botones = "<div class='btn-group'><button type='button' id='btn-editar-categoria' class='btn btn-warning' data-toggle='modal' data-target='#modalEditarCategoria' idCategoria=" + "'" + arrayCategorias.idcategoria + "'" + "><i class='fas fa-pencil-alt'></i></button><button id='btn-eliminar-categoria' class='btn btn-danger' idCategoria=" + "'" + arrayCategorias.idcategoria + "'" + "><i class='fa fa-times'></i></button></div>";

            if (arrayCategorias.status === 0) {
                var status = "<button type='button' id='btn-estatus-categoria' class='btn btn-danger btn-sm' estadoCategoria='1' idCategoria=" + "'" + arrayCategorias.idcategoria + "'" + ">Desactivado</button>";
            } else {
                var status = "<button type='button' id='btn-estatus-categoria' class='btn btn-success btn-sm' estadoCategoria='0' idCategoria=" + "'" + arrayCategorias.idcategoria + "'" + ">Activado</button>";
            }

            var fecha = moment(arrayCategorias.fecha_creacion).format('YYYY-MM-DD hh:mm:ss a');

            const obj = [
                conteo,
                arrayCategorias.idcategoria,
                arrayCategorias.categoria,
                fecha,
                status,
                botones
            ];

            dataCategorias.push(obj);
        }

        res.send(dataCategorias);
    }
}

exports.mostrarCategoria = async (req, res) => {

    let idCategoria = req.params.id;

    const dataCategoria = await pool.query('SELECT * FROM categorias WHERE idcategoria = ?', idCategoria);

    res.status(200).send(dataCategoria);


}

exports.editarCategoria = async (req, res) => {

    let idCategoria = req.params.id;
    let newCategoria = req.body.newCategoria;

    const categoriaSinCambio = await pool.query('SELECT * FROM categorias WHERE categoria = ? AND idcategoria= ?', [newCategoria, idCategoria]);
    const categoriaRepetido = await pool.query('SELECT * FROM categorias WHERE categoria = ?', newCategoria);

    if (categoriaSinCambio.length > 0) {
        res.send('Igual');
    } else {

        if (categoriaRepetido.length > 0) {
            res.send('Repetido');
        } else {
            await pool.query('UPDATE categorias SET categoria = ? WHERE idcategoria = ?', [newCategoria, idCategoria]);
            res.status(200).send('La categoria ha sido actualizada correctamente.');
        }
    }
}


exports.activarCategoria = async (req, res) => {

    const { idCategoria, estadoCategoria } = req.body;

    await pool.query('UPDATE categorias SET status = ? WHERE idcategoria = ?', [estadoCategoria, idCategoria]);

    res.status(200).send('La categoria ha sido actualizada');

}

exports.getCategoriasActivas = async (req, res) => {

    const categorias = await pool.query('SELECT * FROM categorias WHERE status= 1');

    var categoriasTotal = categorias.length;

    if (categoriasTotal === 0) {

        res.send('empty');

    } else {

        const dataCategorias = [];

        for (var x = 0; x < categoriasTotal; x++) {

            conteo = x + 1;
            const arrayCategorias = categorias[x];

            var fecha = moment(arrayCategorias.fecha_creacion).format('YYYY-MM-DD hh:mm:ss a');

            const obj = [
                conteo,
                arrayCategorias.idcategoria,
                arrayCategorias.categoria,
                arrayCategorias.status,
                fecha
            ];

            dataCategorias.push(obj);
        }

        res.send(dataCategorias);
    }

}

exports.eliminarCategoria = async (req, res) => {

    let idCategoria = req.params.id;

    var eliminarCategoria = await pool.query('DELETE FROM categorias WHERE idcategoria = ?', idCategoria);

    if (eliminarCategoria.affectedRows === 1) {
        res.status(200).send('La categoria ha sido eliminada.');
    } else {
        res.send('Inexistente');
    }

}

exports.marcas = async (req, res) => {

    var idUsuario = res.locals.usuario.idusuario;
    var url = req.originalUrl;

    var permiso = await validAccess(idUsuario, url);

    if(permiso>0){

        res.render('modulos/productos/marcas', {
            nombrePagina: 'Marcas'
        });

    }else{

        res.render('modulos/error/401', {
            nombrePagina: '401 Unauthorized'
        });

    }

}

exports.agregarMarca = async (req, res) => {

    const { marca, status, fecha_creacion } = req.body;

    var valFolio = await pool.query('SELECT IFNULL(MAX(idmarca),0)+1 AS idmar FROM marcas');

    for (var x = 0; x < valFolio.length; x++) {
        var idmarca = valFolio[x].idmar;
    }

    const newMarca = {
        idmarca,
        marca,
        status,
        fecha_creacion
    };

    const existMarca = await pool.query('SELECT * FROM marcas WHERE marca = ?', newMarca.marca);

    if (existMarca.length > 0) {
        res.send('Repetido');

    } else {

        await pool.query('INSERT INTO marcas SET ?', [newMarca]);

        res.status(200).send('Marca de Producto Creada Correctamente');
    }
}

exports.mostrarMarcas = async (req, res) => {

    const values = await pool.query('SELECT * FROM marcas');

    var valuesTotal = values.length;

    if (valuesTotal === 0) {

        res.send('empty');

    } else {

        const dataMarcas = [];

        for (var x = 0; x < valuesTotal; x++) {

            conteo = x + 1;
            const arrayMarcas = values[x];
            var botones = "<div class='btn-group'><button type='button' id='btn-editar-marca' class='btn btn-warning' data-toggle='modal' data-target='#modalEditarMarca' idMarca=" + "'" + arrayMarcas.idmarca + "'" + "><i class='fas fa-pencil-alt'></i></button><button id='btn-eliminar-marca' class='btn btn-danger' idMarca=" + "'" + arrayMarcas.idmarca + "'" + "><i class='fa fa-times'></i></button></div>";

            if (arrayMarcas.status === 0) {
                var status = "<button type='button' id='btn-estatus-marca' class='btn btn-danger btn-sm' estadoMarca='1' idMarca=" + "'" + arrayMarcas.idmarca + "'" + ">Desactivado</button>";
            } else {
                var status = "<button type='button' id='btn-estatus-marca' class='btn btn-success btn-sm' estadoMarca='0' idMarca=" + "'" + arrayMarcas.idmarca + "'" + ">Activado</button>";
            }

            var fecha = moment(arrayMarcas.fecha_creacion).format('YYYY-MM-DD hh:mm:ss a');

            const obj = [
                conteo,
                arrayMarcas.idmarca,
                arrayMarcas.marca,
                fecha,
                status,
                botones
            ];

            dataMarcas.push(obj);
        }

        res.send(dataMarcas);
    }
}

exports.activarMarca = async (req, res) => {

    const { idMarca, estadoMarca } = req.body;

    await pool.query('UPDATE marcas SET status = ? WHERE idmarca = ?', [estadoMarca, idMarca]);

    res.status(200).send('La marca ha sido actualizada');

}

exports.mostrarMarca = async (req, res) => {

    let idMarca = req.params.id;

    const dataMarca = await pool.query('SELECT * FROM marcas WHERE idmarca = ?', idMarca);

    res.status(200).send(dataMarca);
}

exports.getMarcasActivas = async (req, res) => {

    const marcas = await pool.query('SELECT * FROM marcas WHERE status= 1');

    var marcasTotal = marcas.length;

    if (marcasTotal === 0) {

        res.send('empty');

    } else {

        const dataMarcas = [];

        for (var x = 0; x < marcasTotal; x++) {

            conteo = x + 1;
            const arrayMarcas = marcas[x];

            var fecha = moment(arrayMarcas.fecha_creacion).format('YYYY-MM-DD hh:mm:ss a');

            const obj = [
                conteo,
                arrayMarcas.idmarca,
                arrayMarcas.marca,
                arrayMarcas.status,
                fecha
            ];

            dataMarcas.push(obj);
        }

        res.send(dataMarcas);
    }

}


exports.editarMarca = async (req, res) => {

    let idMarca = req.params.id;
    let newMarca = req.body.newMarca;

    const marcaSinCambio = await pool.query('SELECT * FROM marcas WHERE marca = ? AND idmarca= ?', [newMarca, idMarca]);
    const marcaRepetido = await pool.query('SELECT * FROM marcas WHERE marca = ?', newMarca);

    if (marcaSinCambio.length > 0) {
        res.send('Igual');
    } else {

        if (marcaRepetido.length > 0) {
            res.send('Repetido');
        } else {
            await pool.query('UPDATE marcas SET marca = ? WHERE idmarca = ?', [newMarca, idMarca]);
            res.status(200).send('La marca ha sido actualizada correctamente.');
        }
    }
}

exports.eliminarMarca = async (req, res) => {

    let idMarca = req.params.id;

    var eliminarMarca = await pool.query('DELETE FROM marcas WHERE idmarca = ?', idMarca);

    if (eliminarMarca.affectedRows === 1) {
        res.status(200).send('La marca ha sido eliminada.');
    } else {
        res.send('Inexistente');
    }

}

exports.productos = async (req, res) => {

    var idUsuario = res.locals.usuario.idusuario;
    var url = req.originalUrl;

    var permiso = await validAccess(idUsuario, url);

    if(permiso>0){

        res.render('modulos/productos/productos', {
            nombrePagina: 'Productos'
        });

    }else{

        res.render('modulos/error/401', {
            nombrePagina: '401 Unauthorized'
        });

    }

}

exports.movimientosProductos = async (req, res) => {

    var idUsuario = res.locals.usuario.idusuario;
    var url = req.originalUrl;

    var permiso = await validAccess(idUsuario, url);

    if(permiso>0){

        res.render('modulos/productos/movimientos_productos', {
            nombrePagina: 'Movimientos de Productos'
        });

    }else{

        res.render('modulos/error/401', {
            nombrePagina: '401 Unauthorized'
        });

    }

}

exports.agregarProducto = async (req, res) => {

    var idusuario = res.locals.usuario.idusuario;
    var tipoMov = 1;
    var idMotivo = 0;

    var { producto, bar_code, idcategoria, idpresentacion, idmarca, idproveedor, stock_total, pre_costo, pre_costo_neto, pre_mayoreo, pre_menudeo, inventariable, status, fecha_creacion } = req.body;

    if( inventariable === true){
        var inventariable=1;
    }else{
        var inventariable=0;
    }

    if(bar_code === ''){
        var bar_code = null;
    }

    if(stock_total === ''){
        var stock_total = null;
    }

    var newIdProd = await pool.query('SELECT IFNULL(MAX(idproducto),100)+1 as idproducto FROM productos');

    var idproducto = newIdProd[0].idproducto;

    const newProd = {
        idproducto,
        producto,
        bar_code,
        idcategoria, 
        idpresentacion, 
        idmarca, 
        idproveedor, 
        stock_total,
        inventariable,
        status,
        fecha_creacion    
    };

    const newPrecios = {
        idproducto,
        pre_costo, 
        pre_costo_neto, 
        pre_mayoreo, 
        pre_menudeo,
    }

    var new_pre_costo = pre_costo;
    var new_pre_costo_neto = pre_costo_neto;
    var new_pre_mayoreo = pre_mayoreo;
    var new_pre_menudeo = pre_menudeo;
    var fecha = fecha_creacion;

    const newPrecHist = {
        idproducto,
        new_pre_costo, 
        new_pre_costo_neto, 
        new_pre_mayoreo, 
        new_pre_menudeo,
        idusuario,
        fecha
    }

    await pool.query('INSERT INTO productos SET ?', [newProd]);

    await pool.query('INSERT INTO precios SET ?', [newPrecios]);

    await pool.query('INSERT INTO precios_hist SET ?', [newPrecHist]);

    await pool.query('call sp_reg_mov_prod(?,?,?,?,?)',[newProd.idproducto, tipoMov, newProd.stock_total, idMotivo, idusuario]);

    res.status(200).send('Producto Creado Correctamente!');
}

exports.mostrarProductos = async (req, res) => {

    var values = await pool.query('call get_info_all_productos()');

    var newValues = values[0];
    var valuesTotal = newValues.length;

    if (valuesTotal === 0) {

        res.send('empty');

    } else {

        const dataProductos = [];

        for (var x = 0; x < valuesTotal; x++) {

            conteo = x + 1;
            const arrayProductos = newValues[x];
            var botones = "<div class='btn-group'><button type='button' id='btn-imagen-producto' class='btn btn-info' data-toggle='modal' data-target='#modalSubirImagen' idProducto=" + "'" + arrayProductos.idproducto + "'" + "><i class='fas fa-image'></i></button><a type='button' id='btn-editar-producto' class='btn btn-warning' href=" + "'/editar_producto/" + arrayProductos.idproducto + "'" + " idProducto=" + "'" + arrayProductos.idproducto + "'" + "><i class='fas fa-pencil-alt'></i></a><button id='btn-eliminar-producto' class='btn btn-danger' idProducto=" + "'" + arrayProductos.idproducto + "'" + "><i class='fa fa-times'></i></button></div>";

            if (arrayProductos.status === 0) {
                var status = "<button type='button' id='btn-estatus-producto' class='btn btn-danger btn-sm' estadoProducto='1' idProducto=" + "'" + arrayProductos.idproducto + "'" + ">Desactivado</button>";
            } else {
                var status = "<button type='button' id='btn-estatus-producto' class='btn btn-success btn-sm' estadoProducto='0' idProducto=" + "'" + arrayProductos.idproducto + "'" + ">Activado</button>";
            }

            if(arrayProductos.imagen === null){
               var imagen =  "<img src='/uploads/productos/default/anonymous.png' width='40px'>";
            }else{
               var imagen = "<img src='/uploads/productos/"+ arrayProductos.imagen +"' width='40px'>";
            }

            var fecha = moment(arrayProductos.fecha_creacion).format('YYYY-MM-DD hh:mm:ss a');

            const obj = [
                conteo,
                imagen,
                arrayProductos.idproducto,
                arrayProductos.producto,
                arrayProductos.bar_code,
                arrayProductos.marca,
                arrayProductos.categoria,
                arrayProductos.abreviatura,
                arrayProductos.proveedor,
                arrayProductos.stock_total,
                currencyFormat(arrayProductos.pre_costo),
                currencyFormat(arrayProductos.pre_costo_neto),
                currencyFormat(arrayProductos.pre_mayoreo),
                currencyFormat(arrayProductos.pre_menudeo),
                fecha,
                status,
                botones
            ];

            dataProductos.push(obj);
        }

        res.send(dataProductos);
    }
}

exports.mostrarImgProducto = async (req, res) => {

    let idProducto = req.params.id;

    const dataImg = await pool.query('SELECT idproducto, imagen FROM productos WHERE idproducto =?', idProducto );

    res.status(200).send(dataImg);

}

exports.agregarImgProducto = async (req, res) => {

    const { idproducto } = req.body;
    
    if(req.file) {

        var imagen = req.file.filename;

        const existImg = await pool.query('SELECT imagen FROM productos WHERE idproducto =?', idproducto);

        var oldImg = existImg[0].imagen

        if(oldImg === null){

            await pool.query('UPDATE productos SET imagen = ? WHERE idproducto = ?', [imagen, idproducto]);

            req.flash('success', 'Imagen actualizada.');
            res.redirect('/productos');

        }else{

            pathOld = __dirname + '../../public/uploads/productos/' + oldImg;
            await pool.query('UPDATE productos SET imagen = ? WHERE idproducto = ?', [imagen, idproducto]);

            if (fs.existsSync(pathOld)){
                fs.unlinkSync(pathOld);
            }

            req.flash('success', 'Imagen actualizada.');
            res.redirect('/productos');

        }
    }

}

exports.activarProducto = async (req, res) => {

    const { idProd, estadoProd } = req.body;

    await pool.query('UPDATE productos SET status = ? WHERE idproducto = ?', [estadoProd, idProd]);

    res.status(200).send('El producto ha sido actualizado');

}

exports.agregarProdForm = async (req, res) => {

    res.render('modulos/productos/agregar_producto', {
        nombrePagina: 'Agregar Producto'
    });

}

exports.editarProdForm = async (req, res) => {

    res.render('modulos/productos/editar_producto', {
        nombrePagina: 'Editar Producto'
    });

}

exports.mostrarProducto = async (req, res) => {

    let idProducto = req.params.id;

    var values = await pool.query('call get_info_producto(?)',idProducto);

    var dataProducto = values[0];

    res.status(200).send(dataProducto);
    
}

exports.precioProducto = async (req, res) => {

    let idProducto = req.params.id;

    var precioProdId = await pool.query('call get_precio_venta_producto(?,1)', idProducto);
    var newprecioProdId = precioProdId[0];

    if(newprecioProdId.length === 0){
        var precioProdCod = await pool.query('call get_precio_venta_producto(?,2)', idProducto);
        var newprecioProdCod = precioProdCod[0];
        
        if(newprecioProdCod.length === 0){
            res.send('Empty');
        }else{
            res.status(200).send(newprecioProdCod);
        }
    }else{
        res.status(200).send(newprecioProdId);
    }
}

exports.precioProductoCompra = async (req, res) => {

    let idProducto = req.params.id;

    var precioProdId = await pool.query('call get_precio_compra_producto(?,1)', idProducto);
    var newprecioProdId = precioProdId[0];

    if(newprecioProdId.length === 0){
        var precioProdCod = await pool.query('call get_precio_compra_producto(?,2)', idProducto);
        var newprecioProdCod = precioProdCod[0];
        
        if(newprecioProdCod.length === 0){
            res.send('Empty');
        }else{
            res.status(200).send(newprecioProdCod);
        }
    }else{
        res.status(200).send(newprecioProdId);
    }
}

exports.presentaciones = async (req, res) => {

    var idUsuario = res.locals.usuario.idusuario;
    var url = req.originalUrl;

    var permiso = await validAccess(idUsuario, url);

    if(permiso>0){

        res.render('modulos/productos/presentacion', {
            nombrePagina: 'Presentaciones'
        });

    }else{

        res.render('modulos/error/401', {
            nombrePagina: '401 Unauthorized'
        });

    }

}

exports.agregarPresentacion = async (req, res) => {

    const { presentacion, abreviatura, status, fecha_creacion } = req.body;

    var valFolio = await pool.query('SELECT IFNULL(MAX(idpresentacion),0)+1 AS idpres FROM presentaciones');

    for (var x = 0; x < valFolio.length; x++) {
        var idpresentacion = valFolio[x].idpres;
    }

    const newPres = {
        idpresentacion,
        presentacion,
        abreviatura,
        status,
        fecha_creacion
    };

    const existPres = await pool.query('SELECT * FROM presentaciones WHERE presentacion = ?', newPres.presentacion);
    const existAbr = await pool.query('SELECT * FROM presentaciones WHERE abreviatura = ?', newPres.abreviatura);

    if (existPres.length > 0) {
        res.send('Repetido');

    } else {

        if (existAbr.length > 0) {
            res.send('Abreviatura');

        } else {

            await pool.query('INSERT INTO presentaciones SET ?', [newPres]);

            res.status(200).send('Presentación de Producto Creada Correctamente');

        }
    }
}


exports.mostrarPresentaciones = async (req, res) => {

    const values = await pool.query('SELECT * FROM presentaciones');

    var valuesTotal = values.length;

    if (valuesTotal === 0) {

        res.send('empty');

    } else {

        const dataPres = [];

        for (var x = 0; x < valuesTotal; x++) {

            conteo = x + 1;
            const arrayPres = values[x];
            var botones = "<div class='btn-group'><button type='button' id='btn-editar-pres' class='btn btn-warning' data-toggle='modal' data-target='#modalEditarPres' idPres=" + "'" + arrayPres.idpresentacion + "'" + "><i class='fas fa-pencil-alt'></i></button><button id='btn-eliminar-pres' class='btn btn-danger' idPres=" + "'" + arrayPres.idpresentacion + "'" + "><i class='fa fa-times'></i></button></div>";

            if (arrayPres.status === 0) {
                var status = "<button type='button' id='btn-estatus-pres' class='btn btn-danger btn-sm' estadoPres='1' idPres=" + "'" + arrayPres.idpresentacion + "'" + ">Desactivado</button>";
            } else {
                var status = "<button type='button' id='btn-estatus-pres' class='btn btn-success btn-sm' estadoPres='0' idPres=" + "'" + arrayPres.idpresentacion + "'" + ">Activado</button>";
            }

            var fecha = moment(arrayPres.fecha_creacion).format('YYYY-MM-DD hh:mm:ss a');

            const obj = [
                conteo,
                arrayPres.idpresentacion,
                arrayPres.presentacion,
                arrayPres.abreviatura,
                fecha,
                status,
                botones
            ];

            dataPres.push(obj);
        }

        res.send(dataPres);
    }
}

exports.activarPresentacion = async (req, res) => {

    const { idPres, estadoPres } = req.body;

    await pool.query('UPDATE presentaciones SET status = ? WHERE idpresentacion = ?', [estadoPres, idPres]);

    res.status(200).send('La presentación ha sido actualizada');

}

exports.mostrarPresentacion = async (req, res) => {

    let idPres = req.params.id;

    const dataPres = await pool.query('SELECT * FROM presentaciones WHERE idpresentacion = ?', idPres);

    res.status(200).send(dataPres);
}

exports.editarPresentacion = async (req, res) => {

    const idPres = req.params.id;

    const { presentacion, abreviatura } = req.body;

    var conteo = 0;

    const dataBase = await pool.query('SELECT * FROM presentaciones WHERE idpresentacion = ?', idPres);

    for (var x = 0; x < dataBase.length; x++) {
        const arrayPres = dataBase[x];
        var pres_base = arrayPres.presentacion;
        var abrev_base = arrayPres.abreviatura;
    }

    const validPres = await pool.query('SELECT * FROM presentaciones WHERE presentacion = ? AND idpresentacion != ?', [presentacion, idPres]);

    const validAbr = await pool.query('SELECT * FROM presentaciones WHERE abreviatura = ? AND idpresentacion != ?', [abreviatura, idPres]);

    if (validPres.length > 0) {

        res.send('Repetido');

    } else {

        if (validAbr.length > 0) {

            res.send('Abreviatura');

        } else {

            if (presentacion != pres_base) {

                await pool.query('UPDATE presentaciones SET presentacion = ? WHERE idpresentacion = ?', [presentacion, idPres]);
                var conteo = conteo + 1;
            }

            if (abreviatura != abrev_base) {

                await pool.query('UPDATE presentaciones SET abreviatura = ? WHERE idpresentacion = ?', [abreviatura, idPres]);
                var conteo = conteo + 1;
            }

            if (conteo > 0) {

                res.send('Presentación Actualizada Correctamente!');

            } else {
                res.send('Nulos');

            }

        }

    }

}

exports.eliminarPresentacion = async (req, res) => {

    let idPres = req.params.id;

    var eliminarPres = await pool.query('DELETE FROM presentaciones WHERE idpresentacion = ?', idPres);

    if (eliminarPres.affectedRows === 1) {
        res.status(200).send('La presentación ha sido eliminada.');
    } else {
        res.send('Inexistente');
    }

}

exports.getPresentacionActivas = async (req, res) => {

    const presentaciones = await pool.query('SELECT * FROM presentaciones WHERE status= 1');

    var presentacionesTotal = presentaciones.length;

    if (presentacionesTotal === 0) {

        res.send('empty');

    } else {

        const dataPresentaciones = [];

        for (var x = 0; x < presentacionesTotal; x++) {

            conteo = x + 1;
            const arrayPresentaciones = presentaciones[x];

            var fecha = moment(arrayPresentaciones.fecha_creacion).format('YYYY-MM-DD hh:mm:ss a');

            const obj = [
                conteo,
                arrayPresentaciones.idpresentacion,
                arrayPresentaciones.presentacion,
                arrayPresentaciones.abreviatura,
                arrayPresentaciones.status,
                fecha
            ];

            dataPresentaciones.push(obj);
        }

        res.send(dataPresentaciones);
    }

}

exports.editarProducto = async (req, res) => {

    let idProducto = req.params.id;

    var { producto, bar_code, idcategoria, idpresentacion, idmarca, idproveedor, pre_costo, pre_costo_neto } = req.body;

    var conteo = 0;

    var values = await pool.query('call get_info_producto(?)',idProducto);

    var dataBase = values[0];

    for (var x = 0; x < dataBase.length; x++) {
        const arrayProd = dataBase[x];
        var producto_bd = arrayProd.producto;
        var bar_code_bd = arrayProd.bar_code;
        var idcategoria_bd = arrayProd.idcategoria;
        var idpresentacion_bd = arrayProd.idpresentacion;
        var idmarca_bd = arrayProd.idmarca;
        var idproveedor_bd = arrayProd.idproveedor;
        var pre_costo_bd = arrayProd.pre_costo;
        var pre_costo_neto_bd = arrayProd.pre_costo_neto;
    }


    if (producto != producto_bd) {

        await pool.query('UPDATE productos SET producto = ? WHERE idproducto = ?', [producto, idProducto]);
        var conteo = conteo + 1;
    }

    if (bar_code != bar_code_bd) {

        await pool.query('UPDATE productos SET bar_code = ? WHERE idproducto = ?', [bar_code, idProducto]);
        var conteo = conteo + 1;
    }

    if (idcategoria != idcategoria_bd) {

        await pool.query('UPDATE productos SET idcategoria = ? WHERE idproducto = ?', [idcategoria, idProducto]);
        var conteo = conteo + 1;
    }

    if (idpresentacion != idpresentacion_bd) {

        await pool.query('UPDATE productos SET idpresentacion = ? WHERE idproducto = ?', [idpresentacion, idProducto]);
        var conteo = conteo + 1;
    }

    if (idmarca != idmarca_bd) {

        await pool.query('UPDATE productos SET idmarca = ? WHERE idproducto = ?', [idmarca, idProducto]);
        var conteo = conteo + 1;
    }

    if (idproveedor != idproveedor_bd) {

        await pool.query('UPDATE productos SET idproveedor = ? WHERE idproducto = ?', [idproveedor, idProducto]);
        var conteo = conteo + 1;
    }

    if (pre_costo != pre_costo_bd) {

        await pool.query('UPDATE precios SET pre_costo = ? WHERE idproducto = ?', [pre_costo, idProducto]);
        var conteo = conteo + 1;
    }

    if (pre_costo_neto != pre_costo_neto_bd) {

        await pool.query('UPDATE precios SET pre_costo_neto = ? WHERE idproducto = ?', [pre_costo_neto, idProducto]);
        var conteo = conteo + 1;
    }

    if (conteo > 0) {
        res.send('Producto Actualizado Correctamente!');
    } else {
        res.send('Nulos');
    }

}

exports.movsProductos = async (req, res) => {

    const { idProd, mesIni, mesFin } = req.body;

    var conteo = 0;

    var q = await pool.query('call get_det_movsprod(?,?,?)',[idProd, mesIni, mesFin]);

    const values = q[0];

    if(values.length === 0){
        res.send('empty');
    }else{

        const dataMovs = [];

        for (var x = 0; x < values.length; x++) {

            conteo = x + 1;
            const arrayMovs = values[x];

            var fecha = moment(arrayMovs.fecha).format('YYYY-MM-DD hh:mm:ss a');

            const obj = [
                conteo,
                arrayMovs.idproducto,
                arrayMovs.producto,
                arrayMovs.mov_descripcion,
                arrayMovs.cantidad,
                arrayMovs.stock_total,
                fecha,
                arrayMovs.usuario
            ];

            dataMovs.push(obj);
        }

        res.send(dataMovs);

    }
    
}

exports.entradaProductosForm = async (req, res) => {

    res.render('modulos/productos/entrada_producto', {
        nombrePagina: 'Entrada de Productos'
    });

}

exports.motivosEntradaInv = async (req, res) => {

    const motivosEntrada = await pool.query('SELECT * FROM motivo_movs_inv WHERE tip_mov_inv IN(1,3) AND status=1');

    var motivosEntradaTotal = motivosEntrada.length;

    if (motivosEntradaTotal === 0) {

        res.send('empty');

    } else {

        const dataMotivos = [];

        for (var x = 0; x < motivosEntradaTotal; x++) {

            const arrayMotivos = motivosEntrada[x];

            const obj = [
                arrayMotivos.idmot_mov,
                arrayMotivos.motivo           
            ];

            dataMotivos.push(obj);
        }

        res.send(dataMotivos);
    }

}

exports.salidaProductosForm = async (req, res) => {

    res.render('modulos/productos/salida_producto', {
        nombrePagina: 'Salida de Productos'
    });

}

exports.motivosSalidaInv = async (req, res) => {

    const motivosEntrada = await pool.query('SELECT * FROM motivo_movs_inv WHERE tip_mov_inv IN(2,3) AND status=1');

    var motivosEntradaTotal = motivosEntrada.length;

    if (motivosEntradaTotal === 0) {

        res.send('empty');

    } else {

        const dataMotivos = [];

        for (var x = 0; x < motivosEntradaTotal; x++) {

            const arrayMotivos = motivosEntrada[x];

            const obj = [
                arrayMotivos.idmot_mov,
                arrayMotivos.motivo           
            ];

            dataMotivos.push(obj);
        }

        res.send(dataMotivos);
    }

}

exports.regMovInv = async (req, res) => {

    var idusuario = res.locals.usuario.idusuario;

    var { idproducto, tipo_mov, cantidad, idmot_mov } = req.body;

    var q = await pool.query('call sp_ajuste_inv(?,?,?,?,?)',[idproducto,idmot_mov,cantidad,tipo_mov,idusuario]);

    var rowsAff = q.affectedRows;

    if(rowsAff>0){
        res.send('Ok');
    }

}

exports.historicoPrecios = async (req, res) => {

    var idUsuario = res.locals.usuario.idusuario;
    var url = req.originalUrl;

    var permiso = await validAccess(idUsuario, url);

    if(permiso>0){

        res.render('modulos/productos/precios_hist', {
            nombrePagina: 'Historico de Precios'
        });

    }else{

        res.render('modulos/error/401', {
            nombrePagina: '401 Unauthorized'
        });

    }

}

exports.getHistPrecios = async (req, res) => {

    const { idProd, tipPrecio } = req.body;

    var conteo = 0;

    var q = await pool.query('call get_histprec(?,?)',[idProd, tipPrecio]);

    const values = q[0];

    if(values.length === 0){
        res.send('empty');
    }else{

        const dataHist = [];

        for (var x = 0; x < values.length; x++) {

            conteo = x + 1;
            const arrayMovs = values[x];

            var fecha = moment(arrayMovs.fecha).format('YYYY-MM-DD hh:mm:ss a');

            if(arrayMovs.accion>0){
                var arrow = "<i class='fas fa-arrow-circle-up text-success'></i>"
            }else{
                if(arrayMovs.accion<0){
                    var arrow = "<i class='fas fa-arrow-circle-down text-danger'></i>"
                }else{
                    var arrow = "<i class='fas fa-minus-circle text-info'></i>"
                }
            }

            const obj = [
                conteo,
                arrayMovs.idproducto,
                arrayMovs.producto,
                currencyFormat(arrayMovs.precio),
                arrow,
                fecha,
                arrayMovs.usuario
            ];

            dataHist.push(obj);
        }

        res.send(dataHist);

    }
    
}

exports.ajustePrecios = async (req, res) => {

    var idUsuario = res.locals.usuario.idusuario;
    var url = req.originalUrl;

    var permiso = await validAccess(idUsuario, url);

    if(permiso>0){

        res.render('modulos/productos/ajuste_precios', {
            nombrePagina: 'Ajuste de Precios'
        });

    }else{

        res.render('modulos/error/401', {
            nombrePagina: '401 Unauthorized'
        });

    }

}

exports.getPrecioAjuste = async (req, res) => {

    var { idProd, tipoPrecio } = req.body;

    var tipBusqueda= 1;

    var precioProdId = await pool.query('call get_precio_ajuste_producto(?,?,?)', [idProd,tipoPrecio,tipBusqueda]);
    var newprecioProdId = precioProdId[0];

    if(newprecioProdId.length === 0){
        var tipBusqueda= 2;
        var precioProdCod = await pool.query('call get_precio_ajuste_producto(?,?,?)', [idProd,tipoPrecio,tipBusqueda]);
        var newprecioProdCod = precioProdCod[0];
        
        if(newprecioProdCod.length === 0){
            res.send('Empty');
        }else{
            res.status(200).send(newprecioProdCod);
        }
    }else{
        res.status(200).send(newprecioProdId);
    }

}

exports.ajustaPrecio = async (req, res) => {

    var idUsuario = res.locals.usuario.idusuario;
    var { idProducto, tipoPrecio, oldPrecio, newPrecio } = req.body;

    var q = await pool.query('call sp_ajuste_precio(?,?,?,?,?)',[idProducto,tipoPrecio,oldPrecio,newPrecio,idUsuario]);

    var rowsAff = q.affectedRows;

    if(rowsAff>0){
        res.send('Ok');
    }
}


function currencyFormat(value) {
	return '$' + value.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
 }

 async function validAccess(idUsuario, url){

    var permiso = 0;

    var idPerfilQry = await pool.query('SELECT idperfil FROM usuarios WHERE idusuario=?',idUsuario);
    var idMenuQry = await pool.query('SELECT idmenu FROM menu WHERE url=?',url);

    var idPerfil = idPerfilQry[0].idperfil;
    var idMenu = idMenuQry[0].idmenu;

    var validPermU = await pool.query('SELECT COUNT(1) as cuenta FROM permisos_xusuario WHERE idmenu=? AND idusuario=? AND acceso=1',[idMenu, idUsuario]);
    var validPermP = await pool.query('SELECT COUNT(1) as cuenta FROM permisos_xperfil WHERE idmenu=? AND idperfil=? AND acceso=1',[idMenu,idPerfil]);
    
    var permiso = permiso + validPermU[0].cuenta + validPermP[0].cuenta;

    return permiso

}