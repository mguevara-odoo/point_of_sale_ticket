odoo.define('point_of_sale_ticket.screens', function (require) {
    "use strict";

	var gui = require('point_of_sale.gui');
	var screen = require('point_of_sale.screens');
	var core = require('web.core');
	var ajax = require('web.ajax');
	var qweb = core.qweb;
    var _t = core._t;

    ajax.loadXML('/point_of_sale_ticket/static/src/xml/pos_ticket.xml', qweb);

    //var pos_model = require('point_of_sale.models');
    //pos_model.load_fields("pos.order", "x_is_ticket");
 
    screen.PaymentScreenWidget.include({
        
		init: function(parent,options){
			this._super(parent,options);
			this.hidden = false;

			var order = this.pos.get_order();
			if(this.pos.config.x_iface_ticketing){
                order.set_to_invoice(false);
				this.$('.js_ticket').addClass('highlight');
			}  else {
				order.set_to_invoice(false);
	        }
        },
        
        /*
        finalize_validation: function() {
            var self = this;
            var order = this.pos.get_order();
    
            if (order.is_paid_with_cash() && this.pos.config.iface_cashdrawer) { 
    
                    this.pos.proxy.open_cashbox();
            }
    
            order.initialize_validation_date();
            order.finalized = true;
    
            if (order.is_to_invoice() || order.is_to_ticket()) {
                var invoiced = this.pos.push_and_invoice_order(order);
                this.invoicing = true;
    
                invoiced.fail(function(error){
                    self.invoicing = false;
                    order.finalized = false;
                    if (error.message === 'Missing Customer') {
                        self.gui.show_popup('confirm',{
                            'title': _t('Please select the Customer'),
                            'body': _t('You need to select the customer before you can invoice an order.'),
                            confirm: function(){
                                self.gui.show_screen('clientlist');
                            },
                        });
                    } else if (error.code < 0) {        // XmlHttpRequest Errors
                        self.gui.show_popup('error',{
                            'title': _t('The order could not be sent'),
                            'body': _t('Check your internet connection and try again.'),
                        });
                    } else if (error.code === 200) {    // OpenERP Server Errors
                        self.gui.show_popup('error-traceback',{
                            'title': error.data.message || _t("Server Error"),
                            'body': error.data.debug || _t('The server encountered an error while receiving your order.'),
                        });
                    } else {                            // ???
                        self.gui.show_popup('error',{
                            'title': _t("Unknown Error"),
                            'body':  _t("The order could not be sent to the server due to an unknown error"),
                        });
                    }
                });
    
                invoiced.done(function(){
                    self.invoicing = false;
                    self.gui.show_screen('receipt');
                });
            } else {
                this.pos.push_order(order);
                this.gui.show_screen('receipt');
            }
    
        },
        */
        
        click_invoice: function(){
            var order = this.pos.get_order();
            order.set_to_invoice(!order.is_to_invoice());
            if (order.is_to_invoice()) {
                this.$('.js_invoice').addClass('highlight');
                this.$('.js_ticket').removeClass('highlight');
            } else {
                this.$('.js_invoice').removeClass('highlight');
                this.$('.js_ticket').addClass('highlight');
            }
            //alert(order.is_to_invoice());
        },
        
        
        show: function(){
            var order = this.pos.get_order();
            if(this.pos.config.x_iface_ticketing){
                order.set_to_invoice(false);
                this.$('.js_ticket').addClass('highlight');
            }  else {
                order.set_to_invoice(false);
            }
            this.pos.get_order().clean_empty_paymentlines();
            this.reset_input();
            this.render_paymentlines();
            this.order_changes();
            window.document.body.addEventListener('keypress',this.keyboard_handler);
            window.document.body.addEventListener('keydown',this.keyboard_keydown_handler);
            this._super();            
        },
        /*
        click_ticket: function(){
            var order = this.pos.get_order();

            order.set_to_ticket(!order.is_to_ticket());
            if (order.is_to_ticket()) {
                this.$('.js_ticket').addClass('highlight');
            } else {
                this.$('.js_ticket').removeClass('highlight');
            }
        },
        */       
        renderElement: function() {
            var self = this;
            this._super();

            this.$('.js_ticket').click(function(){
                self.click_invoice();
            });   
        },
    });
            
});