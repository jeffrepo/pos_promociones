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
        logging.warn('Esto es ui')
        logging.warn(ui_order)

        if session.config_id.pedido_linea:
            res['pedido_linea']=ui_order['pedido_linea']

        if session.config_id.pedido_especial:
            res['pedido_especial']=ui_order['pedido_especial']

        return res
