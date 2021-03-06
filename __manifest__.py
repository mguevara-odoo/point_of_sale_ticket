# -*- encoding: utf-8 -*-
##############################################################################
#
#    Copyright (C) 2018-TODAY Mauricio Guevara - Same Motion<http://www.samemotion.com>
#
#
##############################################################################
{

    'name' : 'Punto de ventas con localizacion de Peru',

    'summary': """
    Accounting Localization for Peru. 
    """,

    'description': """
        This module is the Point of Sale with Accounting localization for Peru
    """,

    'author': "Same Motion",
    'website': "http://www.samemotion.com",

    # Categories can be used to filter modules in modules listing
    # Check https://github.com/odoo/odoo/blob/master/odoo/addons/base/module/module_data.xml
    # for the full list
    'category': 'Localization',
    'version': '2.0',
    'depends': ['point_of_sale'],
    'data': [
        'views/pos_config_view.xml',
        'views/pos_order_view.xml',
        'views/template.xml'],
    'installable': True,
    'auto_install': False,
    'application': False,
}