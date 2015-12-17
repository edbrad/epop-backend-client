(function () {
    'use strict';

    angular
        .module('app.mailerIds', ['lbServices'])
        .controller('MailerIdsController', MailerIdsController);

    MailerIdsController.$inject = ['$q', 'MailerID', 'MailOwner', 'logger'];
    /* @ngInject */
    function MailerIdsController($q, MailerID, MailOwner, logger) {
        var vm = this;
        vm.title = 'Mailer Ids';
        
        vm.MailerIds = [];
        vm.MailOwners = [];
        
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
