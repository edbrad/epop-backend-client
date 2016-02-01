(function () {
    'use strict';

    angular
        .module('app.PermitEditModal',['lbServices'])
        .controller('PermitEditModalController', PermitEditModalController);

    PermitEditModalController.$inject = ['$q', '$scope','$modalInstance', 'logger', 'data', 'Permit', 'MailOwner'];
    /* @ngInject */
    function PermitEditModalController($q, $scope, $modalInstance, logger, data, Permit, MailOwner) {
        // establish View Model
        var vm = this;
        
        // get passed-in information from the Mail Owner View, which invoked this dialog
        vm.properties = data;
        
        // storage for the Permit to be edited/updated
        vm.permit = {};
        
        // storage for the original Mail Owner associated with the current Permit
        vm.mailOwner = {};
        
        // storage for the new/selected Mail Owner to associate with the updated Permit
        vm.newMailOwner = {};
        
        // storage for Mail Owners (for combo box)
        vm.mailOwners = [];
        
        // error checking flag
        vm.submitted = false;
        
        // perform 'CANCEL' processing (dismiss the Modal)
        vm.cancel = function(){
            logger.warning('Permit Edit Modal: cancel/dismiss');
            vm.permit = {}
            vm.mailOwner = {}; 
            $modalInstance.dismiss();
        };
        
        // perform 'UPDATE' processing (update the Permit in the database, then close the dialog)       
        vm.update = function(){
            vm.submitted = true;
            if ($scope.editPermitForm.$valid){
                // assign the Mail Owner id from the selected Mail Owner
                vm.permit.mailOwnerId = vm.newMailOwner.id;
                logger.log("Updated Permit: " + JSON.stringify(vm.permit));
                Permit.upsert(vm.permit).$promise.then(function(){  
                    vm.permit = {};      
                    $modalInstance.close()
                });
            
            }    
        };
        
        // collect selected Permit and asociated Mail Owner from database to display in edit form
        getPermit();
        
        function getPermit() {
            Permit.findById({id: vm.properties.id},
                function (result) {
                    vm.permit = result;
                    logger.log("- Permit: " + JSON.stringify(vm.permit));
                    MailOwner.findById({id: vm.permit.mailOwnerId},
                    function (result) {
                        vm.mailOwner = result;
                        logger.log("MailOwner ID: " + vm.mailOwner.id);
                        // set the selected Mail Owner
                        for(var i = 0 ; i < vm.mailOwners.length; i++){
                            if (vm.permit.mailOwnerId == vm.mailOwners[i].id){
                                vm.newMailOwner = vm.mailOwners[i];
                            }
                        }
                    });
                });
        }
        
        // collect all available Mail Owners, to select which is to be associated with the new Permit
        getMailOwners();
        
        function getMailOwners() {
            MailOwner.find(
                function (result) {
                    vm.mailOwners = result;
                });
        }   
    }
})();