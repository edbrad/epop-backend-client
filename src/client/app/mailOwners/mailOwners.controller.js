(function () {
    'use strict';

    angular
        .module('app.mailOwners', ['lbServices', 'ui.grid', 'ui.grid.pagination', 'ui.grid.resizeColumns'])
        .controller('MailOwnersController', MailOwnersController);

    MailOwnersController.$inject = ['$q', 'MailOwner', 'logger', '$scope'];
    /* @ngInject */
    function MailOwnersController($q, MailOwner, logger, $scope) {
        var vm = this;
        vm.title = 'Mail Owners';
        
        vm.mailOwners = [];
        
        $scope.gridOptions = {
            paginationPageSizes: [25, 75, 100],
            columnDefs:[
                {name: 'Name'},
                {name: 'Address1'},
                {name: 'Address2'},
                {name: 'City' },
                {name: 'State'},
                {name: 'Zip5' }
            ],
            enableGridMenu: true,
            enableFiltering: true
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
