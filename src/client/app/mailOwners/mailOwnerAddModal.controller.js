(function () {
    'use strict';

    angular
        .module('app.MailOwnerAddModal',['lbServices'])
        .controller('MailOwnerAddModalController', MailOwnerAddModalController);
        
    MailOwnerAddModalController.$inject = ['$scope','$modalInstance', 'logger', 'data', 'MailOwner'];
    /* @ngInject */
    function MailOwnerAddModalController($scope, $modalInstance, logger, data, MailOwner) {
        // establish View Model
        var vm = this;
        
        // get passed-in information from the Mail Owner View, which invoked this dialog
        vm.properties = data;
        
        // storage for a new Mail Owner to be added
        vm.newMailOwner = {};
        vm.newMailOwner.State = "IL"; // set the initial State Code
        
        // error checking flag
        vm.submitted = false;
        
        // perform 'CANCEL' processing (dismiss the Modal)
        vm.cancel = function(){
            logger.warning('Mail Owner Add Modal: cancel/dismiss');
            $modalInstance.dismiss();
        };
        
        // perform 'DELETE' processing (remove Mail Owner and associated data from database, then close the dialog)       
        vm.add = function(){
            vm.submitted = true;
            if ($scope.addMailOwnerForm.$valid){
                logger.log("New Mail Owner: " + JSON.stringify(vm.newMailOwner));
                MailOwner.create(vm.newMailOwner).$promise.then(function(){         
                    logger.success('Mail Owner Add Modal: close/ok');
                    $modalInstance.close()
                });
            
            }
                
        };
        
    }
    
})();