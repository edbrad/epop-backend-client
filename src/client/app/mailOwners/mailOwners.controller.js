(function () {
    'use strict';

    angular
        .module('app.mailOwners', ['lbServices', 'ui.grid', 'ui.grid.pagination', 'ui.grid.resizeColumns', 'ui.grid.selection', 'ui.grid.exporter'])
        .controller('MailOwnersController', MailOwnersController);

    MailOwnersController.$inject = ['$q', 'MailOwner', 'logger', '$scope'];
    /* @ngInject */
    function MailOwnersController($q, MailOwner, logger, $scope) {
        var vm = this;
        vm.title = 'Mail Owners';
        
        vm.mailOwners = [];
        
        var currentDate = new Date();
        
        $scope.gridOptions = {
            paginationPageSizes: [10, 30, 100],
            columnDefs:[
                {name: 'Name', displayName: 'Owner Name'},
                {name: 'Address1', displayName: 'Address 1'},
                {name: 'Address2', displayName: 'Address 2'},
                {name: 'City', displayName: 'City' },
                {name: 'State', displayName: 'State'},
                {name: 'Zip5', displayName: 'Zip Code' }
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
            exporterPdfHeader: { text: "EMS EPOP Backend Client - USPS Registered Mail Owners", style: 'headerStyle', alignment: 'center' },
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
            exporterPdfMaxGridWidth: 500,
            exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
                onRegisterApi: function(gridApi){
                $scope.gridApi = gridApi;
            }
        };
        
        activate();
        
        function activate() {
            var promises = [getMailOwners()];
            return $q.all(promises).then(function() {
                logger.info('Activated Mail Owners View');
            });
        }
        
        function getMailOwners() {
            MailOwner.find(
                function (result) {
                    vm.mailOwners = result;
                    $scope.gridOptions.data = result;
                });
        }
    }
})();
