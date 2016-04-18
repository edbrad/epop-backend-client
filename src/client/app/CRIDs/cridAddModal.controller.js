(function () {
    'use strict';

    /**
     * @class app.CRIDAddModal
     * @memberOf app
     * 
     * @description
     *
     * The `CRIDAddModal` module provides a controller for a modal window to add a USPS CRID.
     *
     */
    angular
        .module('app.CRIDAddModal', ['lbServices'])
        /**
         * @ngdoc controller
         * @name app.CRIDs.controller:CRIDAddModalController
         * @param {object} $scope: Angular Scope object
         * @param {object} $modalInstance: Angular Bootsrap modal instance object
         * @param {object} logger: Internal Logging Service 
         * @param {array} data: Genertic data (button text)
         * @param {object} MailOwner: Selected Mail Owner
         * @param {object} CRID: Selected CRID
         *
         * @requires
         * 
         * lbServices (Loopback API service)
         * 
         * @description
         * Controller for modal View to add USPS CRID
         * 
         */
        .controller('CRIDAddModalController', CRIDAddModalController);

    CRIDAddModalController.$inject = ['$scope', '$modalInstance',
        'logger', 'data', 'MailOwner',
        'CRID'];
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
        // storage for Mail Owners (for combo box selection list)
        vm.mailOwners = [];
        // error checking flag
        vm.submitted = false;
        
        /**
         * @ngdoc method
         * @name cancel
         * @methodOf app.CRIDs.controller:CRIDAddModalController
         * @description
         * 
         * perform 'CANCEL' processing (dismiss the Modal)
         */
        vm.cancel = function () {
            logger.warning('CRID Add Modal: cancel/dismiss');
            vm.newCRID = {};
            vm.mailOwner = {};
            $modalInstance.dismiss();
        };
        
        /**
         * @ngdoc method
         * @name add
         * @methodOf app.CRIDs.controller:CRIDAddModalController
         * @description
         * 
         * perform 'ADD' processing (Add CRID data to the database, then close the dialog)
         */
        vm.add = function () {
            vm.submitted = true;
            if ($scope.addCRIDForm.$valid) {
                // assign the Mail Owner id from the selected Mail Owner
                vm.newCRID.mailOwnerId = vm.mailOwner.id;
                logger.log('New CRID: ' + JSON.stringify(vm.newCRID));
                CRID.create(vm.newCRID).$promise.then(function () {
                    logger.log('CRID Add Modal: close/ok');
                    vm.newCRID = {};
                    vm.mailOwner = {}
                    $modalInstance.close()
                });
            }
        };
        
        /**
         * @ngdoc method
         * @name getMailOwners
         * @methodOf app.CRIDs.controller:CRIDAddModalController
         * @description
         * 
         * collect all available Mail Owners, to select which is to be associated with the new CRID
         */
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
