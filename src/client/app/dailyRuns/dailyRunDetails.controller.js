/* jshint -W109, -W101, -W064, -W064, -W116, -W033, -W106, -W109, -W117, -W032, -W014, -W027, -W033 */
(function () {
    'use strict';
    
    /**
     * @class app.dailyRunDetails
     * @memberOf app
     * 
     * @description
     *
     * The `dailyRunDetails` module provides details for a given Daily EPOP Run.
     * 
     * @requires
     *   
     * lbServices (Loopback API service)
     *
     */   
    angular
        .module('app.dailyRunDetails', ['lbServices'])
        /**
         * @ngdoc controller
         * @name app.dailyRunDetails.controller:DailyRunDetailsController
         * @param {object} logger: Internal Logging Object
         * @param {object} $scope: Angular Scope
         * @param {object} $timeout: Angular timming
         * @param {object} $http: Angular http client
         * @param {object} $q: Angular Asyncronus 
         * @param {object} EDocStatement: eDoc Statement
         * @param {object} $stateParams: Routing information
         * 
         * @description
         * 
         * Controller for DailyRunDetails View
         * 
         */
        .controller('DailyRunDetailsController', DailyRunDetailsController);

    DailyRunDetailsController.$inject = ['logger', '$scope', '$timeout', '$http',  '$q', 'EDocStatement', '$stateParams'];
    
    /* @ngInject */
    function DailyRunDetailsController(logger, $scope, $timeout, $http, $q, EDocStatement, $stateParams) {
        // establish view model
        var vm = this;
        
        // work variables (internal)
        var promises = void[];          // storage for the asyncronous function list (for $q)
        
        var currentDate = new Date();
        //
        var statementType ="";
        
        // view model properties
        vm.title = 'Daily Run Details';
        vm.dailyRun = {};
        vm.dailyRuns = [];
        vm.dailyRunId = $scope.dailyRun.dailyID;    // passed in via root scope
        vm.dailyRunDate = $scope.dailyRun.mailDate; // passed in via root scope
        vm.statements = [];
        vm.statement = {};
        
        // storage for statement-related data
        vm.mailDate = "";
        vm.rateType = "";
        vm.statementType ="";
        vm.statementCount = 0;
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
        vm.netPostage = 0;
        vm.rateTypeStyle = "";
        
        // current full service discount (standard class mail)
        var fullServiceDiscount = 0.001;
        
        // work variables used for managing the sort order of statements in the View
        vm.order = "Statement_ID";
        vm.sortStatement = true;
        vm.sortDescription = false;
        vm.setOrder = function(order){
            vm.order = order;
            vm.sortStatement = !vm.sortStatement;
            vm.sortDescription = !vm.sortDescription;
        };
        
        /**
         * @ngdoc method
         * @name numberFormat
         * @methodOf app.dailyRunDetails.controller:DailyRunDetailsController
         * @return {string} number: formatted number w/ comma's
         * @description
         * 
         * format numbers (piece counts) w/ comma's (numeralJS library)
         */
        vm.numberFormat = function(number){
            return numeral(number).format('0,0');
        };
        
        /**
         * @ngdoc method
         * @name numberFormat
         * @methodOf app.dailyRunDetails.controller:DailyRunDetailsController
         * @return {string} number: the number formatted as money
         * 
         * @description
         * 
         * format numbers (postage) as money (numeralJS library)
         */ 
        vm.currencyFormat = function(number){
            return numeral(number).format('$0,0.000');
        };
        
        /**
         * @ngdoc method
         * @name dateFormat
         * @methodOf app.dailyRunDetails.controller:DailyRunDetailsController
         * @param {string} date: the input date string (yyyymmdd)
         * @return {string} date: the formatted date in MM/DD/YYYY format
         * @description
         * 
         * format Dates
         */ 
        vm.dateFormat = function(date){
            var refmtDate = date.substring(0,4) + "-" + date.substring(4,6) + "-" + date.substring(6,8);
            return moment(refmtDate).format('MM/DD/YYYY');
        };
               
        /**
         * @ngdoc method
         * @name createPDF
         * @methodOf app.dailyRunDetails.controller:DailyRunDetailsController
         * @description
         * 
         * Generate a detailed PDF report of the selected Daily Run
         */
        vm.createPDF = function(){
            // define the document layout
            var docDefinition = {
                // PDF meta data
                pageOrientation: 'landscape',
                info: {
                    title:    'EMS EPOP Daily Run Detail Report : ' + vm.statement.Daily_ID,
                    author:   'Executive Mailing Service - EPOP Backend Client',
                    subject:  'EPOP Backend Client - EPOP Full Service Daily Run PDF',
                    keywords: 'EPOP eDoc Statement Daily Run Full Service',
                },
                // PDF Page content
                header:
                    { text: '\nEPOP Daily Full Service Run Report - USPS PostalOne Contingency Document', bold: true, alignment: 'center' },
                content: [
                    { text: ' '},
                    { columns: [
                       {
                            width: '15%',
                            stack:[  
                                { text: 'Mail Date: ' },
                                { text: 'Description: ' },
                                { text: ' '},
                                { text: 'Statement Count: ' }
                            ]
                        },
                        {
                            width: '85%',
                            stack:[
                                { text: vm.dateFormat(vm.dailyRunDate), bold: true },
                                { text: vm.dailyRunId, bold: true },
                                { text: ' '},
                                { text: vm.numberFormat(vm.statementCount), bold: true }
                            ]
                        }
                    ],
                        columnGap: 1
                    },
                    { text: '  ' },
                    { canvas: [
                            {
                                type: 'line',
                                x1: 0,
                                y1: 5,
                                x2: 770,
                                y2: 5,
                                lineWidth: 0.5
                            }
                        ]
                    },
                    { text: ' '},
                    { table: {
                            // headers are automatically repeated if the table spans over multiple pages
                            // you can declare how many rows should be treated as headers
                            headerRows: 1,
                            widths: [ '15%', '8%', '*', '12%', '15%', '10%' ],
                            body: buildBody() 
                        }
                    },
                    { text: ' '}
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
                    color: {
                        fontSize: 14,
                        color: "red"
                    },
                }
            }
            
            // generate PDF output (from document definition object)
            /*logger.log("docDefinition: " + JSON.stringify(docDefinition));*/
            pdfMake.createPdf(docDefinition).open();           
        };
        
        activate();
        /**
         * @ngdoc method
         * @name activate 
         * @methodOf app.dailyRunDetails.controller:DailyRunDetailsController
         * @description 
         * 
         * Initialize the view
         */
        function activate() {
            vm.dailyRunId = $scope.dailyRun.dailyID;
            vm.dailyRunDate = $scope.dailyRun.mailDate;
            promises = [getEDocStatements()];
            return $q.all(promises).then(function() {
                vm.dailyRuns = $scope.dailyRuns;
                /*logger.log("Daily Runs: " + JSON.stringify(vm.dailyRuns))
                logger.info('Activated Daily Run Details View');*/
            });
        }
        
        /**
         * @ngdoc method
         * @name getDailyRun
         * @methodOf app.dailyRunDetails.controller:DailyRunDetailsController
         * @description 
         * 
         * Get the selected Daily Run
         */
        function getDailyRun(){
            /*console.log("ID: " + $scope.dailyRun.dailyID);
            console.log("Date " + $scope.dailyRun.mailDate);*/
            for (var i = 0; i < vm.dailyRuns.length; i++){
                if ((vm.dailyRuns[i].Daily_ID == $scope.dailyRun.dailyID) && (vm.dailyRuns[i].MailDate == $scope.dailyRun.mailDate)){
                    dailyRun = vm.dailyRuns[i];
                    return;
                }
            }    
        }
        
        /**
         * @ngdoc method
         * @name buildBody
         * @methodOf app.dailyRunDetails.controller:DailyRunDetailsController
         * @return {object} body: the report body as a JSON object
         * @description 
         * 
         * Build details for report table
         */
        function buildBody(){
            var header = [
                { text: 'Statement ID', bold: true }, 
                { text: 'Permit #', bold: true },
                { text: 'Description', bold: true }, 
                { text: 'Total Pieces', bold: true }, 
                { text: 'Total Postage', bold: true }, 
                { text: 'eInduction (Y/N)', bold: true }, 
            ];
            
            // storage for statement detail table body content
            var body = [];
            
            var footer = [ 
                { text: '-', bold: true },
                { text: '-', bold: true },
                { text: 'TOTALS:', bold: true }, 
                { text: vm.numberFormat(vm.pieceTotal), bold: true }, 
                { text: vm.currencyFormat(vm.postageTotal), bold: true },
                { text: '-', bold: true }
            ];
            
            // add table header, statement details, & footer
            body.push(header);
            for (var i = 0; i < vm.statements.length; i++) {
                body.push 
                (
                    [
                        vm.statements[i].Statement_ID,
                        vm.statements[i].PermitNumber,
                        vm.statements[i].Description, 
                        vm.numberFormat(vm.statements[i].TotalPieceCount),
                        vm.currencyFormat(vm.statements[i].TotalPostage),
                        "N"
                    ]
                );
            }
            body.push(footer);
            /*logger.log('pdfMake Postage Part A body: ' + JSON.stringify(body));*/
            return body;
        }
        
        /**
         * @ngdoc method
         * @name sortBy 
         * @methodOf app.dailyRunDetails.controller:DailyRunDetailsController
         * @description 
         * 
         * generic JSON Array sort helper function
         * source/reference: http://stackoverflow.com/questions/11099610/generic-way-of-sorting-json-array-by-attribute
         */
        function sortBy(prop) {
            return function(a, b){
                if( a[prop] > b[prop]){
                    return 1;
                }else if( a[prop] < b[prop]){
                    return -1;
                }
                return 0;
            }
        }
        
        /**
         * @ngdoc method
         * @name getEDocStatements 
         * @methodOf app.dailyRunDetails.controller:DailyRunDetailsController
         * @description 
         * 
         * get statements matching the Daily ID and Mail Date
         */
        function getEDocStatements() {
            getDailyRun();
            /*console.log("daily run ID: " + $scope.dailyRun.dailyID);
            console.log("Mail Date: " + $scope.dailyRun.mailDate);*/
            vm.statements = [];
            EDocStatement.find({ filter: { where: { and: [{ Daily_ID: $scope.dailyRun.dailyID }, { MailDate: $scope.dailyRun.mailDate }] } } },
                function(result) {
                    vm.statements = result;
                    vm.statementCount = vm.statements.length;
                    // sort the statements by id
                    vm.statements.sort(sortBy("Statement_ID"));
                    // sum the counts and postage
                    vm.pieceTotal = 0;
                    vm.postageTotal = 0;
                    for (var i = 0; i < vm.statements.length; i++) {
                        vm.pieceTotal += vm.statements[i].TotalPieceCount;
                        vm.postageTotal += vm.statements[i].TotalPostage;
                    }
                    // append accordion group status to each statement
                    for (i = 0; i < vm.statements.length; i++) {
                        vm.statements[i].accordionGroupStatus = {
                            open: false
                        };  
                    }
                    // append Postage Details to each statement object
                    for (i = 0; i < vm.statements.length; i++) {
                        vm.statements[i] = getPostageDetails(vm.statements[i]);
                        // get filtered counts (greater than 0 pieces)
                        vm.statements[i].postageDetails_A_Filtered = vm.statements[i].postageDetails_A.filter(function(el){
                            return el.Count > 0;
                        });
                        vm.statements[i].postageDetails_B_Filtered = vm.statements[i].postageDetails_B.filter(function(el){
                            return el.Count > 0;
                        });
                        
                        // set the rate type color per EMS EPOP Color Scheme
                        logger.log("Statement Rate Type: " + vm.statements[i].statementType);
                        switch(vm.statements[i].statementType)
                        {               
                            // PROFIT / PERMIT IMPRINT
                            case "FP_PI":
                                vm.statements[i].rateTypeStyle = {"background-color": "#00ff00", "color": "#3b3535"};
                            break;
                            // PROFIT / METER
                            case "FP_MT":
                                vm.statements[i].rateTypeStyle = {"background-color": "#00ffff", "color": "#3b3535"};
                            break;
                            // PROFIT / STAMP
                            case "FP_ST":
                                vm.statements[i].rateTypeStyle = {"background-color": "#ff9900", "color": "#3b3535"};
                            break;
                            // NON-PROFIT / PERMIT IMPRINT
                            case "NP_PI":
                                vm.statements[i].rateTypeStyle = {"background-color": "#ffff00", "color": "#3b3535"};
                            break;
                            // NON-PROFIT / METER
                            case "NP_MT":
                                vm.statements[i].rateTypeStyle = {"background-color": "#ff00ff", "color": "#3b3535"};
                            break;
                            // NON-PROFIT / STAMP                     
                            case "NP_ST":
                                vm.statements[i].rateTypeStyle = {"background-color": "#cc99ff", "color": "#3b3535"};
                            break;
                            default:
                                vm.statements[i].rateTypeStyle = {"background-color": "red", "color": "#3b3535"};
                        }  
                    
                        // compute Net Postage
                        var discount = fullServiceDiscount * vm.statements[i].FullServicePieceCount;
                        logger.log("Full Service Discount: " + discount);
                        vm.statements[i].netPostage = vm.statements[i].postageTotal - discount;
                        logger.log("Net Postage: " + vm.statements[i].netPostage);
                        
                        console.log("appended statement: " + JSON.stringify(vm.statements[i]));
                    }
                    
                    /*console.log("status: " + JSON.stringify(vm.statements[1].accordionGroupStatus)); */
                    logger.log("Statement count: " + vm.statements.length);
                });
        }
        
        /**
         * @ngdoc method
         * @name getPostageDetails 
         * @methodOf app.dailyRunDetails.controller:DailyRunDetailsController
         * @param {statement} statement object containing the statement details
         * @desription 
         * 
         * build postage details
         */
        function getPostageDetails(statement){
            // store the statement object
            vm.statement = {};
            vm.statement = statement;
            /*console.log("statement detail: " + JSON.stringify(statement));*/
            // determine the type of statement (only counts for 1 statement type will be populated in the eDoc statement object)
            
            // For Profit
            if (vm.statement.FP_PI_PieceCount > 0){
                vm.statement.statementType = "FP_PI";
            }
            if (vm.statement.FP_MT_PieceCount > 0){
                vm.statement.statementType = "FP_MT";
            }
            if (vm.statement.FP_ST_PieceCount > 0){
                vm.statement.statementType = "FP_ST";
            }
            
            // Non-Profit
            if (vm.statement.NP_PI_PieceCount > 0){
                vm.statement.statementType = "NP_PI";
            }
            if (vm.statement.NP_MT_PieceCount > 0){
                vm.statement.statementType = "NP_MT";
            }
            if (vm.statement.NP_ST_PieceCount > 0){
                vm.statement.statementType = "NP_ST";
            }
            
            logger.log("Statement Type: " + vm.statement.statementType);
            
            // collect statement counts for display (based on the determined statement type)
            vm.statement.postageDetails_A = [];
            vm.statement.postageDetails_B = [];
            vm.statement.pieceTotal_A = 0;
            vm.statement.pieceTotal_B = 0;
            vm.statement.postageTotal_A = 0;
            vm.statement.postageTotal_B = 0;
            vm.statement.pieceTotal = 0;
            vm.statement.postageTotal = 0;
            //
            switch(vm.statement.statementType)
            {
                // ------------------------------------------------------------------------------------------- 
                // FOR-PROFIT
                // ------------------------------------------------------------------------------------------- 
                
                // PROFIT / PERMIT IMPRINT
                case "FP_PI":
                
                    vm.statement.rateType = "Permit Imprint [For Profit]"
                    // -------------------------------------------------------------------------------------------
                    // PROFIT/PERMIT/NONE
                    // Auto [A]
                    vm.statement.postageDetails_A.push({"PS3602": vm.statement.FP_PI_NONE_5Digit_Auto_PS3602, 
                                              "Entry": vm.statement.FP_PI_NONE_5Digit_Auto_Entry, 
                                              "Category": vm.statement.FP_PI_NONE_5Digit_Auto_Category, 
                                              "Price": vm.statement.FP_PI_NONE_5Digit_Auto_Price, 
                                              "Count": vm.statement.FP_PI_NONE_5Digit_Auto_Count, 
                                              "Postage": vm.statement.FP_PI_NONE_5Digit_Auto_Postage});
                    vm.statement.postageTotal_A += vm.statement.FP_PI_NONE_5Digit_Auto_Postage;
                    vm.statement.pieceTotal_A += vm.statement.FP_PI_NONE_5Digit_Auto_Count;
                                              
                    vm.statement.postageDetails_A.push({"PS3602": vm.statement.FP_PI_NONE_3Digit_Auto_PS3602, 
                                              "Entry": vm.statement.FP_PI_NONE_3Digit_Auto_Entry, 
                                              "Category": vm.statement.FP_PI_NONE_3Digit_Auto_Category, 
                                              "Price": vm.statement.FP_PI_NONE_3Digit_Auto_Price, 
                                              "Count": vm.statement.FP_PI_NONE_3Digit_Auto_Count, 
                                              "Postage": vm.statement.FP_PI_NONE_3Digit_Auto_Postage});
                    vm.statement.postageTotal_A += vm.statement.FP_PI_NONE_3Digit_Auto_Postage;
                    vm.statement.pieceTotal_A += vm.statement.FP_PI_NONE_3Digit_Auto_Count;
                    
                    vm.statement.postageDetails_A.push({"PS3602": vm.statement.FP_PI_NONE_AADC_Auto_PS3602, 
                                              "Entry": vm.statement.FP_PI_NONE_AADC_Auto_Entry, 
                                              "Category": vm.statement.FP_PI_NONE_AADC_Auto_Category, 
                                              "Price": vm.statement.FP_PI_NONE_AADC_Auto_Price, 
                                              "Count": vm.statement.FP_PI_NONE_AADC_Auto_Count, 
                                              "Postage": vm.statement.FP_PI_NONE_AADC_Auto_Postage});
                    vm.statement.postageTotal_A += vm.statement.FP_PI_NONE_AADC_Auto_Postage;
                    vm.statement.pieceTotal_A += vm.statement.FP_PI_NONE_AADC_Auto_Count;
                                              
                    vm.statement.postageDetails_A.push({"PS3602": vm.statement.FP_PI_NONE_MxdAADC_Auto_PS3602, 
                                              "Entry": vm.statement.FP_PI_NONE_MxdAADC_Auto_Entry, 
                                              "Category": vm.statement.FP_PI_NONE_MxdAADC_Auto_Category, 
                                              "Price": vm.statement.FP_PI_NONE_MxdAADC_Auto_Price, 
                                              "Count": vm.statement.FP_PI_NONE_MxdAADC_Auto_Count, 
                                              "Postage": vm.statement.FP_PI_NONE_MxdAADC_Auto_Postage});
                    vm.statement.postageTotal_A += vm.statement.FP_PI_NONE_MxdAADC_Auto_Postage;
                    vm.statement.pieceTotal_A += vm.statement.FP_PI_NONE_MxdAADC_Auto_Count;
                     
                    // Non-Auto [B]
                    vm.statement.postageDetails_B.push({"PS3602": vm.statement.FP_PI_NONE_AADC_NonAuto_PS3602, 
                                              "Entry": vm.statement.FP_PI_NONE_AADC_NonAuto_Entry, 
                                              "Category": vm.statement.FP_PI_NONE_AADC_NonAuto_Category, 
                                              "Price": vm.statement.FP_PI_NONE_AADC_NonAuto_Price, 
                                              "Count": vm.statement.FP_PI_NONE_AADC_NonAuto_Count, 
                                              "Postage": vm.statement.FP_PI_NONE_AADC_NonAuto_Postage});
                    vm.statement.postageTotal_B += vm.statement.FP_PI_NONE_AADC_NonAuto_Postage;
                    vm.statement.pieceTotal_B += vm.statement.FP_PI_NONE_AADC_NonAuto_Count;
                                              
                    vm.statement.postageDetails_B.push({"PS3602": vm.statement.FP_PI_NONE_MxdAADC_NonAuto_PS3602, 
                                              "Entry": vm.statement.FP_PI_NONE_MxdAADC_NonAuto_Entry, 
                                              "Category": vm.statement.FP_PI_NONE_MxdAADC_NonAuto_Category, 
                                              "Price": vm.statement.FP_PI_NONE_MxdAADC_NonAuto_Price, 
                                              "Count": vm.statement.FP_PI_NONE_MxdAADC_NonAuto_Count, 
                                              "Postage": vm.statement.FP_PI_NONE_MxdAADC_NonAuto_Postage});
                    vm.statement.postageTotal_B += vm.statement.FP_PI_NONE_MxdAADC_NonAuto_Postage;
                    vm.statement.pieceTotal_B += vm.statement.FP_PI_NONE_MxdAADC_NonAuto_Count;
                    
                    // -------------------------------------------------------------------------------------------                          
                    // PROFIT/PERMIT/DNDC
                    // Auto [A]
                    vm.statement.postageDetails_A.push({"PS3602": vm.statement.FP_PI_DNDC_5Digit_Auto_PS3602, 
                                              "Entry": vm.statement.FP_PI_DNDC_5Digit_Auto_Entry, 
                                              "Category": vm.statement.FP_PI_DNDC_5Digit_Auto_Category, 
                                              "Price": vm.statement.FP_PI_DNDC_5Digit_Auto_Price, 
                                              "Count": vm.statement.FP_PI_DNDC_5Digit_Auto_Count, 
                                              "Postage": vm.statement.FP_PI_DNDC_5Digit_Auto_Postage});
                    vm.statement.postageTotal_A += vm.statement.FP_PI_DNDC_5Digit_Auto_Postage;
                    vm.statement.pieceTotal_A += vm.statement.FP_PI_DNDC_5Digit_Auto_Count;
                                              
                    vm.statement.postageDetails_A.push({"PS3602": vm.statement.FP_PI_DNDC_3Digit_Auto_PS3602, 
                                              "Entry": vm.statement.FP_PI_DNDC_3Digit_Auto_Entry, 
                                              "Category": vm.statement.FP_PI_DNDC_3Digit_Auto_Category, 
                                              "Price": vm.statement.FP_PI_DNDC_3Digit_Auto_Price, 
                                              "Count": vm.statement.FP_PI_DNDC_3Digit_Auto_Count, 
                                              "Postage": vm.statement.FP_PI_DNDC_3Digit_Auto_Postage});
                    vm.statement.postageTotal_A += vm.statement.FP_PI_DNDC_3Digit_Auto_Postage;
                    vm.statement.pieceTotal_A += vm.statement.FP_PI_DNDC_3Digit_Auto_Count;
                    
                    vm.statement.postageDetails_A.push({"PS3602": vm.statement.FP_PI_DNDC_AADC_Auto_PS3602, 
                                              "Entry": vm.statement.FP_PI_DNDC_AADC_Auto_Entry, 
                                              "Category": vm.statement.FP_PI_DNDC_AADC_Auto_Category, 
                                              "Price": vm.statement.FP_PI_DNDC_AADC_Auto_Price, 
                                              "Count": vm.statement.FP_PI_DNDC_AADC_Auto_Count, 
                                              "Postage": vm.statement.FP_PI_DNDC_AADC_Auto_Postage});
                    vm.statement.postageTotal_A += vm.statement.FP_PI_DNDC_AADC_Auto_Postage;
                    vm.statement.pieceTotal_A += vm.statement.FP_PI_DNDC_AADC_Auto_Count;
                                              
                    vm.statement.postageDetails_A.push({"PS3602": vm.statement.FP_PI_DNDC_MxdAADC_Auto_PS3602, 
                                              "Entry": vm.statement.FP_PI_DNDC_MxdAADC_Auto_Entry, 
                                              "Category": vm.statement.FP_PI_DNDC_MxdAADC_Auto_Category, 
                                              "Price": vm.statement.FP_PI_DNDC_MxdAADC_Auto_Price, 
                                              "Count": vm.statement.FP_PI_DNDC_MxdAADC_Auto_Count, 
                                              "Postage": vm.statement.FP_PI_DNDC_MxdAADC_Auto_Postage});
                    vm.statement.postageTotal_A += vm.statement.FP_PI_DNDC_MxdAADC_Auto_Postage;
                    vm.statement.pieceTotal_A += vm.statement.FP_PI_DNDC_MxdAADC_Auto_Count;
                    
                    // Non-Auto [B]
                    vm.statement.postageDetails_B.push({"PS3602": vm.statement.FP_PI_DNDC_AADC_NonAuto_PS3602, 
                                              "Entry": vm.statement.FP_PI_DNDC_AADC_NonAuto_Entry, 
                                              "Category": vm.statement.FP_PI_DNDC_AADC_NonAuto_Category, 
                                              "Price": vm.statement.FP_PI_DNDC_AADC_NonAuto_Price, 
                                              "Count": vm.statement.FP_PI_DNDC_AADC_NonAuto_Count, 
                                              "Postage": vm.statement.FP_PI_DNDC_AADC_NonAuto_Postage});
                    vm.statement.postageTotal_B += vm.statement.FP_PI_DNDC_AADC_NonAuto_Postage;
                    vm.statement.pieceTotal_B += vm.statement.FP_PI_DNDC_AADC_NonAuto_Count;
                                              
                    vm.statement.postageDetails_B.push({"PS3602": vm.statement.FP_PI_DNDC_MxdAADC_NonAuto_PS3602, 
                                              "Entry": vm.statement.FP_PI_DNDC_MxdAADC_NonAuto_Entry, 
                                              "Category": vm.statement.FP_PI_DNDC_MxdAADC_NonAuto_Category, 
                                              "Price": vm.statement.FP_PI_DNDC_MxdAADC_NonAuto_Price, 
                                              "Count": vm.statement.FP_PI_DNDC_MxdAADC_NonAuto_Count, 
                                              "Postage": vm.statement.FP_PI_DNDC_MxdAADC_NonAuto_Postage});
                    vm.statement.postageTotal_B += vm.statement.FP_PI_DNDC_MxdAADC_NonAuto_Postage;
                    vm.statement.pieceTotal_B += vm.statement.FP_PI_DNDC_MxdAADC_NonAuto_Count;
                    
                    // -------------------------------------------------------------------------------------------                         
                    // PROFIT/PERMIT/DSCF
                    // Auto [A]
                    vm.statement.postageDetails_A.push({"PS3602": vm.statement.FP_PI_DSCF_5Digit_Auto_PS3602, 
                                              "Entry": vm.statement.FP_PI_DSCF_5Digit_Auto_Entry, 
                                              "Category": vm.statement.FP_PI_DSCF_5Digit_Auto_Category, 
                                              "Price": vm.statement.FP_PI_DSCF_5Digit_Auto_Price, 
                                              "Count": vm.statement.FP_PI_DSCF_5Digit_Auto_Count, 
                                              "Postage": vm.statement.FP_PI_DSCF_5Digit_Auto_Postage});
                    vm.statement.postageTotal_A += vm.statement.FP_PI_DSCF_5Digit_Auto_Postage;
                    vm.statement.pieceTotal_A += vm.statement.FP_PI_DSCF_5Digit_Auto_Count;
                                              
                    vm.statement.postageDetails_A.push({"PS3602": vm.statement.FP_PI_DSCF_3Digit_Auto_PS3602, 
                                              "Entry": vm.statement.FP_PI_DSCF_3Digit_Auto_Entry, 
                                              "Category": vm.statement.FP_PI_DSCF_3Digit_Auto_Category, 
                                              "Price": vm.statement.FP_PI_DSCF_3Digit_Auto_Price, 
                                              "Count": vm.statement.FP_PI_DSCF_3Digit_Auto_Count, 
                                              "Postage": vm.statement.FP_PI_DSCF_3Digit_Auto_Postage});
                    vm.statement.postageTotal_A += vm.statement.FP_PI_DSCF_3Digit_Auto_Postage;
                    vm.statement.pieceTotal_A += vm.statement.FP_PI_DSCF_3Digit_Auto_Count;
                    
                    vm.statement.postageDetails_A.push({"PS3602": vm.statement.FP_PI_DSCF_AADC_Auto_PS3602, 
                                              "Entry": vm.statement.FP_PI_DSCF_AADC_Auto_Entry, 
                                              "Category": vm.statement.FP_PI_DSCF_AADC_Auto_Category, 
                                              "Price": vm.statement.FP_PI_DSCF_AADC_Auto_Price, 
                                              "Count": vm.statement.FP_PI_DSCF_AADC_Auto_Count, 
                                              "Postage": vm.statement.FP_PI_DSCF_AADC_Auto_Postage});
                   vm.statement.postageTotal_A += vm.statement.FP_PI_DSCF_AADC_Auto_Postage;
                   vm.statement.pieceTotal_A += vm.statement.FP_PI_DSCF_AADC_Auto_Count;
                   
                   // Non-Auto [B]
                   vm.statement.postageDetails_B.push({"PS3602": vm.statement.FP_PI_DSCF_AADC_NonAuto_PS3602, 
                                              "Entry": vm.statement.FP_PI_DSCF_AADC_NonAuto_Entry, 
                                              "Category": vm.statement.FP_PI_DSCF_AADC_NonAuto_Category, 
                                              "Price": vm.statement.FP_PI_DSCF_AADC_NonAuto_Price, 
                                              "Count": vm.statement.FP_PI_DSCF_AADC_NonAuto_Count, 
                                              "Postage": vm.statement.FP_PI_DSCF_AADC_NonAuto_Postage});
                   vm.statement.postageTotal_B += vm.statement.FP_PI_DSCF_AADC_NonAuto_Postage;
                   vm.statement.pieceTotal_B += vm.statement.FP_PI_DSCF_AADC_NonAuto_Count;
                   
                   // GRAND TOTALS
                   vm.statement.pieceTotal = vm.statement.pieceTotal_A + vm.statement.pieceTotal_B; 
                   vm.statement.postageTotal = vm.statement.postageTotal_A + vm.statement.postageTotal_B;
                                        
                break;
                
                // -------------------------------------------------------------------------------------------
                // -------------------------------------------------------------------------------------------
                // PROFIT / METER
                case "FP_MT":
                    vm.statement.rateType = "Meter [For Profit]"
                    // -------------------------------------------------------------------------------------------
                    // PROFIT/METER/NONE
                    // Auto [A]
                    vm.statement.postageDetails_A.push({"PS3602": vm.statement.FP_MT_NONE_5Digit_Auto_PS3602, 
                                              "Entry": vm.statement.FP_MT_NONE_5Digit_Auto_Entry, 
                                              "Category": vm.statement.FP_MT_NONE_5Digit_Auto_Category, 
                                              "Price": vm.statement.FP_MT_NONE_5Digit_Auto_Price, 
                                              "Count": vm.statement.FP_MT_NONE_5Digit_Auto_Count, 
                                              "Postage": vm.statement.FP_MT_NONE_5Digit_Auto_Postage});
                    vm.statement.postageTotal_A += vm.statement.FP_MT_NONE_5Digit_Auto_Postage;
                    vm.statement.pieceTotal_A += vm.statement.FP_MT_NONE_5Digit_Auto_Count;
                                              
                    vm.statement.postageDetails_A.push({"PS3602": vm.statement.FP_MT_NONE_3Digit_Auto_PS3602, 
                                              "Entry": vm.statement.FP_MT_NONE_3Digit_Auto_Entry, 
                                              "Category": vm.statement.FP_MT_NONE_3Digit_Auto_Category, 
                                              "Price": vm.statement.FP_MT_NONE_3Digit_Auto_Price, 
                                              "Count": vm.statement.FP_MT_NONE_3Digit_Auto_Count, 
                                              "Postage": vm.statement.FP_MT_NONE_3Digit_Auto_Postage});
                    vm.statement.postageTotal_A += vm.statement.FP_MT_NONE_3Digit_Auto_Postage;
                    vm.statement.pieceTotal_A += vm.statement.FP_MT_NONE_3Digit_Auto_Count;
                    
                    vm.statement.postageDetails_A.push({"PS3602": vm.statement.FP_MT_NONE_AADC_Auto_PS3602, 
                                              "Entry": vm.statement.FP_MT_NONE_AADC_Auto_Entry, 
                                              "Category": vm.statement.FP_MT_NONE_AADC_Auto_Category, 
                                              "Price": vm.statement.FP_MT_NONE_AADC_Auto_Price, 
                                              "Count": vm.statement.FP_MT_NONE_AADC_Auto_Count, 
                                              "Postage": vm.statement.FP_MT_NONE_AADC_Auto_Postage});
                    vm.statement.postageTotal_A += vm.statement.FP_MT_NONE_AADC_Auto_Postage;
                    vm.statement.pieceTotal_A += vm.statement.FP_MT_NONE_AADC_Auto_Count;
                                              
                    vm.statement.postageDetails_A.push({"PS3602": vm.statement.FP_MT_NONE_MxdAADC_Auto_PS3602, 
                                              "Entry": vm.statement.FP_MT_NONE_MxdAADC_Auto_Entry, 
                                              "Category": vm.statement.FP_MT_NONE_MxdAADC_Auto_Category, 
                                              "Price": vm.statement.FP_MT_NONE_MxdAADC_Auto_Price, 
                                              "Count": vm.statement.FP_MT_NONE_MxdAADC_Auto_Count, 
                                              "Postage": vm.statement.FP_MT_NONE_MxdAADC_Auto_Postage});
                    vm.statement.postageTotal_A += vm.statement.FP_MT_NONE_MxdAADC_Auto_Postage;
                    vm.statement.pieceTotal_A += vm.statement.FP_MT_NONE_MxdAADC_Auto_Count;
                    
                    // Non-Auto [B]
                    vm.statement.postageDetails_B.push({"PS3602": vm.statement.FP_MT_NONE_AADC_NonAuto_PS3602, 
                                              "Entry": vm.statement.FP_MT_NONE_AADC_NonAuto_Entry, 
                                              "Category": vm.statement.FP_MT_NONE_AADC_NonAuto_Category, 
                                              "Price": vm.statement.FP_MT_NONE_AADC_NonAuto_Price, 
                                              "Count": vm.statement.FP_MT_NONE_AADC_NonAuto_Count, 
                                              "Postage": vm.statement.FP_MT_NONE_AADC_NonAuto_Postage});
                    vm.statement.postageTotal_B += vm.statement.FP_MT_NONE_AADC_NonAuto_Postage;
                    vm.statement.pieceTotal_B += vm.statement.FP_MT_NONE_AADC_NonAuto_Count;
                                              
                    vm.statement.postageDetails_B.push({"PS3602": vm.statement.FP_MT_NONE_MxdAADC_NonAuto_PS3602, 
                                              "Entry": vm.statement.FP_MT_NONE_MxdAADC_NonAuto_Entry, 
                                              "Category": vm.statement.FP_MT_NONE_MxdAADC_NonAuto_Category, 
                                              "Price": vm.statement.FP_MT_NONE_MxdAADC_NonAuto_Price, 
                                              "Count": vm.statement.FP_MT_NONE_MxdAADC_NonAuto_Count, 
                                              "Postage": vm.statement.FP_MT_NONE_MxdAADC_NonAuto_Postage});
                    vm.statement.postageTotal_B += vm.statement.FP_MT_NONE_MxdAADC_NonAuto_Postage;
                    vm.statement.pieceTotal_B += vm.statement.FP_MT_NONE_MxdAADC_NonAuto_Count;
                    
                    // -------------------------------------------------------------------------------------------
                    // PROFIT/METER/DNDC
                    // Auto [A]
                    vm.statement.postageDetails_A.push({"PS3602": vm.statement.FP_MT_DNDC_5Digit_Auto_PS3602, 
                                              "Entry": vm.statement.FP_MT_DNDC_5Digit_Auto_Entry, 
                                              "Category": vm.statement.FP_MT_DNDC_5Digit_Auto_Category, 
                                              "Price": vm.statement.FP_MT_DNDC_5Digit_Auto_Price, 
                                              "Count": vm.statement.FP_MT_DNDC_5Digit_Auto_Count, 
                                              "Postage": vm.statement.FP_MT_DNDC_5Digit_Auto_Postage});
                    vm.statement.postageTotal_A += vm.statement.FP_MT_DNDC_5Digit_Auto_Postage;
                    vm.statement.pieceTotal_A += vm.statement.FP_MT_DNDC_5Digit_Auto_Count;
                                              
                    vm.statement.postageDetails_A.push({"PS3602": vm.statement.FP_MT_DNDC_3Digit_Auto_PS3602, 
                                              "Entry": vm.statement.FP_MT_DNDC_3Digit_Auto_Entry, 
                                              "Category": vm.statement.FP_MT_DNDC_3Digit_Auto_Category, 
                                              "Price": vm.statement.FP_MT_DNDC_3Digit_Auto_Price, 
                                              "Count": vm.statement.FP_MT_DNDC_3Digit_Auto_Count, 
                                              "Postage": vm.statement.FP_MT_DNDC_3Digit_Auto_Postage});
                    vm.statement.postageTotal_A += vm.statement.FP_MT_DNDC_3Digit_Auto_Postage;
                    vm.statement.pieceTotal_A += vm.statement.FP_MT_DNDC_3Digit_Auto_Count;
                    
                    vm.statement.postageDetails_A.push({"PS3602": vm.statement.FP_MT_DNDC_AADC_Auto_PS3602, 
                                              "Entry": vm.statement.FP_MT_DNDC_AADC_Auto_Entry, 
                                              "Category": vm.statement.FP_MT_DNDC_AADC_Auto_Category, 
                                              "Price": vm.statement.FP_MT_DNDC_AADC_Auto_Price, 
                                              "Count": vm.statement.FP_MT_DNDC_AADC_Auto_Count, 
                                              "Postage": vm.statement.FP_MT_DNDC_AADC_Auto_Postage});
                    vm.statement.postageTotal_A += vm.statement.FP_MT_DNDC_AADC_Auto_Postage;
                    vm.statement.pieceTotal_A += vm.statement.FP_MT_DNDC_AADC_Auto_Count;
                                              
                    vm.statement.postageDetails_A.push({"PS3602": vm.statement.FP_MT_DNDC_MxdAADC_Auto_PS3602, 
                                              "Entry": vm.statement.FP_MT_DNDC_MxdAADC_Auto_Entry, 
                                              "Category": vm.statement.FP_MT_DNDC_NONE_MxdAADC_Auto_Category, 
                                              "Price": vm.statement.FP_MT_DNDC_MxdAADC_Auto_Price, 
                                              "Count": vm.statement.FP_MT_DNDC_MxdAADC_Auto_Count, 
                                              "Postage": vm.statement.FP_MT_DNDC_MxdAADC_Auto_Postage});
                    vm.statement.postageTotal_A += vm.statement.FP_MT_DNDC_MxdAADC_Auto_Postage;
                    vm.statement.pieceTotal_A += vm.statement.FP_MT_DNDC_MxdAADC_Auto_Count;
                    
                    // Non-Auto [B]
                    vm.statement.postageDetails_B.push({"PS3602": vm.statement.FP_MT_DNDC_AADC_NonAuto_PS3602, 
                                              "Entry": vm.statement.FP_MT_DNDC_AADC_NonAuto_Entry, 
                                              "Category": vm.statement.FP_MT_DNDC_AADC_NonAuto_Category, 
                                              "Price": vm.statement.FP_MT_DNDC_AADC_NonAuto_Price, 
                                              "Count": vm.statement.FP_MT_DNDC_AADC_NonAuto_Count, 
                                              "Postage": vm.statement.FP_MT_DNDC_AADC_NonAuto_Postage});
                    vm.statement.postageTotal_B += vm.statement.FP_MT_DNDC_AADC_NonAuto_Postage;
                    vm.statement.pieceTotal_B += vm.statement.FP_MT_DNDC_AADC_NonAuto_Count;
                                              
                    vm.statement.postageDetails_B.push({"PS3602": vm.statement.FP_MT_DNDC_MxdAADC_NonAuto_PS3602, 
                                              "Entry": vm.statement.FP_MT_DNDC_MxdAADC_NonAuto_Entry, 
                                              "Category": vm.statement.FP_MT_DNDC_MxdAADC_NonAuto_Category, 
                                              "Price": vm.statement.FP_MT_DNDC_MxdAADC_NonAuto_Price, 
                                              "Count": vm.statement.FP_MT_DNDC_MxdAADC_NonAuto_Count, 
                                              "Postage": vm.statement.FP_MT_DNDC_MxdAADC_NonAuto_Postage});
                    vm.statement.postageTotal_B += vm.statement.FP_MT_DNDC_MxdAADC_NonAuto_Postage;
                    vm.statement.pieceTotal_B += vm.statement.FP_MT_DNDC_MxdAADC_NonAuto_Count;
                    
                    // -------------------------------------------------------------------------------------------                          
                    // PROFIT/METER/DSCF
                    // Auto [A]
                    vm.statement.postageDetails_A.push({"PS3602": vm.statement.FP_MT_DSCF_5Digit_Auto_PS3602, 
                                              "Entry": vm.statement.FP_MT_DSCF_5Digit_Auto_Entry, 
                                              "Category": vm.statement.FP_MT_DSCF_5Digit_Auto_Category, 
                                              "Price": vm.statement.FP_MT_DSCF_5Digit_Auto_Price, 
                                              "Count": vm.statement.FP_MT_DSCF_5Digit_Auto_Count, 
                                              "Postage": vm.statement.FP_MT_DSCF_5Digit_Auto_Postage});
                    vm.statement.postageTotal_A += vm.statement.FP_MT_DSCF_5Digit_Auto_Postage;
                    vm.statement.pieceTotal_A += vm.statement.FP_MT_DSCF_5Digit_Auto_Count;
                                              
                    vm.statement.postageDetails_A.push({"PS3602": vm.statement.FP_MT_DSCF_3Digit_Auto_PS3602, 
                                              "Entry": vm.statement.FP_MT_DSCF_3Digit_Auto_Entry, 
                                              "Category": vm.statement.FP_MT_DSCF_3Digit_Auto_Category, 
                                              "Price": vm.statement.FP_MT_DSCF_3Digit_Auto_Price, 
                                              "Count": vm.statement.FP_MT_DSCF_3Digit_Auto_Count, 
                                              "Postage": vm.statement.FP_MT_DSCF_3Digit_Auto_Postage});
                    vm.statement.postageTotal_A += vm.statement.FP_MT_DSCF_3Digit_Auto_Postage;
                    vm.statement.pieceTotal_A += vm.statement.FP_MT_DSCF_3Digit_Auto_Count;
                    
                    vm.statement.postageDetails_A.push({"PS3602": vm.statement.FP_MT_DSCF_AADC_Auto_PS3602, 
                                              "Entry": vm.statement.FP_MT_DSCF_AADC_Auto_Entry, 
                                              "Category": vm.statement.FP_MT_DSCF_AADC_Auto_Category, 
                                              "Price": vm.statement.FP_MT_DSCF_AADC_Auto_Price, 
                                              "Count": vm.statement.FP_MT_DSCF_AADC_Auto_Count, 
                                              "Postage": vm.statement.FP_MT_DSCF_AADC_Auto_Postage});
                    vm.statement.postageTotal_A += vm.statement.FP_MT_DSCF_AADC_Auto_Postage;
                    vm.statement.pieceTotal_A += vm.statement.FP_MT_DSCF_AADC_Auto_Count;      
                
                    // Non-Auto [B]
                    vm.statement.postageDetails_B.push({"PS3602": vm.statement.FP_MT_DSCF_AADC_NonAuto_PS3602, 
                                              "Entry": vm.statement.FP_MT_DSCF_AADC_NonAuto_Entry, 
                                              "Category": vm.statement.FP_MT_DSCF_AADC_NonAuto_Category, 
                                              "Price": vm.statement.FP_MT_DSCF_AADC_NonAuto_Price, 
                                              "Count": vm.statement.FP_MT_DSCF_AADC_NonAuto_Count, 
                                              "Postage": vm.statement.FP_MT_DSCF_AADC_NonAuto_Postage});
                   vm.statement.postageTotal_B += vm.statement.FP_MT_DSCF_AADC_NonAuto_Postage;
                   vm.statement.pieceTotal_B += vm.statement.FP_MT_DSCF_AADC_NonAuto_Count;      
                
                   // GRAND TOTALS
                   vm.statement.pieceTotal = vm.statement.pieceTotal_A + vm.statement.pieceTotal_B; 
                   vm.statement.postageTotal = vm.statement.postageTotal_A + vm.statement.postageTotal_B;
                   
                break;
                
                // ------------------------------------------------------------------------------------------- 
                // ------------------------------------------------------------------------------------------- 
                // PROFIT STAMP
                case "FP_ST":
                    vm.statement.rateType = "Stamp [For Profit]"
                    // ------------------------------------------------------------------------------------------- 
                    // PROFIT/STAMP/NONE
                    // Auto [A]
                    vm.statement.postageDetails_A.push({"PS3602": vm.statement.FP_ST_NONE_5Digit_Auto_PS3602, 
                                              "Entry": vm.statement.FP_ST_NONE_5Digit_Auto_Entry, 
                                              "Category": vm.statement.FP_ST_NONE_5Digit_Auto_Category, 
                                              "Price": vm.statement.FP_ST_NONE_5Digit_Auto_Price, 
                                              "Count": vm.statement.FP_ST_NONE_5Digit_Auto_Count, 
                                              "Postage": vm.statement.FP_ST_NONE_5Digit_Auto_Postage});
                    vm.statement.postageTotal_A += vm.statement.FP_ST_NONE_5Digit_Auto_Postage;
                    vm.statement.pieceTotal_A += vm.statement.FP_ST_NONE_5Digit_Auto_Count;
                                              
                    vm.statement.postageDetails_A.push({"PS3602": vm.statement.FP_ST_NONE_3Digit_Auto_PS3602, 
                                              "Entry": vm.statement.FP_ST_NONE_3Digit_Auto_Entry, 
                                              "Category": vm.statement.FP_ST_NONE_3Digit_Auto_Category, 
                                              "Price": vm.statement.FP_ST_NONE_3Digit_Auto_Price, 
                                              "Count": vm.statement.FP_ST_NONE_3Digit_Auto_Count, 
                                              "Postage": vm.statement.FP_ST_NONE_3Digit_Auto_Postage});
                    vm.statement.postageTotal_A += vm.statement.FP_ST_NONE_3Digit_Auto_Postage;
                    vm.statement.pieceTotal_A += vm.statement.FP_ST_NONE_3Digit_Auto_Count;
                    
                    vm.statement.postageDetails_A.push({"PS3602": vm.statement.FP_ST_NONE_AADC_Auto_PS3602, 
                                              "Entry": vm.statement.FP_ST_NONE_AADC_Auto_Entry, 
                                              "Category": vm.statement.FP_ST_NONE_AADC_Auto_Category, 
                                              "Price": vm.statement.FP_ST_NONE_AADC_Auto_Price, 
                                              "Count": vm.statement.FP_ST_NONE_AADC_Auto_Count, 
                                              "Postage": vm.statement.FP_ST_NONE_AADC_Auto_Postage});
                    vm.statement.postageTotal_A += vm.statement.FP_ST_NONE_AADC_Auto_Postage;
                    vm.statement.pieceTotal_A += vm.statement.FP_ST_NONE_AADC_Auto_Count;
                                              
                    vm.statement.postageDetails_A.push({"PS3602": vm.statement.FP_ST_NONE_MxdAADC_Auto_PS3602, 
                                              "Entry": vm.statement.FP_ST_NONE_MxdAADC_Auto_Entry, 
                                              "Category": vm.statement.FP_ST_NONE_MxdAADC_Auto_Category, 
                                              "Price": vm.statement.FP_ST_NONE_MxdAADC_Auto_Price, 
                                              "Count": vm.statement.FP_ST_NONE_MxdAADC_Auto_Count, 
                                              "Postage": vm.statement.FP_ST_NONE_MxdAADC_Auto_Postage});
                    vm.statement.postageTotal_A += vm.statement.FP_ST_NONE_MxdAADC_Auto_Postage;
                    vm.statement.pieceTotal_A += vm.statement.FP_ST_NONE_MxdAADC_Auto_Count;
                    
                    // Non-Auto [B]
                    vm.statement.postageDetails_B.push({"PS3602": vm.statement.FP_ST_NONE_AADC_NonAuto_PS3602, 
                                              "Entry": vm.statement.FP_ST_NONE_AADC_NonAuto_Entry, 
                                              "Category": vm.statement.FP_ST_NONE_AADC_NonAuto_Category, 
                                              "Price": vm.statement.FP_ST_NONE_AADC_NonAuto_Price, 
                                              "Count": vm.statement.FP_ST_NONE_AADC_NonAuto_Count, 
                                              "Postage": vm.statement.FP_ST_NONE_AADC_NonAuto_Postage});
                    vm.statement.postageTotal_B += vm.statement.FP_ST_NONE_AADC_NonAuto_Postage;
                    vm.statement.pieceTotal_B += vm.statement.FP_ST_NONE_AADC_NonAuto_Count;
                                              
                    vm.statement.postageDetails_B.push({"PS3602": vm.statement.FP_ST_NONE_MxdAADC_NonAuto_PS3602, 
                                              "Entry": vm.statement.FP_ST_NONE_MxdAADC_NonAuto_Entry, 
                                              "Category": vm.statement.FP_ST_NONE_MxdAADC_NonAuto_Category, 
                                              "Price": vm.statement.FP_ST_NONE_MxdAADC_NonAuto_Price, 
                                              "Count": vm.statement.FP_ST_NONE_MxdAADC_NonAuto_Count, 
                                              "Postage": vm.statement.FP_ST_NONE_MxdAADC_NonAuto_Postage});
                    vm.statement.postageTotal_B += vm.statement.FP_ST_NONE_MxdAADC_NonAuto_Postage;
                    vm.statement.pieceTotal_B += vm.statement.FP_ST_NONE_MxdAADC_NonAuto_Count;
                    
                    // -------------------------------------------------------------------------------------------   
                    // PROFIT/STAMP/DNDC
                    // Auto [A]
                    vm.statement.postageDetails_A.push({"PS3602": vm.statement.FP_ST_DNDC_5Digit_Auto_PS3602, 
                                              "Entry": vm.statement.FP_ST_DNDC_5Digit_Auto_Entry, 
                                              "Category": vm.statement.FP_ST_DNDC_5Digit_Auto_Category, 
                                              "Price": vm.statement.FP_ST_DNDC_5Digit_Auto_Price, 
                                              "Count": vm.statement.FP_ST_DNDC_5Digit_Auto_Count, 
                                              "Postage": vm.statement.FP_ST_DNDC_5Digit_Auto_Postage});
                    vm.statement.postageTotal_A += vm.statement.FP_ST_DNDC_5Digit_Auto_Postage;
                    vm.statement.pieceTotal_A += vm.statement.FP_ST_DNDC_5Digit_Auto_Count;
                                              
                    vm.statement.postageDetails_A.push({"PS3602": vm.statement.FP_ST_DNDC_3Digit_Auto_PS3602, 
                                              "Entry": vm.statement.FP_ST_DNDC_3Digit_Auto_Entry, 
                                              "Category": vm.statement.FP_ST_DNDC_3Digit_Auto_Category, 
                                              "Price": vm.statement.FP_ST_DNDC_3Digit_Auto_Price, 
                                              "Count": vm.statement.FP_ST_DNDC_3Digit_Auto_Count, 
                                              "Postage": vm.statement.FP_ST_DNDC_3Digit_Auto_Postage});
                    vm.statement.postageTotal_A += vm.statement.FP_ST_DNDC_3Digit_Auto_Postage;
                    vm.statement.pieceTotal_A += vm.statement.FP_ST_DNDC_3Digit_Auto_Count;
                    
                    vm.statement.postageDetails_A.push({"PS3602": vm.statement.FP_ST_DNDC_AADC_Auto_PS3602, 
                                              "Entry": vm.statement.FP_ST_DNDC_AADC_Auto_Entry, 
                                              "Category": vm.statement.FP_ST_DNDC_AADC_Auto_Category, 
                                              "Price": vm.statement.FP_ST_DNDC_AADC_Auto_Price, 
                                              "Count": vm.statement.FP_ST_DNDC_AADC_Auto_Count, 
                                              "Postage": vm.statement.FP_ST_DNDC_AADC_Auto_Postage});
                    vm.statement.postageTotal_A += vm.statement.FP_ST_DNDC_AADC_Auto_Postage;
                    vm.statement.pieceTotal_A += vm.statement.FP_ST_DNDC_AADC_Auto_Count;
                                              
                    vm.statement.postageDetails_A.push({"PS3602": vm.statement.FP_ST_DNDC_MxdAADC_Auto_PS3602, 
                                              "Entry": vm.statement.FP_ST_DNDC_MxdAADC_Auto_Entry, 
                                              "Category": vm.statement.FP_ST_DNDC_MxdAADC_Auto_Category, 
                                              "Price": vm.statement.FP_ST_DNDC_MxdAADC_Auto_Price, 
                                              "Count": vm.statement.FP_ST_DNDC_MxdAADC_Auto_Count, 
                                              "Postage": vm.statement.FP_ST_DNDC_MxdAADC_Auto_Postage});
                    vm.statement.postageTotal_A += vm.statement.FP_ST_DNDC_MxdAADC_Auto_Postage;
                    vm.statement.pieceTotal_A += vm.statement.FP_ST_DNDC_MxdAADC_Auto_Count;
                    
                    // Non-Auto [B]
                    vm.statement.postageDetails_B.push({"PS3602": vm.statement.FP_ST_DNDC_AADC_NonAuto_PS3602, 
                                              "Entry": vm.statement.FP_ST_DNDC_AADC_NonAuto_Entry, 
                                              "Category": vm.statement.FP_ST_DNDC_AADC_NonAuto_Category, 
                                              "Price": vm.statement.FP_ST_DNDC_AADC_NonAuto_Price, 
                                              "Count": vm.statement.FP_ST_DNDC_AADC_NonAuto_Count, 
                                              "Postage": vm.statement.FP_ST_DNDC_AADC_NonAuto_Postage});
                    vm.statement.postageTotal_B += vm.statement.FP_ST_DNDC_AADC_NonAuto_Postage;
                    vm.statement.pieceTotal_B += vm.statement.FP_ST_DNDC_AADC_NonAuto_Count;
                                              
                    vm.statement.postageDetails_B.push({"PS3602": vm.statement.FP_ST_DNDC_MxdAADC_NonAuto_PS3602, 
                                              "Entry": vm.statement.FP_ST_DNDC_MxdAADC_NonAuto_Entry, 
                                              "Category": vm.statement.FP_ST_DNDC_MxdAADC_NonAuto_Category, 
                                              "Price": vm.statement.FP_ST_DNDC_MxdAADC_NonAuto_Price, 
                                              "Count": vm.statement.FP_ST_DNDC_MxdAADC_NonAuto_Count, 
                                              "Postage": vm.statement.FP_ST_DNDC_MxdAADC_NonAuto_Postage});
                    vm.statement.postageTotal_B += vm.statement.FP_ST_DNDC_MxdAADC_NonAuto_Postage;
                    vm.statement.pieceTotal_B += vm.statement.FP_ST_DNDC_MxdAADC_NonAuto_Count;
                    
                    // -------------------------------------------------------------------------------------------                           
                    // PROFIT/STAMP/DSCF
                    // Auto [A]
                    vm.statement.postageDetails_A.push({"PS3602": vm.statement.FP_ST_DSCF_5Digit_Auto_PS3602, 
                                              "Entry": vm.statement.FP_ST_DSCF_5Digit_Auto_Entry, 
                                              "Category": vm.statement.FP_ST_DSCF_5Digit_Auto_Category, 
                                              "Price": vm.statement.FP_ST_DSCF_5Digit_Auto_Price, 
                                              "Count": vm.statement.FP_ST_DSCF_5Digit_Auto_Count, 
                                              "Postage": vm.statement.FP_ST_DSCF_5Digit_Auto_Postage});
                    vm.statement.postageTotal_A += vm.statement.FP_ST_DSCF_5Digit_Auto_Postage;
                    vm.statement.pieceTotal_A += vm.statement.FP_ST_DSCF_5Digit_Auto_Count;
                                              
                    vm.statement.postageDetails_A.push({"PS3602": vm.statement.FP_ST_DSCF_3Digit_Auto_PS3602, 
                                              "Entry": vm.statement.FP_ST_DSCF_3Digit_Auto_Entry, 
                                              "Category": vm.statement.FP_ST_DSCF_3Digit_Auto_Category, 
                                              "Price": vm.statement.FP_ST_DSCF_3Digit_Auto_Price, 
                                              "Count": vm.statement.FP_ST_DSCF_3Digit_Auto_Count, 
                                              "Postage": vm.statement.FP_ST_DSCF_3Digit_Auto_Postage});
                    vm.statement.postageTotal_A += vm.statement.FP_ST_DSCF_3Digit_Auto_Postage;
                    vm.statement.pieceTotal_A += vm.statement.FP_ST_DSCF_3Digit_Auto_Count;
                    
                    vm.statement.postageDetails_A.push({"PS3602": vm.statement.FP_ST_DSCF_AADC_Auto_PS3602, 
                                              "Entry": vm.statement.FP_ST_DSCF_AADC_Auto_Entry, 
                                              "Category": vm.statement.FP_ST_DSCF_AADC_Auto_Category, 
                                              "Price": vm.statement.FP_ST_DSCF_AADC_Auto_Price, 
                                              "Count": vm.statement.FP_ST_DSCF_AADC_Auto_Count, 
                                              "Postage": vm.statement.FP_ST_DSCF_AADC_Auto_Postage});
                    vm.statement.postageTotal_A += vm.statement.FP_ST_DSCF_AADC_Auto_Postage;
                    vm.statement.pieceTotal_A += vm.statement.FP_ST_DSCF_AADC_Auto_Count;
                                              
                    // Non-Auto [B]
                    vm.statement.postageDetails_B.push({"PS3602": vm.statement.FP_ST_DSCF_AADC_NonAuto_PS3602, 
                                              "Entry": vm.statement.FP_ST_DSCF_AADC_NonAuto_Entry, 
                                              "Category": vm.statement.FP_ST_DSCF_AADC_NonAuto_Category, 
                                              "Price": vm.statement.FP_ST_DSCF_AADC_NonAuto_Price, 
                                              "Count": vm.statement.FP_ST_DSCF_AADC_NonAuto_Count, 
                                              "Postage": vm.statement.FP_ST_DSCF_AADC_NonAuto_Postage});
                    vm.statement.postageTotal_B += vm.statement.FP_ST_DSCF_AADC_NonAuto_Postage;
                    vm.statement.pieceTotal_B += vm.statement.FP_ST_DSCF_AADC_NonAuto_Count;
                                              
                   // GRAND TOTALS
                   vm.statement.pieceTotal = vm.statement.pieceTotal_A + vm.statement.pieceTotal_B; 
                   vm.statement.postageTotal = vm.statement.postageTotal_A + vm.statement.postageTotal_B;
                
                break;
                
                // ------------------------------------------------------------------------------------------- 
                // NON-PROFIT
                // ------------------------------------------------------------------------------------------- 
                
                // NON-PROFIT / PERMIT IMPRINT
                case "NP_PI":
                
                    vm.statement.rateType = "Permit Imprint [NON-PROFIT]"
                    // -------------------------------------------------------------------------------------------
                    // NON-PROFIT/PERMIT/NONE
                    // Auto [A]
                    vm.statement.postageDetails_A.push({"PS3602": vm.statement.NP_PI_NONE_5Digit_Auto_PS3602, 
                                              "Entry": vm.statement.NP_PI_NONE_5Digit_Auto_Entry, 
                                              "Category": vm.statement.NP_PI_NONE_5Digit_Auto_Category, 
                                              "Price": vm.statement.NP_PI_NONE_5Digit_Auto_Price, 
                                              "Count": vm.statement.NP_PI_NONE_5Digit_Auto_Count, 
                                              "Postage": vm.statement.NP_PI_NONE_5Digit_Auto_Postage});
                    vm.statement.postageTotal_A += vm.statement.NP_PI_NONE_5Digit_Auto_Postage;
                    vm.statement.pieceTotal_A += vm.statement.NP_PI_NONE_5Digit_Auto_Count;
                                              
                    vm.statement.postageDetails_A.push({"PS3602": vm.statement.NP_PI_NONE_3Digit_Auto_PS3602, 
                                              "Entry": vm.statement.NP_PI_NONE_3Digit_Auto_Entry, 
                                              "Category": vm.statement.NP_PI_NONE_3Digit_Auto_Category, 
                                              "Price": vm.statement.NP_PI_NONE_3Digit_Auto_Price, 
                                              "Count": vm.statement.NP_PI_NONE_3Digit_Auto_Count, 
                                              "Postage": vm.statement.NP_PI_NONE_3Digit_Auto_Postage});
                    vm.statement.postageTotal_A += vm.statement.NP_PI_NONE_3Digit_Auto_Postage;
                    vm.statement.pieceTotal_A += vm.statement.NP_PI_NONE_3Digit_Auto_Count;
                    
                    vm.statement.postageDetails_A.push({"PS3602": vm.statement.NP_PI_NONE_AADC_Auto_PS3602, 
                                              "Entry": vm.statement.NP_PI_NONE_AADC_Auto_Entry, 
                                              "Category": vm.statement.NP_PI_NONE_AADC_Auto_Category, 
                                              "Price": vm.statement.NP_PI_NONE_AADC_Auto_Price, 
                                              "Count": vm.statement.NP_PI_NONE_AADC_Auto_Count, 
                                              "Postage": vm.statement.NP_PI_NONE_AADC_Auto_Postage});
                    vm.statement.postageTotal_A += vm.statement.NP_PI_NONE_AADC_Auto_Postage;
                    vm.statement.pieceTotal_A += vm.statement.NP_PI_NONE_AADC_Auto_Count;
                                              
                    vm.statement.postageDetails_A.push({"PS3602": vm.statement.NP_PI_NONE_MxdAADC_Auto_PS3602, 
                                              "Entry": vm.statement.NP_PI_NONE_MxdAADC_Auto_Entry, 
                                              "Category": vm.statement.NP_PI_NONE_MxdAADC_Auto_Category, 
                                              "Price": vm.statement.NP_PI_NONE_MxdAADC_Auto_Price, 
                                              "Count": vm.statement.NP_PI_NONE_MxdAADC_Auto_Count, 
                                              "Postage": vm.statement.NP_PI_NONE_MxdAADC_Auto_Postage});
                    vm.statement.postageTotal_A += vm.statement.NP_PI_NONE_MxdAADC_Auto_Postage;
                    vm.statement.pieceTotal_A += vm.statement.NP_PI_NONE_MxdAADC_Auto_Count;
                     
                    // Non-Auto [B]
                    vm.statement.postageDetails_B.push({"PS3602": vm.statement.NP_PI_NONE_AADC_NonAuto_PS3602, 
                                              "Entry": vm.statement.NP_PI_NONE_AADC_NonAuto_Entry, 
                                              "Category": vm.statement.NP_PI_NONE_AADC_NonAuto_Category, 
                                              "Price": vm.statement.NP_PI_NONE_AADC_NonAuto_Price, 
                                              "Count": vm.statement.NP_PI_NONE_AADC_NonAuto_Count, 
                                              "Postage": vm.statement.NP_PI_NONE_AADC_NonAuto_Postage});
                    vm.statement.postageTotal_B += vm.statement.NP_PI_NONE_AADC_NonAuto_Postage;
                    vm.statement.pieceTotal_B += vm.statement.NP_PI_NONE_AADC_NonAuto_Count;
                                              
                    vm.statement.postageDetails_B.push({"PS3602": vm.statement.NP_PI_NONE_MxdAADC_NonAuto_PS3602, 
                                              "Entry": vm.statement.NP_PI_NONE_MxdAADC_NonAuto_Entry, 
                                              "Category": vm.statement.NP_PI_NONE_MxdAADC_NonAuto_Category, 
                                              "Price": vm.statement.NP_PI_NONE_MxdAADC_NonAuto_Price, 
                                              "Count": vm.statement.NP_PI_NONE_MxdAADC_NonAuto_Count, 
                                              "Postage": vm.statement.NP_PI_NONE_MxdAADC_NonAuto_Postage});
                    vm.statement.postageTotal_B += vm.statement.NP_PI_NONE_MxdAADC_NonAuto_Postage;
                    vm.statement.pieceTotal_B += vm.statement.NP_PI_NONE_MxdAADC_NonAuto_Count;
                    
                    // -------------------------------------------------------------------------------------------                          
                    // NON-PROFIT/PERMIT/DNDC
                    // Auto [A]
                    vm.statement.postageDetails_A.push({"PS3602": vm.statement.NP_PI_DNDC_5Digit_Auto_PS3602, 
                                              "Entry": vm.statement.NP_PI_DNDC_5Digit_Auto_Entry, 
                                              "Category": vm.statement.NP_PI_DNDC_5Digit_Auto_Category, 
                                              "Price": vm.statement.NP_PI_DNDC_5Digit_Auto_Price, 
                                              "Count": vm.statement.NP_PI_DNDC_5Digit_Auto_Count, 
                                              "Postage": vm.statement.NP_PI_DNDC_5Digit_Auto_Postage});
                    vm.statement.postageTotal_A += vm.statement.NP_PI_DNDC_5Digit_Auto_Postage;
                    vm.statement.pieceTotal_A += vm.statement.NP_PI_DNDC_5Digit_Auto_Count;
                                              
                    vm.statement.postageDetails_A.push({"PS3602": vm.statement.NP_PI_DNDC_3Digit_Auto_PS3602, 
                                              "Entry": vm.statement.NP_PI_DNDC_3Digit_Auto_Entry, 
                                              "Category": vm.statement.NP_PI_DNDC_3Digit_Auto_Category, 
                                              "Price": vm.statement.NP_PI_DNDC_3Digit_Auto_Price, 
                                              "Count": vm.statement.NP_PI_DNDC_3Digit_Auto_Count, 
                                              "Postage": vm.statement.NP_PI_DNDC_3Digit_Auto_Postage});
                    vm.statement.postageTotal_A += vm.statement.NP_PI_DNDC_3Digit_Auto_Postage;
                    vm.statement.pieceTotal_A += vm.statement.NP_PI_DNDC_3Digit_Auto_Count;
                    
                    vm.statement.postageDetails_A.push({"PS3602": vm.statement.NP_PI_DNDC_AADC_Auto_PS3602, 
                                              "Entry": vm.statement.NP_PI_DNDC_AADC_Auto_Entry, 
                                              "Category": vm.statement.NP_PI_DNDC_AADC_Auto_Category, 
                                              "Price": vm.statement.NP_PI_DNDC_AADC_Auto_Price, 
                                              "Count": vm.statement.NP_PI_DNDC_AADC_Auto_Count, 
                                              "Postage": vm.statement.NP_PI_DNDC_AADC_Auto_Postage});
                    vm.statement.postageTotal_A += vm.statement.NP_PI_DNDC_AADC_Auto_Postage;
                    vm.statement.pieceTotal_A += vm.statement.NP_PI_DNDC_AADC_Auto_Count;
                                              
                    vm.statement.postageDetails_A.push({"PS3602": vm.statement.NP_PI_DNDC_MxdAADC_Auto_PS3602, 
                                              "Entry": vm.statement.NP_PI_DNDC_MxdAADC_Auto_Entry, 
                                              "Category": vm.statement.NP_PI_DNDC_MxdAADC_Auto_Category, 
                                              "Price": vm.statement.NP_PI_DNDC_MxdAADC_Auto_Price, 
                                              "Count": vm.statement.NP_PI_DNDC_MxdAADC_Auto_Count, 
                                              "Postage": vm.statement.NP_PI_DNDC_MxdAADC_Auto_Postage});
                    vm.statement.postageTotal_A += vm.statement.NP_PI_DNDC_MxdAADC_Auto_Postage;
                    vm.statement.pieceTotal_A += vm.statement.NP_PI_DNDC_MxdAADC_Auto_Count;
                    
                    // Non-Auto [B]
                    vm.statement.postageDetails_B.push({"PS3602": vm.statement.NP_PI_DNDC_AADC_NonAuto_PS3602, 
                                              "Entry": vm.statement.NP_PI_DNDC_AADC_NonAuto_Entry, 
                                              "Category": vm.statement.NP_PI_DNDC_AADC_NonAuto_Category, 
                                              "Price": vm.statement.NP_PI_DNDC_AADC_NonAuto_Price, 
                                              "Count": vm.statement.NP_PI_DNDC_AADC_NonAuto_Count, 
                                              "Postage": vm.statement.NP_PI_DNDC_AADC_NonAuto_Postage});
                    vm.statement.postageTotal_B += vm.statement.NP_PI_DNDC_AADC_NonAuto_Postage;
                    vm.statement.pieceTotal_B += vm.statement.NP_PI_DNDC_AADC_NonAuto_Count;
                                              
                    vm.statement.postageDetails_B.push({"PS3602": vm.statement.NP_PI_DNDC_MxdAADC_NonAuto_PS3602, 
                                              "Entry": vm.statement.NP_PI_DNDC_MxdAADC_NonAuto_Entry, 
                                              "Category": vm.statement.NP_PI_DNDC_MxdAADC_NonAuto_Category, 
                                              "Price": vm.statement.NP_PI_DNDC_MxdAADC_NonAuto_Price, 
                                              "Count": vm.statement.NP_PI_DNDC_MxdAADC_NonAuto_Count, 
                                              "Postage": vm.statement.NP_PI_DNDC_MxdAADC_NonAuto_Postage});
                    vm.statement.postageTotal_B += vm.statement.NP_PI_DNDC_MxdAADC_NonAuto_Postage;
                    vm.statement.pieceTotal_B += vm.statement.NP_PI_DNDC_MxdAADC_NonAuto_Count;
                    
                    // -------------------------------------------------------------------------------------------                         
                    // NON-PROFIT/PERMIT/DSCF
                    // Auto [A]
                    vm.statement.postageDetails_A.push({"PS3602": vm.statement.NP_PI_DSCF_5Digit_Auto_PS3602, 
                                              "Entry": vm.statement.NP_PI_DSCF_5Digit_Auto_Entry, 
                                              "Category": vm.statement.NP_PI_DSCF_5Digit_Auto_Category, 
                                              "Price": vm.statement.NP_PI_DSCF_5Digit_Auto_Price, 
                                              "Count": vm.statement.NP_PI_DSCF_5Digit_Auto_Count, 
                                              "Postage": vm.statement.NP_PI_DSCF_5Digit_Auto_Postage});
                    vm.statement.postageTotal_A += vm.statement.NP_PI_DSCF_5Digit_Auto_Postage;
                    vm.statement.pieceTotal_A += vm.statement.NP_PI_DSCF_5Digit_Auto_Count;
                                              
                    vm.statement.postageDetails_A.push({"PS3602": vm.statement.NP_PI_DSCF_3Digit_Auto_PS3602, 
                                              "Entry": vm.statement.NP_PI_DSCF_3Digit_Auto_Entry, 
                                              "Category": vm.statement.NP_PI_DSCF_3Digit_Auto_Category, 
                                              "Price": vm.statement.NP_PI_DSCF_3Digit_Auto_Price, 
                                              "Count": vm.statement.NP_PI_DSCF_3Digit_Auto_Count, 
                                              "Postage": vm.statement.NP_PI_DSCF_3Digit_Auto_Postage});
                    vm.statement.postageTotal_A += vm.statement.NP_PI_DSCF_3Digit_Auto_Postage;
                    vm.statement.pieceTotal_A += vm.statement.NP_PI_DSCF_3Digit_Auto_Count;
                    
                    vm.statement.postageDetails_A.push({"PS3602": vm.statement.NP_PI_DSCF_AADC_Auto_PS3602, 
                                              "Entry": vm.statement.NP_PI_DSCF_AADC_Auto_Entry, 
                                              "Category": vm.statement.NP_PI_DSCF_AADC_Auto_Category, 
                                              "Price": vm.statement.NP_PI_DSCF_AADC_Auto_Price, 
                                              "Count": vm.statement.NP_PI_DSCF_AADC_Auto_Count, 
                                              "Postage": vm.statement.NP_PI_DSCF_AADC_Auto_Postage});
                   vm.statement.postageTotal_A += vm.statement.NP_PI_DSCF_AADC_Auto_Postage;
                   vm.statement.pieceTotal_A += vm.statement.NP_PI_DSCF_AADC_Auto_Count;
                   
                   // Non-Auto [B]
                   vm.statement.postageDetails_B.push({"PS3602": vm.statement.NP_PI_DSCF_AADC_NonAuto_PS3602, 
                                              "Entry": vm.statement.NP_PI_DSCF_AADC_NonAuto_Entry, 
                                              "Category": vm.statement.NP_PI_DSCF_AADC_NonAuto_Category, 
                                              "Price": vm.statement.NP_PI_DSCF_AADC_NonAuto_Price, 
                                              "Count": vm.statement.NP_PI_DSCF_AADC_NonAuto_Count, 
                                              "Postage": vm.statement.NP_PI_DSCF_AADC_NonAuto_Postage});
                   vm.statement.postageTotal_B += vm.statement.NP_PI_DSCF_AADC_NonAuto_Postage;
                   vm.statement.pieceTotal_B += vm.statement.NP_PI_DSCF_AADC_NonAuto_Count;
                   
                   // GRAND TOTALS
                   vm.statement.pieceTotal = vm.statement.pieceTotal_A + vm.statement.pieceTotal_B; 
                   vm.statement.postageTotal = vm.statement.postageTotal_A + vm.statement.postageTotal_B;
                                        
                break;
                
                // -------------------------------------------------------------------------------------------
                // -------------------------------------------------------------------------------------------
                // NON-PROFIT / METER
                case "NP_MT":
                    vm.statement.rateType = "Meter [Non Profit]"
                    // -------------------------------------------------------------------------------------------
                    // NON-PROFIT/METER/NONE
                    // Auto [A]
                    vm.statement.postageDetails_A.push({"PS3602": vm.statement.NP_MT_NONE_5Digit_Auto_PS3602, 
                                              "Entry": vm.statement.NP_MT_NONE_5Digit_Auto_Entry, 
                                              "Category": vm.statement.NP_MT_NONE_5Digit_Auto_Category, 
                                              "Price": vm.statement.NP_MT_NONE_5Digit_Auto_Price, 
                                              "Count": vm.statement.NP_MT_NONE_5Digit_Auto_Count, 
                                              "Postage": vm.statement.NP_MT_NONE_5Digit_Auto_Postage});
                    vm.statement.postageTotal_A += vm.statement.NP_MT_NONE_5Digit_Auto_Postage;
                    vm.statement.pieceTotal_A += vm.statement.NP_MT_NONE_5Digit_Auto_Count;
                                              
                    vm.statement.postageDetails_A.push({"PS3602": vm.statement.NP_MT_NONE_3Digit_Auto_PS3602, 
                                              "Entry": vm.statement.NP_MT_NONE_3Digit_Auto_Entry, 
                                              "Category": vm.statement.NP_MT_NONE_3Digit_Auto_Category, 
                                              "Price": vm.statement.NP_MT_NONE_3Digit_Auto_Price, 
                                              "Count": vm.statement.NP_MT_NONE_3Digit_Auto_Count, 
                                              "Postage": vm.statement.NP_MT_NONE_3Digit_Auto_Postage});
                    vm.statement.postageTotal_A += vm.statement.NP_MT_NONE_3Digit_Auto_Postage;
                    vm.statement.pieceTotal_A += vm.statement.NP_MT_NONE_3Digit_Auto_Count;
                    
                    vm.statement.postageDetails_A.push({"PS3602": vm.statement.NP_MT_NONE_AADC_Auto_PS3602, 
                                              "Entry": vm.statement.NP_MT_NONE_AADC_Auto_Entry, 
                                              "Category": vm.statement.NP_MT_NONE_AADC_Auto_Category, 
                                              "Price": vm.statement.NP_MT_NONE_AADC_Auto_Price, 
                                              "Count": vm.statement.NP_MT_NONE_AADC_Auto_Count, 
                                              "Postage": vm.statement.NP_MT_NONE_AADC_Auto_Postage});
                    vm.statement.postageTotal_A += vm.statement.NP_MT_NONE_AADC_Auto_Postage;
                    vm.statement.pieceTotal_A += vm.statement.NP_MT_NONE_AADC_Auto_Count;
                                              
                    vm.statement.postageDetails_A.push({"PS3602": vm.statement.NP_MT_NONE_MxdAADC_Auto_PS3602, 
                                              "Entry": vm.statement.NP_MT_NONE_MxdAADC_Auto_Entry, 
                                              "Category": vm.statement.NP_MT_NONE_MxdAADC_Auto_Category, 
                                              "Price": vm.statement.NP_MT_NONE_MxdAADC_Auto_Price, 
                                              "Count": vm.statement.NP_MT_NONE_MxdAADC_Auto_Count, 
                                              "Postage": vm.statement.NP_MT_NONE_MxdAADC_Auto_Postage});
                    vm.statement.postageTotal_A += vm.statement.NP_MT_NONE_MxdAADC_Auto_Postage;
                    vm.statement.pieceTotal_A += vm.statement.NP_MT_NONE_MxdAADC_Auto_Count;
                    
                    // Non-Auto [B]
                    vm.statement.postageDetails_B.push({"PS3602": vm.statement.NP_MT_NONE_AADC_NonAuto_PS3602, 
                                              "Entry": vm.statement.NP_MT_NONE_AADC_NonAuto_Entry, 
                                              "Category": vm.statement.NP_MT_NONE_AADC_NonAuto_Category, 
                                              "Price": vm.statement.NP_MT_NONE_AADC_NonAuto_Price, 
                                              "Count": vm.statement.NP_MT_NONE_AADC_NonAuto_Count, 
                                              "Postage": vm.statement.NP_MT_NONE_AADC_NonAuto_Postage});
                    vm.statement.postageTotal_B += vm.statement.NP_MT_NONE_AADC_NonAuto_Postage;
                    vm.statement.pieceTotal_B += vm.statement.NP_MT_NONE_AADC_NonAuto_Count;
                                              
                    vm.statement.postageDetails_B.push({"PS3602": vm.statement.NP_MT_NONE_MxdAADC_NonAuto_PS3602, 
                                              "Entry": vm.statement.NP_MT_NONE_MxdAADC_NonAuto_Entry, 
                                              "Category": vm.statement.NP_MT_NONE_MxdAADC_NonAuto_Category, 
                                              "Price": vm.statement.NP_MT_NONE_MxdAADC_NonAuto_Price, 
                                              "Count": vm.statement.NP_MT_NONE_MxdAADC_NonAuto_Count, 
                                              "Postage": vm.statement.NP_MT_NONE_MxdAADC_NonAuto_Postage});
                    vm.statement.postageTotal_B += vm.statement.NP_MT_NONE_MxdAADC_NonAuto_Postage;
                    vm.statement.pieceTotal_B += vm.statement.NP_MT_NONE_MxdAADC_NonAuto_Count;
                    
                    // -------------------------------------------------------------------------------------------
                    // NON-PROFIT/METER/DNDC
                    // Auto [A]
                    vm.statement.postageDetails_A.push({"PS3602": vm.statement.NP_MT_DNDC_5Digit_Auto_PS3602, 
                                              "Entry": vm.statement.NP_MT_DNDC_5Digit_Auto_Entry, 
                                              "Category": vm.statement.NP_MT_DNDC_5Digit_Auto_Category, 
                                              "Price": vm.statement.NP_MT_DNDC_5Digit_Auto_Price, 
                                              "Count": vm.statement.NP_MT_DNDC_5Digit_Auto_Count, 
                                              "Postage": vm.statement.NP_MT_DNDC_5Digit_Auto_Postage});
                    vm.statement.postageTotal_A += vm.statement.NP_MT_DNDC_5Digit_Auto_Postage;
                    vm.statement.pieceTotal_A += vm.statement.NP_MT_DNDC_5Digit_Auto_Count;
                                              
                    vm.statement.postageDetails_A.push({"PS3602": vm.statement.NP_MT_DNDC_3Digit_Auto_PS3602, 
                                              "Entry": vm.statement.NP_MT_DNDC_3Digit_Auto_Entry, 
                                              "Category": vm.statement.NP_MT_DNDC_3Digit_Auto_Category, 
                                              "Price": vm.statement.NP_MT_DNDC_3Digit_Auto_Price, 
                                              "Count": vm.statement.NP_MT_DNDC_3Digit_Auto_Count, 
                                              "Postage": vm.statement.NP_MT_DNDC_3Digit_Auto_Postage});
                    vm.statement.postageTotal_A += vm.statement.NP_MT_DNDC_3Digit_Auto_Postage;
                    vm.statement.pieceTotal_A += vm.statement.NP_MT_DNDC_3Digit_Auto_Count;
                    
                    vm.statement.postageDetails_A.push({"PS3602": vm.statement.NP_MT_DNDC_AADC_Auto_PS3602, 
                                              "Entry": vm.statement.NP_MT_DNDC_AADC_Auto_Entry, 
                                              "Category": vm.statement.NP_MT_DNDC_AADC_Auto_Category, 
                                              "Price": vm.statement.NP_MT_DNDC_AADC_Auto_Price, 
                                              "Count": vm.statement.NP_MT_DNDC_AADC_Auto_Count, 
                                              "Postage": vm.statement.NP_MT_DNDC_AADC_Auto_Postage});
                    vm.statement.postageTotal_A += vm.statement.NP_MT_DNDC_AADC_Auto_Postage;
                    vm.statement.pieceTotal_A += vm.statement.NP_MT_DNDC_AADC_Auto_Count;
                                              
                    vm.statement.postageDetails_A.push({"PS3602": vm.statement.NP_MT_DNDC_MxdAADC_Auto_PS3602, 
                                              "Entry": vm.statement.NP_MT_DNDC_MxdAADC_Auto_Entry, 
                                              "Category": vm.statement.NP_MT_DNDC_MxdAADC_Auto_Category, 
                                              "Price": vm.statement.NP_MT_DNDC_MxdAADC_Auto_Price, 
                                              "Count": vm.statement.NP_MT_DNDC_MxdAADC_Auto_Count, 
                                              "Postage": vm.statement.NP_MT_DNDC_MxdAADC_Auto_Postage});
                    vm.statement.postageTotal_A += vm.statement.NP_MT_DNDC_MxdAADC_Auto_Postage;
                    vm.statement.pieceTotal_A += vm.statement.NP_MT_DNDC_MxdAADC_Auto_Count;
                    
                    // Non-Auto [B]
                    vm.statement.postageDetails_B.push({"PS3602": vm.statement.NP_MT_DNDC_AADC_NonAuto_PS3602, 
                                              "Entry": vm.statement.NP_MT_DNDC_AADC_NonAuto_Entry, 
                                              "Category": vm.statement.NP_MT_DNDC_AADC_NonAuto_Category, 
                                              "Price": vm.statement.NP_MT_DNDC_AADC_NonAuto_Price, 
                                              "Count": vm.statement.NP_MT_DNDC_AADC_NonAuto_Count, 
                                              "Postage": vm.statement.NP_MT_DNDC_AADC_NonAuto_Postage});
                    vm.statement.postageTotal_B += vm.statement.NP_MT_DNDC_AADC_NonAuto_Postage;
                    vm.statement.pieceTotal_B += vm.statement.NP_MT_DNDC_AADC_NonAuto_Count;
                                              
                    vm.statement.postageDetails_B.push({"PS3602": vm.statement.NP_MT_DNDC_MxdAADC_NonAuto_PS3602, 
                                              "Entry": vm.statement.NP_MT_DNDC_MxdAADC_NonAuto_Entry, 
                                              "Category": vm.statement.NP_MT_DNDC_MxdAADC_NonAuto_Category, 
                                              "Price": vm.statement.NP_MT_DNDC_MxdAADC_NonAuto_Price, 
                                              "Count": vm.statement.NP_MT_DNDC_MxdAADC_NonAuto_Count, 
                                              "Postage": vm.statement.NP_MT_DNDC_MxdAADC_NonAuto_Postage});
                    vm.statement.postageTotal_B += vm.statement.NP_MT_DNDC_MxdAADC_NonAuto_Postage;
                    vm.statement.pieceTotal_B += vm.statement.NP_MT_DNDC_MxdAADC_NonAuto_Count;
                    
                    // -------------------------------------------------------------------------------------------                          
                    // NON-PROFIT/METER/DSCF
                    // Auto [A]
                    vm.statement.postageDetails_A.push({"PS3602": vm.statement.NP_MT_DSCF_5Digit_Auto_PS3602, 
                                              "Entry": vm.statement.NP_MT_DSCF_5Digit_Auto_Entry, 
                                              "Category": vm.statement.NP_MT_DSCF_5Digit_Auto_Category, 
                                              "Price": vm.statement.NP_MT_DSCF_5Digit_Auto_Price, 
                                              "Count": vm.statement.NP_MT_DSCF_5Digit_Auto_Count, 
                                              "Postage": vm.statement.NP_MT_DSCF_5Digit_Auto_Postage});
                    vm.statement.postageTotal_A += vm.statement.NP_MT_DSCF_5Digit_Auto_Postage;
                    vm.statement.pieceTotal_A += vm.statement.NP_MT_DSCF_5Digit_Auto_Count;
                                              
                    vm.statement.postageDetails_A.push({"PS3602": vm.statement.NP_MT_DSCF_3Digit_Auto_PS3602, 
                                              "Entry": vm.statement.NP_MT_DSCF_3Digit_Auto_Entry, 
                                              "Category": vm.statement.NP_MT_DSCF_3Digit_Auto_Category, 
                                              "Price": vm.statement.NP_MT_DSCF_3Digit_Auto_Price, 
                                              "Count": vm.statement.NP_MT_DSCF_3Digit_Auto_Count, 
                                              "Postage": vm.statement.NP_MT_DSCF_3Digit_Auto_Postage});
                    vm.statement.postageTotal_A += vm.statement.NP_MT_DSCF_3Digit_Auto_Postage;
                    vm.statement.pieceTotal_A += vm.statement.NP_MT_DSCF_3Digit_Auto_Count;
                    
                    vm.statement.postageDetails_A.push({"PS3602": vm.statement.NP_MT_DSCF_AADC_Auto_PS3602, 
                                              "Entry": vm.statement.NP_MT_DSCF_AADC_Auto_Entry, 
                                              "Category": vm.statement.NP_MT_DSCF_AADC_Auto_Category, 
                                              "Price": vm.statement.NP_MT_DSCF_AADC_Auto_Price, 
                                              "Count": vm.statement.NP_MT_DSCF_AADC_Auto_Count, 
                                              "Postage": vm.statement.NP_MT_DSCF_AADC_Auto_Postage});
                    vm.statement.postageTotal_A += vm.statement.NP_MT_DSCF_AADC_Auto_Postage;
                    vm.statement.pieceTotal_A += vm.statement.NP_MT_DSCF_AADC_Auto_Count;      
                
                    // Non-Auto [B]
                    vm.statement.postageDetails_B.push({"PS3602": vm.statement.NP_MT_DSCF_AADC_NonAuto_PS3602, 
                                              "Entry": vm.statement.NP_MT_DSCF_AADC_NonAuto_Entry, 
                                              "Category": vm.statement.NP_MT_DSCF_AADC_NonAuto_Category, 
                                              "Price": vm.statement.NP_MT_DSCF_AADC_NonAuto_Price, 
                                              "Count": vm.statement.NP_MT_DSCF_AADC_NonAuto_Count, 
                                              "Postage": vm.statement.NP_MT_DSCF_AADC_NonAuto_Postage});
                   vm.statement.postageTotal_B += vm.statement.NP_MT_DSCF_AADC_NonAuto_Postage;
                   vm.statement.pieceTotal_B += vm.statement.NP_MT_DSCF_AADC_NonAuto_Count;      
                
                   // GRAND TOTALS
                   vm.statement.pieceTotal = vm.statement.pieceTotal_A + vm.statement.pieceTotal_B; 
                   vm.statement.postageTotal = vm.statement.postageTotal_A + vm.statement.postageTotal_B;
                   
                break;
                
                // ------------------------------------------------------------------------------------------- 
                // ------------------------------------------------------------------------------------------- 
                // NON-PROFIT STAMP
                case "NP_ST":
                    vm.statement.rateType = "Stamp [Non Profit]"
                    // ------------------------------------------------------------------------------------------- 
                    // NON-PROFIT/STAMP/NONE
                    // Auto [A]
                    vm.statement.postageDetails_A.push({"PS3602": vm.statement.NP_ST_NONE_5Digit_Auto_PS3602, 
                                              "Entry": vm.statement.NP_ST_NONE_5Digit_Auto_Entry, 
                                              "Category": vm.statement.NP_ST_NONE_5Digit_Auto_Category, 
                                              "Price": vm.statement.NP_ST_NONE_5Digit_Auto_Price, 
                                              "Count": vm.statement.NP_ST_NONE_5Digit_Auto_Count, 
                                              "Postage": vm.statement.NP_ST_NONE_5Digit_Auto_Postage});
                    vm.statement.postageTotal_A += vm.statement.NP_ST_NONE_5Digit_Auto_Postage;
                    vm.statement.pieceTotal_A += vm.statement.NP_ST_NONE_5Digit_Auto_Count;
                                              
                    vm.statement.postageDetails_A.push({"PS3602": vm.statement.NP_ST_NONE_3Digit_Auto_PS3602, 
                                              "Entry": vm.statement.NP_ST_NONE_3Digit_Auto_Entry, 
                                              "Category": vm.statement.NP_ST_NONE_3Digit_Auto_Category, 
                                              "Price": vm.statement.NP_ST_NONE_3Digit_Auto_Price, 
                                              "Count": vm.statement.NP_ST_NONE_3Digit_Auto_Count, 
                                              "Postage": vm.statement.NP_ST_NONE_3Digit_Auto_Postage});
                    vm.statement.postageTotal_A += vm.statement.NP_ST_NONE_3Digit_Auto_Postage;
                    vm.statement.pieceTotal_A += vm.statement.NP_ST_NONE_3Digit_Auto_Count;
                    
                    vm.statement.postageDetails_A.push({"PS3602": vm.statement.NP_ST_NONE_AADC_Auto_PS3602, 
                                              "Entry": vm.statement.NP_ST_NONE_AADC_Auto_Entry, 
                                              "Category": vm.statement.NP_ST_NONE_AADC_Auto_Category, 
                                              "Price": vm.statement.NP_ST_NONE_AADC_Auto_Price, 
                                              "Count": vm.statement.NP_ST_NONE_AADC_Auto_Count, 
                                              "Postage": vm.statement.NP_ST_NONE_AADC_Auto_Postage});
                    vm.statement.postageTotal_A += vm.statement.NP_ST_NONE_AADC_Auto_Postage;
                    vm.statement.pieceTotal_A += vm.statement.NP_ST_NONE_AADC_Auto_Count;
                                              
                    vm.statement.postageDetails_A.push({"PS3602": vm.statement.NP_ST_NONE_MxdAADC_Auto_PS3602, 
                                              "Entry": vm.statement.NP_ST_NONE_MxdAADC_Auto_Entry, 
                                              "Category": vm.statement.NP_ST_NONE_MxdAADC_Auto_Category, 
                                              "Price": vm.statement.NP_ST_NONE_MxdAADC_Auto_Price, 
                                              "Count": vm.statement.NP_ST_NONE_MxdAADC_Auto_Count, 
                                              "Postage": vm.statement.NP_ST_NONE_MxdAADC_Auto_Postage});
                    vm.statement.postageTotal_A += vm.statement.NP_ST_NONE_MxdAADC_Auto_Postage;
                    vm.statement.pieceTotal_A += vm.statement.NP_ST_NONE_MxdAADC_Auto_Count;
                    
                    // Non-Auto [B]
                    vm.statement.postageDetails_B.push({"PS3602": vm.statement.NP_ST_NONE_AADC_NonAuto_PS3602, 
                                              "Entry": vm.statement.NP_ST_NONE_AADC_NonAuto_Entry, 
                                              "Category": vm.statement.NP_ST_NONE_AADC_NonAuto_Category, 
                                              "Price": vm.statement.NP_ST_NONE_AADC_NonAuto_Price, 
                                              "Count": vm.statement.NP_ST_NONE_AADC_NonAuto_Count, 
                                              "Postage": vm.statement.NP_ST_NONE_AADC_NonAuto_Postage});
                    vm.statement.postageTotal_B += vm.statement.NP_ST_NONE_AADC_NonAuto_Postage;
                    vm.statement.pieceTotal_B += vm.statement.NP_ST_NONE_AADC_NonAuto_Count;
                                              
                    vm.statement.postageDetails_B.push({"PS3602": vm.statement.NP_ST_NONE_MxdAADC_NonAuto_PS3602, 
                                              "Entry": vm.statement.NP_ST_NONE_MxdAADC_NonAuto_Entry, 
                                              "Category": vm.statement.NP_ST_NONE_MxdAADC_NonAuto_Category, 
                                              "Price": vm.statement.NP_ST_NONE_MxdAADC_NonAuto_Price, 
                                              "Count": vm.statement.NP_ST_NONE_MxdAADC_NonAuto_Count, 
                                              "Postage": vm.statement.NP_ST_NONE_MxdAADC_NonAuto_Postage});
                    vm.statement.postageTotal_B += vm.statement.NP_ST_NONE_MxdAADC_NonAuto_Postage;
                    vm.statement.pieceTotal_B += vm.statement.NP_ST_NONE_MxdAADC_NonAuto_Count;
                    
                    // -------------------------------------------------------------------------------------------   
                    // NON-PROFIT/STAMP/DNDC
                    // Auto [A]
                    vm.statement.postageDetails_A.push({"PS3602": vm.statement.NP_ST_DNDC_5Digit_Auto_PS3602, 
                                              "Entry": vm.statement.NP_ST_DNDC_5Digit_Auto_Entry, 
                                              "Category": vm.statement.NP_ST_DNDC_5Digit_Auto_Category, 
                                              "Price": vm.statement.NP_ST_DNDC_5Digit_Auto_Price, 
                                              "Count": vm.statement.NP_ST_DNDC_5Digit_Auto_Count, 
                                              "Postage": vm.statement.NP_ST_DNDC_5Digit_Auto_Postage});
                    vm.statement.postageTotal_A += vm.statement.NP_ST_DNDC_5Digit_Auto_Postage;
                    vm.statement.pieceTotal_A += vm.statement.NP_ST_DNDC_5Digit_Auto_Count;
                                              
                    vm.statement.postageDetails_A.push({"PS3602": vm.statement.NP_ST_DNDC_3Digit_Auto_PS3602, 
                                              "Entry": vm.statement.NP_ST_DNDC_3Digit_Auto_Entry, 
                                              "Category": vm.statement.NP_ST_DNDC_3Digit_Auto_Category, 
                                              "Price": vm.statement.NP_ST_DNDC_3Digit_Auto_Price, 
                                              "Count": vm.statement.NP_ST_DNDC_3Digit_Auto_Count, 
                                              "Postage": vm.statement.NP_ST_DNDC_3Digit_Auto_Postage});
                    vm.statement.postageTotal_A += vm.statement.NP_ST_DNDC_3Digit_Auto_Postage;
                    vm.statement.pieceTotal_A += vm.statement.NP_ST_DNDC_3Digit_Auto_Count;
                    
                    vm.statement.postageDetails_A.push({"PS3602": vm.statement.NP_ST_DNDC_AADC_Auto_PS3602, 
                                              "Entry": vm.statement.NP_ST_DNDC_AADC_Auto_Entry, 
                                              "Category": vm.statement.NP_ST_DNDC_AADC_Auto_Category, 
                                              "Price": vm.statement.NP_ST_DNDC_AADC_Auto_Price, 
                                              "Count": vm.statement.NP_ST_DNDC_AADC_Auto_Count, 
                                              "Postage": vm.statement.NP_ST_DNDC_AADC_Auto_Postage});
                    vm.statement.postageTotal_A += vm.statement.NP_ST_DNDC_AADC_Auto_Postage;
                    vm.statement.pieceTotal_A += vm.statement.NP_ST_DNDC_AADC_Auto_Count;
                                              
                    vm.statement.postageDetails_A.push({"PS3602": vm.statement.NP_ST_DNDC_MxdAADC_Auto_PS3602, 
                                              "Entry": vm.statement.NP_ST_DNDC_MxdAADC_Auto_Entry, 
                                              "Category": vm.statement.NP_ST_DNDC_MxdAADC_Auto_Category, 
                                              "Price": vm.statement.NP_ST_DNDC_MxdAADC_Auto_Price, 
                                              "Count": vm.statement.NP_ST_DNDC_MxdAADC_Auto_Count, 
                                              "Postage": vm.statement.NP_ST_DNDC_MxdAADC_Auto_Postage});
                    vm.statement.postageTotal_A += vm.statement.NP_ST_DNDC_MxdAADC_Auto_Postage;
                    vm.statement.pieceTotal_A += vm.statement.NP_ST_DNDC_MxdAADC_Auto_Count;
                    
                    // Non-Auto [B]
                    vm.statement.postageDetails_B.push({"PS3602": vm.statement.NP_ST_DNDC_AADC_NonAuto_PS3602, 
                                              "Entry": vm.statement.NP_ST_DNDC_AADC_NonAuto_Entry, 
                                              "Category": vm.statement.NP_ST_DNDC_AADC_NonAuto_Category, 
                                              "Price": vm.statement.NP_ST_DNDC_AADC_NonAuto_Price, 
                                              "Count": vm.statement.NP_ST_DNDC_AADC_NonAuto_Count, 
                                              "Postage": vm.statement.NP_ST_DNDC_AADC_NonAuto_Postage});
                    vm.statement.postageTotal_B += vm.statement.NP_ST_DNDC_AADC_NonAuto_Postage;
                    vm.statement.pieceTotal_B += vm.statement.NP_ST_DNDC_AADC_NonAuto_Count;
                                              
                    vm.statement.postageDetails_B.push({"PS3602": vm.statement.NP_ST_DNDC_MxdAADC_NonAuto_PS3602, 
                                              "Entry": vm.statement.NP_ST_DNDC_MxdAADC_NonAuto_Entry, 
                                              "Category": vm.statement.NP_ST_DNDC_MxdAADC_NonAuto_Category, 
                                              "Price": vm.statement.NP_ST_DNDC_MxdAADC_NonAuto_Price, 
                                              "Count": vm.statement.NP_ST_DNDC_MxdAADC_NonAuto_Count, 
                                              "Postage": vm.statement.NP_ST_DNDC_MxdAADC_NonAuto_Postage});
                    vm.statement.postageTotal_B += vm.statement.NP_ST_DNDC_MxdAADC_NonAuto_Postage;
                    vm.statement.pieceTotal_B += vm.statement.NP_ST_DNDC_MxdAADC_NonAuto_Count;
                    
                    // -------------------------------------------------------------------------------------------                           
                    // NON-PROFIT/STAMP/DSCF
                    // Auto [A]
                    vm.statement.postageDetails_A.push({"PS3602": vm.statement.NP_ST_DSCF_5Digit_Auto_PS3602, 
                                              "Entry": vm.statement.NP_ST_DSCF_5Digit_Auto_Entry, 
                                              "Category": vm.statement.NP_ST_DSCF_5Digit_Auto_Category, 
                                              "Price": vm.statement.NP_ST_DSCF_5Digit_Auto_Price, 
                                              "Count": vm.statement.NP_ST_DSCF_5Digit_Auto_Count, 
                                              "Postage": vm.statement.NP_ST_DSCF_5Digit_Auto_Postage});
                    vm.statement.postageTotal_A += vm.statement.NP_ST_DSCF_5Digit_Auto_Postage;
                    vm.statement.pieceTotal_A += vm.statement.NP_ST_DSCF_5Digit_Auto_Count;
                                              
                    vm.statement.postageDetails_A.push({"PS3602": vm.statement.NP_ST_DSCF_3Digit_Auto_PS3602, 
                                              "Entry": vm.statement.NP_ST_DSCF_3Digit_Auto_Entry, 
                                              "Category": vm.statement.NP_ST_DSCF_3Digit_Auto_Category, 
                                              "Price": vm.statement.NP_ST_DSCF_3Digit_Auto_Price, 
                                              "Count": vm.statement.NP_ST_DSCF_3Digit_Auto_Count, 
                                              "Postage": vm.statement.NP_ST_DSCF_3Digit_Auto_Postage});
                    vm.statement.postageTotal_A += vm.statement.NP_ST_DSCF_3Digit_Auto_Postage;
                    vm.statement.pieceTotal_A += vm.statement.NP_ST_DSCF_3Digit_Auto_Count;
                    
                    vm.statement.postageDetails_A.push({"PS3602": vm.statement.NP_ST_DSCF_AADC_Auto_PS3602, 
                                              "Entry": vm.statement.NP_ST_DSCF_AADC_Auto_Entry, 
                                              "Category": vm.statement.NP_ST_DSCF_AADC_Auto_Category, 
                                              "Price": vm.statement.NP_ST_DSCF_AADC_Auto_Price, 
                                              "Count": vm.statement.NP_ST_DSCF_AADC_Auto_Count, 
                                              "Postage": vm.statement.NP_ST_DSCF_AADC_Auto_Postage});
                    vm.statement.postageTotal_A += vm.statement.NP_ST_DSCF_AADC_Auto_Postage;
                    vm.statement.pieceTotal_A += vm.statement.NP_ST_DSCF_AADC_Auto_Count;
                                              
                    // Non-Auto [B]
                    vm.statement.postageDetails_B.push({"PS3602": vm.statement.NP_ST_DSCF_AADC_NonAuto_PS3602, 
                                              "Entry": vm.statement.NP_ST_DSCF_AADC_NonAuto_Entry, 
                                              "Category": vm.statement.NP_ST_DSCF_AADC_NonAuto_Category, 
                                              "Price": vm.statement.NP_ST_DSCF_AADC_NonAuto_Price, 
                                              "Count": vm.statement.NP_ST_DSCF_AADC_NonAuto_Count, 
                                              "Postage": vm.statement.NP_ST_DSCF_AADC_NonAuto_Postage});
                    vm.statement.postageTotal_B += vm.statement.NP_ST_DSCF_AADC_NonAuto_Postage;
                    vm.statement.pieceTotal_B += vm.statement.NP_ST_DSCF_AADC_NonAuto_Count;
                                              
                   // GRAND TOTALS
                   vm.statement.pieceTotal = vm.statement.pieceTotal_A + vm.statement.pieceTotal_B; 
                   vm.statement.postageTotal = vm.statement.postageTotal_A + vm.statement.postageTotal_B;
                
                break;
            }
            // return the appended statement
            return statement;
            
        }
         
    }
    
})();
