# -*- coding: utf-8 -*-
from odoo import api, fields, models, SUPERUSER_ID, _
from odoo.exceptions import UserError
import logging
import pytz

class PosPromociones(models.Model):
    _name = "pos_promociones.promocion"

    name = fields.Char("Nombre")
    fecha_inicio = fields.Datetime("Fecha inicio")
    fecha_fin = fields.Datetime("Fecha fin")
    autorizado = fields.Char("Autorizado")
    comentario = fields.Char("Comentario")
    tipo_select = fields.Selection(selection=[('promo','Promocion'), ('desc','Descuento')], string='Tipo')
    cliente_ids = fields.Many2many('res.partner', 'pos_promociones_rel', string="Clientes")
    productos_ids = fields.Many2many('product.product','pos_promociones_tipo_rel', string="Productos")
    condicion_promocion_ids = fields.One2many('pos_promociones.promocion.lineas', 'promo_id', string="Condicion promocion")
    productos_regalo_ids = fields.Many2many('product.product','pos_promociones_regalo_tipo_rel', string="Productos")


class PosPromocionesLinea(models.Model):
    _name = "pos_promociones.promocion.lineas"

    promo_id = fields.Many2one('pos_promociones.promocion')
    a_partir = fields.Integer('a partir')
    promocion = fields.Integer('Promocion')
    porcentaje = fields.Float('Porcentaje')
