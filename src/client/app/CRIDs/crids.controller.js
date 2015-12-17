(function () {
    'use strict';

    angular
        .module('app.CRIDs', ['lbServices'])
        .controller('CRIDsController', CRIDsController);

    CRIDsController.$inject = ['$q', 'CRID', 'MailOwner', 'logger'];
    /* @ngInject */
    function CRIDsController($q, CRID, MailOwner, logger) {
        var vm = this;
        
        vm.title = 'CRIDs';
        vm.CRIDs = [];
        vm.MailOwners = [];
        
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
