# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.
import logging
from datetime import timedelta
from functools import partial

import psycopg2
import pytz

from odoo import api, fields, models, tools, _
from odoo.tools import float_is_zero
from odoo.exceptions import UserError
from odoo.http import request
from odoo.osv.expression import AND
import base64

_logger = logging.getLogger(__name__)


class PosOrder(models.Model):
    _inherit="pos.order"

    @api.model
    def _order_fields(self, ui_order):
        res = super(PosOrder, self)._order_fields(ui_order)
        session = self.env['pos.session'].search([('id', '=', res['session_id'])], limit=1)

        if session.config_id.pedido_linea:
            res['pedido_linea']=ui_order['pedido_linea']

        # if session.config_id.pedido_especial:
        #     res['pedido_especial']=ui_order['pedido_especial']

        return res

    def descuento_lineas(self,pedido_id,lines):
        precio_total_descuento = 0
        precio_total_positivo = 0

        for linea in lines:
            if linea.price_unit > 0:
                precio_total_positivo += linea.price_subtotal_incl
            elif linea.price_unit < 0:
                precio_total_descuento += linea.price_subtotal_incl
                linea.price_unit = 0

        posicion = 0
        for linea in lines:
            if lines[posicion].price_unit > 0:
                descuento = ((precio_total_descuento / precio_total_positivo)*100)*-1
                pedido_id.write({ 'lines': [[1, pedido_id.lines[posicion].id, { 'discount': descuento }]] })
            posicion += 1
        return True

    @api.model
    def _process_order(self, order, draft, existing_order):
        res = super(PosOrder, self)._process_order(order, draft, existing_order)
        if res:
            pedido_id = self.env['pos.order'].search([('id','=', res)])
            if pedido_id:
                self.descuento_lineas(pedido_id,pedido_id.lines)
        return res
