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
               
        // generate PDF version of eDoc Statement (using pdfMake library)
        vm.createPDF = function () {
            // define the document layout
            var docDefinition = {
                // PDF meta data
                info: {
                    title: 'EMS EPOP eDoc Statement',
                    author: 'Executive Mailing Service',
                    subject: 'EPOP',
                    keywords: 'EPOP eDoc Statement 3602',
                },
                // PDF Page content
                content: [
                    { text: 'EPOP eDoc Statement: ' + vm.statement.Statement_ID, style: 'header' },
                    { columns: [
                       {
                            width: '15%',
                            stack:[
                                { text: 'System ID: ' },
                                { text: 'Mail Date: ' },
                                { text: 'Description: ' },
                                { text: '  ' }
                            ]
                        },
                        {
                            width: '85%',
                            stack:[
                                { text: vm.statement.id },
                                { text: vm.mailDate, bold: true },
                                { text: vm.statement.Description, bold: true },
                                { text: '  ' }
                            ]
                        }
                    ],
                        columnGap: 1
                    },  
                    { canvas: [
                            {
                                type: 'line',
                                x1: 0,
                                y1: 5,
                                x2: 535,
                                y2: 5,
                                lineWidth: 0.5
                            }
                        ]
                    },
                    { text: '  ' },                  
                    { columns: [
                       {
                            width: '33%',
                            stack:[
                                { text: 'PERMIT HOLDER:', bold: true, underline: true }, 
                                { text: vm.statement.PermitHolderName},
                                { text: vm.statement.PermitHolderAddress1},
                                { text: vm.statement.PermitHolderAddress2},
                                { text: vm.statement.PermitHolderCity + ', ' + vm.statement.PermitHolderState + ' ' + vm.statement.PermitHolderZipCode},
                                { text: vm.statement.PermitHolderPhone}
                            ]
                        },
                        {
                            width: '33%',
                            stack:[
                                { text: 'MAIL PREPARER:', bold: true }, 
                                { text: vm.statement.MailPreparerName},
                                { text: vm.statement.MailPreparerAddress1},
                                { text: vm.statement.MailPreparerAddress2},
                                { text: vm.statement.MailPreparerCity + ', ' + vm.statement.MailPreparerState + ' ' + vm.statement.MailPreparerZipCode},
                                { text: vm.statement.MailPreparerPhone}
                            ]
                        },
                        {
                            width: '33%',
                            stack:[
                                { text: 'MAIL OWNER:', bold: true }, 
                                { text: vm.statement.MailOwnerName},
                                { text: vm.statement.MailOwnerAddress1},
                                { text: vm.statement.MailOwnerAddress2},
                                { text: vm.statement.MailOwnerCity + ', ' + vm.statement.MailOwnerState + ' ' + vm.statement.MailOwnerZipCode},
                                { text: vm.statement.MailOwnerPhone}
                            ]
                        }
                    ],                    
                        columnGap: 10
                    },
                    { text: '  ' },
                    { canvas: [
                            {
                                type: 'line',
                                x1: 0,
                                y1: 5,
                                x2: 535,
                                y2: 5,
                                lineWidth: 0.5
                            }
                        ]
                    },
                    { text: '  ' },
                    { text: 'POSTAGE SUMMARY', bold: true },
                    { columns: [
                       {
                            width: '60%',
                            stack:[
                                { text: ' ' },
                                { text: 'Standard Mail Letters', bold: true },
                                { text: 'Type of Postage: ' + vm.rateType}
                            ]
                        },
                        {
                            width: '20%',
                            stack:[
                                { text: ' ' }, 
                                { text: 'Total Pieces: ' },
                                { text: 'Total Postage: ' }
                            ]
                        },
                        {
                            width: '20%',
                            stack:[
                                { text: ' ' }, 
                                { text: vm.numberFormat(vm.pieceTotal), bold: true },
                                { text: vm.currencyFormat(vm.postageTotal), bold: true }
                            ]
                        }
                    ],
                        columnGap: 10
                    },
                    { text: ' '},
                    { columns: [
                       {
                            width: '*',
                            stack:[
                                { text: 'Part A', bold: true },
                                { text: 'Automation Letters - 3.3 oz (0.2063 lbs.) or less', fontSize: 8 }
                            ]
                        },
                        {
                            width: '*',
                            stack:[
                                { text: ' ' }
                            ]
                        }
                    ],
                        columnGap: 1
                    },
                    { table: {
                            // headers are automatically repeated if the table spans over multiple pages
                            // you can declare how many rows should be treated as headers
                            headerRows: 1,
                            widths: [ '*', '*', '*', '*', '*', '*' ],
                    
                            body: buildPartABody() 
                        }
                    },
                    { text: ' '},
                    { columns: [
                       {
                            width: '*',
                            stack:[
                                { text: 'Part B', bold: true },
                                { text: 'Non-Automation Letters - 3.3 oz (0.2063 lbs.) or less', fontSize: 8 }
                            ]
                        },
                        {
                            width: '*',
                            stack:[
                                { text: ' ' }
                            ]
                        }
                    ],
                        columnGap: 1
                    },
                    { table: {
                            // headers are automatically repeated if the table spans over multiple pages
                            // you can declare how many rows should be treated as headers
                            headerRows: 1,
                            widths: [ '*', '*', '*', '*', '*', '*' ],
                    
                            body: buildPartBBody() 
                        }
                    },
                    
                    
                ],
                
                // PDF Page footer
                footer: { 
                    columns: [
                        /*{ text: function(currentPage, pageCount) { return currentPage.toString() + ' of ' + pageCount; }, alignment: 'right'}*/
                        { text: '2016 - Executive Mailing Service', alignment: 'center' }
                    ],
                },
                
                // Global Document styles 
                styles: {
                    header: {
                        fontSize: 22,
                        bold: true
                    },
                }
            };
            
            // generate PDF output
            pdfMake.createPdf(docDefinition).open();

        };
               
        // populate the Postage Count Table with the dymanic content
        function buildPartABody(){
            var header = [ 
                { text: '-', bold: true }, 
                { text: 'Entry', bold: true }, 
                { text: 'Price Category', bold: true }, 
                { text: 'Price', bold: true }, 
                { text: '# of Pieces', bold: true }, 
                { text: 'Postage', bold: true }
            ];
            
            var body = [];
            
            var footer = [ 
                { text: ' ', bold: true }, 
                { text: ' ', bold: true }, 
                { text: ' ', bold: true }, 
                { text: 'TOTALS', bold: true }, 
                { text: vm.numberFormat(vm.pieceTotal_A), bold: true }, 
                { text: vm.currencyFormat(vm.postageTotal_A), bold: true }
            ];
            
            body.push(header);
            for (var i = 0; i < vm.postageDetails_A_Filtered.length; i++) {
                body.push 
                (
                    [
                        vm.postageDetails_A_Filtered[i].PS3602, 
                        vm.postageDetails_A_Filtered[i].Entry,
                        vm.postageDetails_A_Filtered[i].Category,
                        vm.currencyFormat(vm.postageDetails_A_Filtered[i].Price),
                        vm.numberFormat(vm.postageDetails_A_Filtered[i].Count), 
                        vm.currencyFormat(vm.postageDetails_A_Filtered[i].Postage)
                    ]
                );
            }
            body.push(footer);
            logger.log('pdfMake Postage Part A body: ' + JSON.stringify(body));
            return body;
        }
        //
        function buildPartBBody(){
            var header = [ 
                { text: '-', bold: true }, 
                { text: 'Entry', bold: true }, 
                { text: 'Price Category', bold: true }, 
                { text: 'Price', bold: true }, 
                { text: '# of Pieces', bold: true }, 
                { text: 'Postage', bold: true }
            ];
            
            var body = [];
            
            var footer = [ 
                { text: ' ', bold: true }, 
                { text: ' ', bold: true }, 
                { text: ' ', bold: true }, 
                { text: 'TOTALS', bold: true }, 
                { text: vm.numberFormat(vm.pieceTotal_B), bold: true }, 
                { text: vm.currencyFormat(vm.postageTotal_B), bold: true }
            ];
            
            body.push(header);
            for (var i = 0; i < vm.postageDetails_B_Filtered.length; i++) {
                body.push 
                (
                    [
                        vm.postageDetails_B_Filtered[i].PS3602, 
                        vm.postageDetails_B_Filtered[i].Entry,
                        vm.postageDetails_B_Filtered[i].Category,
                        vm.currencyFormat(vm.postageDetails_B_Filtered[i].Price),
                        vm.numberFormat(vm.postageDetails_B_Filtered[i].Count), 
                        vm.currencyFormat(vm.postageDetails_B_Filtered[i].Postage)
                    ]
                );
            }
            body.push(footer);
            logger.log('pdfMake Postage Part B body: ' + JSON.stringify(body));
            return body;
        }
            
        
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