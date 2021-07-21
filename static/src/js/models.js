odoo.define('pos_promociones.models', function (require) {
"use strict";
var rpc = require('web.rpc');
var models = require('point_of_sale.models');
var gui = require('point_of_sale.gui');
var time, time1 = require('web.time');
var field_utils = require('web.field_utils');


//https://speedysense.com/convert-float-to-time-in-javascript/#:~:text=floor(number)%3B%20var%20decpart,result%20sign%20%3D%20sign%20%3D%3D%201%20%3F

// models.load_models([ ----> se cargaran todos los models de pos_promocion

models.load_models({
		model: 'pos_promociones.promocion', fields: ['name', 'fecha_inicio', 'fecha_fin', 'hora_inicio', 'hora_final', 'autorizado', 'comentario', 'tipo_select', 'tienda_ids', 'cliente_ids', 'productos_ids', 'condicion_promocion_ids', 'condicion_descuento_ids', 'productos_regalo_ids', 'aplicar'],
		domain: function(self){
	  },
		loaded: function(self,promocion){
			self.promocion = [];
			var promoDescuento=[];
			var promoPromocion=[];
			//Recorrer "promocion", para obtener valores como el id de la tienda, obtener la fecha de la promocion
			for (var i = 0; i < promocion.length; i++) {

				promocion[i];
				promocion[i]['pos_condicion_promocion_ids']=[];
				promocion[i]['pos_condicion_descuento_ids']=[];
				var tiendas = promocion[i].tienda_ids;
				for (var j = 0; j < tiendas.length; j++) {
					tiendas[j];
					if (self.config.id == tiendas[j]) {
						var validation_date = new Date();

						var fecha_sesion0 = moment(validation_date).utc().local().format("DD-MM-YYYY")

						var fecha_promo_in = promocion[i].fecha_inicio;
						var fecha_promo_in0 = moment(fecha_promo_in).utc().local().format("DD-MM-YYYY")

						var fecha_promo_fin = promocion[i].fecha_fin;
						var fecha_promo_fin0 = moment(fecha_promo_fin).utc().local().format("DD-MM-YYYY")
						console.log("fecha_sesion0");
						console.log(fecha_sesion0);
						console.log("fecha_promo_in0");
						console.log(fecha_promo_in0);
						console.log("fecha_promo_fin0");
						console.log(fecha_promo_fin0);
						if ((fecha_sesion0 >= fecha_promo_in0) && (fecha_sesion0 <= fecha_promo_fin0)){

							var promocion_i = promocion[i];
							var domain = [['id', 'in', promocion_i.condicion_promocion_ids]]
							var fields = ['promo_id', 'a_partir', 'promocion', 'porcentaje'];

							rpc.query({
	                model: 'pos_promociones.promocion.lineas',
	                method: 'search_read', //siempre se queda
	                args: [domain, fields], //parametrso y campos
	            },{
	                timeout: 3000,
	                shadow: true,
	            }).then(function (promocionesLineas) {
									if(promocionesLineas){
										for (var p = 0; p < promocionesLineas.length; p++) {
											promocionesLineas[p];
											promocion_i['pos_condicion_promocion_ids'].push(promocionesLineas[p]);
										}
									}
							});
							var domain=[['id', 'in', promocion_i.condicion_descuento_ids]]
							var fields=['descuento_id', 'partir_de', 'descuento']
							rpc.query({
								model:'pos_promociones.promocion.descuento',
								method:'search_read',
								args: [domain, fields]
							},{
								timeout:3000,
								shadow: true,
							}).then(function (promocionesDescuento){
								if(promocionesDescuento){
									for (var pD = 0; pD < promocionesDescuento.length; pD++) {
										promocionesDescuento[pD];
										promocion_i['pos_condicion_descuento_ids'].push(promocionesDescuento[pD]);
									}


								}
							});
							self.promocion.push(promocion[i]); //se agrega el listado de promociones a self
							console.log("Self.promocion");
							console.log(self.promocion);

						}
					}
				}
			}
		},

	})


var _super_posmodel = models.PosModel.prototype;
models.PosModel = models.PosModel.extend({

  add_new_order: function(){
      var new_order = _super_posmodel.add_new_order.apply(this);
      this.set('pedido_linea', false);
      this.set('pedido_especial', false);
    },
    set_pedidoLinea: function(pedido_linea){
      this.set('pedido_linea', pedido_linea);
    },
    get_pedidoLinea: function(){
      return this.get('pedido_linea');
    },

    set_pedidoEspecial: function(pedido_especial){
      this.set('pedido_especial', pedido_especial);
    },

    get_pedidoEspecial: function(){
      return this.get('pedido_especial');
    },

})

var _super_order = models.Order.prototype;

var _super_order_line = models.Orderline.prototype;


var _super_order_line = models.Orderline.prototype;
models.Orderline = models.Orderline.extend({
    initialize: function() {
        _super_order_line.initialize.apply(this,arguments);
        this.promocion_aplicada = this.promocion_aplicada || false;
    },
    set_promocion_aplicada: function(promocion_aplicada){
        this.promocion_aplicada = promocion_aplicada;
        this.trigger('change',this);
    },

    get_promocion_aplicada: function(promocion_aplicada){
        return this.promocion_aplicada;
    },

		set_f_descuento: function(f_descuento){
			this.f_descuento = f_descuento;
			this.trigger('change', this);
		},

		get_f_descuento: function(f_descuento){
			return this.f_descuento;
		},



		get_buscarProductoPromocion: function(producto, promociones){
			var producto_otra_linea=0, cantidad_producto_regalo=0, div=0, lista_descuentos={};

			var order = this.pos.get_order();
			var db = this.pos.db;
			var condicion_promocion_ids = false;
			var producto_beneficio = false, nueva_form=0;

			// linea de variables segunda prueba oficial

			var n_cantidad=0;


			var suma_cantidades=0, cantidad_promocion=0, cantidad_promocion_2=0, restante=0, rest=0, self_quantity=0, cantidad_producto = 0, cantidad_segundo_producto=0;
			var self = this;
			var suma_precio = 0, prod_regalo, cantidad_regalo=0, calculo_mostrar=0, mostrar_ventana=0, ultimo_restante=0;
			var precio_descuento=0, precio_descuento_2 =0, precio_real=0, f_descuento=0, f_descuento_2= 0, regalo=0;
			var id_productos_regalo = null;
			var today = new Date();
	    var hora = today.getHours();
	    var minuto = today.getMinutes();
	    if( minuto.toString().length == 1){
	        minuto = '0'+minuto
	    }
			var new_producto = producto;
			var hora_minuto = today.getHours()+':'+minuto;
			var hora_minuto1 = moment(hora_minuto, ["h:mm A"]).format("HH:mm");

			// if (hora_minuto1 >= '11:59') {  //conversion de 24hrs pm
			// 	const timeString12hrs0 = new Date('1970-01-01T' + hora_minuto + 'Z')
			// 	.toLocaleTimeString({},{timeZone:'UTC', hour12:true, hour:'numeric', minute:'numeric'});
			// 	hora_minuto1 = timeString12hrs0;
			// }
			var productos_promocion=[];
			var producto_nueva_promo;

			for (var i = 0; i < promociones.length; i++) {
				var promocion= promociones[i].productos_ids;
				var productos_regalo = promociones[i].productos_regalo_ids;
				self.get_hora(promociones[i].hora_inicio, promociones[i].hora_final);

				// if ( (promocion.includes(producto.id)) || (productos_regalo.includes(producto.id)) ) {
				// 	n_cantidad+=self.quantity;
				// 	order.get_orderlines().forEach(function(l) {
				//
				// 		if (self.quantity > 1) {
				// 			n_cantidad = 0;
				// 		}
				//
				// 		if (producto.id == l.product.id) {
				//
				// 			if (!(producto.id in order.get_diccionarioProductos())) {
				//
				// 				order.get_diccionarioProductos()[producto.id]={'n_cantidad': 0,'f_descuento':0, 'aplicada':false, 'mayor_aplicado':true, 'linea_padre_promocion': false};
				//
				// 			}
				// 			n_cantidad+=l.get_quantity();
				// 		}
				//
				// 		console.log("LA L");
				// 		console.log(l);
				// 		console.log(order.get_orderlines());
				//
				// 		if ( producto.id in order.get_diccionarioProductos() ) {
				// 			order.get_diccionarioProductos()[producto.id]['n_cantidad']+=n_cantidad;
				// 		}
				//
				// 	});
				//
				//
				// }

				console.log("Lista entera de productos");
				console.log(order.get_diccionarioProductos());

				// var horas = self.get_hora(promociones[i].hora_inicio, promociones[i].hora_final);

				// for (var j = 0; j < promocion.length; j++) {
				//
				// 	var id_productos = promocion[j];
				// 	// (Number(producto.id) === Number(id_productos)
				// 	if ( (promocion.includes(producto.id)) || (productos_regalo.includes(producto.id))) {
				//
				// 		suma_cantidades += self.quantity; //variables de prueba
				//
				// 		order.get_orderlines().forEach(function(l) {
				// 			if (self.quantity > 1) {
				// 				suma_cantidades = 0;
				// 			}
				//
				// 			var condicion = promociones[i].pos_condicion_promocion_ids;
				// 			suma_precio = l.get_base_price();
				//
				// 			for (var k = 0; k < condicion.length; k++) {
				//
				// 			 	condicion[k]
				// 			 	if (Number(producto.id) === Number(l.product.id)) {
				//
				//
				//
				// 					if (l.get_promocion_aplicada() == false) {
				//
				// 					suma_cantidades += l.get_quantity();
				//
				// 				}
				//
				//
				// 					restante = suma_cantidades;
				//
				// 					regalo = suma_cantidades - condicion[k].promocion;
				// 					if ( suma_cantidades >= regalo) {
				//
				// 						calculo_mostrar = Number(suma_cantidades / condicion[k].a_partir).toFixed(2);
				// 						mostrar_ventana = Math.trunc(calculo_mostrar);
				//
				// 						var hora_inic, hora_fina;
				//
				// 						for (var n = 0; n < horas.length; n++) {
				//
				// 							horas[n];
				// 							hora_inic = horas[0];
				// 							hora_fina = horas[1];
				//
				// 						}
				//
				// 						if ( (hora_minuto1 >= hora_inic ) && (hora_minuto1 <= hora_fina) ) {
				//
				// 							n=0;
				//
				// 							while (n < mostrar_ventana) {
				// 							restante = restante - condicion[k].a_partir;
				// 							ultimo_restante= restante;
				// 							n++;
				//
				// 							}
				//
				//
				//
				// 							if (!(producto.id in order.get_diccionarioProductos())) {
				// 								console.log(order.get_diccionarioProductos());
				// 								order.get_diccionarioProductos()[producto.id]={'f_descuento':0, 'aplicada':true, 'mayor_aplicado':true, 'linea_padre_promocion': false}
				// 							}
				//
				// 							// if (!(lista_descuentos[producto.id] = producto.id )) {
				// 							// 	lista_descuentos.push(producto.id)
				// 							// }
				// 							// lista_descuentos[producto.id]={'aplicada': true, 'prueba':1}
				//
				// 							console.log("order.get_diccionarioProductos()");
				// 							console.log(order.get_diccionarioProductos());
				//
				// 							// for (var m = 0; m < productos_regalo.length; m++) {
				// 							//
				// 							// 	prod_regalo = productos_regalo[m];
				// 							//
				// 							// }
				//
				// 							// var producto_db = db.get_product_by_id(prod_regalo);
				//
				// 							// productos_promocion.push({
				// 							// 	'label': producto_db.display_name,
				// 							// 	'item':  producto_db,
				// 							//
				// 							// });
				//
				//
				//
				// 						}
				//
				//
				//
				//
				// 				 }
				//
				//
				//
				// 				}
				//
				//
				//
				//
				//
				// 			}
				//
				//
				//
				//
				// 		});
				//
				// 	}
				//
				//
				//
				//
				//
				//
				//
				//
				// 	for (var o = 0; o < productos_regalo.length; o++) {
				// 		if (Number(producto.id) === Number(productos_regalo[o])) {
				//
				// 			order.get_orderlines().forEach(function(l) {
				// 				order.get_diccionarioProductos()[producto.id]={'f_descuento':0, 'aplicada':true};
				// 				if (l.product.id != producto.id) {
				// 					producto_otra_linea = l.get_base_price();
				// 					precio_descuento = l.get_base_price();
				// 					cantidad_producto = l.get_quantity();
				// 				}
				//
				// 				cantidad_segundo_producto = self.quantity;
				// 				var suma = cantidad_producto + cantidad_segundo_producto;
				// 				var condicion = promociones[i].pos_condicion_promocion_ids;
				// 				for (var p = 0; p < condicion.length; p++) {
				// 					div = suma / condicion[p].a_partir;
				// 					rest = self.quantity - Math.round(div);
				// 				}
				//
				// 				if (rest > 0) {
				// 					self_quantity = self.quantity - rest;
				// 					cantidad_promocion = producto.lst_price * self_quantity;
				// 				}
				// 				else{
				// 					cantidad_promocion = producto.lst_price * self.quantity;
				// 				}
				//
				// 				precio_real = producto_otra_linea + cantidad_promocion;
				//
				// 				f_descuento = ( (100 - (precio_descuento * 100) / precio_real) ).toFixed(10);
				//
				// 				console.log("El descuento 2");
				// 				console.log(f_descuento);
				// 				console.log(order.get_diccionarioProductos());
				//
				// 				if (l.product.id in order.get_diccionarioProductos() && order.get_diccionarioProductos()[l.product.id]['aplicada'] == true) {
				//
				// 					order.get_diccionarioProductos()[l.product.id]['f_descuento']=f_descuento;
				// 					order.get_diccionarioProductos()[l.product.id]['aplicada']=false;
				//
				// 				}
				//
				// 				if (rest == 0) {
				// 					order.get_diccionarioProductos()[producto.id]['f_descuento']=f_descuento
				// 					order.get_diccionarioProductos()[producto.id]['aplicada']=false;
				// 				}
				//
				// 				if (rest > 0) {
				// 					cantidad_promocion_2 = producto.lst_price * self.quantity;
				//
				// 					precio_real = producto_otra_linea + cantidad_promocion_2;
				//
				// 					precio_descuento_2 = producto_otra_linea + cantidad_promocion;
				//
				//
				// 					nueva_form  = ( (100 - (precio_descuento_2 * 100) / precio_real) ).toFixed(12);
				//
				//
				// 					// f_descuento_2 = (f_descuento / self.quantity).toFixed(12);
				//
				// 					order.get_diccionarioProductos()[producto.id]['f_descuento']=nueva_form;
				// 					order.get_diccionarioProductos()[producto.id]['aplicada']=false;
				//
				// 					if (order.get_diccionarioProductos()[l.product.id]['mayor_aplicado'] == true) {
				// 						order.get_diccionarioProductos()[l.product.id]['f_descuento']=nueva_form;
				// 						order.get_diccionarioProductos()[l.product.id]['aplicada']=false;
				// 					}
				//
				// 				}
				//
				// 				l.set_f_descuento(order.get_diccionarioProductos());
				// 				console.log("lista_descuentos fin");
				// 				console.log(order.get_diccionarioProductos());
				//
				// 			});
				//
				//
				// 		}
				//
				// 	}
				//
				//
				//
				// }

			}


			return [condicion_promocion_ids, producto_beneficio];
		},

		get_productos_anteriores : function (){
			return this.get('productos_anteriores');
		},

		set_productos_anteriores : function ( producto_anterior){
			var productos_anteriores = [];
			productos_anteriores.push(producto_anterior);
			this.set('productos_anteriores', productos_anteriores);
		},

		mostrar_popup_promociones : function (productos_promocion, l, order, suma_precio, cantidad_promocion, cantidad_regalo, producto, mostrar_ventana) {
			var self = this;
			var precio_descuento = 0;
			console.log("De lo que sea");
			suma_precio = l.get_base_price();

			self.pos.gui.show_popup('selection',{
				title: "Productos de regalo",
				list: productos_promocion,
				confirm: function(producto_item) {

					var cantidad_regalo = producto_item.lst_price * cantidad_promocion;
					var precio_real = suma_precio + cantidad_regalo;


					precio_descuento += suma_precio;

					var f_descuento = ( (100 - (precio_descuento * 100) / precio_real) ).toFixed(10);

					order.add_product(producto_item, { quantity: cantidad_promocion, discount: f_descuento });

					l.set_discount(f_descuento);
					l.set_promocion_aplicada(true);

				},
				cancel: function(){
						 // user chose nothing
				}

			});
			return true
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

		get_buscarProductoDescuento: function(producto, promociones){
			var order = this.pos.get_order();
			var db = this.pos.db;
			var condicion_descuento_ids= false;
			var producto_beneficio = false;
			var self=this;
			var suma_cantidades = 0;
			var suma_precio = 0;
			var condicion_descuento = 0;
			var resta=0;
			var f_descuento=0;
			var producto_precio = 0;
			var calculo_total=0;
			var today = new Date();
	    var hora = today.getHours();
	    var minuto = today.getMinutes();
			if( minuto.toString().length == 1){
	        minuto = '0'+minuto
	    }
			var hora_minuto = today.getHours()+':'+today.getMinutes();
			var hora_minuto1 = moment(hora_minuto, ["h:mm A"]).format("HH:mm");
			if (hora_minuto1 >= '12:59') {
				const timeString12hrs0 = new Date('1970-01-01T' + hora_minuto + 'Z')
				.toLocaleTimeString({},{timeZone:'UTC', hour12:true, hour:'numeric', minute:'numeric'});
				hora_minuto1 = timeString12hrs0;
			}

			order.get_orderlines().forEach(function(o) {
				producto_precio = o.get_base_price();
			});

			var id_product = producto.id;
			for (var i = 0; i < promociones.length; i++) {
				var productos = promociones[i].productos_ids;
				var horas = self.get_hora(promociones[i].hora_inicio, promociones[i].hora_final);

				for (var j = 0; j < productos.length; j++) {
					var id_productos = productos[j];

					if (producto.id == id_productos) {

						order.get_orderlines().forEach(function(l) {

							var condicion = promociones[i].pos_condicion_descuento_ids;
							suma_precio = l.get_base_price();

							for (var k = 0; k < condicion.length; k++) {
								condicion[k];
								condicion_descuento = condicion[k].descuento;


								if (producto.id == l.product.id) {
									suma_cantidades = l.get_quantity();

									if (suma_cantidades >= condicion[k].partir_de) {

										var hora_inicio, hora_final;
										for (var m = 0; m < horas.length; m++) {
											horas[m]

											hora_inicio = horas[0];
											hora_final = horas[1];
										}

										if ((hora_minuto1 >= hora_inicio) && (hora_minuto1 <= hora_final) ) {

											resta = suma_precio - condicion_descuento;
											f_descuento = (resta * 100)/suma_precio;
											calculo_total = producto_precio*(f_descuento/100);

										}

									}

								}

							}

						});

					}



				}

			}

			return [condicion_descuento_ids, producto_beneficio]
		},

		set_quantity: function(quantity, keep_price){
			var self = this;

			_super_order_line.set_quantity.apply(this,arguments);
			this.trigger('change', this);

			self.get_buscarProductoPromocion(self.product, this.pos.promocion);
			self.get_buscarProductoDescuento(self.product, this.pos.promocion);

		},
})

models.Order = models.Order.extend({
  export_as_JSON : function(){
    var new_json = _super_order.export_as_JSON.apply(this);
    new_json['pedido_especial'] = this.pos.get_pedidoEspecial() ? this.pos.get_pedidoEspecial() : false;
    new_json['pedido_linea'] = this.pos.get_pedidoLinea() ? this.pos.get_pedidoLinea() : false;

    return new_json;
  },

	initialize: function() {
			_super_order.initialize.apply(this,arguments);
			this.set_diccionarioProductos({});
			this.get_diccionarioProductos();
			this.set_descuento(0);
			this.descuento=0;
	},



	get_descuento: function(){
		return this.get('descuento');
	},

	set_descuento: function(descuento){
		this.set('descuento', descuento);
	},


	set_diccionarioProductos: function(diccionario_promos){
		this.set('diccionario_promos', diccionario_promos);
	},

	get_diccionarioProductos: function(){
		return this.get('diccionario_promos');
	},


	// add_product: function(product, options){
	//
	// 	var self = this;
	// 	var suma_productos =0;
	// 	var today = new Date();
  //   var hora = today.getHours();
  //   var minuto = today.getMinutes();
  //   if( minuto.toString().length == 1){
  //       minuto = '0'+minuto
  //   }
	//
	// 	var order = this.pos.get_order();
	//
	// 	var new_add_product = _super_order.add_product.apply(this,arguments);
	// 	self.get_buscarProductoPromocion(product, this.pos.promocion);
	// 	self.get_buscarProductoDescuento(product, this.pos.promocion);
	//
	// 	console.log("Clic en add_product");
	//
	//
	// 	return false;
	// },



})



});
