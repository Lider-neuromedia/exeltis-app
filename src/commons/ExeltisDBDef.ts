export class ExeltisDBDef {

    //Nombre del esquema de Base de Datos
    public static DATABASE_NAME: string = "Exeltis";

    public static MEDICOS = class {

        //Nombre de la tabla
        public static TABLE_NAME: string = "medicos";
        //Nombre de las Columnas que contiene la tabla
        public static medico_id: string = "medico_id";
        public static visitador_id: string = "visitador_id";
        public static nombre_medico: string = "nombre_medico";
        public static especialidad: string = "especialidad";

    }

    
/*
    //Setencia SQL que permite crear la tabla medicos
    public static MEDICOS_TABLE_CREATE: string;
    MEDICOS_TABLE_CREATE = "CREATE TABLE " + this.MEDICOS.TABLE_NAME + " (" +
                    this.MEDICOS.medico_id + " varchar ( 100 ) NOT NULL, " +
                    this.MEDICOS.visitador_id + " varchar ( 30 ) NOT NULL, " +
                    this.MEDICOS.nombre_medico + " varchar ( 200 ) NOT NULL, " +
                    " PRIMARY KEY( " + this.MEDICOS.medico_id + " ) );";

    //Setencia SQL que permite eliminar la tabla medicos
    public static MEDICOS_TABLE_DROP: string;
    MEDICOS_TABLE_DROP = "DROP TABLE IF EXISTS " + this.MEDICOS.TABLE_NAME;*/

}

//Setencia SQL que permite crear la tabla medicos
export let MEDICOS_TABLE_CREATE = "CREATE TABLE medicos (" +
                "medico_id varchar ( 30 ) NOT NULL, " +
                "visitador_id varchar ( 30 ) NOT NULL, " +
                "page integer, " +
                "nombre_medico varchar ( 200 ) NOT NULL, " +
                "especialidad varchar ( 100 ) NOT NULL, " +
                " PRIMARY KEY( medico_id ) );";

//Setencia SQL que permite crear la tabla visitas
export let VISITAS_TABLE_CREATE = "CREATE TABLE visitas (" +
                "id_vis INTEGER PRIMARY KEY , " +
                "medico_id varchar ( 30 ) NOT NULL, " +
                "visitador_id varchar ( 30 ) NOT NULL, " +
                "tipo_visita_id varchar ( 30 ), " +
                "fecha varchar ( 100 ) NOT NULL, " +
                "fechainicio varchar ( 100 ), " +
                "fechafin varchar ( 100 ), " +
                "agendada varchar ( 10 ), " +
                "terminada varchar ( 10 ), " +
                "id_servidor varchar ( 10 ), " +
                "subida varchar ( 10 ) );";

//Setencia SQL que permite crear la tabla medicosproductos
export let MEDICOSPRODUCTOS_TABLE_CREATE = "CREATE TABLE medicosproductos (" +
                "medico_id varchar ( 30 ) NOT NULL, " +
                "visitador_id varchar ( 30 ) NOT NULL, " +
                "tipo_visita_id varchar ( 30 ) NOT NULL, " +
                "tipo_visita_nombre varchar ( 100 ) , " +
                "id varchar ( 30 ), " +
                "codigo varchar ( 100 ), " +
                "color varchar ( 100 ), " +
                "nombre varchar ( 100 ), " +
                "url_documento varchar ( 100 ), " +
                "url_logo varchar ( 100 ), " +
                "orden_producto varchar ( 30 ), " +
                " PRIMARY KEY( medico_id, visitador_id, tipo_visita_id, id ) );";

//Setencia SQL que permite crear la tabla productos
export let PRODUCTOS_TABLE_CREATE = "CREATE TABLE productos (" +
                "pro_id INTEGER PRIMARY KEY , " +
                "id varchar ( 30 ), " +
                "linea_id varchar ( 30 ), " +
                "categoria_id varchar ( 30 ), " +
                "codigo varchar ( 100 ), " +
                "color varchar ( 100 ), " +
                "nombre varchar ( 100 ), " +
                "page integer, " +
                "url_documento varchar ( 100 ), " +
                "url_logo varchar ( 100 ) );";

//Setencia SQL que permite crear la tabla productos_linea
export let PRODUCTOS_LINEA_TABLE_CREATE = "CREATE TABLE productos_linea (" +
                "pro_lin_id INTEGER PRIMARY KEY , " +
                "producto_id varchar ( 30 ), " +
                "linea_id varchar ( 30 ), " +
                "nombre varchar ( 100 ) );";

//Setencia SQL que permite crear la tabla productos_categoria
export let PRODUCTOS_CATEGORIA_TABLE_CREATE = "CREATE TABLE productos_categoria (" +
                "pro_cat_id INTEGER PRIMARY KEY , " +
                "producto_id varchar ( 30 ), " +
                "categoria_id varchar ( 30 ), " +
                "nombre varchar ( 100 ) );";

//Setencia SQL que permite eliminar la tabla medicos
export let MEDICOS_TABLE_DROP = "DROP TABLE IF EXISTS medicos";

//Setencia SQL que permite eliminar la tabla visitas
export let VISITAS_TABLE_DROP = "DROP TABLE IF EXISTS visitas";

//Setencia SQL que permite eliminar la tabla medicosproductos
export let MEDICOSPRODUCTOS_TABLE_DROP = "DROP TABLE IF EXISTS medicosproductos";

//Setencia SQL que permite eliminar la tabla productos
export let PRODUCTOS_TABLE_DROP = "DROP TABLE IF EXISTS productos";

//Setencia SQL que permite eliminar la tabla productos_linea
export let PRODUCTOS_LINEA_TABLE_DROP = "DROP TABLE IF EXISTS productos_linea";

//Setencia SQL que permite eliminar la tabla productos_categoria
export let PRODUCTOS_CATEGORIA_TABLE_DROP = "DROP TABLE IF EXISTS productos_categoria";