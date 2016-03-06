/* jshint -W109, -W101, -W064, -W064, -W116, -W033, -W106, -W109, -W117, -W032, -W014, -W027, -W033 */
(function () {
    'use strict';

    angular
        .module('app.MailerIdEditModal',['lbServices'])
        .controller('MailerIdEditModalController', MailerIdEditModalController);

    MailerIdEditModalController.$inject = ['$q', '$scope','$modalInstance', 'logger', 'data', 'MailerID', 'MailOwner'];
    /* @ngInject */
    function MailerIdEditModalController($q, $scope, $modalInstance, logger, data, MailerID, MailOwner) {
        // establish View Model
        var vm = this;
        
        // get passed-in information from the Mail Owner View, which invoked this dialog
        vm.properties = data;
        
        // storage for the Mailer ID to be edited/updated
        vm.mailerId = {};
        
        // storage for the original Mail Owner associated with the current Mailer Id
        vm.mailOwner = {};
        
        // storage for the new/selected Mail Owner to associate with the updated Mailer Id
        vm.newMailOwner = {};
        
        // storage for Mail Owners (for combo box)
        vm.mailOwners = [];
        
        // error checking flag
        vm.submitted = false;
        
        // perform 'CANCEL' processing (dismiss the Modal)
        vm.cancel = function(){
            logger.warning('Mailer ID Edit Modal: cancel/dismiss');
            vm.mailerId = {}
            vm.mailOwner = {}; 
            $modalInstance.dismiss();
        };
        
        // perform 'UPDATE' processing (update the Permit in the database, then close the dialog)       
        vm.update = function(){
            vm.submitted = true;
            if ($scope.editMailerIdForm.$valid){
                // assign the Mail Owner id from the selected Mail Owner
                vm.mailerId.mailOwnerId = vm.newMailOwner.id;
                logger.log("Updated Mailer ID: " + JSON.stringify(vm.mailerId));
                MailerID.upsert(vm.mailerId).$promise.then(function(){  
                    vm.mailerId = {};      
                    $modalInstance.close()
                });
            }    
        };
        
        // collect selected Mailer Id and asociated Mail Owner from database to display in edit form
        getMailerId();
        
        function getMailerId() {
            MailerID.findById({id: vm.properties.id},
                function (result) {
                    vm.mailerId = result;
                    logger.log("- Mailer Id: " + JSON.stringify(vm.mailerId));
                    MailOwner.findById({id: vm.mailerId.mailOwnerId},
                    function (result) {
                        vm.mailOwner = result;
                        logger.log("Mail Owner ID: " + vm.mailOwner.id);
                        // set the selected Mail Owner
                        for(var i = 0 ; i < vm.mailOwners.length; i++){
                            if (vm.mailerId.mailOwnerId == vm.mailOwners[i].id){
                                vm.newMailOwner = vm.mailOwners[i];
                            }
                        }
                    });
                });
        }
        
        // collect all available Mail Owners, to select which is to be associated with the new Mailer Id
        getMailOwners();
        
        function getMailOwners() {
            MailOwner.find(
                function (result) {
                    vm.mailOwners = result;
                });
        }
    }
})();