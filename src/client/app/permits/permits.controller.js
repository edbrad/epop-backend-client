(function () {
    'use strict';

    angular
        .module('app.permits', ['lbServices', 'ui.grid', 'ui.grid.pagination', 'ui.grid.resizeColumns', 'ui.grid.moveColumns', 'ui.grid.selection', 'ui.grid.exporter'])
        .controller('PermitsController', PermitsController);

    PermitsController.$inject = ['$q', 'Permit', 'MailOwner', 'logger', '$scope', 'dialogsService'];
    /* @ngInject */
    function PermitsController($q, Permit, MailOwner, logger, $scope, dialog) {
        // establish View Model
        var vm = this;
        
        // set View title
        vm.title = 'Permits';
        
        // storage for Permits
        vm.Permits = [];
        
        // storage for Mail Owners (to get/display the associated Mail Owner for a Permit)
        vm.MailOwners = [];
        
        // storage for the asyncronous function list (for $q) 
        var promises = void[];
        
        // storage for date used in UI Grid Excel/CSV/PDF exporting
        var currentDate = new Date();
        
        // set UI Grid layout/formatting options
        $scope.gridOptions = {
            paginationPageSizes: [8, 32, 96],
            rowHeight: 40,
            columnDefs:[
                {name: 'PermitNumber', displayName: 'Permit #'},
                {field: 'mailOwnerId', name: 'mailOwnerId', displayName: 'Permit Holder / Mail Owner',
                 cellTemplate: '<div style="padding: 5px;">{{grid.appScope.getMailOwnerName(row.entity.mailOwnerId)}}</div>'},
                {name: 'PermitCity', displayName: 'Permit City'},
                {name: 'PermitState', displayName: 'Permit State'},
                {name: 'PermitZip5', displayName: 'Permit Zip'},
                {field: 'ACTION', displayname: 'ACTION', cellTemplate: '<span>' +
                                                                       '  <button class="btn btn-primary" style="margin-top: 3px;" ng-click="grid.appScope.editPermit(row.entity.id)">' +
                                                                       '	    <i class="fa fa-edit"></i>Edit' +
                                                                       '  </button>' +
                                                                       '</span>' +
                                                                       '<span>'+
                                                                       '	<button class="btn btn-danger" style="margin-top: 3px;" ng-click="grid.appScope.deletePermit(row.entity.id)">' +
                                                                       '		<i class="fa fa-trash"></i>Delete' +
                                                                       '	</button>' +
                                                                       '</span>', width: 173}
            ],
            enableGridMenu: true,
            enableFiltering: true,
            enableSelectAll: true,
            exporterCsvFilename: 'Permits_' + '' +
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
            exporterPdfHeader: { text: "EMS EPOP Backend Client - USPS Registered Permits", style: 'headerStyle', alignment: 'center', margin: [2, 12] },
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
            promises = [getPermits(), getMailOwners()];
            return $q.all(promises).then(function() {
                logger.info('Activated Permits View');
            });
        }
        
        // collect Permits from database
        function getPermits() {
            Permit.find(
                function (result) {
                    vm.Permits = result;
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
        
        // invoke modal dialog w/form to add new Permit
        vm.addPermit = function(){
            dialog.addPermit('Add New Permit', ['ADD', 'CANCEL'])
            .then(function(){
                getPermits();
                logger.success("New Permit Added!");
            });
        };
        
        // invoke modal dialog to delete current Permit, and update the grid
        $scope.deletePermit = function(id){
            dialog.deletePermit('Delete Permit?', 'Are You Sure You Want to Delete this Permit?', ['DELETE', 'CANCEL'], id)
            .then(function(){
                getPermits();
                logger.success("Permit Deleted!");
            });
        };
        
        // invoke modal dialog w/form to edit selected Permit
        $scope.editPermit = function(id){
            dialog.editPermit('Edit Permit', ['UPDATE', 'CANCEL'], id)
            .then(function(){
                getPermits();
                logger.success("Permit Updated!");
            });
        };
        
    }
})();
