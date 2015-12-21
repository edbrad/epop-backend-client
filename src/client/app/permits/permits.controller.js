(function () {
    'use strict';

    angular
        .module('app.permits', ['lbServices', 'ui.grid', 'ui.grid.pagination', 'ui.grid.resizeColumns', 'ui.grid.moveColumns', 'ui.grid.selection', 'ui.grid.exporter'])
        .controller('PermitsController', PermitsController);

    PermitsController.$inject = ['$q', 'Permit', 'MailOwner', 'logger', '$scope'];
    /* @ngInject */
    function PermitsController($q, Permit, MailOwner, logger, $scope) {
        var vm = this;
        vm.title = 'Permits';
        
        vm.Permits = [];
        vm.MailOwners = [];
        
        var currentDate = new Date();
        
        $scope.gridOptions = {
            paginationPageSizes: [25, 75, 100],
            columnDefs:[
                {name: 'PermitNumber', displayName: 'Permit #'},
                {field: 'mailOwnerId', name: 'mailOwnerId', displayName: 'Permit Holder / Mail Owner',
                 cellTemplate: '<div style="padding: 5px;">{{grid.appScope.getMailOwnerName(row.entity.mailOwnerId)}}</div>'},
                {name: 'PermitCity', displayName: 'Permit City'},
                {name: 'PermitState', displayName: 'Permit State'},
                {name: 'PermitZip5', displayName: 'Permit Zip'}
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
        
        activate();
        
        function activate() {
            var promises = [getPermits(), getMailOwners()];
            return $q.all(promises).then(function() {
                logger.info('Activated Permits View');
            });
        }
        
        function getPermits() {
            Permit.find(
                function (result) {
                    vm.Permits = result;
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
    }
})();
