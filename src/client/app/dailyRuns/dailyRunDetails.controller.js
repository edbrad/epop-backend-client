/* jshint -W109, -W101, -W064, -W064, -W116, -W033, -W106, -W109, -W117, -W032, -W014, -W027, -W033 */
(function () {
    'use strict';
    
    /**
     * @class app.dailRunDetails
     * @memberOf app
     * 
     * @description
     *
     * The `dailRunDetails` module provides details for a given Daily EPOP Run.
     * 
     * @requires
     *   - lbServices: provides access to the back-end database
     *
     */   
    angular
        .module('app.dailyRunDetails', ['lbServices'])
        /**
         * @ngdoc controller
         * @name app.dailRunDetails.controller:DailyRunDetailsController
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
        var fullServiceDiscount = .001;
        
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
         * @methodOf app.dailRunDetails.DailyRunDetailsController
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
         * @methodOf app.dailRunDetails.DailyRunDetailsController
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
         * @methodOf app.dailRunDetails.DailyRunDetailsController
         * @param string date: the input date string (yyyymmdd)
         * @return string date: the formatted date in MM/DD/YYYY format
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
         * @methodOf app.dailRunDetails.DailyRunDetailsController
         * @description
         * 
         * Generate a detailed PDF report of the selected Daily Run
         */
        vm.createPDF = function(){
            // define the document layout
            var docDefinition = {
                // PDF meta data
                info: {
                    title:    'EMS EPOP Daily Run Detail Report : ' + vm.statement.Daily_ID,
                    author:   'Executive Mailing Service - EPOP Backend Client',
                    subject:  'EPOP Backend Client - EPOP Full Service Daily Run PDF',
                    keywords: 'EPOP eDoc Statement Daily Run Full Service',
                },
                // PDF Page content
                header:
                    { text: 'EPOP Daily Full Service Run Report - USPS PostalOne Contingency Document', bold: true, alignment: 'center' },
                content: [
                    { text: ' '},
                    { columns: [
                       {
                            width: '15%',
                            stack:[  
                                { text: 'Mail Date: ' },
                                { text: 'Description: ' },
                                { text: '  ' }
                            ]
                        },
                        {
                            width: '85%',
                            stack:[
                                { text: vm.dateFormat(vm.dailyRunDate), bold: true },
                                { text: vm.dailyRunId, bold: true },
                                { text: '  ' }
                            ]
                        }
                    ],
                        columnGap: 1
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
                    color: {
                        fontSize: 14,
                        color: "red"
                    },
                }
            }
            
            // generate PDF output (from document definition object)
            logger.log("docDefinition: " + JSON.stringify(docDefinition));
            pdfMake.createPdf(docDefinition).open();
            
        };
        
        activate();
        /**
         * @ngdoc method
         * @name activate 
         * @methodOf app.dailRunDetails.DailyRunDetailsController
         * @desription 
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
         * @methodOf app.dailRunDetails.DailyRunDetailsController
         * @desription 
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
         * @name getEDocStatements 
         * @methodOf app.dailRunDetails.DailyRunDetailsController
         * @desription 
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
                    // append accordion group status to each statement
                    for (var i = 0; i < vm.statements.length; i++) {
                        vm.statements[i].accordionGroupStatus = {
                            open: false
                        };  
                    }
                    // append Postage Details to each statement object
                    for (var i = 0; i < vm.statements.length; i++) {
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
         * @methodOf app.dailRunDetails.DailyRunDetailsController
         * @param statement statement object containing the statement details
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
