odoo.define('l10n_pe_einvoicing_point_of_sale.models', function (require) {
    "use strict";

    var BarcodeParser = require('barcodes.BarcodeParser');
    var PosDB = require('point_of_sale.DB');
    var devices = require('point_of_sale.devices');
    var core = require('web.core');
    var Model = require('web.DataModel');
    var formats = require('web.formats');
    var session = require('web.session');
    var time = require('web.time');
    var utils = require('web.utils');
    
    var QWeb = core.qweb;
    var _t = core._t;
    var Mutex = utils.Mutex;
    var round_di = utils.round_decimals;
    var round_pr = utils.round_precision;

    var models = require('point_of_sale.models');
    var _super_posmodel = models.PosModel.prototype;

    models.PosModel = models.PosModel.extend({

        push_and_invoice_order: function(order){
            //_super_posmodel.push_and_invoice_order.call(this, order);
            var self = this;
            var invoiced = new $.Deferred(); 
    
            if(!order.get_client()){
                invoiced.reject({code:400, message:'Missing Customer', data:{}});
                return invoiced;
            }
    
            var order_id = this.db.add_order(order.export_as_JSON());
    
            this.flush_mutex.exec(function(){
                var done = new $.Deferred(); // holds the mutex
                //alert('Ticket is: ' + order.is_to_ticket() + ', Invoice is: ' + order.is_to_invoice());
                if (order.is_to_invoice()) {
                    var transfer = self._flush_orders([self.db.get_order(order_id)], {timeout:30000, to_invoice:true, to_ticket:false});
                } else if (order.is_to_ticket()) {
                    var transfer = self._flush_orders([self.db.get_order(order_id)], {timeout:30000, to_ticket:true, to_invoice:false});
                }
                transfer.fail(function(error){
                    invoiced.reject(error);
                    done.reject();
                });
    
                // on success, get the order id generated by the server
                transfer.pipe(function(order_server_id){    
    
                    // generate the pdf and download it
                    self.chrome.do_action('point_of_sale.pos_invoice_report',{additional_context:{ 
                        active_ids:order_server_id,
                    }}).done(function () {
                        invoiced.resolve();
                        done.resolve();
                    });
                });
    
                return done;
    
            });    
            return invoiced;
        },

        _save_to_server: function (orders, options) {
            //_super_posmodel._save_to_server.call(this, orders, options);
            if (!orders || !orders.length) {
                var result = $.Deferred();
                result.resolve([]);
                return result;
            }
                
            options = options || {};
    
            var self = this;
            var timeout = typeof options.timeout === 'number' ? options.timeout : 7500 * orders.length;
    
            // Keep the order ids that are about to be sent to the
            // backend. In between create_from_ui and the success callback
            // new orders may have been added to it.
            var order_ids_to_sync = _.pluck(orders, 'id');

            //alert('Inv: ' + options.to_invoice + ', Tic: ' + options.to_ticket);
            //alert('is to invoice: ' + order.is_to_invoice() + ' ,is to ticket: ' + order.is_to_ticket());
            // we try to send the order. shadow prevents a spinner if it takes too long. (unless we are sending an invoice,
            // then we want to notify the user that we are waiting on something )
            var posOrderModel = new Model('pos.order');
            return posOrderModel.call('create_from_ui',
                [_.map(orders, function (order) {
                    order.to_invoice = options.to_invoice || false;
                    order.to_ticket = options.to_ticket || false; // MGQ
                    return order;
                })],
                undefined,
                {
                    //shadow: !options.to_invoice,
                    //shadow: !options.to_ticket,
                    shadow: false, // MGQ
                    timeout: timeout
                }
            ).then(function (server_ids) {
                _.each(order_ids_to_sync, function (order_id) {
                    self.db.remove_order(order_id);
                });
                self.set('failed',false);
                return server_ids;
            }).fail(function (error, event){
                if(error.code === 200 ){    // Business Logic Error, not a connection problem
                    //if warning do not need to display traceback!!
                    if (error.data.exception_type == 'warning') {
                        delete error.data.debug;
                    }
    
                    // Hide error if already shown before ... 
                    //if ((!self.get('failed') || options.show_error) && !options.to_invoice) {
                    if ((!self.get('failed') || options.show_error) && false) {
                        self.gui.show_popup('error-traceback',{
                            'title': error.data.message,
                            'body':  error.data.debug
                        });
                    }
                    self.set('failed',error)
                }
                // prevent an error popup creation by the rpc failure
                // we want the failure to be silent as we send the orders in the background
                event.preventDefault();
                console.error('Failed to send orders:', orders);
            });
        },
    });

    var _super_order = models.Order.prototype;

    models.Order = models.Order.extend({
        initialize: function(attributes,options){            
                var self = this;
                options  = options || {};
        
                this.to_ticket      = false; // MGQ

                return _super_order.initialize.call(this, attributes, options);
            },

        init_from_JSON: function(json) {
            this.to_ticket = false;    // FIXME
            return _super_order.init_from_JSON.call(this, json);
        },
        /* ---- Ticket --- */
        set_to_ticket: function(to_ticket) {
            this.assert_editable();
            this.to_ticket = to_ticket;
        },
        is_to_ticket: function(){
            return this.to_ticket;
        },        
    });
});