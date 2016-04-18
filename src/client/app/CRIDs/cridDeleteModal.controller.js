(function () {
    'use strict';
    /**
     * @class app.CRIDDeleteModal
     * 
     * @description
     *
     * The `CRIDDeleteModalController` module provides a controller for a modal window 
     * to delete a USPS CRID.
     *
     */
    angular
        .module('app.CRIDDeleteModal', ['lbServices'])
        /**
         * @ngdoc controller
         * @name app.CRIDs.controller:CRIDDeleteModal
         * @param {object} $scope: Angular Scope object
         * @param {object} $modalInstance: Angular Bootsrap modal instance object
         * @param {object} logger: Internal Logging Service 
         * @param {array} data: Genertic data (button text)
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
        .controller('CRIDDeleteModalController', CRIDDeleteModalController);

    CRIDDeleteModalController.$inject = ['$scope', '$modalInstance', 'logger', 'data', 'CRID'];
    /* @ngInject */
    function CRIDDeleteModalController($scope, $modalInstance, logger, data, CRID) {
        // establish View Model
        var vm = this;
        // get passed-in information from the CRID View, which invoked this dialog
        vm.properties = data;
        // perform 'CANCEL' processing (dismiss the Modal)
        vm.cancel = function () {
            logger.warning('CRID delete Modal: cancel/dismiss');
            $modalInstance.dismiss();
        };
        // perform 'DELETE' processing (remove CRID, then close the dialog)
        vm.delete = function (id) {
            logger.log('Deleting CRID w/ id: ' + id);
            // delete the CRID
            CRID.deleteById({id: id}).$promise.then(function () {
                logger.log('Deleted CRID');
                $modalInstance.close()
            });
        };
    }
})();
