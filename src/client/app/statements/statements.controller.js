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
        vm.mailOwners = [];
        
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
            /*columnDefs:[
                {name: 'id', displayName: 'ID', visible: false },
                {field: 'Name', displayName: 'Owner Name', cellTemplate: '<div tooltip-placement="bottom" uib-tooltip="View the Mail Owner Details" class="ui-grid-cell-contents" style="padding: 5px; a:hover{color:red; background-color:blue; text-decoration:underline};"><a ui-sref="mailOwnerDetail({ id: row.entity.id })">{{ row.entity.Name }}</a></div>', width: 200},
                {name: 'Address1', displayName: 'Address 1', width: "*"},
                {name: 'Address2', displayName: 'Address 2', width: "*"},
                {name: 'City', displayName: 'City', width: "*" },
                {name: 'State', displayName: 'State', width: "*"},
                {name: 'Zip5', displayName: 'Zip Code', width: "*" },
                // append Edit & Delete buttons
                {field: 'ACTION', displayname: 'ACTION', cellTemplate: '<span>' +
                                                                       '  <button class="btn btn-primary" style="margin-top: 3px;" ng-click="grid.appScope.editMailOwner(row.entity.id)">' +
                                                                       '	    <i class="fa fa-edit"></i>Edit' +
                                                                       '  </button>' +
                                                                       '</span>' +
                                                                       '<span>'+
                                                                       '	<button class="btn btn-danger" style="margin-top: 3px;" ng-click="grid.appScope.deleteMailOwner(row.entity.id)">' +
                                                                       '		<i class="fa fa-trash"></i>Delete' +
                                                                       '	</button>' +
                                                                       '</span>', width: 173}
            ],*/
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
            promises = [getMailOwners(), getEDocStatements()];
            return $q.all(promises).then(function() {
                logger.info('Activated Mail Owners View');
            });
        }
        
        // collect Mail Owners from database
        function getMailOwners() {
            MailOwner.find(
                function (result) {
                    vm.mailOwners = result;
                    console.log("mail owner count: " + vm.mailOwners.length);
                    $scope.gridOptions.data = result;
                });
        }
        
        // collect eDoc Statements from database
        function getEDocStatements(){
            EDocStatement.find(
                function (result) {
                    vm.eDocStatements = result;
                });
        }
        
    }
            
})();
