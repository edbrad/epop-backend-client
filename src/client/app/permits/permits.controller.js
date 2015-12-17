(function () {
    'use strict';

    angular
        .module('app.permits', ['lbServices'])
        .controller('PermitsController', PermitsController);

    PermitsController.$inject = ['$q', 'Permit', 'MailOwner', 'logger'];
    /* @ngInject */
    function PermitsController($q, Permit, MailOwner, logger) {
        var vm = this;
        vm.title = 'Permits';
        
        vm.Permits = [];
        vm.MailOwners = [];
        
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
                });
        }
        
        function getMailOwners() {
            MailOwner.find(
                function (result) {
                    vm.MailOwners = result;
                });
        }
        
        vm.getMailOwnerName = function(id){
            for(var i = 0 ; i < vm.MailOwners.length; i++){
                var obj = vm.MailOwners[i];
                if (obj.id == id){
                    return obj.Name;
                }
            }
        };
    }
})();
