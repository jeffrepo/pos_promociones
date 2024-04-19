# -*- coding: utf-8 -*-
from odoo import api, fields, models, SUPERUSER_ID, _
from odoo.exceptions import UserError
import logging
import pytz

class PosInfoExtra(models.Model):
    _inherit = 'pos.order'

    # pedido_especial = fields.Boolean(string="Pedido especial")
    pedido_linea = fields.Boolean(string="Pedido de linea")
