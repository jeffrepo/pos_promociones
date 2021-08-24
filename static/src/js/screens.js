odoo.define('pos_promociones.screens', function (require) {
"use strict";

var screens = require('point_of_sale.screens');

var PedidoEspecial = screens.ActionButtonWidget.extend({
    template: 'PedidoEspecial',
    init: function(parent, options) {
        this._super(parent, options);
        this.pos.bind('change:selectedOrder',this.renderElement,this);
    },
    button_click: function(){
        var self = this;
        var order = this.pos.get_order();
        var gui = this.pos.gui;

        order.pedido_especial = !order.pedido_especial;

        var set_especial = this.pos.set_pedidoEspecial(order.pedido_especial);
        var get_especial = this.pos.get_pedidoEspecial();
        this.renderElement();

    },

});

screens.define_action_button({
    'name': 'pedidoespecial',
    'widget': PedidoEspecial,
    'condition': function(){
        return this.pos.config.pedido_especial;
    },
});


var PedidoLinea = screens.ActionButtonWidget.extend({
    template: 'PedidoLinea',
    init: function(parent, options) {
        this._super(parent, options);
        this.pos.bind('change:selectedOrder',this.renderElement,this);
    },
    button_click: function(){
        var self = this;
        var order = this.pos.get_order();
        var gui = this.pos.gui;
        order.pedido_linea = !order.pedido_linea;

        var set_linea = this.pos.set_pedidoLinea(order.pedido_linea);
        var get_linea = this.pos.get_pedidoLinea();
        if (this.pos.get_pedidoLinea() == true){
          this.pos.set_pedidoEspecial(false);
          // this.set('pedido_especial', false);
          // this.pedido_especial.reset();
        }
        this.renderElement();
    },
});

screens.define_action_button({
    'name': 'pedidolinea',
    'widget': PedidoLinea,
    'condition': function(){
        return this.pos.config.pedido_linea;
    },
});


var ButtonPromocion = screens.ActionButtonWidget.extend({
  template: 'ButtonPromocion',
  init: function(parent, options){
    this._super(parent, options);
    this.pos.bind('change:selectedOrder',this.renderElement,this);
  },

  get_hora : function (hora_inicio, hora_final) {
    // Check sign of given number
    var sign = (hora_inicio >= 0) ? 1 : -1;
    var sign1 = (hora_final >= 0) ? 1 : -1;

    // Set positive value of number of sign negative
    hora_inicio = hora_inicio * sign;
    hora_final = hora_final * sign1;

    // Separate the int from the decimal part
    var hour = Math.floor(hora_inicio);
    var hour1 = Math.floor(hora_final);

    var decpart = hora_inicio - hour;
    var decpart1 = hora_final - hour1;

    var min = 1 / 60;

    // Round to nearest minute
    decpart = min * Math.round(decpart / min);
    decpart1 = min * Math.round(decpart1 / min);

    var minute = Math.floor(decpart * 60) + '';
    var minute1 = Math.floor(decpart1 * 60) + '';

    // Add padding if need
    if (minute.length < 2) {
    minute = '0' + minute;
    }

    if (minute1.length < 2) {
      minute1 = '0' + minute1;
    }

    // Add Sign in final result
    sign = sign == 1 ? '' : '-';
    sign1 = sign1 == 1 ? '' : '-';

    // Concate hours and minutes
    var hora0, hora1;
    hora0 = sign + hour + ':' + minute;
    hora1 = sign1 + hour1 + ':' + minute1;

    var times = moment(hora0, ["h:mm A"]).format("HH:mm");


    // if (times > '11:59') {
    // 	const timeString12hrs = new Date('1970-01-01T' + hora0 + 'Z')
    // 	.toLocaleTimeString({},{timeZone:'UTC', hour12:true, hour:'numeric', minute:'numeric'});
    // 	times = timeString12hrs;
    // }

    var times1 = moment(hora1, ["h:mm A"]).format("HH:mm");

    // if (times1 >= '11:59') {
    // 	const timeString12hrs0 = new Date('1970-01-01T'+ hora1 + 'Z')
    // 	.toLocaleTimeString({},{timeZone:'UTC', hour12:true, hour:'numeric', minute:'numeric'});
    // 	times1 = timeString12hrs0;
    // }

    return [times, times1];
  },

  get_tipo_descuento : function(){
    var self = this;
    var order = this.pos.get_order();
    var gui = this.pos.gui;
    var db = this.pos.db;
    var producto_regalo_id = this.pos.config.producto_descuento_id;
    var diccionario_productos_descuento={}
    var promociones = false;
    promociones = self.pos.promocion;

    //--------------Variable para descuento-----------------------------------
		var diccionario_productos_descuento={}, productos_promocion0=0, condicion=false;
		var cliente=false, horas=false, clientes=false, n_promociones={};
    cliente = order.attributes.client.id;

    var today = new Date();
		var hora = today.getHours();
		var minuto = today.getMinutes();
		if( minuto.toString().length == 1){
				minuto = '0'+minuto
		}

		var hora_minuto = today.getHours()+':'+minuto;
		var hora_minuto1 = moment(hora_minuto, ["h:mm A"]).format("HH:mm");

    order.get_orderlines().forEach(function(l) {

      for (var i = 0; i < promociones.length; i++) {

        if (promociones[i].tipo_select == 'desc') {
          horas = self.get_hora(promociones[i].hora_inicio, promociones[i].hora_final);

          var validation_date = new Date();

          var fecha_sesion0 = moment(validation_date).utc().local();

          var fecha_promo_in = promociones[i].fecha_inicio;
          var fecha_promo_in0 = moment(fecha_promo_in.replace(/-/g, '\/')).utc().local();

          var fecha_promo_fin = promociones[i].fecha_fin;
          var fecha_promo_fin0 = moment(fecha_promo_fin.replace(/-/g, '\/')).utc().local();

          var hora_inic, hora_fina;

          for (var n = 0; n < horas.length; n++) {
            horas[n];
            hora_inic = horas[0];
            hora_fina = horas[1];
          }

          if ((fecha_sesion0 >= fecha_promo_in0) && (fecha_sesion0 <= fecha_promo_fin0) && (fecha_sesion0 != fecha_promo_fin0)){

            if ( (hora_minuto1 >= hora_inic )){

              clientes = promociones[i].cliente_ids;

              productos_promocion0 = promociones[i].productos_ids;

              if (clientes.includes(cliente)) {

                if ( productos_promocion0.includes(l.product.id)) {

                  if (!(l.product.id in diccionario_productos_descuento)) {
                    diccionario_productos_descuento[l.product.id]={
                      'id':l.product.id,
                      'tipo_descuento': promociones[i].aplicar,
                      'cantidad': 0,
                      'precio_unitario': l.get_unit_price(),
                      'promos_llevar':0,
                      'total':0,
                      'descuento':0,
                      'cantidad_regalo':0,
                      'cantidad_descuento':0,
                      'total_descuento': [],
                      'n_promocion': [],
                      'estado': false,
                      'estado_cantidades':false,
                    };
                  }

                  if (!(promociones[i].pos_condicion_descuento_ids[0]['id'] in diccionario_productos_descuento[l.product.id]['n_promocion']) ) {
                    if (diccionario_productos_descuento[l.product.id]['n_promocion'].length <= 0) {
                      diccionario_productos_descuento[l.product.id]['n_promocion'].push(promociones[i].pos_condicion_descuento_ids[0]['id']);
                    }else {
                      if (!(promociones[i].pos_condicion_descuento_ids[0]['id'] in diccionario_productos_descuento[l.product.id]['n_promocion'])) {
                        if (!(diccionario_productos_descuento[l.product.id]['n_promocion'].includes(promociones[i].pos_condicion_descuento_ids[0]['id']))) {
                          diccionario_productos_descuento[l.product.id]['n_promocion'].push(promociones[i].pos_condicion_descuento_ids[0]['id']);
                        }

                      }

                    }

                  }
                  console.log("Geordie estoy aquí ");

                  if (l.product.id == diccionario_productos_descuento[l.product.id]['id']) {
                    if (diccionario_productos_descuento[l.product.id]['ids_lineas'].length <= 0) {
                      if (!(l.id in diccionario_productos_descuento[l.product.id]['ids_lineas'])) {
                        diccionario_productos_descuento[l.product.id]['cantidad'] +=l.get_quantity();
                        diccionario_productos_descuento[l.product.id]['total'] +=l.get_base_price();
                        diccionario_productos_descuento[l.product.id]['ids_lineas'].push(l.id)
                        diccionario_productos_descuento[l.product.id]['estado_cantidades'] =true;
                      }
                    }else {
                      if (!(l.id in diccionario_productos_descuento[l.product.id]['ids_lineas'])) {

                        if (!( diccionario_productos_descuento[l.product.id]['ids_lineas'].includes(l.id) )) {
                          diccionario_productos_descuento[l.product.id]['cantidad'] +=l.get_quantity();
                          diccionario_productos_descuento[l.product.id]['total'] +=l.get_base_price();
                          diccionario_productos_descuento[l.product.id]['ids_lineas'].push(l.id)
                          diccionario_productos_descuento[l.product.id]['estado_cantidades'] =true;
                        }

                      }
                    }
                  }

                  condicion = promociones[i].pos_condicion_descuento_ids;

                }



              }
              else if (clientes.length <= 0) {

                if ( productos_promocion0.includes(l.product.id)) {

                  if (!(l.product.id in diccionario_productos_descuento)) {

                    diccionario_productos_descuento[l.product.id]={
  										'id':l.product.id,
  										'tipo_descuento': promociones[i].aplicar,
  										'cantidad': 0,
  										'precio_unitario': l.get_unit_price(),
  										'promos_llevar':0,
  										'total':0,
  										'descuento':0,
  										'cantidad_regalo':0,
  										'cantidad_descuento':0,
                      'total_descuento': [],
                      'n_promocion': [],
                      'ids_lineas':[],
                      'estado': false,
                      'estado_cantidades':false,
  									};

                  }
                  if (!(promociones[i].pos_condicion_descuento_ids[0]['id'] in diccionario_productos_descuento[l.product.id]['n_promocion']) ) {
                    if (diccionario_productos_descuento[l.product.id]['n_promocion'].length <= 0) {
                      diccionario_productos_descuento[l.product.id]['n_promocion'].push(promociones[i].pos_condicion_descuento_ids[0]['id']);
                    }else {
                      if (!(promociones[i].pos_condicion_descuento_ids[0]['id'] in diccionario_productos_descuento[l.product.id]['n_promocion'])) {
                        if (!(diccionario_productos_descuento[l.product.id]['n_promocion'].includes(promociones[i].pos_condicion_descuento_ids[0]['id']))) {
                          diccionario_productos_descuento[l.product.id]['n_promocion'].push(promociones[i].pos_condicion_descuento_ids[0]['id']);
                        }

                      }

                    }

                  }
                  console.log("Geordie estoy aquí 1");
                  if (l.product.id == diccionario_productos_descuento[l.product.id]['id']) {
                    if (diccionario_productos_descuento[l.product.id]['ids_lineas'].length <= 0) {
                      if (!(l.id in diccionario_productos_descuento[l.product.id]['ids_lineas'])) {
                        diccionario_productos_descuento[l.product.id]['cantidad'] +=l.get_quantity();
                        diccionario_productos_descuento[l.product.id]['total'] +=l.get_base_price();
                        diccionario_productos_descuento[l.product.id]['ids_lineas'].push(l.id)
                        diccionario_productos_descuento[l.product.id]['estado_cantidades'] =true;
                      }
                    }else {
                      if (!(l.id in diccionario_productos_descuento[l.product.id]['ids_lineas'])) {

                        if (!( diccionario_productos_descuento[l.product.id]['ids_lineas'].includes(l.id) )) {
                          diccionario_productos_descuento[l.product.id]['cantidad'] +=l.get_quantity();
                          diccionario_productos_descuento[l.product.id]['total'] +=l.get_base_price();
                          diccionario_productos_descuento[l.product.id]['ids_lineas'].push(l.id)
                          diccionario_productos_descuento[l.product.id]['estado_cantidades'] =true;
                        }

                      }
                    }
                  }

                  condicion = promociones[i].pos_condicion_descuento_ids;

                }

              }

            }

          }
          else if ((fecha_sesion0 >= fecha_promo_in0) && (fecha_sesion0 <= fecha_promo_fin0) && (fecha_sesion0 == fecha_promo_fin0)) {

            if ( (hora_minuto1 <= hora_fina) ) {

              clientes = promociones[i].cliente_ids;

              productos_promocion0 = promociones[i].productos_ids;

              if (clientes.includes(cliente)) {

                if ( productos_promocion0.includes(l.product.id)) {

                  if (!(l.product.id in diccionario_productos_descuento)) {
                    diccionario_productos_descuento[l.product.id]={
                      'id':l.product.id,
                      'tipo_descuento': promociones[i].aplicar,
                      'cantidad': 0,
                      'precio_unitario': l.get_unit_price(),
                      'promos_llevar':0,
                      'total':0,
                      'descuento':0,
                      'cantidad_regalo':0,
                      'cantidad_descuento':0,
                      'total_descuento': [],
                      'n_promocion': [],
                      'estado': false,
                      'estado_cantidades':false,
                    };
                  }

                  if (!(promociones[i].pos_condicion_descuento_ids[0]['id'] in diccionario_productos_descuento[l.product.id]['n_promocion']) ) {
                    if (diccionario_productos_descuento[l.product.id]['n_promocion'].length <= 0) {
                      diccionario_productos_descuento[l.product.id]['n_promocion'].push(promociones[i].pos_condicion_descuento_ids[0]['id']);
                    }else {
                      if (!(promociones[i].pos_condicion_descuento_ids[0]['id'] in diccionario_productos_descuento[l.product.id]['n_promocion'])) {
                        if (!(diccionario_productos_descuento[l.product.id]['n_promocion'].includes(promociones[i].pos_condicion_descuento_ids[0]['id']))) {
                          diccionario_productos_descuento[l.product.id]['n_promocion'].push(promociones[i].pos_condicion_descuento_ids[0]['id']);
                        }

                      }

                    }

                  }
                  console.log("Geordie estoy aquí 2");
                  if (l.product.id == diccionario_productos_descuento[l.product.id]['id']) {
                    if (diccionario_productos_descuento[l.product.id]['ids_lineas'].length <= 0) {
                      if (!(l.id in diccionario_productos_descuento[l.product.id]['ids_lineas'])) {
                        diccionario_productos_descuento[l.product.id]['cantidad'] +=l.get_quantity();
                        diccionario_productos_descuento[l.product.id]['total'] +=l.get_base_price();
                        diccionario_productos_descuento[l.product.id]['ids_lineas'].push(l.id)
                        diccionario_productos_descuento[l.product.id]['estado_cantidades'] =true;
                      }
                    }else {
                      if (!(l.id in diccionario_productos_descuento[l.product.id]['ids_lineas'])) {

                        if (!( diccionario_productos_descuento[l.product.id]['ids_lineas'].includes(l.id) )) {
                          diccionario_productos_descuento[l.product.id]['cantidad'] +=l.get_quantity();
                          diccionario_productos_descuento[l.product.id]['total'] +=l.get_base_price();
                          diccionario_productos_descuento[l.product.id]['ids_lineas'].push(l.id)
                          diccionario_productos_descuento[l.product.id]['estado_cantidades'] =true;
                        }

                      }
                    }
                  }
                  condicion = promociones[i].pos_condicion_descuento_ids;

                }

              }

              else if (clientes.length <= 0) {

                if ( productos_promocion0.includes(l.product.id)) {

                  if (!(l.product.id in diccionario_productos_descuento)) {

                    diccionario_productos_descuento[l.product.id]={
  										'id':l.product.id,
  										'tipo_descuento': promociones[i].aplicar,
  										'cantidad': 0,
  										'precio_unitario': l.get_unit_price(),
  										'promos_llevar':0,
  										'total':0,
  										'descuento':0,
  										'cantidad_regalo':0,
  										'cantidad_descuento':0,
                      'total_descuento':[],
                      'n_promocion': [],
                      'estado': false,
                      'estado_cantidades': false,
  									};

                  }

                  if (!(promociones[i].pos_condicion_descuento_ids[0]['id'] in diccionario_productos_descuento[l.product.id]['n_promocion']) ) {
                    if (diccionario_productos_descuento[l.product.id]['n_promocion'].length <= 0) {
                      diccionario_productos_descuento[l.product.id]['n_promocion'].push(promociones[i].pos_condicion_descuento_ids[0]['id']);
                    }else {
                      if (!(promociones[i].pos_condicion_descuento_ids[0]['id'] in diccionario_productos_descuento[l.product.id]['n_promocion'])) {
                        if (!(diccionario_productos_descuento[l.product.id]['n_promocion'].includes(promociones[i].pos_condicion_descuento_ids[0]['id']))) {
                          diccionario_productos_descuento[l.product.id]['n_promocion'].push(promociones[i].pos_condicion_descuento_ids[0]['id']);
                        }

                      }

                    }

                  }
                  console.log("Geordie estoy aquí 3");
                  if (l.product.id == diccionario_productos_descuento[l.product.id]['id']) {
                    if (diccionario_productos_descuento[l.product.id]['ids_lineas'].length <= 0) {
                      if (!(l.id in diccionario_productos_descuento[l.product.id]['ids_lineas'])) {
                        diccionario_productos_descuento[l.product.id]['cantidad'] +=l.get_quantity();
                        diccionario_productos_descuento[l.product.id]['total'] +=l.get_base_price();
                        diccionario_productos_descuento[l.product.id]['ids_lineas'].push(l.id)
                        diccionario_productos_descuento[l.product.id]['estado_cantidades'] =true;
                      }
                    }else {
                      if (!(l.id in diccionario_productos_descuento[l.product.id]['ids_lineas'])) {

                        if (!( diccionario_productos_descuento[l.product.id]['ids_lineas'].includes(l.id) )) {
                          diccionario_productos_descuento[l.product.id]['cantidad'] +=l.get_quantity();
                          diccionario_productos_descuento[l.product.id]['total'] +=l.get_base_price();
                          diccionario_productos_descuento[l.product.id]['ids_lineas'].push(l.id)
                          diccionario_productos_descuento[l.product.id]['estado_cantidades'] =true;
                        }

                      }
                    }
                  }

                  condicion = promociones[i].pos_condicion_descuento_ids;

                }

              }


            }

          }


        }

      }

    });
    return [diccionario_productos_descuento, n_promociones];
  },

  get_tipo_promocion : function(){
    var self = this;
    var order = this.pos.get_order();
    var gui = this.pos.gui;
    var db = this.pos.db;
    var producto_regalo_id = this.pos.config.producto_descuento_id;

    //--------------Variable para promocion-----------------------------------
		var promociones = false, horas=false, producto_beneficio= false, productos_promocion=false, diccionario_productos = {}, condicion=false;
		var promos_llevar = 0, calculo_repetir=false, suma_promos_llevar=0, lista_regalos=false, porcentaje=0, clientes;
		var resta = 0, cantidad_unitaria_regalo=0,suma_cantidad_regalo=0, precio_unitario=0, producto_regalo =0, cliente=false;

    var producto_beneficio1=false ;
    promociones = self.pos.promocion;
    cliente = order.attributes.client.id;

    var today = new Date();
		var hora = today.getHours();
		var minuto = today.getMinutes();
		if( minuto.toString().length == 1){
				minuto = '0'+minuto
		}

		var hora_minuto = today.getHours()+':'+minuto;
		var hora_minuto1 = moment(hora_minuto, ["h:mm A"]).format("HH:mm");

    order.get_orderlines().forEach(function(l) {
      for (var i = 0; i < promociones.length; i++) {

        var validation_date = new Date();

        var fecha_sesion0 = moment(validation_date).utc().local();

        var fecha_promo_in = promociones[i].fecha_inicio;
        var fecha_promo_in0 = moment(fecha_promo_in.replace(/-/g, '\/')).utc().local();

        var fecha_promo_fin = promociones[i].fecha_fin;
        var fecha_promo_fin0 = moment(fecha_promo_fin.replace(/-/g, '\/')).utc().local();

        if (promociones[i].tipo_select == 'promo') {
          horas = self.get_hora(promociones[i].hora_inicio, promociones[i].hora_final);

          var hora_inic, hora_fina;

          for (var n = 0; n < horas.length; n++) {
            horas[n];
            hora_inic = horas[0];
            hora_fina = horas[1];
          }

          if ((fecha_sesion0 >= fecha_promo_in0) && (fecha_sesion0 <= fecha_promo_fin0) && (fecha_sesion0 != fecha_promo_fin0)){

            if ( (hora_minuto1 >= hora_inic )){

              producto_beneficio = promociones[i].productos_regalo_ids;
              productos_promocion = promociones[i].productos_ids;

              clientes = promociones[i].cliente_ids;

              if (clientes.includes(cliente)) {

                if ( (productos_promocion.includes(l.product.id) ) ) {

                  if ( productos_promocion.includes(l.product.id)) {

                    if (!(l.product.id in diccionario_productos )) {

                      diccionario_productos[l.product.id]={
                      'id': l.product.id,
                      'cantidad': 0,
                      'promos_llevar': 0,
                      'listado_regalos': producto_beneficio,
                      'cantidad_regalo':0,
                      'porcentaje':0,
                      'id_condicion': promociones[i].condicion_promocion_ids[0],
                      }
                    }

                  }
                  diccionario_productos[l.product.id]['cantidad']+=l.get_quantity();
                }

              }
              else if (clientes.length <= 0) {

                if ( (productos_promocion.includes(l.product.id) ) ) {

                  if ( productos_promocion.includes(l.product.id)) {

                    if (!(l.product.id in diccionario_productos )) {
                      diccionario_productos[l.product.id]={
                      'id': l.product.id,
                      'cantidad': 0,
                      'promos_llevar': 0,
                      'listado_regalos': producto_beneficio,
                      'cantidad_regalo':0,
                      'porcentaje':0,
                      'id_condicion': promociones[i].condicion_promocion_ids[0],
                      }
                    }

                  }

                  diccionario_productos[l.product.id]['cantidad']+=l.get_quantity();
                }
              }

            }

          }
          else if ((fecha_sesion0 >= fecha_promo_in0) && (fecha_sesion0 <= fecha_promo_fin0) && (fecha_sesion0 == fecha_promo_fin0)){

            if ( (hora_minuto1 <= hora_fina)){

              producto_beneficio = promociones[i].productos_regalo_ids;
              productos_promocion = promociones[i].productos_ids;


              clientes = promociones[i].cliente_ids;


              if (clientes.includes(cliente)) {

                if ( (productos_promocion.includes(l.product.id) ) ) {

                  if ( productos_promocion.includes(l.product.id)) {

                    if (!(l.product.id in diccionario_productos )) {

                      diccionario_productos[l.product.id]={
                      'id': l.product.id,
                      'cantidad': 0,
                      'promos_llevar': 0,
                      'listado_regalos': producto_beneficio,
                      'cantidad_regalo':0,
                      'porcentaje':0,
                      'id_condicion': promociones[i].condicion_promocion_ids[0],
                      }
                    }

                  }

                  diccionario_productos[l.product.id]['cantidad']+=l.get_quantity();

                }

              }
              else if (clientes.length <= 0) {
                if ( (productos_promocion.includes(l.product.id) ) ) {

                  if ( productos_promocion.includes(l.product.id)) {

                    if (!(l.product.id in diccionario_productos )) {
                      diccionario_productos[l.product.id]={
                      'id': l.product.id,
                      'cantidad': 0,
                      'promos_llevar': 0,
                      'listado_regalos': producto_beneficio,
                      'cantidad_regalo':0,
                      'porcentaje':0,
                      'id_condicion':promociones[i].condicion_promocion_ids[0],
                      }
                    }

                  }

                  diccionario_productos[l.product.id]['cantidad']+=l.get_quantity();

                }
              }

            }

          }

        }


      }

    });

    return diccionario_productos;
  },

  button_click: function(){
    var self = this;
    var order = this.pos.get_order();
    var gui = this.pos.gui;
    var db = this.pos.db;
    var producto_regalo_id = this.pos.config.producto_descuento_id;

		order.descuento = 0;
		//--------------Variable para promocion-----------------------------------
		var promociones = false, horas=false, producto_beneficio= false, productos_promocion=false, diccionario_productos = {}, condicion=false;
		var promos_llevar = 0, calculo_repetir=false, suma_promos_llevar=0, lista_regalos=false, porcentaje=0;
		var resta = 0, cantidad_unitaria_regalo=0,suma_cantidad_regalo=0, precio_unitario=0, producto_regalo =0, productos_benficio=false;

		var diccionario_productos_regalo={}, producto_beneficio1=false ;
		promociones = self.pos.promocion;

		//--------------Variable para descuento-----------------------------------
		var diccionario_productos_descuento = false, diccionario_promos_pedidos = {}, producto_beneficio0=false, productos_promocion0=0;
		var calculo_repetir0= 0,promos_llevar0=0, nuevo_diccionario={},precio_final=0, sumando_cantidades_descuento=0, new_quantity_discount=0, repeticion_promos=0;

    diccionario_productos_descuento = self.get_tipo_descuento()[0];
    //diccionario_n_promociones = self.get_tipo_descuento()[1];
    diccionario_productos = self.get_tipo_promocion();

		order.get_orderlines().forEach(function(l) {
			for (var g = 0; g < promociones.length; g++) {

        if (promociones[g].tipo_select == 'promo') {

          if (l.product.id in diccionario_productos) {
            if (diccionario_productos[l.product.id]['id_condicion'] == promociones[g].condicion_promocion_ids[0]) {

              condicion = promociones[g].pos_condicion_promocion_ids;
              for (var i = 0; i < condicion.length; i++) {

                if ( Object.keys(diccionario_productos).length > 0) {

                  if (l.product.id in diccionario_productos) {

                    if ( l.product.id == diccionario_productos[l.product.id]['id']) {

                      if (condicion[i].a_partir == 1 && condicion[i].promocion == 1) {
                        calculo_repetir = Number(diccionario_productos[l.product.id]['cantidad'] / (1) ).toFixed(2);
                      }else {
                        calculo_repetir = Number(diccionario_productos[l.product.id]['cantidad'] / (condicion[i].a_partir) ).toFixed(2);
                      }

                      promos_llevar = Math.trunc(calculo_repetir);
                      diccionario_productos[l.product.id]['promos_llevar']=promos_llevar;
                      diccionario_productos[l.product.id]['cantidad_regalo']=condicion[i].promocion;
                      diccionario_productos[l.product.id]['porcentaje']=condicion[i].porcentaje;


                    }

                  }

                }

              }

            }

          }


          producto_beneficio1 = promociones[g].productos_regalo_ids;
          if (producto_beneficio1.includes(l.product.id)) {
            if (diccionario_productos_regalo.hasOwnProperty(l.product.id) == false ) {

              diccionario_productos_regalo[l.product.id]={
                'id': l.product.id,
                'cantidad': 0,
                'total':0,
                'precio_unitario': 0,
                'id_condicion': promociones[g].condicion_promocion_ids[0],
              };
            }
            diccionario_productos_regalo[l.product.id]['cantidad'] += l.get_quantity();
            diccionario_productos_regalo[l.product.id]['total'] +=l.get_base_price();

          }

				}


				if (promociones[g].tipo_select == 'desc') {
          productos_benficio = promociones[g].productos_ids;

          if (l.product.id in diccionario_productos_descuento) {

            if ( promociones[g].aplicar == 'dinero' && diccionario_productos_descuento[l.product.id]['tipo_descuento'] == 'dinero') {
              condicion = promociones[g].pos_condicion_descuento_ids;

              for (var m = 0; m < condicion.length; m++) {
                if ( Object.keys(diccionario_productos_descuento).length > 0) {
                  if (l.product.id in diccionario_productos_descuento) {

                    if (condicion.length > 1) {
                      if (l.product.id == diccionario_productos_descuento[l.product.id]['id']) {

                        diccionario_productos_descuento[l.product.id]['descuento'] = condicion[m].descuento;
                        diccionario_productos_descuento[l.product.id]['cantidad_descuento'] = condicion[m].partir_de;
                        if (condicion[m].partir_de == 0 ) {
                          console.log("no se puede crear una promoción sin la condicon 'a partir de' ←");
                        }
                        else {

                          if (diccionario_productos_descuento[l.product.id]['total'] > condicion[m].partir_de) {
                            calculo_repetir0 = Number(diccionario_productos_descuento[l.product.id]['total'] / (condicion[m].partir_de) ).toFixed(2);
                            diccionario_productos_descuento[l.product.id]['estado'] = true;
                          }

                        }

                        promos_llevar0 = Math.trunc(calculo_repetir0);
                        if (diccionario_productos_descuento.length > 1) {
                            diccionario_productos_descuento[l.product.id]['promos_llevar']=promos_llevar0;
                        }
                        else {
                          diccionario_productos_descuento[l.product.id]['promos_llevar']=promos_llevar0;
                        }

                      }
                    } else {
                      if (l.product.id == diccionario_productos_descuento[l.product.id]['id']) {
                        diccionario_productos_descuento[l.product.id]['descuento'] = condicion[m].descuento;
                        diccionario_productos_descuento[l.product.id]['cantidad_descuento'] = condicion[m].partir_de;

                        if (condicion[m].partir_de == 0) {
                          console.log("no se puede crear una promoción sin la condicon 'a partir de' ←");
                        }else{
                          if (diccionario_productos_descuento[l.product.id]['total'] > condicion[m].partir_de) {
                            calculo_repetir0 = Number(diccionario_productos_descuento[l.product.id]['total'] / (condicion[m].partir_de) ).toFixed(2);
                            diccionario_productos_descuento[l.product.id]['estado'] = true;
                          }

                        }

                        promos_llevar0 = Math.trunc(calculo_repetir0);

                        if (diccionario_productos_descuento.length > 1) {
                            diccionario_productos_descuento[l.product.id]['promos_llevar']=promos_llevar0;
                        }
                        else {
                          diccionario_productos_descuento[l.product.id]['promos_llevar']=promos_llevar0;
                          return;
                        }

                      }
                    }




                  }

                }


              }


            }
            else if ( promociones[g].aplicar == 'uni' && diccionario_productos_descuento[l.product.id]['tipo_descuento'] == 'uni'){
              condicion = promociones[g].pos_condicion_descuento_ids;
              if (diccionario_productos_descuento[l.product.id]['n_promocion'].includes(condicion[0]['id'])) {
                if (diccionario_productos_descuento[l.product.id]['id'] === l.product.id) {

                  if (diccionario_productos_descuento[l.product.id]['n_promocion'].length > 1) {
                    if ( !(condicion[0]['id'] in diccionario_promos_pedidos) ) {
                      diccionario_promos_pedidos[condicion[0]['id']]={
                        'cantidad':0,
                        'total':0,
                        'porcentaje_descuento': condicion[0]['descuento'],
                        'a_partir': (condicion[0]['partir_de'] + 1),
                        'total_descuento':0,
                        'productos_ids': [],
                        'cantidad_base':0,
                        'lineas_ids':[],
                        'estado':false,
                      } //sacar diccionario de aquí

                    }

                    // if (diccionario_promos_pedidos[condicion[0]['id']]['productos_ids'].length <= 0) {
                    //   diccionario_promos_pedidos[condicion[0]['id']]['productos_ids'].push(l.product.id);
                    // }else {
                    //   if (!(diccionario_promos_pedidos[condicion[0]['id']]['productos_ids'].includes(l.product.id))) {
                    //     diccionario_promos_pedidos[condicion[0]['id']]['productos_ids'].push(l.product.id);
                    //   }
                    // }


                    if ( condicion[0]['id'] in diccionario_promos_pedidos ) {
                      if (!(diccionario_promos_pedidos[condicion[0]['id']]['productos_ids'].includes(l.product.id))) {
                        if (diccionario_productos_descuento[l.product.id]['n_promocion'].includes(condicion[0]['id'])) {

                          if (diccionario_promos_pedidos[condicion[0]['id']]['estado'] == false) {

                            if (diccionario_promos_pedidos[condicion[0]['id']]['cantidad_base'] <= 0) {
                              diccionario_promos_pedidos[condicion[0]['id']]['cantidad_base'] += diccionario_productos_descuento[l.product.id]['cantidad'];
                              if (diccionario_promos_pedidos[condicion[0]['id']]['productos_ids'].length <= 0) {
                                diccionario_promos_pedidos[condicion[0]['id']]['productos_ids'].push(l.product.id);
                              }else {
                                if (!(diccionario_promos_pedidos[condicion[0]['id']]['productos_ids'].includes(l.product.id))) {
                                  diccionario_promos_pedidos[condicion[0]['id']]['productos_ids'].push(l.product.id);
                                }
                              }
                            }else{
                              if (!( diccionario_promos_pedidos[condicion[0]['id']]['productos_ids'].includes(l.product.id) )) {

                                diccionario_promos_pedidos[condicion[0]['id']]['cantidad_base'] += diccionario_productos_descuento[l.product.id]['cantidad'];
                                if (diccionario_promos_pedidos[condicion[0]['id']]['productos_ids'].length <= 0) {
                                  diccionario_promos_pedidos[condicion[0]['id']]['productos_ids'].push(l.product.id);
                                }else {
                                  if (!(diccionario_promos_pedidos[condicion[0]['id']]['productos_ids'].includes(l.product.id))) {
                                    diccionario_promos_pedidos[condicion[0]['id']]['productos_ids'].push(l.product.id);
                                  }
                                }
                              }

                            }

                          }
                        }

                      }
                    }


                    if (diccionario_productos_descuento[l.product.id]['estado'] == false) {
                      sumando_cantidades_descuento += diccionario_productos_descuento[l.product.id]['cantidad'];
                      diccionario_productos_descuento[l.product.id]['estado'] = true;
                    }
                  }

                  if (diccionario_productos_descuento[l.product.id]['n_promocion'].length == 1) {

                    if ( condicion[0]['id'] in diccionario_promos_pedidos ) {
                      if (diccionario_productos_descuento[l.product.id]['n_promocion'][0] == condicion[0]['id']) {

                        if (diccionario_productos_descuento[l.product.id]['n_promocion'].includes(condicion[0]['id'])) {
                          if (diccionario_promos_pedidos[condicion[0]['id']]['estado'] == false) {
                            if (!( diccionario_promos_pedidos[condicion[0]['id']]['productos_ids'].includes(l.product.id) )) {
                              if ( !(condicion[0]['id'] in diccionario_promos_pedidos) ) {

                              diccionario_promos_pedidos[condicion[0]['id']]['cantidad_base'] += diccionario_productos_descuento[l.product.id]['cantidad'];
                              diccionario_promos_pedidos[condicion[0]['id']]['productos_ids'].push(l.product.id);
                              diccionario_promos_pedidos[condicion[0]['id']]['lineas_ids'].push(l.id);
                            }

                          }
                        }

                      }
                    }

                  }

                }

                if (diccionario_productos_descuento[l.product.id]['n_promocion'].length > 1) {

                  if (diccionario_promos_pedidos[condicion[0]['id']]['cantidad_base'] > 0) {
                    repeticion_promos = Math.trunc( diccionario_promos_pedidos[condicion[0]['id']]['cantidad_base'] / diccionario_promos_pedidos[condicion[0]['id']]['a_partir'] );
                  }

                  //repeticion_promos = Math.trunc( sumando_cantidades_descuento / diccionario_promos_pedidos[condicion[0]['id']]['a_partir'] );

                  diccionario_promos_pedidos[condicion[0]['id']]['cantidad'] = ( diccionario_promos_pedidos[condicion[0]['id']]['a_partir'] * repeticion_promos);

                  diccionario_promos_pedidos[condicion[0]['id']]['total'] = diccionario_productos_descuento[l.product.id]['precio_unitario'];

                  if (diccionario_promos_pedidos[condicion[0]['id']]['cantidad'] >= diccionario_promos_pedidos[condicion[0]['id']]['a_partir']) {
                    var ttal = (( diccionario_promos_pedidos[condicion[0]['id']]['cantidad'] * diccionario_promos_pedidos[condicion[0]['id']]['total'] ) * ( diccionario_promos_pedidos[condicion[0]['id']]['porcentaje_descuento']/100))
                    diccionario_promos_pedidos[condicion[0]['id']]['total_descuento'] = ttal;

                  }

                }else {

                  if (condicion[0]['id'] in diccionario_promos_pedidos) {
                    if (diccionario_promos_pedidos[condicion[0]['id']]['cantidad_base'] > 0) {
                      repeticion_promos = Math.trunc( diccionario_promos_pedidos[condicion[0]['id']]['cantidad_base'] / diccionario_promos_pedidos[condicion[0]['id']]['a_partir'] );
                    }

                    //repeticion_promos = Math.trunc( sumando_cantidades_descuento / diccionario_promos_pedidos[condicion[0]['id']]['a_partir'] );

                    diccionario_promos_pedidos[condicion[0]['id']]['cantidad'] = ( diccionario_promos_pedidos[condicion[0]['id']]['a_partir'] * repeticion_promos);

                    diccionario_promos_pedidos[condicion[0]['id']]['total'] = diccionario_productos_descuento[l.product.id]['precio_unitario'];

                    if (diccionario_promos_pedidos[condicion[0]['id']]['cantidad'] >= diccionario_promos_pedidos[condicion[0]['id']]['a_partir']) {
                      var ttal = (( diccionario_promos_pedidos[condicion[0]['id']]['cantidad'] * diccionario_promos_pedidos[condicion[0]['id']]['total'] ) * ( diccionario_promos_pedidos[condicion[0]['id']]['porcentaje_descuento']/100))
                      diccionario_promos_pedidos[condicion[0]['id']]['total_descuento'] = ttal;

                    }
                  }



                }

              };



              for (var m = 0; m < condicion.length; m++) {
                if ( Object.keys(diccionario_productos_descuento).length > 0) {

                  if (l.product.id in diccionario_productos_descuento) {
                    if (condicion.length > 1) {
                      if (l.product.id == diccionario_productos_descuento[l.product.id]['id']) {
                        if (diccionario_productos_descuento[l.product.id]['n_promocion'].length < 1) {
                          sumando_cantidades_descuento += diccionario_productos_descuento[l.product.id]['cantidad'];

                          if (sumando_cantidades_descuento >  condicion[m].partir_de) {
                            calculo_repetir0 = Number(sumando_cantidades_descuento / (condicion[m].partir_de - condicion[m].descuento) ).toFixed(2);
                            diccionario_productos_descuento[l.product.id]['estado'] = true;
                            sumando_cantidades_descuento=0;
                          }

                          promos_llevar0 = Math.trunc(calculo_repetir0);
                          if (diccionario_productos_descuento[l.product.id]['n_promocion'].includes(condicion[0]['id'])) {
                            diccionario_productos_descuento[l.product.id]['promos_llevar']=promos_llevar0;
                            diccionario_productos_descuento[l.product.id]['descuento']=condicion[m].descuento;
                            diccionario_productos_descuento[l.product.id]['cantidad_regalo']=condicion.partir_de;
                          }

                        }




                      }

                    }
                    else {

                      if (diccionario_productos_descuento[l.product.id]['n_promocion'].includes(condicion[0]['id'])) {
                        if ( diccionario_productos_descuento[l.product.id]['n_promocion'].length == 1) {

                          if (l.product.id == diccionario_productos_descuento[l.product.id]['id']) {
                            if ( !(condicion[0]['id'] in diccionario_promos_pedidos) ) {
                              calculo_repetir0 = Number(diccionario_productos_descuento[l.product.id]['cantidad'] / (condicion[m].partir_de) ).toFixed(2);
                              diccionario_productos_descuento[l.product.id]['estado'] = true;

                              promos_llevar0 = Math.trunc(calculo_repetir0);
                              diccionario_promos_pedidos[condicion[0]['id']]={
                                'cantidad':0,
                                'total':0,
                                'porcentaje_descuento': condicion[0]['descuento'],
                                'a_partir': (condicion[0]['partir_de'] + 1),
                                'total_descuento':0,
                                'productos_ids': [],
                                'cantidad_base':0,
                                'lineas_ids':[],
                                'estado':false,
                              }
                            }
                            if (!(diccionario_promos_pedidos[condicion[0]['id']]['productos_ids'].includes(l.product.id))) {
                              console.log("Los productos ::");
                              console.log(l.product.display_name);
                              console.log(l.product.id);
                              console.log(diccionario_productos_descuento[l.product.id]['cantidad']);
                              diccionario_promos_pedidos[condicion[0]['id']]['cantidad_base'] += diccionario_productos_descuento[l.product.id]['cantidad'];
                              diccionario_promos_pedidos[condicion[0]['id']]['productos_ids'].push(l.product.id);
                              console.log(diccionario_promos_pedidos[condicion[0]['id']]['cantidad_base']);
                            }

                            if (condicion[0]['id'] in diccionario_promos_pedidos) {
                              if (diccionario_promos_pedidos[condicion[0]['id']]['cantidad_base'] > 0) {
                                repeticion_promos = Math.trunc( diccionario_promos_pedidos[condicion[0]['id']]['cantidad_base'] / diccionario_promos_pedidos[condicion[0]['id']]['a_partir'] );
                              }

                              //repeticion_promos = Math.trunc( sumando_cantidades_descuento / diccionario_promos_pedidos[condicion[0]['id']]['a_partir'] );

                              diccionario_promos_pedidos[condicion[0]['id']]['cantidad'] = ( diccionario_promos_pedidos[condicion[0]['id']]['a_partir'] * repeticion_promos);

                              diccionario_promos_pedidos[condicion[0]['id']]['total'] = diccionario_productos_descuento[l.product.id]['precio_unitario'];

                              if (diccionario_promos_pedidos[condicion[0]['id']]['cantidad'] >= diccionario_promos_pedidos[condicion[0]['id']]['a_partir']) {
                                var ttal = (( diccionario_promos_pedidos[condicion[0]['id']]['cantidad'] * diccionario_promos_pedidos[condicion[0]['id']]['total'] ) * ( diccionario_promos_pedidos[condicion[0]['id']]['porcentaje_descuento']/100))
                                diccionario_promos_pedidos[condicion[0]['id']]['total_descuento'] = ttal;

                              }
                            }

                              if (diccionario_productos_descuento[l.product.id]['n_promocion'].includes(condicion[0]['id']) ) {
                                diccionario_productos_descuento[l.product.id]['promos_llevar']=promos_llevar0;

                                diccionario_productos_descuento[l.product.id]['descuento']=condicion[m].descuento;
                                diccionario_productos_descuento[l.product.id]['cantidad_regalo']=condicion[m].partir_de;

                              }

                            }

                          }

                        }
                      }



                    }

                  }
                }

              }

            }
          }


				}

			}
		});




    //Veficando el tamaño de los diccionarios para proceder con los calculos de tipo promoción o descuento

		if ( Object.keys(diccionario_productos).length > 0) {
      console.log("diccionario_productos");
      console.log(diccionario_productos);
      console.log("Diccionario productos regalo");
      console.log(diccionario_productos_regalo);
      for (const [key, value] of Object.entries(diccionario_productos)) {
        if ( Object.keys(diccionario_productos_regalo) ) {
          for ( const [llave_regalo, valor_regalo] of Object.entries(diccionario_productos_regalo) ) {
            if (key == llave_regalo) {
              console.log("Que vamos recibiendo");
              console.log(key);

            }
          }
        }
      }

		} //fin de verificación del tamaño del diccionario_productos



		if ( Object.keys(diccionario_productos_descuento).length > 0) {
      console.log("diccionario_productos_descuento");
      console.log(diccionario_productos_descuento);
      console.log("diccionario_promos_pedidos");
      console.log(diccionario_promos_pedidos);
      console.log("_____________________");
      var n=0, n_promocion=0, cantidad_x=0, n1=0;
      var valor_descuento_total=[], diccionario_calculo_descuento={};
      for (const [key1, value1] of Object.entries(diccionario_productos_descuento)) {
        n1 +=1;

        if (value1['tipo_descuento'] == 'uni') {

          if ( value1['n_promocion'].length <= 1) {

            if (!(value1['n_promocion'] in nuevo_diccionario)) {

              nuevo_diccionario[value1['n_promocion']]={
                'n_promocion': value1['n_promocion'],
                'condi': 0,
                'sum_cantidad': 0,
                'condicions': 0,
                'calculo_restante':0,
                'nueva_cantidad':0,
                'precio_unitario':0,
                'descuento':0,
                'sumas_precios':0,
                'total_precio':0,
                'total_regalo':0,

              }

            }

            if (nuevo_diccionario[value1['n_promocion']]['n_promocion'][0] == value1['n_promocion'][0]) {

              nuevo_diccionario[value1['n_promocion']]['condi']= value1['cantidad_regalo'] + 1;

              nuevo_diccionario[value1['n_promocion']]['sum_cantidad'] += value1['cantidad'];

              nuevo_diccionario[value1['n_promocion']]['condicions'] = Math.trunc(nuevo_diccionario[value1['n_promocion']]['sum_cantidad'] / nuevo_diccionario[value1['n_promocion']]['condi']);

              nuevo_diccionario[value1['n_promocion']]['calculo_restante'] = ( nuevo_diccionario[value1['n_promocion']]['sum_cantidad']-( nuevo_diccionario[value1['n_promocion']]['condi']* nuevo_diccionario[value1['n_promocion']]['condicions']));

              nuevo_diccionario[value1['n_promocion']]['nueva_cantidad'] = (nuevo_diccionario[value1['n_promocion']]['sum_cantidad'] - nuevo_diccionario[value1['n_promocion']]['calculo_restante']);

              nuevo_diccionario[value1['n_promocion']]['precio_unitario'] = value1['precio_unitario'];

              nuevo_diccionario[value1['n_promocion']]['sumas_precios'] += nuevo_diccionario[value1['n_promocion']]['precio_unitario'];

            }


            if (nuevo_diccionario[value1['n_promocion']]['n_promocion'][0] == value1['n_promocion'][0]) {

              while (n < nuevo_diccionario[value1['n_promocion']]['nueva_cantidad']) {

                nuevo_diccionario[value1['n_promocion']]['total_precio'] = nuevo_diccionario[value1['n_promocion']]['sumas_precios'];
                n++;
              }


              // nuevo_diccionario[value1['n_promocion']]['exacto'] = (nuevo_diccionario[value1['n_promocion']]['total_precio'] * nuevo_diccionario[value1['n_promocion']]['nueva_cantidad']) - (nuevo_diccionario[value1['n_promocion']]['total_precio']*nuevo_diccionario[value1['n_promocion']]['cantidad_x']);

              nuevo_diccionario[value1['n_promocion']]['descuento'] = value1['descuento'];

              nuevo_diccionario[value1['n_promocion']]['total_regalo'] = ( (nuevo_diccionario[value1['n_promocion']]['precio_unitario'] * nuevo_diccionario[value1['n_promocion']]['nueva_cantidad'] )* ( nuevo_diccionario[value1['n_promocion']]['descuento']/100) );

            }

          }else {

            if ( !(value1['n_promocion'] in diccionario_calculo_descuento) ) {
              diccionario_calculo_descuento[value1['n_promocion']]={
                'total_descuento': [],
                'estado':false,
              }
            }
            for (var v_npro = 0; v_npro < value1['n_promocion'].length; v_npro++) {

              if (value1['n_promocion'] in diccionario_calculo_descuento) {
                if ( value1['n_promocion'].includes(value1['n_promocion'][v_npro])) {
                  if (value1['n_promocion'][v_npro] in diccionario_promos_pedidos) {

                    if (diccionario_promos_pedidos[value1['n_promocion'][v_npro]]['total_descuento'] > 0) {
                      if (!(diccionario_calculo_descuento[value1['n_promocion']]['total_descuento'].includes(diccionario_promos_pedidos[value1['n_promocion'][v_npro]]['total_descuento']))) {
                        diccionario_calculo_descuento[value1['n_promocion']]['total_descuento'].push(diccionario_promos_pedidos[value1['n_promocion'][v_npro]]['total_descuento']);
                      }


                    }

                  }
                }
              }


            }

            if (value1['n_promocion'] in diccionario_calculo_descuento) {

              var mayor=0;
              var lista = diccionario_calculo_descuento[value1['n_promocion']]['total_descuento'];

              for (let numeros of lista) {
                if (mayor < numeros)
                  mayor = numeros

              }
              if (diccionario_calculo_descuento[value1['n_promocion']]['estado'] == false) {
                order.descuento += mayor
                diccionario_calculo_descuento[value1['n_promocion']]['estado'] = true;
              }


            }


          }


        }


				if (value1['tipo_descuento'] == 'dinero') {

					if (value1['promos_llevar'] > 0 && value1['precio_unitario'] <= value1['total'] && value1['estado'] == true) {

						var restar_promos_llevar = value1['promos_llevar'];
						precio_final = (value1['total'] * (value1['descuento'] / 100));
						order.descuento += precio_final;
						value1['promos_llevar'] -= restar_promos_llevar;

					}
					else if(value1['promos_llevar'] > 0 && value1['total'] > 0 && value1['precio_unitario'] > value1['total'] && value1['estado'] == true){
						var restar_promos_llevar = value1['promos_llevar'];
						resta = value1['total'] - (value1['cantidad_regalo']*value1['promos_llevar']);
						precio_final = (value1['total'] * (value1['descuento'] / 100));
						order.descuento += precio_final;
						value1['cantidad'] = 0;

						value1['promos_llevar'] -= restar_promos_llevar;

					}

				}

			}
		}//Fin de la verificación del tamaño del diccionario_productos_descuento

    if (Object.keys(nuevo_diccionario).length > 0) {

      for (const [key4, value4] of Object.entries(nuevo_diccionario)) {
        order.descuento += value4['total_regalo'];
      }
    }


    if (order.descuento > 0) {

      for (var o = 0; o < producto_regalo_id.length; o++) {
        var id = producto_regalo_id[0];
      }

      var producto_descuento= db.get_product_by_id(id);

      order.get_orderlines().forEach(function(l) {

        if (l.product.id == id) {

          l.order.remove_orderline(l.id);

        }
      });

      order.add_product(producto_descuento,{quantity:1, price:-(order.descuento)});



		}else {

      for (var o = 0; o < producto_regalo_id.length; o++) {
        var id = producto_regalo_id[0];
      }
      order.get_orderlines().forEach(function(l) {

        if (l.product.id == id) {

          l.order.remove_orderline(l.id);

        }
      });


    }
    this.renderElement();
  },


});

screens.define_action_button({

  'name': 'buttonPromocion',
  'widget': ButtonPromocion,
  'condition': function(){
    return this.pos.config.producto_descuento_id;
  },

});

var PosBaseWidget = require('point_of_sale.BaseWidget');

screens.ActionpadWidget.include({

  renderElement: function(){

    console.log('Am here');
    PosBaseWidget.prototype.renderElement.call(this);
    var self = this;
    var db = this.pos.db;

    this._super();

    this.$('.pay').click(function(){

      var order = self.pos.get_order();


      self.gui.show_screen('payment');
    });

  },


});








});
