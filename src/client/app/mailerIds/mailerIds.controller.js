(function () {
    'use strict';

    angular
        .module('app.mailerIds', ['lbServices', 'ui.grid', 'ui.grid.pagination', 'ui.grid.resizeColumns'])
        .controller('MailerIdsController', MailerIdsController);

    MailerIdsController.$inject = ['$q', 'MailerID', 'MailOwner', 'logger', '$scope'];
    /* @ngInject */
    function MailerIdsController($q, MailerID, MailOwner, logger, $scope) {
        var vm = this;
        vm.title = 'Mailer Ids';
        
        vm.MailerIds = [];
        vm.MailOwners = [];
        
        $scope.gridOptions = {
            paginationPageSizes: [25, 75, 100],
            columnDefs:[
                {name: 'MailerID', displayName: 'Mailer ID'},
                {field: 'mailOwnerId', name: 'mailOwnerId', displayName: 'Mail Owner Name',
                 cellTemplate: '<div style="padding: 5px;">{{grid.appScope.getMailOwnerName(row.entity.mailOwnerId)}}</div>'},
                {name: 'MailerAddress1', displayName: 'Mailer Address 1'},
                {name: 'MailerAddress2', displayName: 'Mailer Address 2'},
                {name: 'MailerCity', displayName: 'Mailer City'},
                {name: 'MailerState', displayName: 'Mailer State'},
                {name: 'MailerZip5', displayName: 'Zip'}
            ],
            enableGridMenu: true,
            enableFiltering: true
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
    }
})();
