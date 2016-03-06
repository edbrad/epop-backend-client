/* jshint -W109, -W101, -W064, -W064, -W116, -W033, -W106, -W109, -W117, -W032, -W014, -W027, -W033 */
(function () {
    'use strict';

    angular
        .module('app.CRIDDeleteModal', ['lbServices'])
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
