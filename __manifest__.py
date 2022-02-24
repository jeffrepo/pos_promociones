# -*- coding: utf-8 -*-
{
    'name': "Quemen",

    'summary': """ Desarrollo extra quemen """,

    'description': """
        Desarrollo extra pra quemen
    """,

    'author': "JS",
    'website': "",

    'category': 'Uncategorized',
    'version': '0.1',

    'depends': ['stock','base','point_of_sale', 'purchase', 'sale', 'stock', 'pos_sale'],

    'data': [
        'security/ir.model.access.csv',
        'views/pos_promocion_views.xml',
        'views/pos_config_views.xml',
        'views/templates.xml',
        'views/pos_config_extra_views.xml',
    ],
    'qweb': [
        'static/src/xml/pos.xml'
    ],
    'license': 'LGPL-3',
    'installable': True,
    'application': True,
    'auto_install': False,
}
