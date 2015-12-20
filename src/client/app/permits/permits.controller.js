(function () {
    'use strict';

    angular
        .module('app.permits', ['lbServices', 'ui.grid', 'ui.grid.pagination', 'ui.grid.resizeColumns'])
        .controller('PermitsController', PermitsController);

    PermitsController.$inject = ['$q', 'Permit', 'MailOwner', 'logger', '$scope'];
    /* @ngInject */
    function PermitsController($q, Permit, MailOwner, logger, $scope) {
        var vm = this;
        vm.title = 'Permits';
        
        vm.Permits = [];
        vm.MailOwners = [];
        
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
            enableFiltering: true
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
