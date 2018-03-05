# -*- coding: utf-8 -*-
# Same Motion
import logging
import uuid

from odoo import api, fields, models, _
from odoo.exceptions import UserError

_logger = logging.getLogger(__name__)

class PosConfigTicket(models.Model):
    _inherit = 'pos.config'

    # Add Default Ticket Journal to Point of Sale
    def _default_ticket_journal(self):
        return '' 

    x_ticket_journal_id = fields.Many2one(
        'account.journal', string='Ticket Journal',
        domain=[('type', '=', 'sale')],
        help="Accounting journal used to create tickets.",
        default=_default_ticket_journal)  
    x_iface_ticketing = fields.Boolean(string='Ticketing', help='Enables ticket generation from the Point of Sale', default=True)