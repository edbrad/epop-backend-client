(function () {
    'use strict';

    angular
        .module('app.mailOwners', ['lbServices', 'ui.grid', 'ui.grid.pagination', 'ui.grid.resizeColumns', 'ui.grid.moveColumns', 'ui.grid.selection', 'ui.grid.exporter', 'app.dialogsService'])
        .controller('MailOwnersController', MailOwnersController);

    MailOwnersController.$inject = ['$q', 'MailOwner', 'logger', '$scope', 'dialogsService', '$state', '$stateParams', '$timeout'];
    /* @ngInject */
    function MailOwnersController($q, MailOwner, logger, $scope, dialog, $state, $stateParams, $timeout) {
        // establish View Model
        var vm = this;
        
        // set View title
        vm.title = 'Mail Owners';
        
        // storage for Mail Owner data
        vm.mailOwners = [];
        
        // asyncronous function array storage 
        var promises = void[];
        
        // store current date for grid export
        var currentDate = new Date();
                    
        // initialize UI Grid layout/formatting options                            
        $scope.gridOptions = {
            paginationPageSizes: [8, 32, 96],
            rowHeight: 40,
            columnDefs:[
                {name: 'id', displayName: 'ID', visible: false },
                {field: 'Name', displayName: 'Owner Name', cellTemplate: '<div style="padding: 5px;"><a ui-sref="mailOwnerDetail({ id: row.entity.id })">{{ row.entity.Name }}</a></div>'},
                {name: 'Address1', displayName: 'Address 1'},
                {name: 'Address2', displayName: 'Address 2'},
                {name: 'City', displayName: 'City' },
                {name: 'State', displayName: 'State'},
                {name: 'Zip5', displayName: 'Zip Code' },
                // append Edit & Delete buttons
                {field: 'ACTION', displayname: 'ACTION', cellTemplate: '<span>' +
                                                                       '  <button class="btn btn-primary" style="margin-top: 3px;" ng-click="grid.appScope.test()">' +
                                                                       '	    <i class="fa fa-edit"></i>Edit' +
                                                                       '  </button>' +
                                                                       '</span>' +
                                                                       '<span>'+
                                                                       '	<button class="btn btn-danger" style="margin-top: 3px;" ng-click="grid.appScope.deleteMailOwner(row.entity.id)">' +
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
            promises = [getMailOwners()];
            return $q.all(promises).then(function() {
                logger.info('Activated Mail Owners View');
            });
        }
        
        // collect Mail Owners from database
        function getMailOwners() {
            MailOwner.find(
                function (result) {
                    vm.mailOwners = result;
                    $scope.gridOptions.data = result;
                });
        }
        
        // invoke modal dialog w/form to add new Mail Owner
        vm.addMailOwner = function(){
            dialog.addMailOwner('Add New Mail Owner', ['ADD', 'CANCEL'])
            .then(function(){
                getMailOwners();
                logger.success("Mail Owner Added!");
            });
        };
        
        // invoke modal dialog to delete current Mail Owner, and update the grid
        $scope.deleteMailOwner = function(id){
            dialog.deleteMailOwner('Delete Mail Owner?', 'WARNING: This will also delete all associated CRIDs, MIDs, Permits and Mailer IDs for this Mail Owner!', ['DELETE', 'CANCEL'], id)
            .then(function(){
                getMailOwners();
                logger.success("Mail Owner Deleted!");
            });
        };
        
    }
})();
