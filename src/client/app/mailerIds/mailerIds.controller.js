(function () {
    'use strict';

    angular
        .module('app.mailerIds', ['lbServices'])
        .controller('MailerIdsController', MailerIdsController);

    MailerIdsController.$inject = ['$q', 'MailerID', 'logger'];
    /* @ngInject */
    function MailerIdsController($q, MailerID, logger) {
        var vm = this;
        vm.title = 'Mailer Ids';
        
        vm.MailerIds = [];
        
        activate();
        
        function activate() {
            var promises = [getMailerIds()];
            return $q.all(promises).then(function() {
                logger.info('Activated Mailer Ids View');
            });
        }
        
        function getMailerIds() {
            MailerID.find(
                function (result) {
                    vm.MailerIds = result;
                });
        }
    }
})();
