const pool = require('../config/db');


exports.empresa = async (req, res) => {

    res.render('modulos/empresa', {
        nombrePagina: 'Empresa'
    });

}


exports.infoEmpresa = async (req, res) => {

    var empresa = await pool.query('SELECT * FROM empresa');

    const dataEmpresa = [];

    if (empresa.length === 0) {

        res.send('Empty');

    }else{

        for (var x = 0; x < empresa.length; x++) {
            const arrayEmpresa = empresa[x];
            dataEmpresa.push(arrayEmpresa);
        }

        res.send(dataEmpresa);

    }

}


exports.guardarEmpresa = async (req, res) => {

    const { nombre_empresa, razon_social, web_site } = req.body;
    var conteo = 0;

    const newEmpresa = {
        nombre_empresa,
        razon_social, 
        web_site
    };

    var infoEmpresa = await pool.query('SELECT * FROM empresa');


    if(infoEmpresa.length === 0){

        await pool.query('INSERT INTO empresa SET ?', [newEmpresa]);

        res.status(200).send('Creado');

    }else{

        for (var x = 0; x < infoEmpresa.length; x++) {
            const arrayEmpresa = infoEmpresa[x];
            var empresa_base = arrayEmpresa.nombre_empresa;
            var razon_social_base = arrayEmpresa.razon_social;
            var web_site_base = arrayEmpresa.web_site;
        }

        if(nombre_empresa !== empresa_base){
            await pool.query('UPDATE empresa SET nombre_empresa = ?', [nombre_empresa]);
            var conteo = conteo + 1;
        }

        if(razon_social !== razon_social_base){
            await pool.query('UPDATE empresa SET razon_social = ?', [razon_social]);
            var conteo = conteo + 1;
        }

        if(web_site !== web_site_base){
            await pool.query('UPDATE empresa SET web_site = ?', [web_site]);
            var conteo = conteo + 1;
        }

        if (conteo > 0) {

            res.send('Actualizado');
    
        } else {
            res.send('Nulos');
    
        }


    }

}

