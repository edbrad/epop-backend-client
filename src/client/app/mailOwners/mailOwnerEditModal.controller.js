/* jshint -W109, -W101, -W064, -W064, -W116, -W033, -W106, -W109, -W117, -W032, -W014, -W027, -W033 */
(function () {
    'use strict';

    angular
        .module('app.MailOwnerEditModal',['lbServices'])
        .controller('MailOwnerEditModalController', MailOwnerEditModalController);

    MailOwnerEditModalController.$inject = ['$scope','$modalInstance', 'logger', 'data', 'MailOwner'];
    /* @ngInject */
    function MailOwnerEditModalController($scope, $modalInstance, logger, data, MailOwner) {
        // establish View Model
        var vm = this;
        
        // get passed-in information from the Mail Owner View, which invoked this dialog
        vm.properties = data;
        
        // storage for Mail Owner to be edited/updated
        vm.mailOwner = {};
        
        // error checking flag
        vm.submitted = false;
        
        // perform 'CANCEL' processing (dismiss the Modal)
        vm.cancel = function(){
            logger.warning('Mail Owner Edit Modal: cancel/dismiss');
            vm.mailOwner = {}; 
            $modalInstance.dismiss();
        };
        
        // collect selected Mail Owner from database to display in edit form
        getMailOwner();
        
        function getMailOwner() {
            MailOwner.findById({id: vm.properties.id},
                function (result) {
                    vm.mailOwner = result;
                });
        }
        
        // perform 'UPDATE' processing (update the Mail Owner in the database, then close the dialog)       
        vm.update = function(){
            vm.submitted = true;
            if ($scope.editMailOwnerForm.$valid){
                logger.log("Updated Mail Owner: " + JSON.stringify(vm.mailOwner));
                MailOwner.upsert(vm.mailOwner).$promise.then(function(){  
                    vm.mailOwner = {};      
                    $modalInstance.close()
                });
            }
        };
    }
})();