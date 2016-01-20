(function () {
    'use strict';

    angular
        .module('app.CRIDs', ['lbServices', 'ui.grid', 'ui.grid.pagination', 'ui.grid.resizeColumns', 'ui.grid.moveColumns', 'ui.grid.selection', 'ui.grid.exporter','app.dialogsService'])
        .controller('CRIDsController', CRIDsController);

    CRIDsController.$inject = ['$q', 'CRID', 'MailOwner', 'logger', '$scope', 'dialogsService'];
    /* @ngInject */
    function CRIDsController($q, CRID, MailOwner, logger, $scope, dialog) {
        // establish View Model
        var vm = this;
        
        // View title
        vm.title = 'CRIDs';
        
        // storage for CRID's
        vm.CRIDs = [];
        
        // storage for available Mail Owners
        vm.MailOwners = [];
        
        // date used in Reports and Excel/CSV exporting
        var currentDate = new Date();
        
        // CRID display grid options
        $scope.gridOptions = {
            paginationPageSizes: [8, 32, 96],
            rowHeight: 40,
            columnDefs:[
                {field: 'mailOwnerId', name: 'mailOwnerId', displayName: 'Mail Owner Name',
                 cellTemplate: '<div style="padding: 5px;">{{grid.appScope.getMailOwnerName(row.entity.mailOwnerId)}}</div>'},
                {name: 'CRID', displayName: 'CRID'},
                // append Edit & Delete buttons
                {field: 'ACTION', displayname: 'ACTION', cellTemplate: '<span>' +
                                                                       '  <button class="btn btn-primary" style="margin-top: 3px;" ng-click="grid.appScope.editCRID(row.entity.id)">' +
                                                                       '	    <i class="fa fa-edit"></i>Edit' +
                                                                       '  </button>' +
                                                                       '</span>' +
                                                                       '<span>'+
                                                                       '	<button class="btn btn-danger" style="margin-top: 3px;" ng-click="grid.appScope.deleteCRID(row.entity.id)">' +
                                                                       '		<i class="fa fa-trash"></i>Delete' +
                                                                       '	</button>' +
                                                                       '</span>', width: 173}
            ],
            enableGridMenu: true,
            enableFiltering: true,
            enableSelectAll: true,
            exporterCsvFilename: 'CRIDs_' + '' +
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
            exporterPdfHeader: { text: "EMS EPOP Backend Client - USPS Registered CRID&#39s", style: 'headerStyle', alignment: 'center', margin: [2, 12] },
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
        
        // initialize the view
        activate();
        
        function activate() {
            var promises = [getCRIDs(), getMailOwners()];
            return $q.all(promises).then(function() {
                logger.info('Activated CRIDs View');      
            });
        }
        
        // get all available CRIDs
        function getCRIDs() {
            CRID.find(
                function (result) {
                    vm.CRIDs = result;
                    $scope.gridOptions.data = result;
                });
        }
        
        // get all available Mail Owners
        function getMailOwners() {
            MailOwner.find(
                function (result) {
                    vm.MailOwners = result;
                });
        }
        
        // get the Mail Owner name from  it's Id
        $scope.getMailOwnerName = function(id){
            for(var i = 0 ; i < vm.MailOwners.length; i++){
                var obj = vm.MailOwners[i];
                if (obj.id == id){
                    return obj.Name;
                }
            }
        };
        
        // invoke modal dialog w/form to add new CRID
        vm.addCRID = function(){
            dialog.addCRID('Add New CRID', ['ADD', 'CANCEL'])
            .then(function(){
                getCRIDs();
                logger.success("New CRID Added!");
            });
        };
        
        // invoke modal dialog to delete current CRID, and update the grid
        $scope.deleteCRID = function(id){
            dialog.deleteCRID('Delete CRID?', 'Are You Sure You Want to Delete this CRID?', ['DELETE', 'CANCEL'], id)
            .then(function(){
                getCRIDs();
                logger.success("CRID Deleted!");
            });
        };
        
        // invoke modal dialog w/form to edit selected CRID
        $scope.editCRID = function(id){
            dialog.editCRID('Edit CRID', ['UPDATE', 'CANCEL'], id)
            .then(function(){
                getCRIDs();
                logger.success("CRID Updated!");
            });
        };
        
         
    }
})();
