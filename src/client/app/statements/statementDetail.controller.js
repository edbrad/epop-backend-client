(function () {
    'use strict';

    angular
        .module('app.statementDetail', ['lbServices'])
        .controller('StatementDetailController', StatementDetailController);
        
    StatementDetailController.$inject = ['$q', 'EDocStatement', 'logger', '$scope', '$stateParams'];
    /* @ngInject */
    function StatementDetailController($q, EDocStatement, logger, $scope, $stateParams) {
        // establish View Model
        var vm = this;
        
        // assign View Title
        vm.title = 'eDoc Statement Detail';
        
        // storage for the selected Statement
        vm.statement = {};
		
		// storage for the asynchronous functions list (for $q)
        var promises = void[];
        
        // storage for statement-related data
        vm.mailDate = "";
        vm.rateType = "";
        vm.postageDetails_A = [];
        vm.postageDetails_B = [];
        vm.postageDetails_A_Filtered = [];
        vm.postageDetails_B_Filtered = [];
        vm.pieceTotal_A = 0;
        vm.pieceTotal_B = 0;
        vm.postageTotal_A = 0;
        vm.postageTotal_B = 0;
        vm.pieceTotal = 0;
        vm.postageTotal = 0;
        
	    // activate/initialize view
        activate();
        //
        function activate() {
            promises = [getStatement()];
            return $q.all(promises).then(function() {
               logger.info('Activated eDoc Statement Detail View'); 
            }) 
        }
		
		// collect selected Statement from database and perform some pre-processing of the statement data
        function getStatement() {
            EDocStatement.findById({id: $stateParams.id},
                function (result) {
                    vm.statement = result;
                    logger.log("Statement: " + JSON.stringify(vm.statement));
                    getPostageDetails();
                    
                    // re-format Mail Date data into YYYY-MM-DD form for the momemntJS library
                    var refmtDate = vm.statement.MailDate.substring(0,4) + "-" + vm.statement.MailDate.substring(4,6) + "-" + vm.statement.MailDate.substring(6,8);
                    vm.mailDate = moment(refmtDate).format('MMMM Do YYYY');
                    
                    // get filtered counts (greater than 0 pieces)
                    vm.postageDetails_A_Filtered = vm.postageDetails_A.filter(function(el){
                        return el.Count > 0;
                    });
                    vm.postageDetails_B_Filtered = vm.postageDetails_B.filter(function(el){
                        return el.Count > 0;
                    });
                });
        }
        
        // format numbers (piece counts) w/ comma's (numeralJS library)
        vm.numberFormat = function(number){
            return numeral(number).format('0,0');
        };
        
        // format numbers (postage) as money (numeralJS library)
        vm.currencyFormat = function(number){
            return numeral(number).format('$0,0.000');
        };
        
        // custom (legacy-compatible) Array extension method for filtering
        if (!Array.prototype.filter) {
            Array.prototype.filter = function (fun /*, thisp*/) {
                var len = this.length >>> 0;
                if (typeof fun != "function")
                    throw new TypeError();

                var res = [];
                var thisp = arguments[1];
                for (var i = 0; i < len; i++) {
                    if (i in this) {
                        var val = this[i]; // in case fun mutates this
                        if (fun.call(thisp, val, i, this))
                            res.push(val);
                    }
                }
                return res;
            };
        }
        
        // build postage details
        function getPostageDetails(){
            
            // determine the type of statement (only counts for 1 statement type will be populated)
            var statementType ="";
            
            // For Profit
            if (vm.statement.FP_PI_PieceCount > 0){
                statementType = "FP_PI";
            }
            if (vm.statement.FP_MT_PieceCount > 0){
                statementType = "FP_MT";
            }
            if (vm.statement.FP_ST_PieceCount > 0){
                statementType = "FP_ST";
            }
            
            // Non-Profit
            if (vm.statement.NP_PI_PieceCount > 0){
                statementType = "NP_PI";
            }
            if (vm.statement.NP_MT_PieceCount > 0){
                statementType = "NP_MT";
            }
            if (vm.statement.NP_ST_PieceCount > 0){
                statementType = "NP_ST";
            }
            
            logger.log("Statement Type: " + statementType);
            
            // collect statement counts for display (based on the determined statement type)
            vm.postageDetails_A = [];
            vm.postageDetails_B = [];
            vm.pieceTotal_A = 0;
            vm.pieceTotal_B = 0;
            vm.postageTotal_A = 0;
            vm.postageTotal_B = 0;
            vm.pieceTotal = 0;
            vm.postageTotal = 0;
            
            switch(statementType)
            {
                // ------------------------------------------------------------------------------------------- 
                // --------FOR-PROFIT------------------------------------------------------------------------- 
                // ------------------------------------------------------------------------------------------- 
                
                // PROFIT / PERMIT IMPRINT
                case "FP_PI":
                
                    vm.rateType = "Permit Imprint [For Profit]"
                    // -------------------------------------------------------------------------------------------
                    // PROFIT/PERMIT/NONE
                    // Auto [A]
                    vm.postageDetails_A.push({"PS3602": vm.statement.FP_PI_NONE_5Digit_Auto_PS3602, 
                                              "Entry": vm.statement.FP_PI_NONE_5Digit_Auto_Entry, 
                                              "Category": vm.statement.FP_PI_NONE_5Digit_Auto_Category, 
                                              "Price": vm.statement.FP_PI_NONE_5Digit_Auto_Price, 
                                              "Count": vm.statement.FP_PI_NONE_5Digit_Auto_Count, 
                                              "Postage": vm.statement.FP_PI_NONE_5Digit_Auto_Postage});
                    vm.postageTotal_A += vm.statement.FP_PI_NONE_5Digit_Auto_Postage;
                    vm.pieceTotal_A += vm.statement.FP_PI_NONE_5Digit_Auto_Count;
                                              
                    vm.postageDetails_A.push({"PS3602": vm.statement.FP_PI_NONE_3Digit_Auto_PS3602, 
                                              "Entry": vm.statement.FP_PI_NONE_3Digit_Auto_Entry, 
                                              "Category": vm.statement.FP_PI_NONE_3Digit_Auto_Category, 
                                              "Price": vm.statement.FP_PI_NONE_3Digit_Auto_Price, 
                                              "Count": vm.statement.FP_PI_NONE_3Digit_Auto_Count, 
                                              "Postage": vm.statement.FP_PI_NONE_3Digit_Auto_Postage});
                    vm.postageTotal_A += vm.statement.FP_PI_NONE_3Digit_Auto_Postage;
                    vm.pieceTotal_A += vm.statement.FP_PI_NONE_3Digit_Auto_Count;
                    
                    vm.postageDetails_A.push({"PS3602": vm.statement.FP_PI_NONE_AADC_Auto_PS3602, 
                                              "Entry": vm.statement.FP_PI_NONE_AADC_Auto_Entry, 
                                              "Category": vm.statement.FP_PI_NONE_AADC_Auto_Category, 
                                              "Price": vm.statement.FP_PI_NONE_AADC_Auto_Price, 
                                              "Count": vm.statement.FP_PI_NONE_AADC_Auto_Count, 
                                              "Postage": vm.statement.FP_PI_NONE_AADC_Auto_Postage});
                    vm.postageTotal_A += vm.statement.FP_PI_NONE_AADC_Auto_Postage;
                    vm.pieceTotal_A += vm.statement.FP_PI_NONE_AADC_Auto_Count;
                                              
                    vm.postageDetails_A.push({"PS3602": vm.statement.FP_PI_NONE_MxdAADC_Auto_PS3602, 
                                              "Entry": vm.statement.FP_PI_NONE_MxdAADC_Auto_Entry, 
                                              "Category": vm.statement.FP_PI_NONE_MxdAADC_Auto_Category, 
                                              "Price": vm.statement.FP_PI_NONE_MxdAADC_Auto_Price, 
                                              "Count": vm.statement.FP_PI_NONE_MxdAADC_Auto_Count, 
                                              "Postage": vm.statement.FP_PI_NONE_MxdAADC_Auto_Postage});
                    vm.postageTotal_A += vm.statement.FP_PI_NONE_MxdAADC_Auto_Postage;
                    vm.pieceTotal_A += vm.statement.FP_PI_NONE_MxdAADC_Auto_Count;
                     
                    // Non-Auto [B]
                    vm.postageDetails_B.push({"PS3602": vm.statement.FP_PI_NONE_AADC_NonAuto_PS3602, 
                                              "Entry": vm.statement.FP_PI_NONE_AADC_NonAuto_Entry, 
                                              "Category": vm.statement.FP_PI_NONE_AADC_NonAuto_Category, 
                                              "Price": vm.statement.FP_PI_NONE_AADC_NonAuto_Price, 
                                              "Count": vm.statement.FP_PI_NONE_AADC_NonAuto_Count, 
                                              "Postage": vm.statement.FP_PI_NONE_AADC_NonAuto_Postage});
                    vm.postageTotal_B += vm.statement.FP_PI_NONE_AADC_NonAuto_Postage;
                    vm.pieceTotal_B += vm.statement.FP_PI_NONE_AADC_NonAuto_Count;
                                              
                    vm.postageDetails_B.push({"PS3602": vm.statement.FP_PI_NONE_MxdAADC_NonAuto_PS3602, 
                                              "Entry": vm.statement.FP_PI_NONE_MxdAADC_NonAuto_Entry, 
                                              "Category": vm.statement.FP_PI_NONE_MxdAADC_NonAuto_Category, 
                                              "Price": vm.statement.FP_PI_NONE_MxdAADC_NonAuto_Price, 
                                              "Count": vm.statement.FP_PI_NONE_MxdAADC_NonAuto_Count, 
                                              "Postage": vm.statement.FP_PI_NONE_MxdAADC_NonAuto_Postage});
                    vm.postageTotal_B += vm.statement.FP_PI_NONE_MxdAADC_NonAuto_Postage;
                    vm.pieceTotal_B += vm.statement.FP_PI_NONE_MxdAADC_NonAuto_Count;
                    
                    // -------------------------------------------------------------------------------------------                          
                    // PROFIT/PERMIT/DNDC
                    // Auto [A]
                    vm.postageDetails_A.push({"PS3602": vm.statement.FP_PI_DNDC_5Digit_Auto_PS3602, 
                                              "Entry": vm.statement.FP_PI_DNDC_5Digit_Auto_Entry, 
                                              "Category": vm.statement.FP_PI_DNDC_5Digit_Auto_Category, 
                                              "Price": vm.statement.FP_PI_DNDC_5Digit_Auto_Price, 
                                              "Count": vm.statement.FP_PI_DNDC_5Digit_Auto_Count, 
                                              "Postage": vm.statement.FP_PI_DNDC_5Digit_Auto_Postage});
                    vm.postageTotal_A += vm.statement.FP_PI_DNDC_5Digit_Auto_Postage;
                    vm.pieceTotal_A += vm.statement.FP_PI_DNDC_5Digit_Auto_Count;
                                              
                    vm.postageDetails_A.push({"PS3602": vm.statement.FP_PI_DNDC_3Digit_Auto_PS3602, 
                                              "Entry": vm.statement.FP_PI_DNDC_3Digit_Auto_Entry, 
                                              "Category": vm.statement.FP_PI_DNDC_3Digit_Auto_Category, 
                                              "Price": vm.statement.FP_PI_DNDC_3Digit_Auto_Price, 
                                              "Count": vm.statement.FP_PI_DNDC_3Digit_Auto_Count, 
                                              "Postage": vm.statement.FP_PI_DNDC_3Digit_Auto_Postage});
                    vm.postageTotal_A += vm.statement.FP_PI_DNDC_3Digit_Auto_Postage;
                    vm.pieceTotal_A += vm.statement.FP_PI_DNDC_3Digit_Auto_Count;
                    
                    vm.postageDetails_A.push({"PS3602": vm.statement.FP_PI_DNDC_AADC_Auto_PS3602, 
                                              "Entry": vm.statement.FP_PI_DNDC_AADC_Auto_Entry, 
                                              "Category": vm.statement.FP_PI_DNDC_AADC_Auto_Category, 
                                              "Price": vm.statement.FP_PI_DNDC_AADC_Auto_Price, 
                                              "Count": vm.statement.FP_PI_DNDC_AADC_Auto_Count, 
                                              "Postage": vm.statement.FP_PI_DNDC_AADC_Auto_Postage});
                    vm.postageTotal_A += vm.statement.FP_PI_DNDC_AADC_Auto_Postage;
                    vm.pieceTotal_A += vm.statement.FP_PI_DNDC_AADC_Auto_Count;
                                              
                    vm.postageDetails_A.push({"PS3602": vm.statement.FP_PI_DNDC_MxdAADC_Auto_PS3602, 
                                              "Entry": vm.statement.FP_PI_DNDC_MxdAADC_Auto_Entry, 
                                              "Category": vm.statement.FP_PI_DNDC_MxdAADC_Auto_Category, 
                                              "Price": vm.statement.FP_PI_DNDC_MxdAADC_Auto_Price, 
                                              "Count": vm.statement.FP_PI_DNDC_MxdAADC_Auto_Count, 
                                              "Postage": vm.statement.FP_PI_DNDC_MxdAADC_Auto_Postage});
                    vm.postageTotal_A += vm.statement.FP_PI_DNDC_MxdAADC_Auto_Postage;
                    vm.pieceTotal_A += vm.statement.FP_PI_DNDC_MxdAADC_Auto_Count;
                    
                    // Non-Auto [B]
                    vm.postageDetails_B.push({"PS3602": vm.statement.FP_PI_DNDC_AADC_NonAuto_PS3602, 
                                              "Entry": vm.statement.FP_PI_DNDC_AADC_NonAuto_Entry, 
                                              "Category": vm.statement.FP_PI_DNDC_AADC_NonAuto_Category, 
                                              "Price": vm.statement.FP_PI_DNDC_AADC_NonAuto_Price, 
                                              "Count": vm.statement.FP_PI_DNDC_AADC_NonAuto_Count, 
                                              "Postage": vm.statement.FP_PI_DNDC_AADC_NonAuto_Postage});
                    vm.postageTotal_B += vm.statement.FP_PI_DNDC_AADC_NonAuto_Postage;
                    vm.pieceTotal_B += vm.statement.FP_PI_DNDC_AADC_NonAuto_Count;
                                              
                    vm.postageDetails_B.push({"PS3602": vm.statement.FP_PI_DNDC_MxdAADC_NonAuto_PS3602, 
                                              "Entry": vm.statement.FP_PI_DNDC_MxdAADC_NonAuto_Entry, 
                                              "Category": vm.statement.FP_PI_DNDC_MxdAADC_NonAuto_Category, 
                                              "Price": vm.statement.FP_PI_DNDC_MxdAADC_NonAuto_Price, 
                                              "Count": vm.statement.FP_PI_DNDC_MxdAADC_NonAuto_Count, 
                                              "Postage": vm.statement.FP_PI_DNDC_MxdAADC_NonAuto_Postage});
                    vm.postageTotal_B += vm.statement.FP_PI_DNDC_MxdAADC_NonAuto_Postage;
                    vm.pieceTotal_B += vm.statement.FP_PI_DNDC_MxdAADC_NonAuto_Count;
                    
                    // -------------------------------------------------------------------------------------------                         
                    // PROFIT/PERMIT/DSCF
                    // Auto [A]
                    vm.postageDetails_A.push({"PS3602": vm.statement.FP_PI_DSCF_5Digit_Auto_PS3602, 
                                              "Entry": vm.statement.FP_PI_DSCF_5Digit_Auto_Entry, 
                                              "Category": vm.statement.FP_PI_DSCF_5Digit_Auto_Category, 
                                              "Price": vm.statement.FP_PI_DSCF_5Digit_Auto_Price, 
                                              "Count": vm.statement.FP_PI_DSCF_5Digit_Auto_Count, 
                                              "Postage": vm.statement.FP_PI_DSCF_5Digit_Auto_Postage});
                    vm.postageTotal_A += vm.statement.FP_PI_DSCF_5Digit_Auto_Postage;
                    vm.pieceTotal_A += vm.statement.FP_PI_DSCF_5Digit_Auto_Count;
                                              
                    vm.postageDetails_A.push({"PS3602": vm.statement.FP_PI_DSCF_3Digit_Auto_PS3602, 
                                              "Entry": vm.statement.FP_PI_DSCF_3Digit_Auto_Entry, 
                                              "Category": vm.statement.FP_PI_DSCF_3Digit_Auto_Category, 
                                              "Price": vm.statement.FP_PI_DSCF_3Digit_Auto_Price, 
                                              "Count": vm.statement.FP_PI_DSCF_3Digit_Auto_Count, 
                                              "Postage": vm.statement.FP_PI_DSCF_3Digit_Auto_Postage});
                    vm.postageTotal_A += vm.statement.FP_PI_DSCF_3Digit_Auto_Postage;
                    vm.pieceTotal_A += vm.statement.FP_PI_DSCF_3Digit_Auto_Count;
                    
                    vm.postageDetails_A.push({"PS3602": vm.statement.FP_PI_DSCF_AADC_Auto_PS3602, 
                                              "Entry": vm.statement.FP_PI_DSCF_AADC_Auto_Entry, 
                                              "Category": vm.statement.FP_PI_DSCF_AADC_Auto_Category, 
                                              "Price": vm.statement.FP_PI_DSCF_AADC_Auto_Price, 
                                              "Count": vm.statement.FP_PI_DSCF_AADC_Auto_Count, 
                                              "Postage": vm.statement.FP_PI_DSCF_AADC_Auto_Postage});
                   vm.postageTotal_A += vm.statement.FP_PI_DSCF_AADC_Auto_Postage;
                   vm.pieceTotal_A += vm.statement.FP_PI_DSCF_AADC_Auto_Count;
                   
                   // Non-Auto [B]
                   vm.postageDetails_B.push({"PS3602": vm.statement.FP_PI_DSCF_AADC_NonAuto_PS3602, 
                                              "Entry": vm.statement.FP_PI_DSCF_AADC_NonAuto_Entry, 
                                              "Category": vm.statement.FP_PI_DSCF_AADC_NonAuto_Category, 
                                              "Price": vm.statement.FP_PI_DSCF_AADC_NonAuto_Price, 
                                              "Count": vm.statement.FP_PI_DSCF_AADC_NonAuto_Count, 
                                              "Postage": vm.statement.FP_PI_DSCF_AADC_NonAuto_Postage});
                   vm.postageTotal_B += vm.statement.FP_PI_DSCF_AADC_NonAuto_Postage;
                   vm.pieceTotal_B += vm.statement.FP_PI_DSCF_AADC_NonAuto_Count;
                   
                   // GRAND TOTALS
                   vm.pieceTotal = vm.pieceTotal_A + vm.pieceTotal_B; 
                   vm.postageTotal = vm.postageTotal_A + vm.postageTotal_B;
                                        
                break;
                
                // -------------------------------------------------------------------------------------------
                // -------------------------------------------------------------------------------------------
                // PROFIT / METER
                case "FP_MT":
                
                    // -------------------------------------------------------------------------------------------
                    // PROFIT/METER/NONE
                    // Auto [A]
                    vm.postageDetails_A.push({"PS3602": vm.statement.FP_MT_NONE_5Digit_Auto_PS3602, 
                                              "Entry": vm.statement.FP_MT_NONE_5Digit_Auto_Entry, 
                                              "Category": vm.statement.FP_MT_NONE_5Digit_Auto_Category, 
                                              "Price": vm.statement.FP_MT_NONE_5Digit_Auto_Price, 
                                              "Count": vm.statement.FP_MT_NONE_5Digit_Auto_Count, 
                                              "Postage": vm.statement.FP_MT_NONE_5Digit_Auto_Postage});
                    vm.postageTotal_A += vm.statement.FP_MT_NONE_5Digit_Auto_Postage;
                    vm.pieceTotal_A += vm.statement.FP_MT_NONE_5Digit_Auto_Count;
                                              
                    vm.postageDetails_A.push({"PS3602": vm.statement.FP_MT_NONE_3Digit_Auto_PS3602, 
                                              "Entry": vm.statement.FP_MT_NONE_3Digit_Auto_Entry, 
                                              "Category": vm.statement.FP_MT_NONE_3Digit_Auto_Category, 
                                              "Price": vm.statement.FP_MT_NONE_3Digit_Auto_Price, 
                                              "Count": vm.statement.FP_MT_NONE_3Digit_Auto_Count, 
                                              "Postage": vm.statement.FP_MT_NONE_3Digit_Auto_Postage});
                    vm.postageTotal_A += vm.statement.FP_MT_NONE_3Digit_Auto_Postage;
                    vm.pieceTotal_A += vm.statement.FP_MT_NONE_3Digit_Auto_Count;
                    
                    vm.postageDetails_A.push({"PS3602": vm.statement.FP_MT_NONE_AADC_Auto_PS3602, 
                                              "Entry": vm.statement.FP_MT_NONE_AADC_Auto_Entry, 
                                              "Category": vm.statement.FP_MT_NONE_AADC_Auto_Category, 
                                              "Price": vm.statement.FP_MT_NONE_AADC_Auto_Price, 
                                              "Count": vm.statement.FP_MT_NONE_AADC_Auto_Count, 
                                              "Postage": vm.statement.FP_MT_NONE_AADC_Auto_Postage});
                    vm.postageTotal_A += vm.statement.FP_MT_NONE_AADC_Auto_Postage;
                    vm.pieceTotal_A += vm.statement.FP_MT_NONE_AADC_Auto_Count;
                                              
                    vm.postageDetails_A.push({"PS3602": vm.statement.FP_MT_NONE_MxdAADC_Auto_PS3602, 
                                              "Entry": vm.statement.FP_MT_NONE_MxdAADC_Auto_Entry, 
                                              "Category": vm.statement.FP_MT_MxdNONE_AADC_Auto_Category, 
                                              "Price": vm.statement.FP_MT_NONE_MxdAADC_Auto_Price, 
                                              "Count": vm.statement.FP_MT_NONE_MxdAADC_Auto_Count, 
                                              "Postage": vm.statement.FP_MT_NONE_MxdAADC_Auto_Postage});
                    vm.postageTotal_A += vm.statement.FP_MT_NONE_MxdAADC_Auto_Postage;
                    vm.pieceTotal_A += vm.statement.FP_MT_NONE_MxdAADC_Auto_Count;
                    
                    // Non-Auto [B]
                    vm.postageDetails_B.push({"PS3602": vm.statement.FP_MT_NONE_AADC_NonAuto_PS3602, 
                                              "Entry": vm.statement.FP_MT_NONE_AADC_NonAuto_Entry, 
                                              "Category": vm.statement.FP_MT_NONE_AADC_NonAuto_Category, 
                                              "Price": vm.statement.FP_MT_NONE_AADC_NonAuto_Price, 
                                              "Count": vm.statement.FP_MT_NONE_AADC_NonAuto_Count, 
                                              "Postage": vm.statement.FP_MT_NONE_AADC_NonAuto_Postage});
                    vm.postageTotal_B += vm.statement.FP_MT_NONE_AADC_NonAuto_Postage;
                    vm.pieceTotal_B += vm.statement.FP_MT_NONE_AADC_NonAuto_Count;
                                              
                    vm.postageDetails_B.push({"PS3602": vm.statement.FP_MT_NONE_MxdAADC_NonAuto_PS3602, 
                                              "Entry": vm.statement.FP_MT_NONE_MxdAADC_NonAuto_Entry, 
                                              "Category": vm.statement.FP_MT_MxdNONE_AADC_NonAuto_Category, 
                                              "Price": vm.statement.FP_MT_NONE_MxdAADC_NonAuto_Price, 
                                              "Count": vm.statement.FP_MT_NONE_MxdAADC_NonAuto_Count, 
                                              "Postage": vm.statement.FP_MT_NONE_MxdAADC_NonAuto_Postage});
                    vm.postageTotal_B += vm.statement.FP_MT_NONE_MxdAADC_NonAuto_Postage;
                    vm.pieceTotal_B += vm.statement.FP_MT_NONE_MxdAADC_NonAuto_Count;
                    
                    // -------------------------------------------------------------------------------------------
                    // PROFIT/METER/DNDC
                    // Auto [A]
                    vm.postageDetails_A.push({"PS3602": vm.statement.FP_MT_DNDC_5Digit_Auto_PS3602, 
                                              "Entry": vm.statement.FP_MT_DNDC_5Digit_Auto_Entry, 
                                              "Category": vm.statement.FP_MT_DNDC_5Digit_Auto_Category, 
                                              "Price": vm.statement.FP_MT_DNDC_5Digit_Auto_Price, 
                                              "Count": vm.statement.FP_MT_DNDC_5Digit_Auto_Count, 
                                              "Postage": vm.statement.FP_MT_DNDC_5Digit_Auto_Postage});
                    vm.postageTotal_A += vm.statement.FP_MT_DNDC_5Digit_Auto_Postage;
                    vm.pieceTotal_A += vm.statement.FP_MT_DNDC_5Digit_Auto_Count;
                                              
                    vm.postageDetails_A.push({"PS3602": vm.statement.FP_MT_DNDC_3Digit_Auto_PS3602, 
                                              "Entry": vm.statement.FP_MT_DNDC_3Digit_Auto_Entry, 
                                              "Category": vm.statement.FP_MT_DNDC_3Digit_Auto_Category, 
                                              "Price": vm.statement.FP_MT_DNDC_3Digit_Auto_Price, 
                                              "Count": vm.statement.FP_MT_DNDC_3Digit_Auto_Count, 
                                              "Postage": vm.statement.FP_MT_DNDC_3Digit_Auto_Postage});
                    vm.postageTotal_A += vm.statement.FP_MT_DNDC_3Digit_Auto_Postage;
                    vm.pieceTotal_A += vm.statement.FP_MT_DNDC_3Digit_Auto_Count;
                    
                    vm.postageDetails_A.push({"PS3602": vm.statement.FP_MT_DNDC_AADC_Auto_PS3602, 
                                              "Entry": vm.statement.FP_MT_DNDC_AADC_Auto_Entry, 
                                              "Category": vm.statement.FP_MT_DNDC_AADC_Auto_Category, 
                                              "Price": vm.statement.FP_MT_DNDC_AADC_Auto_Price, 
                                              "Count": vm.statement.FP_MT_DNDC_AADC_Auto_Count, 
                                              "Postage": vm.statement.FP_MT_DNDC_AADC_Auto_Postage});
                    vm.postageTotal_A += vm.statement.FP_MT_DNDC_AADC_Auto_Postage;
                    vm.pieceTotal_A += vm.statement.FP_MT_DNDC_AADC_Auto_Count;
                                              
                    vm.postageDetails_A.push({"PS3602": vm.statement.FP_MT_DNDC_MxdAADC_Auto_PS3602, 
                                              "Entry": vm.statement.FP_MT_DNDC_MxdAADC_Auto_Entry, 
                                              "Category": vm.statement.FP_MT_DNDC_MxdNONE_AADC_Auto_Category, 
                                              "Price": vm.statement.FP_MT_DNDC_MxdAADC_Auto_Price, 
                                              "Count": vm.statement.FP_MT_DNDC_MxdAADC_Auto_Count, 
                                              "Postage": vm.statement.FP_MT_DNDC_MxdAADC_Auto_Postage});
                    vm.postageTotal_A += vm.statement.FP_MT_DNDC_MxdAADC_Auto_Postage;
                    vm.pieceTotal_A += vm.statement.FP_MT_DNDC_MxdAADC_Auto_Count;
                    
                    // Non-Auto [B]
                    vm.postageDetails_B.push({"PS3602": vm.statement.FP_MT_DNDC_AADC_NonAuto_PS3602, 
                                              "Entry": vm.statement.FP_MT_DNDC_AADC_NonAuto_Entry, 
                                              "Category": vm.statement.FP_MT_DNDC_AADC_NonAuto_Category, 
                                              "Price": vm.statement.FP_MT_DNDC_AADC_NonAuto_Price, 
                                              "Count": vm.statement.FP_MT_DNDC_AADC_NonAuto_Count, 
                                              "Postage": vm.statement.FP_MT_DNDC_AADC_NonAuto_Postage});
                    vm.postageTotal_B += vm.statement.FP_MT_DNDC_AADC_NonAuto_Postage;
                    vm.pieceTotal_B += vm.statement.FP_MT_DNDC_AADC_NonAuto_Count;
                                              
                    vm.postageDetails_B.push({"PS3602": vm.statement.FP_MT_DNDC_MxdAADC_NonAuto_PS3602, 
                                              "Entry": vm.statement.FP_MT_DNDC_MxdAADC_NonAuto_Entry, 
                                              "Category": vm.statement.FP_MT_DNDC_MxdNONE_NonAADC_Auto_Category, 
                                              "Price": vm.statement.FP_MT_DNDC_MxdAADC_NonAuto_Price, 
                                              "Count": vm.statement.FP_MT_DNDC_MxdAADC_NonAuto_Count, 
                                              "Postage": vm.statement.FP_MT_DNDC_MxdAADC_NonAuto_Postage});
                    vm.postageTotal_B += vm.statement.FP_MT_DNDC_MxdAADC_NonAuto_Postage;
                    vm.pieceTotal_B += vm.statement.FP_MT_DNDC_MxdAADC_NonAuto_Count;
                    
                    // -------------------------------------------------------------------------------------------                          
                    // PROFIT/METER/DSCF
                    // Auto [A]
                    vm.postageDetails_A.push({"PS3602": vm.statement.FP_MT_DSCF_5Digit_Auto_PS3602, 
                                              "Entry": vm.statement.FP_MT_DSCF_5Digit_Auto_Entry, 
                                              "Category": vm.statement.FP_MT_DSCF_5Digit_Auto_Category, 
                                              "Price": vm.statement.FP_MT_DSCF_5Digit_Auto_Price, 
                                              "Count": vm.statement.FP_MT_DSCF_5Digit_Auto_Count, 
                                              "Postage": vm.statement.FP_MT_DSCF_5Digit_Auto_Postage});
                    vm.postageTotal_A += vm.statement.FP_MT_DSCF_5Digit_Auto_Postage;
                    vm.pieceTotal_A += vm.statement.FP_MT_DSCF_5Digit_Auto_Count;
                                              
                    vm.postageDetails_A.push({"PS3602": vm.statement.FP_MT_DSCF_3Digit_Auto_PS3602, 
                                              "Entry": vm.statement.FP_MT_DSCF_3Digit_Auto_Entry, 
                                              "Category": vm.statement.FP_MT_DSCF_3Digit_Auto_Category, 
                                              "Price": vm.statement.FP_MT_DSCF_3Digit_Auto_Price, 
                                              "Count": vm.statement.FP_MT_DSCF_3Digit_Auto_Count, 
                                              "Postage": vm.statement.FP_MT_DSCF_3Digit_Auto_Postage});
                    vm.postageTotal_A += vm.statement.FP_MT_DSCF_3Digit_Auto_Postage;
                    vm.pieceTotal_A += vm.statement.FP_MT_DSCF_3Digit_Auto_Count;
                    
                    vm.postageDetails_A.push({"PS3602": vm.statement.FP_MT_DSCF_AADC_Auto_PS3602, 
                                              "Entry": vm.statement.FP_MT_DSCF_AADC_Auto_Entry, 
                                              "Category": vm.statement.FP_MT_DSCF_AADC_Auto_Category, 
                                              "Price": vm.statement.FP_MT_DSCF_AADC_Auto_Price, 
                                              "Count": vm.statement.FP_MT_DSCF_AADC_Auto_Count, 
                                              "Postage": vm.statement.FP_MT_DSCF_AADC_Auto_Postage});
                    vm.postageTotal_A += vm.statement.FP_MT_DSCF_AADC_Auto_Postage;
                    vm.pieceTotal_A += vm.statement.FP_MT_DSCF_AADC_Auto_Count;      
                
                    // Non-Auto [B]
                    vm.postageDetails_B.push({"PS3602": vm.statement.FP_MT_DSCF_AADC_NonAuto_PS3602, 
                                              "Entry": vm.statement.FP_MT_DSCF_AADC_NonAuto_Entry, 
                                              "Category": vm.statement.FP_MT_DSCF_AADC_NonAuto_Category, 
                                              "Price": vm.statement.FP_MT_DSCF_AADC_NonAuto_Price, 
                                              "Count": vm.statement.FP_MT_DSCF_AADC_NonAuto_Count, 
                                              "Postage": vm.statement.FP_MT_DSCF_AADC_NonAuto_Postage});
                   vm.postageTotal_B += vm.statement.FP_MT_DSCF_AADC_NonAuto_Postage;
                   vm.pieceTotal_B += vm.statement.FP_MT_DSCF_AADC_NonAuto_Count;      
                
                   // GRAND TOTALS
                   vm.pieceTotal = vm.pieceTotal_A + vm.pieceTotal_B; 
                   vm.postageTotal = vm.postageTotal_A + vm.postageTotal_B;
                   
                break;
                
                // ------------------------------------------------------------------------------------------- 
                // ------------------------------------------------------------------------------------------- 
                // PROFIT STAMP
                case "FP_ST":
                    // ------------------------------------------------------------------------------------------- 
                    // PROFIT/STAMP/NONE
                    // Auto [A]
                    vm.postageDetails_A.push({"PS3602": vm.statement.FP_ST_NONE_5Digit_Auto_PS3602, 
                                              "Entry": vm.statement.FP_ST_NONE_5Digit_Auto_Entry, 
                                              "Category": vm.statement.FP_ST_NONE_5Digit_Auto_Category, 
                                              "Price": vm.statement.FP_ST_NONE_5Digit_Auto_Price, 
                                              "Count": vm.statement.FP_ST_NONE_5Digit_Auto_Count, 
                                              "Postage": vm.statement.FP_ST_NONE_5Digit_Auto_Postage});
                    vm.postageTotal_A += vm.statement.FP_ST_NONE_5Digit_Auto_Postage;
                    vm.pieceTotal_A += vm.statement.FP_ST_NONE_5Digit_Auto_Count;
                                              
                    vm.postageDetails_A.push({"PS3602": vm.statement.FP_ST_NONE_3Digit_Auto_PS3602, 
                                              "Entry": vm.statement.FP_ST_NONE_3Digit_Auto_Entry, 
                                              "Category": vm.statement.FP_ST_NONE_3Digit_Auto_Category, 
                                              "Price": vm.statement.FP_ST_NONE_3Digit_Auto_Price, 
                                              "Count": vm.statement.FP_ST_NONE_3Digit_Auto_Count, 
                                              "Postage": vm.statement.FP_ST_NONE_3Digit_Auto_Postage});
                    vm.postageTotal_A += vm.statement.FP_ST_NONE_3Digit_Auto_Postage;
                    vm.pieceTotal_A += vm.statement.FP_ST_NONE_3Digit_Auto_Count;
                    
                    vm.postageDetails_A.push({"PS3602": vm.statement.FP_ST_NONE_AADC_Auto_PS3602, 
                                              "Entry": vm.statement.FP_ST_NONE_AADC_Auto_Entry, 
                                              "Category": vm.statement.FP_ST_NONE_AADC_Auto_Category, 
                                              "Price": vm.statement.FP_ST_NONE_AADC_Auto_Price, 
                                              "Count": vm.statement.FP_ST_NONE_AADC_Auto_Count, 
                                              "Postage": vm.statement.FP_ST_NONE_AADC_Auto_Postage});
                    vm.postageTotal_A += vm.statement.FP_ST_NONE_AADC_Auto_Postage;
                    vm.pieceTotal_A += vm.statement.FP_ST_NONE_AADC_Auto_Count;
                                              
                    vm.postageDetails_A.push({"PS3602": vm.statement.FP_ST_NONE_MxdAADC_Auto_PS3602, 
                                              "Entry": vm.statement.FP_ST_NONE_MxdAADC_Auto_Entry, 
                                              "Category": vm.statement.FP_ST_MxdNONE_AADC_Auto_Category, 
                                              "Price": vm.statement.FP_ST_NONE_MxdAADC_Auto_Price, 
                                              "Count": vm.statement.FP_ST_NONE_MxdAADC_Auto_Count, 
                                              "Postage": vm.statement.FP_ST_NONE_MxdAADC_Auto_Postage});
                    vm.postageTotal_A += vm.statement.FP_ST_NONE_MxdAADC_Auto_Postage;
                    vm.pieceTotal_A += vm.statement.FP_ST_NONE_MxdAADC_Auto_Count;
                    
                    // Non-Auto [B]
                    vm.postageDetails_B.push({"PS3602": vm.statement.FP_ST_NONE_AADC_NonAuto_PS3602, 
                                              "Entry": vm.statement.FP_ST_NONE_AADC_NonAuto_Entry, 
                                              "Category": vm.statement.FP_ST_NONE_AADC_NonAuto_Category, 
                                              "Price": vm.statement.FP_ST_NONE_AADC_NonAuto_Price, 
                                              "Count": vm.statement.FP_ST_NONE_AADC_NonAuto_Count, 
                                              "Postage": vm.statement.FP_ST_NONE_AADC_NonAuto_Postage});
                    vm.postageTotal_B += vm.statement.FP_ST_NONE_AADC_NonAuto_Postage;
                    vm.pieceTotal_B += vm.statement.FP_ST_NONE_AADC_NonAuto_Count;
                                              
                    vm.postageDetails_B.push({"PS3602": vm.statement.FP_ST_NONE_MxdAADC_NonAuto_PS3602, 
                                              "Entry": vm.statement.FP_ST_NONE_MxdAADC_NonAuto_Entry, 
                                              "Category": vm.statement.FP_ST_NONE_MxdNONE_NonAADC_Auto_Category, 
                                              "Price": vm.statement.FP_ST_NONE_MxdAADC_NonAuto_Price, 
                                              "Count": vm.statement.FP_ST_NONE_MxdAADC_NonAuto_Count, 
                                              "Postage": vm.statement.FP_ST_NONE_MxdAADC_NonAuto_Postage});
                    vm.postageTotal_B += vm.statement.FP_ST_NONE_MxdAADC_NonAuto_Postage;
                    vm.pieceTotal_B += vm.statement.FP_ST_NONE_MxdAADC_NonAuto_Count;
                    
                    // -------------------------------------------------------------------------------------------   
                    // PROFIT/STAMP/DNDC
                    // Auto [A]
                    vm.postageDetails_A.push({"PS3602": vm.statement.FP_ST_DNDC_5Digit_Auto_PS3602, 
                                              "Entry": vm.statement.FP_ST_DNDC_5Digit_Auto_Entry, 
                                              "Category": vm.statement.FP_ST_DNDC_5Digit_Auto_Category, 
                                              "Price": vm.statement.FP_ST_DNDC_5Digit_Auto_Price, 
                                              "Count": vm.statement.FP_ST_DNDC_5Digit_Auto_Count, 
                                              "Postage": vm.statement.FP_ST_DNDC_5Digit_Auto_Postage});
                    vm.postageTotal_A += vm.statement.FP_ST_DNDC_5Digit_Auto_Postage;
                    vm.pieceTotal_A += vm.statement.FP_ST_DNDC_5Digit_Auto_Count;
                                              
                    vm.postageDetails_A.push({"PS3602": vm.statement.FP_ST_DNDC_3Digit_Auto_PS3602, 
                                              "Entry": vm.statement.FP_ST_DNDC_3Digit_Auto_Entry, 
                                              "Category": vm.statement.FP_ST_DNDC_3Digit_Auto_Category, 
                                              "Price": vm.statement.FP_ST_DNDC_3Digit_Auto_Price, 
                                              "Count": vm.statement.FP_ST_DNDC_3Digit_Auto_Count, 
                                              "Postage": vm.statement.FP_ST_DNDC_3Digit_Auto_Postage});
                    vm.postageTotal_A += vm.statement.FP_ST_DNDC_3Digit_Auto_Postage;
                    vm.pieceTotal_A += vm.statement.FP_ST_DNDC_3Digit_Auto_Count;
                    
                    vm.postageDetails_A.push({"PS3602": vm.statement.FP_ST_DNDC_AADC_Auto_PS3602, 
                                              "Entry": vm.statement.FP_ST_DNDC_AADC_Auto_Entry, 
                                              "Category": vm.statement.FP_ST_DNDC_AADC_Auto_Category, 
                                              "Price": vm.statement.FP_ST_DNDC_AADC_Auto_Price, 
                                              "Count": vm.statement.FP_ST_DNDC_AADC_Auto_Count, 
                                              "Postage": vm.statement.FP_ST_DNDC_AADC_Auto_Postage});
                    vm.postageTotal_A += vm.statement.FP_ST_DNDC_AADC_Auto_Postage;
                    vm.pieceTotal_A += vm.statement.FP_ST_DNDC_AADC_Auto_Count;
                                              
                    vm.postageDetails_A.push({"PS3602": vm.statement.FP_ST_DNDC_MxdAADC_Auto_PS3602, 
                                              "Entry": vm.statement.FP_ST_DNDC_MxdAADC_Auto_Entry, 
                                              "Category": vm.statement.FP_ST_DNDC_MxdNONE_AADC_Auto_Category, 
                                              "Price": vm.statement.FP_ST_DNDC_MxdAADC_Auto_Price, 
                                              "Count": vm.statement.FP_ST_DNDC_MxdAADC_Auto_Count, 
                                              "Postage": vm.statement.FP_ST_DNDC_MxdAADC_Auto_Postage});
                    vm.postageTotal_A += vm.statement.FP_ST_DNDC_MxdAADC_Auto_Postage;
                    vm.pieceTotal_A += vm.statement.FP_ST_DNDC_MxdAADC_Auto_Count;
                    
                    // Non-Auto [B]
                    vm.postageDetails_B.push({"PS3602": vm.statement.FP_ST_DNDC_AADC_NonAuto_PS3602, 
                                              "Entry": vm.statement.FP_ST_DNDC_AADC_NonAuto_Entry, 
                                              "Category": vm.statement.FP_ST_DNDC_AADC_NonAuto_Category, 
                                              "Price": vm.statement.FP_ST_DNDC_AADC_NonAuto_Price, 
                                              "Count": vm.statement.FP_ST_DNDC_AADC_NonAuto_Count, 
                                              "Postage": vm.statement.FP_ST_DNDC_AADC_NonAuto_Postage});
                    vm.postageTotal_B += vm.statement.FP_ST_DNDC_AADC_NonAuto_Postage;
                    vm.pieceTotal_B += vm.statement.FP_ST_DNDC_AADC_NonAuto_Count;
                                              
                    vm.postageDetails_B.push({"PS3602": vm.statement.FP_ST_DNDC_MxdAADC_NonAuto_PS3602, 
                                              "Entry": vm.statement.FP_ST_DNDC_MxdAADC_NonAuto_Entry, 
                                              "Category": vm.statement.FP_ST_DNDC_MxdNONE_NonAADC_Auto_Category, 
                                              "Price": vm.statement.FP_ST_DNDC_MxdAADC_NonAuto_Price, 
                                              "Count": vm.statement.FP_ST_DNDC_MxdAADC_NonAuto_Count, 
                                              "Postage": vm.statement.FP_ST_DNDC_MxdAADC_NonAuto_Postage});
                    vm.postageTotal_B += vm.statement.FP_ST_DNDC_MxdAADC_NonAuto_Postage;
                    vm.pieceTotal_B += vm.statement.FP_ST_DNDC_MxdAADC_NonAuto_Count;
                    
                    // -------------------------------------------------------------------------------------------                           
                    // PROFIT/STAMP/DSCF
                    // Auto [A]
                    vm.postageDetails_A.push({"PS3602": vm.statement.FP_ST_DSCF_5Digit_Auto_PS3602, 
                                              "Entry": vm.statement.FP_ST_DSCF_5Digit_Auto_Entry, 
                                              "Category": vm.statement.FP_ST_DSCF_5Digit_Auto_Category, 
                                              "Price": vm.statement.FP_ST_DSCF_5Digit_Auto_Price, 
                                              "Count": vm.statement.FP_ST_DSCF_5Digit_Auto_Count, 
                                              "Postage": vm.statement.FP_ST_DSCF_5Digit_Auto_Postage});
                    vm.postageTotal_A += vm.statement.FP_ST_DSCF_5Digit_Auto_Postage;
                    vm.pieceTotal_A += vm.statement.FP_ST_DSCF_5Digit_Auto_Count;
                                              
                    vm.postageDetails_A.push({"PS3602": vm.statement.FP_ST_DSCF_3Digit_Auto_PS3602, 
                                              "Entry": vm.statement.FP_ST_DSCF_3Digit_Auto_Entry, 
                                              "Category": vm.statement.FP_ST_DSCF_3Digit_Auto_Category, 
                                              "Price": vm.statement.FP_ST_DSCF_3Digit_Auto_Price, 
                                              "Count": vm.statement.FP_ST_DSCF_3Digit_Auto_Count, 
                                              "Postage": vm.statement.FP_ST_DSCF_3Digit_Auto_Postage});
                    vm.postageTotal_A += vm.statement.FP_ST_DSCF_3Digit_Auto_Postage;
                    vm.pieceTotal_A += vm.statement.FP_ST_DSCF_3Digit_Auto_Count;
                    
                    vm.postageDetails_A.push({"PS3602": vm.statement.FP_ST_DSCF_AADC_Auto_PS3602, 
                                              "Entry": vm.statement.FP_ST_DSCF_AADC_Auto_Entry, 
                                              "Category": vm.statement.FP_ST_DSCF_AADC_Auto_Category, 
                                              "Price": vm.statement.FP_ST_DSCF_AADC_Auto_Price, 
                                              "Count": vm.statement.FP_ST_DSCF_AADC_Auto_Count, 
                                              "Postage": vm.statement.FP_ST_DSCF_AADC_Auto_Postage});
                    vm.postageTotal_A += vm.statement.FP_ST_DSCF_AADC_Auto_Postage;
                    vm.pieceTotal_A += vm.statement.FP_ST_DSCF_AADC_Auto_Count;
                                              
                    // Non-Auto [B]
                    vm.postageDetails_B.push({"PS3602": vm.statement.FP_ST_DSCF_AADC_NonAuto_PS3602, 
                                              "Entry": vm.statement.FP_ST_DSCF_AADC_NonAuto_Entry, 
                                              "Category": vm.statement.FP_ST_DSCF_AADC_NonAuto_Category, 
                                              "Price": vm.statement.FP_ST_DSCF_AADC_NonAuto_Price, 
                                              "Count": vm.statement.FP_ST_DSCF_AADC_NonAuto_Count, 
                                              "Postage": vm.statement.FP_ST_DSCF_AADC_NonAuto_Postage});
                    vm.postageTotal_B += vm.statement.FP_ST_DSCF_AADC_NonAuto_Postage;
                    vm.pieceTotal_B += vm.statement.FP_ST_DSCF_AADC_NonAuto_Count;
                                              
                   // GRAND TOTALS
                   vm.pieceTotal = vm.pieceTotal_A + vm.pieceTotal_B; 
                   vm.postageTotal = vm.postageTotal_A + vm.postageTotal_B;
                
                break;
                
                // ------------------------------------------------------------------------------------------- 
                // --------NON-PROFIT------------------------------------------------------------------------- 
                // ------------------------------------------------------------------------------------------- 
                
                // NON-PROFIT / PERMIT IMPRINT
                case "NP_PI":
                
                    vm.rateType = "Permit Imprint [NON-PROFIT]"
                    // -------------------------------------------------------------------------------------------
                    // NON-PROFIT/PERMIT/NONE
                    // Auto [A]
                    vm.postageDetails_A.push({"PS3602": vm.statement.NP_PI_NONE_5Digit_Auto_PS3602, 
                                              "Entry": vm.statement.NP_PI_NONE_5Digit_Auto_Entry, 
                                              "Category": vm.statement.NP_PI_NONE_5Digit_Auto_Category, 
                                              "Price": vm.statement.NP_PI_NONE_5Digit_Auto_Price, 
                                              "Count": vm.statement.NP_PI_NONE_5Digit_Auto_Count, 
                                              "Postage": vm.statement.NP_PI_NONE_5Digit_Auto_Postage});
                    vm.postageTotal_A += vm.statement.NP_PI_NONE_5Digit_Auto_Postage;
                    vm.pieceTotal_A += vm.statement.NP_PI_NONE_5Digit_Auto_Count;
                                              
                    vm.postageDetails_A.push({"PS3602": vm.statement.NP_PI_NONE_3Digit_Auto_PS3602, 
                                              "Entry": vm.statement.NP_PI_NONE_3Digit_Auto_Entry, 
                                              "Category": vm.statement.NP_PI_NONE_3Digit_Auto_Category, 
                                              "Price": vm.statement.NP_PI_NONE_3Digit_Auto_Price, 
                                              "Count": vm.statement.NP_PI_NONE_3Digit_Auto_Count, 
                                              "Postage": vm.statement.NP_PI_NONE_3Digit_Auto_Postage});
                    vm.postageTotal_A += vm.statement.NP_PI_NONE_3Digit_Auto_Postage;
                    vm.pieceTotal_A += vm.statement.NP_PI_NONE_3Digit_Auto_Count;
                    
                    vm.postageDetails_A.push({"PS3602": vm.statement.NP_PI_NONE_AADC_Auto_PS3602, 
                                              "Entry": vm.statement.NP_PI_NONE_AADC_Auto_Entry, 
                                              "Category": vm.statement.NP_PI_NONE_AADC_Auto_Category, 
                                              "Price": vm.statement.NP_PI_NONE_AADC_Auto_Price, 
                                              "Count": vm.statement.NP_PI_NONE_AADC_Auto_Count, 
                                              "Postage": vm.statement.NP_PI_NONE_AADC_Auto_Postage});
                    vm.postageTotal_A += vm.statement.NP_PI_NONE_AADC_Auto_Postage;
                    vm.pieceTotal_A += vm.statement.NP_PI_NONE_AADC_Auto_Count;
                                              
                    vm.postageDetails_A.push({"PS3602": vm.statement.NP_PI_NONE_MxdAADC_Auto_PS3602, 
                                              "Entry": vm.statement.NP_PI_NONE_MxdAADC_Auto_Entry, 
                                              "Category": vm.statement.NP_PI_NONE_MxdAADC_Auto_Category, 
                                              "Price": vm.statement.NP_PI_NONE_MxdAADC_Auto_Price, 
                                              "Count": vm.statement.NP_PI_NONE_MxdAADC_Auto_Count, 
                                              "Postage": vm.statement.NP_PI_NONE_MxdAADC_Auto_Postage});
                    vm.postageTotal_A += vm.statement.NP_PI_NONE_MxdAADC_Auto_Postage;
                    vm.pieceTotal_A += vm.statement.NP_PI_NONE_MxdAADC_Auto_Count;
                     
                    // Non-Auto [B]
                    vm.postageDetails_B.push({"PS3602": vm.statement.NP_PI_NONE_AADC_NonAuto_PS3602, 
                                              "Entry": vm.statement.NP_PI_NONE_AADC_NonAuto_Entry, 
                                              "Category": vm.statement.NP_PI_NONE_AADC_NonAuto_Category, 
                                              "Price": vm.statement.NP_PI_NONE_AADC_NonAuto_Price, 
                                              "Count": vm.statement.NP_PI_NONE_AADC_NonAuto_Count, 
                                              "Postage": vm.statement.NP_PI_NONE_AADC_NonAuto_Postage});
                    vm.postageTotal_B += vm.statement.NP_PI_NONE_AADC_NonAuto_Postage;
                    vm.pieceTotal_B += vm.statement.NP_PI_NONE_AADC_NonAuto_Count;
                                              
                    vm.postageDetails_B.push({"PS3602": vm.statement.NP_PI_NONE_MxdAADC_NonAuto_PS3602, 
                                              "Entry": vm.statement.NP_PI_NONE_MxdAADC_NonAuto_Entry, 
                                              "Category": vm.statement.NP_PI_NONE_MxdAADC_NonAuto_Category, 
                                              "Price": vm.statement.NP_PI_NONE_MxdAADC_NonAuto_Price, 
                                              "Count": vm.statement.NP_PI_NONE_MxdAADC_NonAuto_Count, 
                                              "Postage": vm.statement.NP_PI_NONE_MxdAADC_NonAuto_Postage});
                    vm.postageTotal_B += vm.statement.NP_PI_NONE_MxdAADC_NonAuto_Postage;
                    vm.pieceTotal_B += vm.statement.NP_PI_NONE_MxdAADC_NonAuto_Count;
                    
                    // -------------------------------------------------------------------------------------------                          
                    // NON-PROFIT/PERMIT/DNDC
                    // Auto [A]
                    vm.postageDetails_A.push({"PS3602": vm.statement.NP_PI_DNDC_5Digit_Auto_PS3602, 
                                              "Entry": vm.statement.NP_PI_DNDC_5Digit_Auto_Entry, 
                                              "Category": vm.statement.NP_PI_DNDC_5Digit_Auto_Category, 
                                              "Price": vm.statement.NP_PI_DNDC_5Digit_Auto_Price, 
                                              "Count": vm.statement.NP_PI_DNDC_5Digit_Auto_Count, 
                                              "Postage": vm.statement.NP_PI_DNDC_5Digit_Auto_Postage});
                    vm.postageTotal_A += vm.statement.NP_PI_DNDC_5Digit_Auto_Postage;
                    vm.pieceTotal_A += vm.statement.NP_PI_DNDC_5Digit_Auto_Count;
                                              
                    vm.postageDetails_A.push({"PS3602": vm.statement.NP_PI_DNDC_3Digit_Auto_PS3602, 
                                              "Entry": vm.statement.NP_PI_DNDC_3Digit_Auto_Entry, 
                                              "Category": vm.statement.NP_PI_DNDC_3Digit_Auto_Category, 
                                              "Price": vm.statement.NP_PI_DNDC_3Digit_Auto_Price, 
                                              "Count": vm.statement.NP_PI_DNDC_3Digit_Auto_Count, 
                                              "Postage": vm.statement.NP_PI_DNDC_3Digit_Auto_Postage});
                    vm.postageTotal_A += vm.statement.NP_PI_DNDC_3Digit_Auto_Postage;
                    vm.pieceTotal_A += vm.statement.NP_PI_DNDC_3Digit_Auto_Count;
                    
                    vm.postageDetails_A.push({"PS3602": vm.statement.NP_PI_DNDC_AADC_Auto_PS3602, 
                                              "Entry": vm.statement.NP_PI_DNDC_AADC_Auto_Entry, 
                                              "Category": vm.statement.NP_PI_DNDC_AADC_Auto_Category, 
                                              "Price": vm.statement.NP_PI_DNDC_AADC_Auto_Price, 
                                              "Count": vm.statement.NP_PI_DNDC_AADC_Auto_Count, 
                                              "Postage": vm.statement.NP_PI_DNDC_AADC_Auto_Postage});
                    vm.postageTotal_A += vm.statement.NP_PI_DNDC_AADC_Auto_Postage;
                    vm.pieceTotal_A += vm.statement.NP_PI_DNDC_AADC_Auto_Count;
                                              
                    vm.postageDetails_A.push({"PS3602": vm.statement.NP_PI_DNDC_MxdAADC_Auto_PS3602, 
                                              "Entry": vm.statement.NP_PI_DNDC_MxdAADC_Auto_Entry, 
                                              "Category": vm.statement.NP_PI_DNDC_MxdAADC_Auto_Category, 
                                              "Price": vm.statement.NP_PI_DNDC_MxdAADC_Auto_Price, 
                                              "Count": vm.statement.NP_PI_DNDC_MxdAADC_Auto_Count, 
                                              "Postage": vm.statement.NP_PI_DNDC_MxdAADC_Auto_Postage});
                    vm.postageTotal_A += vm.statement.NP_PI_DNDC_MxdAADC_Auto_Postage;
                    vm.pieceTotal_A += vm.statement.NP_PI_DNDC_MxdAADC_Auto_Count;
                    
                    // Non-Auto [B]
                    vm.postageDetails_B.push({"PS3602": vm.statement.NP_PI_DNDC_AADC_NonAuto_PS3602, 
                                              "Entry": vm.statement.NP_PI_DNDC_AADC_NonAuto_Entry, 
                                              "Category": vm.statement.NP_PI_DNDC_AADC_NonAuto_Category, 
                                              "Price": vm.statement.NP_PI_DNDC_AADC_NonAuto_Price, 
                                              "Count": vm.statement.NP_PI_DNDC_AADC_NonAuto_Count, 
                                              "Postage": vm.statement.NP_PI_DNDC_AADC_NonAuto_Postage});
                    vm.postageTotal_B += vm.statement.NP_PI_DNDC_AADC_NonAuto_Postage;
                    vm.pieceTotal_B += vm.statement.NP_PI_DNDC_AADC_NonAuto_Count;
                                              
                    vm.postageDetails_B.push({"PS3602": vm.statement.NP_PI_DNDC_MxdAADC_NonAuto_PS3602, 
                                              "Entry": vm.statement.NP_PI_DNDC_MxdAADC_NonAuto_Entry, 
                                              "Category": vm.statement.NP_PI_DNDC_MxdAADC_NonAuto_Category, 
                                              "Price": vm.statement.NP_PI_DNDC_MxdAADC_NonAuto_Price, 
                                              "Count": vm.statement.NP_PI_DNDC_MxdAADC_NonAuto_Count, 
                                              "Postage": vm.statement.NP_PI_DNDC_MxdAADC_NonAuto_Postage});
                    vm.postageTotal_B += vm.statement.NP_PI_DNDC_MxdAADC_NonAuto_Postage;
                    vm.pieceTotal_B += vm.statement.NP_PI_DNDC_MxdAADC_NonAuto_Count;
                    
                    // -------------------------------------------------------------------------------------------                         
                    // NON-PROFIT/PERMIT/DSCF
                    // Auto [A]
                    vm.postageDetails_A.push({"PS3602": vm.statement.NP_PI_DSCF_5Digit_Auto_PS3602, 
                                              "Entry": vm.statement.NP_PI_DSCF_5Digit_Auto_Entry, 
                                              "Category": vm.statement.NP_PI_DSCF_5Digit_Auto_Category, 
                                              "Price": vm.statement.NP_PI_DSCF_5Digit_Auto_Price, 
                                              "Count": vm.statement.NP_PI_DSCF_5Digit_Auto_Count, 
                                              "Postage": vm.statement.NP_PI_DSCF_5Digit_Auto_Postage});
                    vm.postageTotal_A += vm.statement.NP_PI_DSCF_5Digit_Auto_Postage;
                    vm.pieceTotal_A += vm.statement.NP_PI_DSCF_5Digit_Auto_Count;
                                              
                    vm.postageDetails_A.push({"PS3602": vm.statement.NP_PI_DSCF_3Digit_Auto_PS3602, 
                                              "Entry": vm.statement.NP_PI_DSCF_3Digit_Auto_Entry, 
                                              "Category": vm.statement.NP_PI_DSCF_3Digit_Auto_Category, 
                                              "Price": vm.statement.NP_PI_DSCF_3Digit_Auto_Price, 
                                              "Count": vm.statement.NP_PI_DSCF_3Digit_Auto_Count, 
                                              "Postage": vm.statement.NP_PI_DSCF_3Digit_Auto_Postage});
                    vm.postageTotal_A += vm.statement.NP_PI_DSCF_3Digit_Auto_Postage;
                    vm.pieceTotal_A += vm.statement.NP_PI_DSCF_3Digit_Auto_Count;
                    
                    vm.postageDetails_A.push({"PS3602": vm.statement.NP_PI_DSCF_AADC_Auto_PS3602, 
                                              "Entry": vm.statement.NP_PI_DSCF_AADC_Auto_Entry, 
                                              "Category": vm.statement.NP_PI_DSCF_AADC_Auto_Category, 
                                              "Price": vm.statement.NP_PI_DSCF_AADC_Auto_Price, 
                                              "Count": vm.statement.NP_PI_DSCF_AADC_Auto_Count, 
                                              "Postage": vm.statement.NP_PI_DSCF_AADC_Auto_Postage});
                   vm.postageTotal_A += vm.statement.NP_PI_DSCF_AADC_Auto_Postage;
                   vm.pieceTotal_A += vm.statement.NP_PI_DSCF_AADC_Auto_Count;
                   
                   // Non-Auto [B]
                   vm.postageDetails_B.push({"PS3602": vm.statement.NP_PI_DSCF_AADC_NonAuto_PS3602, 
                                              "Entry": vm.statement.NP_PI_DSCF_AADC_NonAuto_Entry, 
                                              "Category": vm.statement.NP_PI_DSCF_AADC_NonAuto_Category, 
                                              "Price": vm.statement.NP_PI_DSCF_AADC_NonAuto_Price, 
                                              "Count": vm.statement.NP_PI_DSCF_AADC_NonAuto_Count, 
                                              "Postage": vm.statement.NP_PI_DSCF_AADC_NonAuto_Postage});
                   vm.postageTotal_B += vm.statement.NP_PI_DSCF_AADC_NonAuto_Postage;
                   vm.pieceTotal_B += vm.statement.NP_PI_DSCF_AADC_NonAuto_Count;
                   
                   // GRAND TOTALS
                   vm.pieceTotal = vm.pieceTotal_A + vm.pieceTotal_B; 
                   vm.postageTotal = vm.postageTotal_A + vm.postageTotal_B;
                                        
                break;
                
                // -------------------------------------------------------------------------------------------
                // -------------------------------------------------------------------------------------------
                // NON-PROFIT / METER
                case "NP_MT":
                
                    // -------------------------------------------------------------------------------------------
                    // NON-PROFIT/METER/NONE
                    // Auto [A]
                    vm.postageDetails_A.push({"PS3602": vm.statement.NP_MT_NONE_5Digit_Auto_PS3602, 
                                              "Entry": vm.statement.NP_MT_NONE_5Digit_Auto_Entry, 
                                              "Category": vm.statement.NP_MT_NONE_5Digit_Auto_Category, 
                                              "Price": vm.statement.NP_MT_NONE_5Digit_Auto_Price, 
                                              "Count": vm.statement.NP_MT_NONE_5Digit_Auto_Count, 
                                              "Postage": vm.statement.NP_MT_NONE_5Digit_Auto_Postage});
                    vm.postageTotal_A += vm.statement.NP_MT_NONE_5Digit_Auto_Postage;
                    vm.pieceTotal_A += vm.statement.NP_MT_NONE_5Digit_Auto_Count;
                                              
                    vm.postageDetails_A.push({"PS3602": vm.statement.NP_MT_NONE_3Digit_Auto_PS3602, 
                                              "Entry": vm.statement.NP_MT_NONE_3Digit_Auto_Entry, 
                                              "Category": vm.statement.NP_MT_NONE_3Digit_Auto_Category, 
                                              "Price": vm.statement.NP_MT_NONE_3Digit_Auto_Price, 
                                              "Count": vm.statement.NP_MT_NONE_3Digit_Auto_Count, 
                                              "Postage": vm.statement.NP_MT_NONE_3Digit_Auto_Postage});
                    vm.postageTotal_A += vm.statement.NP_MT_NONE_3Digit_Auto_Postage;
                    vm.pieceTotal_A += vm.statement.NP_MT_NONE_3Digit_Auto_Count;
                    
                    vm.postageDetails_A.push({"PS3602": vm.statement.NP_MT_NONE_AADC_Auto_PS3602, 
                                              "Entry": vm.statement.NP_MT_NONE_AADC_Auto_Entry, 
                                              "Category": vm.statement.NP_MT_NONE_AADC_Auto_Category, 
                                              "Price": vm.statement.NP_MT_NONE_AADC_Auto_Price, 
                                              "Count": vm.statement.NP_MT_NONE_AADC_Auto_Count, 
                                              "Postage": vm.statement.NP_MT_NONE_AADC_Auto_Postage});
                    vm.postageTotal_A += vm.statement.NP_MT_NONE_AADC_Auto_Postage;
                    vm.pieceTotal_A += vm.statement.NP_MT_NONE_AADC_Auto_Count;
                                              
                    vm.postageDetails_A.push({"PS3602": vm.statement.NP_MT_NONE_MxdAADC_Auto_PS3602, 
                                              "Entry": vm.statement.NP_MT_NONE_MxdAADC_Auto_Entry, 
                                              "Category": vm.statement.NP_MT_MxdNONE_AADC_Auto_Category, 
                                              "Price": vm.statement.NP_MT_NONE_MxdAADC_Auto_Price, 
                                              "Count": vm.statement.NP_MT_NONE_MxdAADC_Auto_Count, 
                                              "Postage": vm.statement.NP_MT_NONE_MxdAADC_Auto_Postage});
                    vm.postageTotal_A += vm.statement.NP_MT_NONE_MxdAADC_Auto_Postage;
                    vm.pieceTotal_A += vm.statement.NP_MT_NONE_MxdAADC_Auto_Count;
                    
                    // Non-Auto [B]
                    vm.postageDetails_B.push({"PS3602": vm.statement.NP_MT_NONE_AADC_NonAuto_PS3602, 
                                              "Entry": vm.statement.NP_MT_NONE_AADC_NonAuto_Entry, 
                                              "Category": vm.statement.NP_MT_NONE_AADC_NonAuto_Category, 
                                              "Price": vm.statement.NP_MT_NONE_AADC_NonAuto_Price, 
                                              "Count": vm.statement.NP_MT_NONE_AADC_NonAuto_Count, 
                                              "Postage": vm.statement.NP_MT_NONE_AADC_NonAuto_Postage});
                    vm.postageTotal_B += vm.statement.NP_MT_NONE_AADC_NonAuto_Postage;
                    vm.pieceTotal_B += vm.statement.NP_MT_NONE_AADC_NonAuto_Count;
                                              
                    vm.postageDetails_B.push({"PS3602": vm.statement.NP_MT_NONE_MxdAADC_NonAuto_PS3602, 
                                              "Entry": vm.statement.NP_MT_NONE_MxdAADC_NonAuto_Entry, 
                                              "Category": vm.statement.NP_MT_MxdNONE_AADC_NonAuto_Category, 
                                              "Price": vm.statement.NP_MT_NONE_MxdAADC_NonAuto_Price, 
                                              "Count": vm.statement.NP_MT_NONE_MxdAADC_NonAuto_Count, 
                                              "Postage": vm.statement.NP_MT_NONE_MxdAADC_NonAuto_Postage});
                    vm.postageTotal_B += vm.statement.NP_MT_NONE_MxdAADC_NonAuto_Postage;
                    vm.pieceTotal_B += vm.statement.NP_MT_NONE_MxdAADC_NonAuto_Count;
                    
                    // -------------------------------------------------------------------------------------------
                    // NON-PROFIT/METER/DNDC
                    // Auto [A]
                    vm.postageDetails_A.push({"PS3602": vm.statement.NP_MT_DNDC_5Digit_Auto_PS3602, 
                                              "Entry": vm.statement.NP_MT_DNDC_5Digit_Auto_Entry, 
                                              "Category": vm.statement.NP_MT_DNDC_5Digit_Auto_Category, 
                                              "Price": vm.statement.NP_MT_DNDC_5Digit_Auto_Price, 
                                              "Count": vm.statement.NP_MT_DNDC_5Digit_Auto_Count, 
                                              "Postage": vm.statement.NP_MT_DNDC_5Digit_Auto_Postage});
                    vm.postageTotal_A += vm.statement.NP_MT_DNDC_5Digit_Auto_Postage;
                    vm.pieceTotal_A += vm.statement.NP_MT_DNDC_5Digit_Auto_Count;
                                              
                    vm.postageDetails_A.push({"PS3602": vm.statement.NP_MT_DNDC_3Digit_Auto_PS3602, 
                                              "Entry": vm.statement.NP_MT_DNDC_3Digit_Auto_Entry, 
                                              "Category": vm.statement.NP_MT_DNDC_3Digit_Auto_Category, 
                                              "Price": vm.statement.NP_MT_DNDC_3Digit_Auto_Price, 
                                              "Count": vm.statement.NP_MT_DNDC_3Digit_Auto_Count, 
                                              "Postage": vm.statement.NP_MT_DNDC_3Digit_Auto_Postage});
                    vm.postageTotal_A += vm.statement.NP_MT_DNDC_3Digit_Auto_Postage;
                    vm.pieceTotal_A += vm.statement.NP_MT_DNDC_3Digit_Auto_Count;
                    
                    vm.postageDetails_A.push({"PS3602": vm.statement.NP_MT_DNDC_AADC_Auto_PS3602, 
                                              "Entry": vm.statement.NP_MT_DNDC_AADC_Auto_Entry, 
                                              "Category": vm.statement.NP_MT_DNDC_AADC_Auto_Category, 
                                              "Price": vm.statement.NP_MT_DNDC_AADC_Auto_Price, 
                                              "Count": vm.statement.NP_MT_DNDC_AADC_Auto_Count, 
                                              "Postage": vm.statement.NP_MT_DNDC_AADC_Auto_Postage});
                    vm.postageTotal_A += vm.statement.NP_MT_DNDC_AADC_Auto_Postage;
                    vm.pieceTotal_A += vm.statement.NP_MT_DNDC_AADC_Auto_Count;
                                              
                    vm.postageDetails_A.push({"PS3602": vm.statement.NP_MT_DNDC_MxdAADC_Auto_PS3602, 
                                              "Entry": vm.statement.NP_MT_DNDC_MxdAADC_Auto_Entry, 
                                              "Category": vm.statement.NP_MT_DNDC_MxdNONE_AADC_Auto_Category, 
                                              "Price": vm.statement.NP_MT_DNDC_MxdAADC_Auto_Price, 
                                              "Count": vm.statement.NP_MT_DNDC_MxdAADC_Auto_Count, 
                                              "Postage": vm.statement.NP_MT_DNDC_MxdAADC_Auto_Postage});
                    vm.postageTotal_A += vm.statement.NP_MT_DNDC_MxdAADC_Auto_Postage;
                    vm.pieceTotal_A += vm.statement.NP_MT_DNDC_MxdAADC_Auto_Count;
                    
                    // Non-Auto [B]
                    vm.postageDetails_B.push({"PS3602": vm.statement.NP_MT_DNDC_AADC_NonAuto_PS3602, 
                                              "Entry": vm.statement.NP_MT_DNDC_AADC_NonAuto_Entry, 
                                              "Category": vm.statement.NP_MT_DNDC_AADC_NonAuto_Category, 
                                              "Price": vm.statement.NP_MT_DNDC_AADC_NonAuto_Price, 
                                              "Count": vm.statement.NP_MT_DNDC_AADC_NonAuto_Count, 
                                              "Postage": vm.statement.NP_MT_DNDC_AADC_NonAuto_Postage});
                    vm.postageTotal_B += vm.statement.NP_MT_DNDC_AADC_NonAuto_Postage;
                    vm.pieceTotal_B += vm.statement.NP_MT_DNDC_AADC_NonAuto_Count;
                                              
                    vm.postageDetails_B.push({"PS3602": vm.statement.NP_MT_DNDC_MxdAADC_NonAuto_PS3602, 
                                              "Entry": vm.statement.NP_MT_DNDC_MxdAADC_NonAuto_Entry, 
                                              "Category": vm.statement.NP_MT_DNDC_MxdNONE_NonAADC_Auto_Category, 
                                              "Price": vm.statement.NP_MT_DNDC_MxdAADC_NonAuto_Price, 
                                              "Count": vm.statement.NP_MT_DNDC_MxdAADC_NonAuto_Count, 
                                              "Postage": vm.statement.NP_MT_DNDC_MxdAADC_NonAuto_Postage});
                    vm.postageTotal_B += vm.statement.NP_MT_DNDC_MxdAADC_NonAuto_Postage;
                    vm.pieceTotal_B += vm.statement.NP_MT_DNDC_MxdAADC_NonAuto_Count;
                    
                    // -------------------------------------------------------------------------------------------                          
                    // NON-PROFIT/METER/DSCF
                    // Auto [A]
                    vm.postageDetails_A.push({"PS3602": vm.statement.NP_MT_DSCF_5Digit_Auto_PS3602, 
                                              "Entry": vm.statement.NP_MT_DSCF_5Digit_Auto_Entry, 
                                              "Category": vm.statement.NP_MT_DSCF_5Digit_Auto_Category, 
                                              "Price": vm.statement.NP_MT_DSCF_5Digit_Auto_Price, 
                                              "Count": vm.statement.NP_MT_DSCF_5Digit_Auto_Count, 
                                              "Postage": vm.statement.NP_MT_DSCF_5Digit_Auto_Postage});
                    vm.postageTotal_A += vm.statement.NP_MT_DSCF_5Digit_Auto_Postage;
                    vm.pieceTotal_A += vm.statement.NP_MT_DSCF_5Digit_Auto_Count;
                                              
                    vm.postageDetails_A.push({"PS3602": vm.statement.NP_MT_DSCF_3Digit_Auto_PS3602, 
                                              "Entry": vm.statement.NP_MT_DSCF_3Digit_Auto_Entry, 
                                              "Category": vm.statement.NP_MT_DSCF_3Digit_Auto_Category, 
                                              "Price": vm.statement.NP_MT_DSCF_3Digit_Auto_Price, 
                                              "Count": vm.statement.NP_MT_DSCF_3Digit_Auto_Count, 
                                              "Postage": vm.statement.NP_MT_DSCF_3Digit_Auto_Postage});
                    vm.postageTotal_A += vm.statement.NP_MT_DSCF_3Digit_Auto_Postage;
                    vm.pieceTotal_A += vm.statement.NP_MT_DSCF_3Digit_Auto_Count;
                    
                    vm.postageDetails_A.push({"PS3602": vm.statement.NP_MT_DSCF_AADC_Auto_PS3602, 
                                              "Entry": vm.statement.NP_MT_DSCF_AADC_Auto_Entry, 
                                              "Category": vm.statement.NP_MT_DSCF_AADC_Auto_Category, 
                                              "Price": vm.statement.NP_MT_DSCF_AADC_Auto_Price, 
                                              "Count": vm.statement.NP_MT_DSCF_AADC_Auto_Count, 
                                              "Postage": vm.statement.NP_MT_DSCF_AADC_Auto_Postage});
                    vm.postageTotal_A += vm.statement.NP_MT_DSCF_AADC_Auto_Postage;
                    vm.pieceTotal_A += vm.statement.NP_MT_DSCF_AADC_Auto_Count;      
                
                    // Non-Auto [B]
                    vm.postageDetails_B.push({"PS3602": vm.statement.NP_MT_DSCF_AADC_NonAuto_PS3602, 
                                              "Entry": vm.statement.NP_MT_DSCF_AADC_NonAuto_Entry, 
                                              "Category": vm.statement.NP_MT_DSCF_AADC_NonAuto_Category, 
                                              "Price": vm.statement.NP_MT_DSCF_AADC_NonAuto_Price, 
                                              "Count": vm.statement.NP_MT_DSCF_AADC_NonAuto_Count, 
                                              "Postage": vm.statement.NP_MT_DSCF_AADC_NonAuto_Postage});
                   vm.postageTotal_B += vm.statement.NP_MT_DSCF_AADC_NonAuto_Postage;
                   vm.pieceTotal_B += vm.statement.NP_MT_DSCF_AADC_NonAuto_Count;      
                
                   // GRAND TOTALS
                   vm.pieceTotal = vm.pieceTotal_A + vm.pieceTotal_B; 
                   vm.postageTotal = vm.postageTotal_A + vm.postageTotal_B;
                   
                break;
                
                // ------------------------------------------------------------------------------------------- 
                // ------------------------------------------------------------------------------------------- 
                // NON-PROFIT STAMP
                case "NP_ST":
                    // ------------------------------------------------------------------------------------------- 
                    // NON-PROFIT/STAMP/NONE
                    // Auto [A]
                    vm.postageDetails_A.push({"PS3602": vm.statement.NP_ST_NONE_5Digit_Auto_PS3602, 
                                              "Entry": vm.statement.NP_ST_NONE_5Digit_Auto_Entry, 
                                              "Category": vm.statement.NP_ST_NONE_5Digit_Auto_Category, 
                                              "Price": vm.statement.NP_ST_NONE_5Digit_Auto_Price, 
                                              "Count": vm.statement.NP_ST_NONE_5Digit_Auto_Count, 
                                              "Postage": vm.statement.NP_ST_NONE_5Digit_Auto_Postage});
                    vm.postageTotal_A += vm.statement.NP_ST_NONE_5Digit_Auto_Postage;
                    vm.pieceTotal_A += vm.statement.NP_ST_NONE_5Digit_Auto_Count;
                                              
                    vm.postageDetails_A.push({"PS3602": vm.statement.NP_ST_NONE_3Digit_Auto_PS3602, 
                                              "Entry": vm.statement.NP_ST_NONE_3Digit_Auto_Entry, 
                                              "Category": vm.statement.NP_ST_NONE_3Digit_Auto_Category, 
                                              "Price": vm.statement.NP_ST_NONE_3Digit_Auto_Price, 
                                              "Count": vm.statement.NP_ST_NONE_3Digit_Auto_Count, 
                                              "Postage": vm.statement.NP_ST_NONE_3Digit_Auto_Postage});
                    vm.postageTotal_A += vm.statement.NP_ST_NONE_3Digit_Auto_Postage;
                    vm.pieceTotal_A += vm.statement.NP_ST_NONE_3Digit_Auto_Count;
                    
                    vm.postageDetails_A.push({"PS3602": vm.statement.NP_ST_NONE_AADC_Auto_PS3602, 
                                              "Entry": vm.statement.NP_ST_NONE_AADC_Auto_Entry, 
                                              "Category": vm.statement.NP_ST_NONE_AADC_Auto_Category, 
                                              "Price": vm.statement.NP_ST_NONE_AADC_Auto_Price, 
                                              "Count": vm.statement.NP_ST_NONE_AADC_Auto_Count, 
                                              "Postage": vm.statement.NP_ST_NONE_AADC_Auto_Postage});
                    vm.postageTotal_A += vm.statement.NP_ST_NONE_AADC_Auto_Postage;
                    vm.pieceTotal_A += vm.statement.NP_ST_NONE_AADC_Auto_Count;
                                              
                    vm.postageDetails_A.push({"PS3602": vm.statement.NP_ST_NONE_MxdAADC_Auto_PS3602, 
                                              "Entry": vm.statement.NP_ST_NONE_MxdAADC_Auto_Entry, 
                                              "Category": vm.statement.NP_ST_MxdNONE_AADC_Auto_Category, 
                                              "Price": vm.statement.NP_ST_NONE_MxdAADC_Auto_Price, 
                                              "Count": vm.statement.NP_ST_NONE_MxdAADC_Auto_Count, 
                                              "Postage": vm.statement.NP_ST_NONE_MxdAADC_Auto_Postage});
                    vm.postageTotal_A += vm.statement.NP_ST_NONE_MxdAADC_Auto_Postage;
                    vm.pieceTotal_A += vm.statement.NP_ST_NONE_MxdAADC_Auto_Count;
                    
                    // Non-Auto [B]
                    vm.postageDetails_B.push({"PS3602": vm.statement.NP_ST_NONE_AADC_NonAuto_PS3602, 
                                              "Entry": vm.statement.NP_ST_NONE_AADC_NonAuto_Entry, 
                                              "Category": vm.statement.NP_ST_NONE_AADC_NonAuto_Category, 
                                              "Price": vm.statement.NP_ST_NONE_AADC_NonAuto_Price, 
                                              "Count": vm.statement.NP_ST_NONE_AADC_NonAuto_Count, 
                                              "Postage": vm.statement.NP_ST_NONE_AADC_NonAuto_Postage});
                    vm.postageTotal_B += vm.statement.NP_ST_NONE_AADC_NonAuto_Postage;
                    vm.pieceTotal_B += vm.statement.NP_ST_NONE_AADC_NonAuto_Count;
                                              
                    vm.postageDetails_B.push({"PS3602": vm.statement.NP_ST_NONE_MxdAADC_NonAuto_PS3602, 
                                              "Entry": vm.statement.NP_ST_NONE_MxdAADC_NonAuto_Entry, 
                                              "Category": vm.statement.NP_ST_NONE_MxdNONE_NonAADC_Auto_Category, 
                                              "Price": vm.statement.NP_ST_NONE_MxdAADC_NonAuto_Price, 
                                              "Count": vm.statement.NP_ST_NONE_MxdAADC_NonAuto_Count, 
                                              "Postage": vm.statement.NP_ST_NONE_MxdAADC_NonAuto_Postage});
                    vm.postageTotal_B += vm.statement.NP_ST_NONE_MxdAADC_NonAuto_Postage;
                    vm.pieceTotal_B += vm.statement.NP_ST_NONE_MxdAADC_NonAuto_Count;
                    
                    // -------------------------------------------------------------------------------------------   
                    // NON-PROFIT/STAMP/DNDC
                    // Auto [A]
                    vm.postageDetails_A.push({"PS3602": vm.statement.NP_ST_DNDC_5Digit_Auto_PS3602, 
                                              "Entry": vm.statement.NP_ST_DNDC_5Digit_Auto_Entry, 
                                              "Category": vm.statement.NP_ST_DNDC_5Digit_Auto_Category, 
                                              "Price": vm.statement.NP_ST_DNDC_5Digit_Auto_Price, 
                                              "Count": vm.statement.NP_ST_DNDC_5Digit_Auto_Count, 
                                              "Postage": vm.statement.NP_ST_DNDC_5Digit_Auto_Postage});
                    vm.postageTotal_A += vm.statement.NP_ST_DNDC_5Digit_Auto_Postage;
                    vm.pieceTotal_A += vm.statement.NP_ST_DNDC_5Digit_Auto_Count;
                                              
                    vm.postageDetails_A.push({"PS3602": vm.statement.NP_ST_DNDC_3Digit_Auto_PS3602, 
                                              "Entry": vm.statement.NP_ST_DNDC_3Digit_Auto_Entry, 
                                              "Category": vm.statement.NP_ST_DNDC_3Digit_Auto_Category, 
                                              "Price": vm.statement.NP_ST_DNDC_3Digit_Auto_Price, 
                                              "Count": vm.statement.NP_ST_DNDC_3Digit_Auto_Count, 
                                              "Postage": vm.statement.NP_ST_DNDC_3Digit_Auto_Postage});
                    vm.postageTotal_A += vm.statement.NP_ST_DNDC_3Digit_Auto_Postage;
                    vm.pieceTotal_A += vm.statement.NP_ST_DNDC_3Digit_Auto_Count;
                    
                    vm.postageDetails_A.push({"PS3602": vm.statement.NP_ST_DNDC_AADC_Auto_PS3602, 
                                              "Entry": vm.statement.NP_ST_DNDC_AADC_Auto_Entry, 
                                              "Category": vm.statement.NP_ST_DNDC_AADC_Auto_Category, 
                                              "Price": vm.statement.NP_ST_DNDC_AADC_Auto_Price, 
                                              "Count": vm.statement.NP_ST_DNDC_AADC_Auto_Count, 
                                              "Postage": vm.statement.NP_ST_DNDC_AADC_Auto_Postage});
                    vm.postageTotal_A += vm.statement.NP_ST_DNDC_AADC_Auto_Postage;
                    vm.pieceTotal_A += vm.statement.NP_ST_DNDC_AADC_Auto_Count;
                                              
                    vm.postageDetails_A.push({"PS3602": vm.statement.NP_ST_DNDC_MxdAADC_Auto_PS3602, 
                                              "Entry": vm.statement.NP_ST_DNDC_MxdAADC_Auto_Entry, 
                                              "Category": vm.statement.NP_ST_DNDC_MxdNONE_AADC_Auto_Category, 
                                              "Price": vm.statement.NP_ST_DNDC_MxdAADC_Auto_Price, 
                                              "Count": vm.statement.NP_ST_DNDC_MxdAADC_Auto_Count, 
                                              "Postage": vm.statement.NP_ST_DNDC_MxdAADC_Auto_Postage});
                    vm.postageTotal_A += vm.statement.NP_ST_DNDC_MxdAADC_Auto_Postage;
                    vm.pieceTotal_A += vm.statement.NP_ST_DNDC_MxdAADC_Auto_Count;
                    
                    // Non-Auto [B]
                    vm.postageDetails_B.push({"PS3602": vm.statement.NP_ST_DNDC_AADC_NonAuto_PS3602, 
                                              "Entry": vm.statement.NP_ST_DNDC_AADC_NonAuto_Entry, 
                                              "Category": vm.statement.NP_ST_DNDC_AADC_NonAuto_Category, 
                                              "Price": vm.statement.NP_ST_DNDC_AADC_NonAuto_Price, 
                                              "Count": vm.statement.NP_ST_DNDC_AADC_NonAuto_Count, 
                                              "Postage": vm.statement.NP_ST_DNDC_AADC_NonAuto_Postage});
                    vm.postageTotal_B += vm.statement.NP_ST_DNDC_AADC_NonAuto_Postage;
                    vm.pieceTotal_B += vm.statement.NP_ST_DNDC_AADC_NonAuto_Count;
                                              
                    vm.postageDetails_B.push({"PS3602": vm.statement.NP_ST_DNDC_MxdAADC_NonAuto_PS3602, 
                                              "Entry": vm.statement.NP_ST_DNDC_MxdAADC_NonAuto_Entry, 
                                              "Category": vm.statement.NP_ST_DNDC_MxdNONE_NonAADC_Auto_Category, 
                                              "Price": vm.statement.NP_ST_DNDC_MxdAADC_NonAuto_Price, 
                                              "Count": vm.statement.NP_ST_DNDC_MxdAADC_NonAuto_Count, 
                                              "Postage": vm.statement.NP_ST_DNDC_MxdAADC_NonAuto_Postage});
                    vm.postageTotal_B += vm.statement.NP_ST_DNDC_MxdAADC_NonAuto_Postage;
                    vm.pieceTotal_B += vm.statement.NP_ST_DNDC_MxdAADC_NonAuto_Count;
                    
                    // -------------------------------------------------------------------------------------------                           
                    // NON-PROFIT/STAMP/DSCF
                    // Auto [A]
                    vm.postageDetails_A.push({"PS3602": vm.statement.NP_ST_DSCF_5Digit_Auto_PS3602, 
                                              "Entry": vm.statement.NP_ST_DSCF_5Digit_Auto_Entry, 
                                              "Category": vm.statement.NP_ST_DSCF_5Digit_Auto_Category, 
                                              "Price": vm.statement.NP_ST_DSCF_5Digit_Auto_Price, 
                                              "Count": vm.statement.NP_ST_DSCF_5Digit_Auto_Count, 
                                              "Postage": vm.statement.NP_ST_DSCF_5Digit_Auto_Postage});
                    vm.postageTotal_A += vm.statement.NP_ST_DSCF_5Digit_Auto_Postage;
                    vm.pieceTotal_A += vm.statement.NP_ST_DSCF_5Digit_Auto_Count;
                                              
                    vm.postageDetails_A.push({"PS3602": vm.statement.NP_ST_DSCF_3Digit_Auto_PS3602, 
                                              "Entry": vm.statement.NP_ST_DSCF_3Digit_Auto_Entry, 
                                              "Category": vm.statement.NP_ST_DSCF_3Digit_Auto_Category, 
                                              "Price": vm.statement.NP_ST_DSCF_3Digit_Auto_Price, 
                                              "Count": vm.statement.NP_ST_DSCF_3Digit_Auto_Count, 
                                              "Postage": vm.statement.NP_ST_DSCF_3Digit_Auto_Postage});
                    vm.postageTotal_A += vm.statement.NP_ST_DSCF_3Digit_Auto_Postage;
                    vm.pieceTotal_A += vm.statement.NP_ST_DSCF_3Digit_Auto_Count;
                    
                    vm.postageDetails_A.push({"PS3602": vm.statement.NP_ST_DSCF_AADC_Auto_PS3602, 
                                              "Entry": vm.statement.NP_ST_DSCF_AADC_Auto_Entry, 
                                              "Category": vm.statement.NP_ST_DSCF_AADC_Auto_Category, 
                                              "Price": vm.statement.NP_ST_DSCF_AADC_Auto_Price, 
                                              "Count": vm.statement.NP_ST_DSCF_AADC_Auto_Count, 
                                              "Postage": vm.statement.NP_ST_DSCF_AADC_Auto_Postage});
                    vm.postageTotal_A += vm.statement.NP_ST_DSCF_AADC_Auto_Postage;
                    vm.pieceTotal_A += vm.statement.NP_ST_DSCF_AADC_Auto_Count;
                                              
                    // Non-Auto [B]
                    vm.postageDetails_B.push({"PS3602": vm.statement.NP_ST_DSCF_AADC_NonAuto_PS3602, 
                                              "Entry": vm.statement.NP_ST_DSCF_AADC_NonAuto_Entry, 
                                              "Category": vm.statement.NP_ST_DSCF_AADC_NonAuto_Category, 
                                              "Price": vm.statement.NP_ST_DSCF_AADC_NonAuto_Price, 
                                              "Count": vm.statement.NP_ST_DSCF_AADC_NonAuto_Count, 
                                              "Postage": vm.statement.NP_ST_DSCF_AADC_NonAuto_Postage});
                    vm.postageTotal_B += vm.statement.NP_ST_DSCF_AADC_NonAuto_Postage;
                    vm.pieceTotal_B += vm.statement.NP_ST_DSCF_AADC_NonAuto_Count;
                                              
                   // GRAND TOTALS
                   vm.pieceTotal = vm.pieceTotal_A + vm.pieceTotal_B; 
                   vm.postageTotal = vm.postageTotal_A + vm.postageTotal_B;
                
                break;
            }
            
        }
        
	}
    
})();