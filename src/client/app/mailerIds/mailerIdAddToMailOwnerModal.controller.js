(function () {
    'use strict';

    angular
        .module('app.MailerIdAddToMailOwnerModal',['lbServices'])
        .controller('MailerIdAddToMailOwnerModalController', MailerIdAddToMailOwnerModalController);

    MailerIdAddToMailOwnerModalController.$inject = ['$scope','$modalInstance', 'logger', 'data', 'MailOwner', 'MailerID'];
    /* @ngInject */
    function MailerIdAddToMailOwnerModalController($scope, $modalInstance, logger, data, MailOwner, MailerID) {
        // establish View Model
        var vm = this;
        
        // get passed-in information from the Permit View, which invoked this dialog
        vm.properties = data;
        
        // storage for a new Mailer ID to be added
        vm.newMailerId = {};
        vm.newMailerId.MailerState = "IL"; // set the initial State Code
        
        // storage for the selected Mail Owner to associate with the new Permit
        vm.mailOwner = {};
         
        // error checking flag
        vm.submitted = false;
        
        // perform 'CANCEL' processing (dismiss the Modal)
        vm.cancel = function(){
            logger.warning('Mailer ID Add Modal: cancel/dismiss');
            vm.newMailerId = {};
            vm.mailOwner = {};
            $modalInstance.dismiss();
        };
        
        // perform 'ADD' processing (Add Mailer Id data to the database, then close the dialog)       
        vm.add = function(){
            vm.submitted = true;
            if ($scope.addMailerIdForm.$valid){
                // assign the Mail Owner id from the selected Mail Owner
                vm.newMailerId.mailOwnerId = vm.mailOwner.id;
                logger.log("New Mailer ID: " + JSON.stringify(vm.newMailerId));
                MailerID.create(vm.newMailerId).$promise.then(function(){         
                    logger.log('Mailer ID Add Modal: close/ok');
                    vm.newMailerId = {};
                    vm.mailOwner = {}
                    $modalInstance.close()
                });
            }
        };
        
        // collect current Mail Owner, which is to be associated with the new Mailer Id
        getMailOwner();
        
        function getMailOwner() {
            MailOwner.findById({id: vm.properties.id},
                function (result) {
                    vm.mailOwner = result;
                });
        }
    }
})();