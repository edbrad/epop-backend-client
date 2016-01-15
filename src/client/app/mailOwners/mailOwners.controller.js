(function () {
    'use strict';

    angular
        .module('app.mailOwners', ['lbServices', 'ui.grid', 'ui.grid.pagination', 'ui.grid.resizeColumns', 'ui.grid.moveColumns', 'ui.grid.selection', 'ui.grid.exporter', 'app.dialogsService'])
        .controller('MailOwnersController', MailOwnersController);

    MailOwnersController.$inject = ['$q', 'MailOwner', 'logger', '$scope', 'dialogsService'];
    /* @ngInject */
    function MailOwnersController($q, MailOwner, logger, $scope, dialog) {
        var vm = this;
        vm.title = 'Mail Owners';
        
        vm.mailOwners = [];
        
        var promises = void[];
        
        var currentDate = new Date();
        
        $scope.gridOptions = {
            paginationPageSizes: [10, 30, 100],
            columnDefs:[
                {name: 'id', displayName: 'ID', visible: false },
                {field: 'Name', displayName: 'Owner Name', cellTemplate: '<div style="padding: 5px;"><a ui-sref="mailOwnerDetail({ id: row.entity.id })">{{ row.entity.Name }}</a></div>'},
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
        
        activate();
        
        function activate() {
            promises = [getMailOwners()];
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
        
        vm.addMailOwner = function(){
            dialog.addMailOwner('Add New Mail Owner', ['ADD', 'CANCEL'])
            .then(function(){
                getMailOwners();
                logger.info("Add Mail Owner modal complete!");
            });
        };
        
        vm.removeMailOwners = function(){
            dialog.confirm('Are You Sure You Want To DELETE The Selected Mail Owner(s)?','Delete Mail Owner(s)?', ['YES', 'CANCEL'])
            .then(function(){
                logger.info("Delete Mail Owner(s) modal complete!");
            });
        };
    }
})();
