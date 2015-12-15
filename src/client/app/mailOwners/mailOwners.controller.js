(function () {
    'use strict';

    angular
        .module('app.mailOwners', ['lbServices'])
        .controller('MailOwnersController', MailOwnersController);

    MailOwnersController.$inject = ['$q', 'MailOwner', 'logger'];
    /* @ngInject */
    function MailOwnersController($q, MailOwner, logger) {
        var vm = this;
        vm.title = 'Mail Owners';
        
        vm.mailOwners = [];
        
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
                });
        }
    }
})();
