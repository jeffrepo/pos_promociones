odoo.define('quemen.screens', function (require) {
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



});
