/* jshint -W109, -W101, -W064, -W064, -W116, -W033, -W106, -W109, -W117, -W032, -W014, -W027, -W033 */
(function () {
    'use strict';

    angular
        .module('app.PermitAddModal',['lbServices'])
        .controller('PermitAddModalController', PermitAddModalController);

    PermitAddModalController.$inject = ['$scope','$modalInstance', 'logger', 'data', 'MailOwner', 'Permit'];
    /* @ngInject */
    function PermitAddModalController($scope, $modalInstance, logger, data, MailOwner, Permit) {
        // establish View Model
        var vm = this;
        
        // get passed-in information from the Permit View, which invoked this dialog
        vm.properties = data;
        
        // storage for a new Permit to be added
        vm.newPermit = {};
        vm.newPermit.PermitState = "IL"; // set the initial State Code
        
        // storage for the selected Mail Owner to associate with the new Permit
        vm.mailOwner = {};
        
        // storage for Mail Owners (for combo box selection list)
        vm.mailOwners = [];
        
        // error checking flag
        vm.submitted = false;
        
        // perform 'CANCEL' processing (dismiss the Modal)
        vm.cancel = function(){
            logger.warning('Permit Add Modal: cancel/dismiss');
            vm.newPermit = {};
            vm.mailOwner = {};
            $modalInstance.dismiss();
        };
        
        // perform 'ADD' processing (Add CRID data to the database, then close the dialog)       
        vm.add = function(){
            vm.submitted = true;
            if ($scope.addPermitForm.$valid){
                // assign the Mail Owner id from the selected Mail Owner
                vm.newPermit.mailOwnerId = vm.mailOwner.id;
                logger.log("New Permit: " + JSON.stringify(vm.newPermit));
                Permit.create(vm.newPermit).$promise.then(function(){         
                    logger.log('Permit Add Modal: close/ok');
                    vm.newPermit = {};
                    vm.mailOwner = {}
                    $modalInstance.close()
                });
            }
        };
        
        // collect all available Mail Owners, to select which is to be associated with the new Permit
        getMailOwners();
        
        function getMailOwners() {
            MailOwner.find(
                function (result) {
                    vm.mailOwners = result;
                    // set the first item as selcted in the combo box
                    vm.mailOwner = vm.mailOwners[0];
                });
        }
    }
})();