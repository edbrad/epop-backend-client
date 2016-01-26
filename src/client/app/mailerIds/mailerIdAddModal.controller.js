(function () {
    'use strict';

    angular
        .module('app.MailerIdAddModal',['lbServices'])
        .controller('MailerIdAddModalController', MailerIdAddModalController);

    MailerIdAddModalController.$inject = ['$scope','$modalInstance', 'logger', 'data', 'MailOwner', 'MailerID'];
    /* @ngInject */
    function MailerIdAddModalController($scope, $modalInstance, logger, data, MailOwner, MailerID) {
        // establish View Model
        var vm = this;
        
        // get passed-in information from the Mailer Id View, which invoked this dialog
        vm.properties = data;
        
        // storage for a new Mailer Id to be added
        vm.newMailerId = {};
        vm.newMailerId.MailerState = "IL"; // set the initial State Code
        
        // storage for the selected Mail Owner to associate with the new Mailer Id
        vm.mailOwner = {};
        
        // storage for Mail Owners (for combo box)
        vm.mailOwners = [];
        
        // error checking flag
        vm.submitted = false;
        
        // perform 'CANCEL' processing (dismiss the Modal)
        vm.cancel = function(){
            logger.warning('Mailer Id Add Modal: cancel/dismiss');
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
                console.log("New Mailer Id: " + JSON.stringify(vm.newMailerId));
                MailerID.create(vm.newMailerId).$promise.then(function(){         
                    console.log('Mailer Id Add Modal: close/ok');
                    vm.newMailerId = {};
                    vm.mailOwner = {}
                    $modalInstance.close()
                });
            
            }
                
        };
        
        // collect all available Mail Owners, to select which is to be associated with the new Mailer Id
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