/* jshint -W109, -W101, -W064, -W064, -W116, -W033, -W106, -W109, -W117, -W032, -W014, -W027, -W033 */
(function () {
    'use strict';

    angular
        .module('app.PermitAddToMailOwnerModal',['lbServices'])
        .controller('PermitAddToMailOwnerModalController', PermitAddToMailOwnerModalController);

    PermitAddToMailOwnerModalController.$inject = ['$scope','$modalInstance', 'logger', 'data', 'MailOwner', 'Permit'];
    /* @ngInject */
    function PermitAddToMailOwnerModalController($scope, $modalInstance, logger, data, MailOwner, Permit) {
        // establish View Model
        var vm = this;
        
        // get passed-in information from the Permit View, which invoked this dialog
        vm.properties = data;
        
        // storage for a new Permit to be added
        vm.newPermit = {};
        vm.newPermit.PermitState = "IL"; // set the initial State Code
        
        // storage for the selected Mail Owner to associate with the new Permit
        vm.mailOwner = {};
         
        // error checking flag
        vm.submitted = false;
        
        // perform 'CANCEL' processing (dismiss the Modal)
        vm.cancel = function(){
            logger.warning('CRID Add Modal: cancel/dismiss');
            vm.newPermit = {};
            vm.mailOwner = {};
            $modalInstance.dismiss();
        };
        
        // perform 'ADD' processing (Add Permit data to the database, then close the dialog)       
        vm.add = function(){
            vm.submitted = true;
            if ($scope.addPermitForm.$valid){
                // assign the Mail Owner id from the selected Mail Owner
                vm.newPermit.mailOwnerId = vm.mailOwner.id;
                logger.log("New CRID: " + JSON.stringify(vm.newPermit));
                Permit.create(vm.newPermit).$promise.then(function(){         
                    logger.log('Permit Add Modal: close/ok');
                    vm.newPermit = {};
                    vm.mailOwner = {}
                    $modalInstance.close()
                });
            
            }
                
        };
        
        // collect current Mail Owner, which is to be associated with the new CRID
        getMailOwner();
        
        function getMailOwner() {
            MailOwner.findById({id: vm.properties.id},
                function (result) {
                    vm.mailOwner = result;
                });
        } 
    }
})();