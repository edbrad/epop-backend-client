(function () {
    'use strict';

    /**
     * @class app.CRIDEditModal
     * @memberOf app
     * 
     * @description
     *
     * The `CRIDEditModal` module provides a controller for a modal window to edit a USPS CRID
     *
     */
    angular
        .module('app.CRIDEditModal', ['lbServices'])
        /**
         * @ngdoc controller
         * @name app.CRIDs.controller:CRIDEditModal
         * @param {object} $q: Angular asychronous process object
         * @param {object} $scope: Angular Scope object
         * @param {object} $modalInstance: Angular Bootsrap modal instance object
         * @param {object} logger: Internal Logging Service 
         * @param {array} data: Genertic data (button text)
         * @param {object} CRID: Selected CRID
         * @param {object} MailOwner: Selected Mail Owner
         * 
         * @requires
         * 
         * lbServices (Loopback API service)
         * 
         * @description
         * Controller for modal View to add USPS CRID to a given Mail Owner
         * 
         */
        .controller('CRIDEditModalController', CRIDEditModalController);

    CRIDEditModalController.$inject = ['$q', '$scope', '$modalInstance', 'logger',
        'data', 'CRID', 'MailOwner'];
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
        
        /**
         * @ngdoc method
         * @name cancel
         * @methodOf app.CRIDs.controller:CRIDEditModal
         * @description
         * 
         * perform 'CANCEL' processing (dismiss the Modal)
         */
        vm.cancel = function () {
            logger.warning('CRID Edit Modal: cancel/dismiss');
            vm.CRID = {}
            vm.mailOwner = {};
            $modalInstance.dismiss();
        };
        
        /**
         * @ngdoc method
         * @name update
         * @methodOf app.CRIDs.controller:CRIDEditModal
         * @description
         * 
         * perform 'UPDATE' processing (update the CRID in the database, then close the dialog)
         */
        vm.update = function () {
            vm.submitted = true;
            if ($scope.editCRIDForm.$valid) {
                // assign the Mail Owner id from the selected Mail Owner
                vm.CRID.mailOwnerId = vm.newMailOwner.id;
                logger.log('Updated CRID: ' + JSON.stringify(vm.CRID));
                CRID.upsert(vm.CRID).$promise.then(function () {
                    vm.CRID = {};
                    $modalInstance.close()
                });
            }
        };
        
        /**
         * @ngdoc method
         * @name getCRID
         * @methodOf app.CRIDs.controller:CRIDEditModal
         * @description
         * 
         * collect selected CRID and asociated Mail Owner from database to display in edit form
         */
        getCRID();
        function getCRID() {
            CRID.findById({id: vm.properties.id},
                function (result) {
                    vm.CRID = result;
                    logger.log('- CRID: ' + JSON.stringify(vm.CRID));
                    MailOwner.findById({id: vm.CRID.mailOwnerId},
                        function (result) {
                            vm.mailOwner = result;
                            logger.log('MailOwner ID: ' + vm.mailOwner.id);
                            // set the selected Mail Owner
                            for (var i = 0; i < vm.mailOwners.length; i++) {
                                if (vm.CRID.mailOwnerId == vm.mailOwners[i].id) {
                                    vm.newMailOwner = vm.mailOwners[i];
                                }
                            }
                        });
                });
        }
        
        /**
         * @ngdoc method
         * @name getMailOwners
         * @methodOf app.CRIDs.controller:CRIDEditModal
         * @description
         * 
         * collect all available Mail Owners, to select which is to be associated with the new CRID
         */
        getMailOwners();
        function getMailOwners() {
            MailOwner.find(
                function (result) {
                    vm.mailOwners = result;
                });
        }
    }
})();
