{
    "name": "Odoo 17 Dynamic Chatter Visibility",
    "summary": "Hide/Show Chatter",
    "version": "17.0.0.0.1",
    "category": "Technical",
    "author": "James Nguyen",
    "license": "OPL-1",
    "currency": "USD",
    "price": '33.59',
    "depends": ["web", "mail"],
    "support": "jamesnguyen.ph@gmail.com",
    "development_status": "Production/Stable",
    "data": [
    ],
    "assets": {
        "web.assets_backend": [
            'jn_dynamic_chatter_visibility/static/src/scss/chatter_visibility_form_renderer.scss',
            'jn_dynamic_chatter_visibility/static/src/js/chatter_visibility_form_renderer.js',
        ],
    },
    "sequence": 1,
    "application": True,
    "installable": True,
}
