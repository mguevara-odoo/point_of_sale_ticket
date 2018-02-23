odoo.define('point_of_sale_ticket.screens', function (require) {
    "use strict";

	var gui = require('point_of_sale.gui');
	var screen = require('point_of_sale.screens');
	var core = require('web.core');
	var ajax = require('web.ajax');
	var qweb = core.qweb;
	var _t = core._t;

    ajax.loadXML('/point_of_sale_ticket/static/src/xml/pos_ticket.xml', qweb);

screen.PaymentScreenWidget.include({
    
            click_ticket: function(){
                var order = this.pos.get_order();
                
                order.set_to_invoice(!order.is_to_invoice());
                if (order.is_to_invoice()) {
                    this.$('.js_ticket').addClass('highlight');
                    alert('Se selecciono la opción de boleta');
                } else {
                    this.$('.js_ticket').removeClass('highlight');
                }
            },
        
            renderElement: function() {
                var self = this;
                this._super();

                this.$('.js_ticket').click(function(){
                    self.click_ticket();
                });   
            },
        });
        
    });