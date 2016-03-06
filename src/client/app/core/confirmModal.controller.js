/* jshint -W109, -W101, -W064, -W064, -W116, -W033 */
(function () {
    'use strict';

    angular
        .module('app.confirmModal',[])
        .controller('ConfirmModalController', ConfirmModalController);

    ConfirmModalController.$inject = ['$modalInstance', 'logger', 'data'];
    /* @ngInject */
    function ConfirmModalController($modalInstance, logger, data) {
        var vm = this;
        
        vm.cancel = cancel;
        vm.ok = ok;
        vm.properties = data;
        
        function cancel(){
            logger.warning('Confirm Modal: cancel/dismiss');
            $modalInstance.dismiss();
        }
        
        function ok(){
            logger.success('Confirm Modal: close/ok');
            $modalInstance.close();
        }
        
    }
})();
