(function () {
    'use strict';

    angular
        .module('app.CRIDEditModal',['lbServices'])
        .controller('CRIDEditModalController', CRIDEditModalController);

    CRIDEditModalController.$inject = ['$q', '$scope','$modalInstance', 'logger', 'data', 'CRID', 'MailOwner'];
    /* @ngInject */
    function CRIDEditModalController($q, $scope, $modalInstance, logger, data, CRID, MailOwner) {
        // establish View Model
        var vm = this;
        
        // get passed-in information from the Mail Owner View, which invoked this dialog
        vm.properties = data;
        
        // storage for the CRID to be edited/updated
        vm.CRID = {};
        
        // storage for the original Mail Owner associated with the current CRID
        vm.mailOwner = {};
        
        // storage for the new/selected Mail Owner to associate with the updated CRID
        vm.newMailOwner = {};
        
        // storage for Mail Owners (for combo box)
        vm.mailOwners = [];
        
        // error checking flag
        vm.submitted = false;
        
        // perform 'CANCEL' processing (dismiss the Modal)
        vm.cancel = function(){
            logger.warning('CRID Edit Modal: cancel/dismiss');
            vm.CRID = {}
            vm.mailOwner = {}; 
            $modalInstance.dismiss();
        };
        
        // perform 'UPDATE' processing (update the CRID in the database, then close the dialog)       
        vm.update = function(){
            vm.submitted = true;
            if ($scope.editCRIDForm.$valid){
                // assign the Mail Owner id from the selected Mail Owner
                vm.CRID.mailOwnerId = vm.newMailOwner.id;
                logger.log("Updated CRID: " + JSON.stringify(vm.CRID));
                CRID.upsert(vm.CRID).$promise.then(function(){  
                    vm.CRID = {};      
                    $modalInstance.close()
                });
            }    
        };
        
        // collect selected CRID and asociated Mail Owner from database to display in edit form
        getCRID();
        
        function getCRID() {
            CRID.findById({id: vm.properties.id},
                function (result) {
                    vm.CRID = result;
                    logger.log("- CRID: " + JSON.stringify(vm.CRID));
                    MailOwner.findById({id: vm.CRID.mailOwnerId},
                    function (result) {
                        vm.mailOwner = result;
                        logger.log("MailOwner ID: " + vm.mailOwner.id);
                        // set the selected Mail Owner
                        for(var i = 0 ; i < vm.mailOwners.length; i++){
                            if (vm.CRID.mailOwnerId == vm.mailOwners[i].id){
                                vm.newMailOwner = vm.mailOwners[i];
                            }
                        }
                    });
                });
        }
        
        // collect all available Mail Owners, to select which is to be associated with the new CRID
        getMailOwners();
        
        function getMailOwners() {
            MailOwner.find(
                function (result) {
                    vm.mailOwners = result;
                });
        }    
    }
})();