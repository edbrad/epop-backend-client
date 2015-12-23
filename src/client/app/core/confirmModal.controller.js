(function () {
    'use strict';

    angular
        .module('app.core')
        .controller('ConfirmModalController', ConfirmModalController);

    ConfirmModalController.$inject = ['$modalInstance', 'data'];
    /* @ngInject */
    function ConfirmModalController($modalInstance, data) {
        var vm = this;
        
        vm.cancel = cancel;
        vm.ok = ok;
        vm.properties = data;
        
        function cancel(){
            $modalInstance.dismiss();
        }
        
        function ok(){
            $modalInstance.close();
        }
        
    }
})();
