(function () {
    'use strict';

    angular
        .module('app.permits', ['lbServices'])
        .controller('PermitsController', PermitsController);

    PermitsController.$inject = ['$q', 'Permit', 'logger'];
    /* @ngInject */
    function PermitsController($q, Permit, logger) {
        var vm = this;
        vm.title = 'Permits';
        
        vm.Permits = [];
        
        activate();
        
        function activate() {
            var promises = [getPermits()];
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
    }
})();
