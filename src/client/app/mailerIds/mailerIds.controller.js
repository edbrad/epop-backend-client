/* jshint -W109, -W101, -W064, -W064, -W116, -W033, -W106, -W109, -W117, -W032, -W014, -W027, -W033 */
(function () {
    'use strict';

    angular
        .module('app.mailerIds', ['lbServices', 'ui.grid', 'ui.grid.pagination', 'ui.grid.resizeColumns', 'ui.grid.moveColumns', 'ui.grid.selection', 'ui.grid.exporter', 'app.dialogsService'])
        .controller('MailerIdsController', MailerIdsController);

    MailerIdsController.$inject = ['$q', 'MailerID', 'MailOwner', 'logger', '$scope', 'dialogsService'];
    /* @ngInject */
    function MailerIdsController($q, MailerID, MailOwner, logger, $scope, dialog) {
        // establish View Model
        var vm = this;
        
        // set View title
        vm.title = 'Mailer Ids';
        
        // storage for Mailer IDs
        vm.MailerIds = [];
        
        // storage for Mail Owners
        vm.MailOwners = [];
        
        // storage for date used in UI Grid Excel/CSV/PDF exporting
        var currentDate = new Date();
        
        // initialize UI Grid layout/formatting options
        $scope.gridOptions = {
            paginationPageSizes: [10, 20, 100],
            rowHeight: 40,
            columnDefs:[
                {name: 'MailerID', displayName: 'Mailer ID'},
                {field: 'mailOwnerId', name: 'mailOwnerId', displayName: 'Mail Owner',
                 cellTemplate: '<div class="ui-grid-cell-contents" tooltip-placement="bottom" tooltip-append-to-body="true" uib-tooltip="View the Mail Owner Details" style="padding: 5px;"><a ui-sref="mailOwnerDetail({ id: row.entity.mailOwnerId })">{{grid.appScope.getMailOwnerName(row.entity.mailOwnerId)}}</a></div>', width: "*"},
                /*{name: 'MailerName', displayName: 'Mailer Name'},
                {name: 'MailerAddress1', displayName: 'Mailer Address 1'},
                {name: 'MailerAddress2', displayName: 'Mailer Address 2'},
                {name: 'MailerCity', displayName: 'Mailer City'},
                {name: 'MailerState', displayName: 'Mailer State'},
                {name: 'MailerZip5', displayName: 'Zip'},*/
                {field: 'ACTION', displayname: 'ACTION', cellTemplate: '<span>' +
                                                                       '  <button class="btn btn-primary" style="margin-top: 3px;" ng-click="grid.appScope.editMailerId(row.entity.id)">' +
                                                                       '	    <i class="fa fa-edit"></i>Edit' +
                                                                       '  </button>' +
                                                                       '</span>' +
                                                                       '<span>'+
                                                                       '	<button class="btn btn-danger" style="margin-top: 3px;" ng-click="grid.appScope.deleteMailerId(row.entity.id)">' +
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
            exporterPdfHeader: { text: "EMS EPOP Backend Client - USPS Registered Mailer Id's", style: 'headerStyle', alignment: 'center', margin: [2, 12] },
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
            var promises = [getMailerIds(), getMailOwners()];
            return $q.all(promises).then(function() {
                logger.info('Activated Mailer Ids View');
            });
        }
        
        // collect Mailer IDs from database
        function getMailerIds() {
            MailerID.find(
                function (result) {
                    vm.MailerIds = result;
                    $scope.gridOptions.data = result;
                });
        }
        
        // collect Mail Owners from database
        function getMailOwners() {
            MailOwner.find(
                function (result) {
                    vm.MailOwners = result;
                });
        }
        
        // get associated Mail Owner Name for given Permit
        $scope.getMailOwnerName = function(id){
            for(var i = 0 ; i < vm.MailOwners.length; i++){
                var obj = vm.MailOwners[i];
                if (obj.id == id){
                    return obj.Name;
                }
            }
        };
        
        // invoke modal dialog w/form to add new Mailer Id
        vm.addMailerId = function(){
            dialog.addMailerId('Add New Mailer ID', ['Add', 'Cancel'])
            .then(function(){
                getMailerIds();
                logger.success("New Mailer ID Added!");
            });
        };
        
        // invoke modal dialog to delete current Mailer ID, and update the grid
        $scope.deleteMailerId = function(id){
            dialog.deleteMailerId('Delete Mailer ID?', 'Are You Sure You Want to Delete this Mailer ID?', ['Delete', 'Cancel'], id)
            .then(function(){
                getMailerIds();
                logger.success("Mailer ID Deleted!");
            });
        };
        
        // invoke modal dialog w/form to edit selected Mailer Id
        $scope.editMailerId = function(id){
            dialog.editMailerId('Edit Mailer ID', ['Update', 'Cancel'], id)
            .then(function(){
                getMailerIds();
                logger.success("Mailer ID Updated!");
            });
        };
    }
})();
