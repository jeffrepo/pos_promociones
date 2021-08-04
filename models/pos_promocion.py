# -*- coding: utf-8 -*-
from odoo import api, fields, models, SUPERUSER_ID, _
from odoo.exceptions import UserError
import logging
import pytz

class PosPromociones(models.Model):
    _name = "pos_promociones.promocion"

    name = fields.Char("Nombre")
    fecha_inicio = fields.Date("Fecha inicio")
    fecha_fin = fields.Date("Fecha fin")
    hora_inicio = fields.Float("Hora inicio")
    hora_final = fields.Float("Hora fin")
    autorizado = fields.Char("Autorizado")
    comentario = fields.Char("Comentario")
    tipo_select = fields.Selection(selection=[('promo','Promocion'), ('desc','Descuento')], string='Tipo')
    tienda_ids = fields.Many2many('pos.config','pos_promociones_tienda',string="Tiendas")
    cliente_ids = fields.Many2many('res.partner', 'pos_promociones_rel', string="Clientes")
    productos_ids = fields.Many2many('product.product','pos_promociones_tipo_rel', string="Productos promocion")
    condicion_promocion_ids = fields.One2many('pos_promociones.promocion.lineas', 'promo_id', string="Condicion promocion")
    condicion_descuento_ids = fields.One2many('pos_promociones.promocion.descuento', 'descuento_id', string="Condicion descuento")
    productos_regalo_ids = fields.Many2many('product.product','pos_promociones_regalo_tipo_rel', string="Productos beneficio")
    aplicar = fields.Selection(selection=[('dinero', 'Dinero'), ('uni', 'Unidades')])


class PosPromocionesLinea(models.Model):
    _name = "pos_promociones.promocion.lineas"

    promo_id = fields.Many2one('pos_promociones.promocion')
    a_partir = fields.Integer('a partir')
    promocion = fields.Integer('Promocion')
    porcentaje = fields.Float('Porcentaje')

class PosPromocionesDescuento(models.Model):
    _name = "pos_promociones.promocion.descuento"

    descuento_id = fields.Many2one('pos_promociones.promocion')
    partir_de = fields.Integer('A partir de')
    descuento = fields.Float('Descuento')
