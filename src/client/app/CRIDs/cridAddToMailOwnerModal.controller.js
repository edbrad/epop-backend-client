(function () {
    'use strict';

    angular
        .module('app.CRIDAddToMailOwnerModal',['lbServices'])
        .controller('CRIDAddToMailOwnerModalController', CRIDAddToMailOwnerModalController);

    CRIDAddToMailOwnerModalController.$inject = ['$scope','$modalInstance', 'logger', 'data', 'MailOwner', 'CRID'];
    /* @ngInject */
    function CRIDAddToMailOwnerModalController($scope, $modalInstance, logger, data, MailOwner, CRID) {
        // establish View Model
        var vm = this;
        
        // get passed-in information from the CRID View, which invoked this dialog
        vm.properties = data;
        
        // storage for a new CRID to be added
        vm.newCRID = {};
        
        // storage for the selected Mail Owner to associate with the new CRID
        vm.mailOwner = {};
         
        // error checking flag
        vm.submitted = false;
        
        // perform 'CANCEL' processing (dismiss the Modal)
        vm.cancel = function(){
            logger.warning('CRID Add Modal: cancel/dismiss');
            vm.newCRID = {};
            vm.mailOwner = {};
            $modalInstance.dismiss();
        };
        
        // perform 'ADD' processing (Add CRID data to the database, then close the dialog)       
        vm.add = function(){
            vm.submitted = true;
            if ($scope.addCRIDForm.$valid){
                // assign the Mail Owner id from the selected Mail Owner
                vm.newCRID.mailOwnerId = vm.mailOwner.id;
                logger.log("New CRID: " + JSON.stringify(vm.newCRID));
                CRID.create(vm.newCRID).$promise.then(function(){         
                    logger.log('CRID Add Modal: close/ok');
                    vm.newCRID = {};
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