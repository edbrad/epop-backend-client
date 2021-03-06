/* jshint -W109, -W101, -W064, -W064, -W116, -W033, -W106, -W109, -W117, -W032, -W014, -W027, -W033 */
(function () {
    'use strict';

    angular
        .module('app.MailOwnerDeleteModal',['lbServices'])
        .controller('MailOwnerDeleteModalController', MailOwnerDeleteModalController);

    MailOwnerDeleteModalController.$inject = ['$scope','$modalInstance', 'logger', 'data', 'MailOwner'];
    /* @ngInject */
    function MailOwnerDeleteModalController($scope, $modalInstance, logger, data, MailOwner) {
        // establish View Model
        var vm = this;
        
        // get passed-in information from the Mail Owner View, which invoked this dialog
        vm.properties = data;
        
        // perform 'CANCEL' processing (dismiss the Modal)
        vm.cancel = function(){
            logger.warning('Mail Owner delete Modal: cancel/dismiss');
            $modalInstance.dismiss();
        };
        
        // perform 'DELETE' processing (remove Mail Owner and associated data from database, then close the dialog)
        vm.delete = function(id){
            logger.log('Deleting Mail Owner w/ id: ' + id);
            
            // delete related CRID's
            MailOwner.CRIDs.destroyAll({id: id}).$promise.then(function(){         
                logger.log('Deleted All Related CRIDs');
            });
            
            // delete related Permits
            MailOwner.Permits.destroyAll({id: id}).$promise.then(function(){         
                logger.log('Deleted All Related Permits');
            });
            
            // delete related Mailer Id's
            MailOwner.MailerIDs.destroyAll({id: id}).$promise.then(function(){         
                logger.log('Deleted All Related MailerIDs');
            });
            
            // delete the Mail Owner
            MailOwner.deleteById({id: id}).$promise.then(function(){         
                logger.log('Deleted Mail Owner');
                $modalInstance.close()
            });
            
        }; 
        
    }
})();