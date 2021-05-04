import axios from 'axios';


const menuLateral = document.getElementById('menu-lateral');

(function () {

    if (menuLateral) {

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
    var id_anterior= 0;
    
    for (var i = 0; i < submenu.length; i++) {
        
        var submenus = submenu[i];
        var submenu_nombre = submenus.submenu;

        if (submenu_nombre != null) {
            var id_menu = submenus.idmenu;
            var url_submenu = submenus.url_submenu;
            var classNameLi = '"nav-item"';
            var classNameA = '"nav-link"';
            var classNameIcon = '"nav-icon ' + submenus.icono_submenu + ' "';
            
            if(id_menu != id_anterior){
                //agregamos un <ul> el cual va hacer el contenedor del submenu
                id_anterior = id_menu;
                $("#" + id_menu).append('<ul class="nav nav-treeview"></ul>');

            }
            //agregamos los item al submenu
            $("#" + id_menu + " ul").append("<li class= " + classNameLi + ">" + "<a href=" + url_submenu + " class="+ classNameA + ">" + "<i class=" + classNameIcon + "></i>" + "<p>" + submenu_nombre  + "</li>");
        }
    }
}