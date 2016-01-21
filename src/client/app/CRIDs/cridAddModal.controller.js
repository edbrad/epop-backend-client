(function () {
    'use strict';

    angular
        .module('app.CRIDAddModal',['lbServices'])
        .controller('CRIDAddModalController', CRIDAddModalController);

    CRIDAddModalController.$inject = ['$scope','$modalInstance', 'logger', 'data', 'MailOwner', 'CRID'];
    /* @ngInject */
    function CRIDAddModalController($scope, $modalInstance, logger, data, MailOwner, CRID) {
        // establish View Model
        var vm = this;
        
        // get passed-in information from the CRID View, which invoked this dialog
        vm.properties = data;
        
        // storage for a new CRID to be added
        vm.newCRID = {};
        
        // storage for the selected Mail Owner to associate with the new CRID
        vm.mailOwner = {};
        
        // storage for Mail Owners (for combo box)
        vm.mailOwners = [];
        
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
                console.log("New CRID: " + JSON.stringify(vm.newCRID));
                CRID.create(vm.newCRID).$promise.then(function(){         
                    console.log('CRID Add Modal: close/ok');
                    vm.newCRID = {};
                    vm.mailOwner = {}
                    $modalInstance.close()
                });
            
            }
                
        };
        
        // collect all available Mail Owners, to select which is to be associated with the new CRID
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