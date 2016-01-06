(function () {
    'use strict';

    angular
        .module('app.MailOwnerAddModal',[])
        .controller('MailOwnerAddModalController', MailOwnerAddModalController);

    MailOwnerAddModalController.$inject = ['$modalInstance', 'logger', 'data'];
    /* @ngInject */
    function MailOwnerAddModalController($modalInstance, logger, data) {
        var vm = this;
        
        vm.cancel = cancel;
        vm.add = add;
        vm.properties = data;
        
        function cancel(){
            logger.warning('Mail Owner Add Modal: cancel/dismiss');
            $modalInstance.dismiss();
        }
        
        function add(){
            logger.success('Mail Owner Add Modal: close/ok');
            $modalInstance.close();
        }
        
    }
})();