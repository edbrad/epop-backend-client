(function () {
    'use strict';

    angular
        .module('app.statements', ['lbServices', 'ui.grid', 'ui.grid.pagination', 'ui.grid.resizeColumns', 'ui.grid.moveColumns', 'ui.grid.selection', 'ui.grid.exporter', 'ui.grid.autoResize', 'app.dialogsService'])
        .controller('StatementsController', StatementsController);
        
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
                    
        // initialize UI Grid layout/formatting options                            
        $scope.gridOptions = {
            paginationPageSizes: [8, 32, 96],
            rowHeight: 40,
            columnDefs:[
                {name: 'id', displayName: 'ID', visible: false },
                {field: 'Statement_ID', displayName: 'Statement ID'},
                {name: 'Description', displayName: 'Description', width: "*"},
                {name: 'MailDate', displayName: 'Mail Date', width: "*"},
                {name: 'PermitNumber', displayName: 'Permit #', width: "*" },
                {name: 'TotalPieceCount', displayName: 'Pieces', width: "*"},
                {name: 'TotalPostage', displayName: 'Postage', width: "*" },
                // append Edit & Delete buttons
                {field: 'ACTION', displayname: 'ACTION', cellTemplate: '<span>' +
                                                                       '  <button class="btn btn-primary" style="margin-top: 3px;" ng-click="grid.appScope.editStatement(row.entity.id)">' +
                                                                       '	    <i class="fa fa-edit"></i>Edit' +
                                                                       '  </button>' +
                                                                       '</span>' +
                                                                       '<span>'+
                                                                       '	<button class="btn btn-danger" style="margin-top: 3px;" ng-click="grid.appScope.deleteStatement(row.entity.id)">' +
                                                                       '		<i class="fa fa-trash"></i>Delete' +
                                                                       '	</button>' +
                                                                       '</span>', width: 173}
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
            exporterPdfHeader: { text: "EMS EPOP Backend Client - USPS Registered Mail Owners", style: 'headerStyle', alignment: 'center', margin: [2, 12] },
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
            promises = [getEDocStatements()];
            return $q.all(promises).then(function() {
                logger.info('Activated Statements View');
            });
        }
        
        // collect Statements from database
        /*function getMailOwners() {
            MailOwner.find(
                function (result) {
                    vm.mailOwners = result;
                    console.log("mail owner count: " + vm.mailOwners.length);
                    $scope.gridOptions.data = result;
                });
        }*/
        
        // collect eDoc Statements from database
        function getEDocStatements(){
            EDocStatement.find(
                function (result) {
                    vm.eDocStatements = result;
                    console.log("Statement count: " + vm.eDocStatements.length);
                    $scope.gridOptions.data = result;
                });
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
            return moment(date).format('MMMM Do YYYY');
        };
        
    }
            
})();
