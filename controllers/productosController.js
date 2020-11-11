const pool = require('../config/db');
const moment = require('moment');


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

    console.log(existCategoria.length);

    if(existCategoria.length > 0 ){
        res.send('Repetido');

    }else{

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

        if(categoriaRepetido.length > 0){
            res.send('Repetido');
        }else{
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

    if(existMarca.length > 0 ){
        res.send('Repetido');

    }else{

        await pool.query('INSERT INTO marcas SET ?', [newMarca]);

        res.status(200).send('Marca de Producto Creada Correctamente');
    }
}