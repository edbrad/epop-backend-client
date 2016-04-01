(function () {
    'use strict';
    
    /**
     * @class app.confirmModal
     * @memberOf app
     * 
     * @description
     *
     * The `confirmModal` module provides a generic controller for a "confirm" modal window.
     *
     */
    angular
        .module('app.confirmModal',[])
        /**
         * @ngdoc controller
         * @name app.admin.controller:ConfirmModalController
         * @description
         * 
         * Controller for "Confirm" modal View
         * 
         */
        .controller('ConfirmModalController', ConfirmModalController);

    ConfirmModalController.$inject = ['$modalInstance', 'logger', 'data'];
    /* @ngInject */
    function ConfirmModalController($modalInstance, logger, data) {
        // establish view model
        var vm = this;
        
        // exposed function references
        vm.cancel = cancel;
        vm.ok = ok;
        
        // generic data being passed in
        vm.properties = data;
        
        // cancel/close the modal window w/o action
        function cancel(){
            logger.warning('Confirm Modal: Cancel/Dismiss');
            $modalInstance.dismiss();
        }
        
        // ok/close the modal window w/ action        
        function ok(){
            logger.success('Confirm Modal: Close/Ok');
            $modalInstance.close();
        }      
    }
})();
