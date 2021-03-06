/* jshint -W109, -W101, -W064, -W064, -W116, -W033, -W106, -W109, -W117, -W032, -W014, -W027, -W033 */
(function () {
    'use strict';

    angular
        .module('app.statements', ['lbServices', 'ui.grid', 'ui.grid.pagination', 'ui.grid.resizeColumns', 'ui.grid.moveColumns', 'ui.grid.selection', 'ui.grid.exporter', 'ui.grid.autoResize', 'app.dialogsService', 'jkuri.datepicker'])
        .controller('StatementsController', StatementsController)
        .filter('DateReformatFilter', DateReformatFilter);
        
    StatementsController.$inject = ['$q', 'MailOwner', 'EDocStatement', 'logger', '$scope', 'dialogsService', '$state', '$stateParams', '$timeout'];
    /* @ngInject */
    function StatementsController($q, MailOwner, EDocStatement, logger, $scope, dialog, $state, $stateParams, $timeout) {
        // establish View Model
        var vm = this;
        
        // set View title
        vm.title = 'Statements';
        
        // storage for Mail Owner data
        //vm.mailOwners = [];
        
        // storage for Statement data
        vm.eDocStatements = [];
        
        // storage for the asyncronous function list (for $q) 
        var promises = void[];
        
        // storage for date used in UI Grid Excel/CSV/PDF exporting
        var currentDate = new Date();
        
        // storage for statement date filter
        var wrkDate = new Date();
        var statementDate = wrkDate.getFullYear().toString() + "-" + 
            zeroPad((wrkDate.getMonth() + 1).toString(), 2)  + "-" + 
            zeroPad(wrkDate.getDate().toString(), 2);
        logger.log("initial statement date: " + statementDate);
        vm.statementDateStart = statementDate;
        vm.statementDateEnd = statementDate;
        vm.statementDateStartSearch = statementDate;
        vm.statementDateEndSearch = statementDate;
        
        // run new date-filtered query       
        vm.filterStatementsByDate = function(){
            logger.log("Start Date: " + vm.statementDateStart);
            logger.log("End Date: " + vm.statementDateEnd);
            
            // remove dashes for searching
            vm.statementDateStartSearch = vm.statementDateStart.replace(/-|\s/g, "");
            vm.statementDateEndSearch = vm.statementDateEnd.replace(/-|\s/g, "");
            
            logger.log("New Start Date: " + vm.statementDateStartSearch);
            logger.log("New End Date: " + vm.statementDateEndSearch);
            
            promises = [getEDocStatements()];
            return $q.all(promises).then(function() {
                logger.success('Successfully Filtered Statements!');
            });
        };
                   
        // initialize UI Grid layout/formatting options                            
        $scope.gridOptions = {
            paginationPageSizes: [10, 20, 100],
            rowHeight: 40,
            columnDefs:[
                {name: 'id', displayName: 'ID', visible: false },
                {field: 'Statement_ID', displayName: 'Statement ID', cellTemplate: '<div tooltip-placement="bottom" tooltip-append-to-body="true" uib-tooltip="View the Statement Detail" class="ui-grid-cell-contents" style="padding: 5px; a:hover{color:red; background-color:blue; text-decoration:underline};"><a ui-sref="statementDetail({ id: row.entity.id })">{{ row.entity.Statement_ID }}</a></div>', width: 130},
                {name: 'Description', displayName: 'Description', width: "*"},
                {name: 'MailDate', displayName: 'Mail Date', width: 100, cellFilter: 'DateReformatFilter'},
                {name: 'PermitNumber', displayName: 'Permit #', width: 90 },
                {name: 'TotalPieceCount', displayName: 'Pieces', width: 120, cellFilter: 'number: 0'},
                {name: 'TotalPostage', displayName: 'Postage', width: 120, cellFilter: 'currency:"$" : 3' }
                
            ],
            enableGridMenu: true,
            enableFiltering: true,
            enableSelectAll: true,
            exporterCsvFilename: 'MailOwners_' + '' +
                                 (currentDate.getMonth()+1) + "-"
                                 + currentDate.getDate() + "-"
                                 + currentDate.getFullYear() + "-"  
                                 + currentDate.getHours() + "-"  
                                 + currentDate.getMinutes() + "-" 
                                 + currentDate.getSeconds() 
                                 + '.csv',
            exporterPdfDefaultStyle: {fontSize: 9},
            exporterPdfTableStyle: {margin: [30, 30, 30, 30]},
            exporterPdfTableHeaderStyle: {fontSize: 10, bold: true, italics: true, color: 'red'},
            exporterPdfHeader: { text: "EMS EPOP Backend Client - eDoc Statements", style: 'headerStyle', alignment: 'center', margin: [2, 12] },
            exporterPdfFooter: function ( currentPage, pageCount ) {
                return { text: currentPage.toString() + ' of ' + pageCount.toString(), style: 'footerStyle', alignment: 'center' };
            },
            exporterPdfCustomFormatter: function ( docDefinition ) {
                docDefinition.styles.headerStyle = { fontSize: 22, bold: true };
                docDefinition.styles.footerStyle = { fontSize: 10, bold: true };
                return docDefinition;
            },
            exporterPdfOrientation: 'landscape',
            exporterPdfPageSize: 'LETTER',
            exporterPdfMaxGridWidth: 620,
            exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
                onRegisterApi: function(gridApi){
                $scope.gridApi = gridApi;
            }
        };
              
        // activate/initialize view
        activate();
        
        function activate() {
            logger.log("Start Date: " + vm.statementDateStart);
            logger.log("End Date: " + vm.statementDateEnd);
            
            // remove dashes for searching
            vm.statementDateStartSearch = vm.statementDateStart.replace(/-|\s/g, "");
            vm.statementDateEndSearch = vm.statementDateEnd.replace(/-|\s/g, "");
            
            logger.log("New Start Date: " + vm.statementDateStartSearch);
            logger.log("New End Date: " + vm.statementDateEndSearch);
            promises = [getEDocStatements()];
            return $q.all(promises).then(function() {
                logger.info('Activated Statements View');
            });
        }
        
        // collect eDoc Statements from database (filtered by current date)
        function getEDocStatements(){
            logger.log("stateparams: " + $stateParams.view);
            switch ($stateParams.view)
            {
                // do not filter grid view
                case "grid":
                    EDocStatement.find(
                        function (result) {
                            vm.eDocStatements = result;
                            logger.log("Statement count: " + vm.eDocStatements.length);
                            $scope.gridOptions.data = result;
                        });
                break;
                // apply date filter to card view
                case "card":
                    EDocStatement.find({ filter: { where: { MailDate: { between: [vm.statementDateStartSearch, vm.statementDateEndSearch] } } } },
                        function (result) {
                            vm.eDocStatements = result;
                            logger.log("Statement count: " + vm.eDocStatements.length);
                            $scope.gridOptions.data = result;
                        });
                break;
                // apply date filter (default - card view)
                default:
                    EDocStatement.find({ filter: { where: { MailDate: { between: [vm.statementDateStartSearch, vm.statementDateEndSearch] } } } },
                            function (result) {
                                vm.eDocStatements = result;
                                logger.log("Statement count: " + vm.eDocStatements.length);
                                $scope.gridOptions.data = result;
                            });
                break;
            }
        }
        
        // format numbers w/ comma's
        vm.numberFormat = function(number){
            return numeral(number).format('0,0');
        };
        
        // format numbers as money
        vm.currencyFormat = function(number){
            return numeral(number).format('$0,0.00');
        };
        
        // format Dates
        vm.dateFormat = function(date){
            var refmtDate = date.substring(0,4) + "-" + date.substring(4,6) + "-" + date.substring(6,8);
            return moment(refmtDate).format('MM/DD/YYYY');
        };
        
        // truncate text (for description)
        vm.truncateText = function(text){
            if (text.length <= 25){
                return text;
            }
            else{
                return text.substring(0,25) + "...";
            }    
        };
        
        // zero-padding
        function zeroPad(num, size){
            var s = num + "";
            while(s.length < size){
                s = "0" + s;
            }
            return s;
        }
        
    }
    
    // FILTER - Date Reformat
    function DateReformatFilter() {
        return function(date){
            var refmtDate = date.substring(0,4) + "-" + date.substring(4,6) + "-" + date.substring(6,8);
            return moment(refmtDate).format('MM/DD/YYYY');
        }
    }
            
})();
