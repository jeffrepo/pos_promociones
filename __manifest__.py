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
        'views/pos_promocion_views.xml',

    ],
    'qweb': [
    ],
    'installable': True,
    'application': True,
    'auto_install': False,
}
