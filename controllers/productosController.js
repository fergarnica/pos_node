const pool = require('../config/db');
const moment = require('moment');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const fs = require("fs");

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

    res.render('modulos/productos/categorias', {
        nombrePagina: 'Categorias'
    });
}

exports.agregarCategoria = async (req, res) => {

    const { categoria, status, fecha_creacion } = req.body;

    const newCategoria = {
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

    //console.log(valuesTotal);
    //console.log(values);

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

    //console.log(req.body);

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
    res.render('modulos/productos/marcas', {
        nombrePagina: 'Marcas'
    });

}

exports.agregarMarca = async (req, res) => {

    const { marca, status, fecha_creacion } = req.body;

    const newMarca = {
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

    //console.log(valuesTotal);
    //console.log(values);

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

    //console.log(req.body);

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

    res.render('modulos/productos/productos', {
        nombrePagina: 'Productos'
    });

}

exports.agregarProducto = async (req, res) => {

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

    const newProd = {
        producto,
        bar_code,
        idcategoria, 
        idpresentacion, 
        idmarca, 
        idproveedor, 
        stock_total, 
        pre_costo, 
        pre_costo_neto, 
        pre_mayoreo, 
        pre_menudeo,
        inventariable,
        status,
        fecha_creacion    
    };

    await pool.query('INSERT INTO productos SET ?', [newProd]);

    res.status(200).send('Producto Creado Correctamente!');
}

exports.mostrarProductos = async (req, res) => {

    const values = await pool.query('SELECT a.idproducto,a.producto,a.bar_code,b.categoria,c.abreviatura,d.marca,e.proveedor,a.inventariable,a.stock_total,a.pre_costo,a.pre_costo_neto,a.pre_mayoreo,a.pre_menudeo,a.imagen,a.status,a.fecha_creacion FROM pos_node.productos a LEFT JOIN pos_node.categorias b ON a.idcategoria=b.idcategoria LEFT JOIN pos_node.presentaciones c ON a.idpresentacion=c.idpresentacion LEFT JOIN pos_node.marcas d ON a.idmarca=d.idmarca LEFT JOIN pos_node.proveedores e ON a.idproveedor=e.idproveedor');

    var valuesTotal = values.length;

    if (valuesTotal === 0) {

        res.send('empty');

    } else {

        const dataProductos = [];

        for (var x = 0; x < valuesTotal; x++) {

            conteo = x + 1;
            const arrayProductos = values[x];
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

    /* req.checkBody('producto', 'El nombre del producto no puede ir vacio').notEmpty(); */
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

    const dataProducto = await pool.query('SELECT a.idproducto,a.producto,a.bar_code,a.idcategoria,b.categoria,a.idpresentacion,c.abreviatura,a.idmarca,d.marca,a.idproveedor,e.proveedor,a.inventariable,a.stock_total,a.pre_costo,a.pre_costo_neto,a.pre_mayoreo,a.pre_menudeo,a.imagen,a.status,a.fecha_creacion FROM pos_node.productos a LEFT JOIN pos_node.categorias b ON a.idcategoria=b.idcategoria LEFT JOIN pos_node.presentaciones c ON a.idpresentacion=c.idpresentacion LEFT JOIN pos_node.marcas d ON a.idmarca=d.idmarca LEFT JOIN pos_node.proveedores e ON a.idproveedor=e.idproveedor WHERE a.idproducto= ?', idProducto);

    res.status(200).send(dataProducto);
    
}

exports.precioProducto = async (req, res) => {

    let idProducto = req.params.id;

    const precioProdId = await pool.query('SELECT idproducto, producto, bar_code, stock_total, pre_costo, pre_costo_neto, pre_mayoreo, pre_menudeo FROM pos_node.productos WHERE status=1 AND idproducto= ?', idProducto);

    if(precioProdId.length === 0){
        const precioProdCod = await pool.query('SELECT idproducto, producto, bar_code, stock_total, pre_costo, pre_costo_neto, pre_mayoreo, pre_menudeo FROM pos_node.productos WHERE status=1 AND bar_code= ?', idProducto);
        
        if(precioProdCod.length === 0){
            res.send('Empty');
        }else{
            res.status(200).send(precioProdCod);
        }
    }else{
        res.status(200).send(precioProdId);
    }
}


exports.presentaciones = async (req, res) => {

    res.render('modulos/productos/presentacion', {
        nombrePagina: 'Presentaciones'
    });

}

exports.agregarPresentacion = async (req, res) => {

    const { presentacion, abreviatura, status, fecha_creacion } = req.body;

    const newPres = {
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

    //console.log(valuesTotal);
    //console.log(values);

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

    //console.log(req.body);

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


function currencyFormat(value) {
	return '$' + value.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
 }