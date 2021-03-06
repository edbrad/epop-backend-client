/* jshint -W109, -W101, -W064, -W064, -W116, -W033, -W106, -W109, -W117, -W032, -W014, -W027, -W033 */
(function () {
    'use strict';

    angular
        .module('app.PermitDeleteModal',['lbServices'])
        .controller('PermitDeleteModalController', PermitDeleteModalController);

    PermitDeleteModalController.$inject = ['$scope','$modalInstance', 'logger', 'data', 'Permit'];
    /* @ngInject */
    function PermitDeleteModalController($scope, $modalInstance, logger, data, Permit) {
        // establish View Model
        var vm = this;
        
        // get passed-in information from the CRID View, which invoked this dialog
        vm.properties = data;
        
        // perform 'CANCEL' processing (dismiss the Modal)
        vm.cancel = function(){
            logger.warning('Permit delete Modal: cancel/dismiss');
            $modalInstance.dismiss();
        };
        
        // perform 'DELETE' processing (remove Permit, then close the dialog)
        vm.delete = function(id){
            logger.log('Deleting Permit w/ id: ' + id);
            
            // delete the Permit
            Permit.deleteById({id: id}).$promise.then(function(){         
                logger.log('Deleted Permit');
                $modalInstance.close()
            });
        };   
    }
})();