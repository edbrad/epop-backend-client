(function () {
    'use strict';

    angular
        .module('app.mailerIds', ['lbServices', 'ui.grid', 'ui.grid.pagination', 'ui.grid.resizeColumns', 'ui.grid.moveColumns', 'ui.grid.selection', 'ui.grid.exporter', 'app.dialogsService'])
        .controller('MailerIdsController', MailerIdsController);

    MailerIdsController.$inject = ['$q', 'MailerID', 'MailOwner', 'logger', '$scope', 'dialogsService'];
    /* @ngInject */
    function MailerIdsController($q, MailerID, MailOwner, logger, $scope, dialog) {
        var vm = this;
        vm.title = 'Mailer Ids';
        
        vm.MailerIds = [];
        vm.MailOwners = [];
        
        var currentDate = new Date();
        
        $scope.gridOptions = {
            paginationPageSizes: [8, 32, 96],
            rowHeight: 40,
            columnDefs:[
                {name: 'MailerID', displayName: 'Mailer ID'},
                {field: 'mailOwnerId', name: 'mailOwnerId', displayName: 'Mail Owner Name',
                 cellTemplate: '<div style="padding: 5px;">{{grid.appScope.getMailOwnerName(row.entity.mailOwnerId)}}</div>'},
                {name: 'MailerName', displayName: 'Mailer Name'},
                {name: 'MailerAddress1', displayName: 'Mailer Address 1'},
                {name: 'MailerAddress2', displayName: 'Mailer Address 2'},
                {name: 'MailerCity', displayName: 'Mailer City'},
                {name: 'MailerState', displayName: 'Mailer State'},
                {name: 'MailerZip5', displayName: 'Zip'},
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
        
        activate();
        
        function activate() {
            var promises = [getMailerIds(), getMailOwners()];
            return $q.all(promises).then(function() {
                logger.info('Activated Mailer Ids View');
            });
        }
        
        function getMailerIds() {
            MailerID.find(
                function (result) {
                    vm.MailerIds = result;
                    $scope.gridOptions.data = result;
                });
        }
        
        function getMailOwners() {
            MailOwner.find(
                function (result) {
                    vm.MailOwners = result;
                });
        }
        
        /*vm.getMailOwnerName = function(id){
            for(var i = 0 ; i < vm.MailOwners.length; i++){
                var obj = vm.MailOwners[i];
                if (obj.id == id){
                    return obj.Name;
                }
            }
        };*/
        
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
            dialog.addMailerId('Add New Mailer ID', ['ADD', 'CANCEL'])
            .then(function(){
                getMailerIds();
                logger.success("New Mailer ID Added!");
            });
        };
        
        // invoke modal dialog to delete current Mailer ID, and update the grid
        $scope.deleteMailerId = function(id){
            dialog.deleteMailerId('Delete Mailer ID?', 'Are You Sure You Want to Delete this Mailer ID?', ['DELETE', 'CANCEL'], id)
            .then(function(){
                getMailerIds();
                logger.success("Mailer ID Deleted!");
            });
        };
        
        // invoke modal dialog w/form to edit selected Mailer Id
        $scope.editMailerId = function(id){
            dialog.editMailerId('Edit Mailer ID', ['UPDATE', 'CANCEL'], id)
            .then(function(){
                getMailerIds();
                logger.success("Mailer ID Updated!");
            });
        };
    }
})();
