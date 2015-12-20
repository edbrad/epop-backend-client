(function () {
    'use strict';

    angular
        .module('app.CRIDs', ['lbServices', 'ui.grid', 'ui.grid.pagination', 'ui.grid.resizeColumns'])
        .controller('CRIDsController', CRIDsController);

    CRIDsController.$inject = ['$q', 'CRID', 'MailOwner', 'logger', '$scope'];
    /* @ngInject */
    function CRIDsController($q, CRID, MailOwner, logger, $scope) {
        var vm = this;
        
        vm.title = 'CRIDs';
        vm.CRIDs = [];
        vm.MailOwners = [];
        
        $scope.gridOptions = {
            paginationPageSizes: [25, 75, 100],
            columnDefs:[
                {field: 'mailOwnerId', name: 'mailOwnerId', displayName: 'Mail Owner Name',
                 cellTemplate: '<div style="padding: 5px;">{{grid.appScope.getMailOwnerName(row.entity.mailOwnerId)}}</div>'},
                {name: 'CRID', displayName: 'CRID'},
            ],
            enableGridMenu: true,
            enableFiltering: true
        };
        
        activate();
        
        function activate() {
            var promises = [getCRIDs(), getMailOwners()];
            return $q.all(promises).then(function() {
                logger.info('Activated CRIDs View');      
            });
        }
        
        function getCRIDs() {
            CRID.find(
                function (result) {
                    vm.CRIDs = result;
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
