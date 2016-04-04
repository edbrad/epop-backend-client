/* jshint -W109, -W101, -W064, -W064, -W116, -W033, -W106, -W109, -W117, -W032, -W014, -W027, -W033 */
(function () {
    'use strict';
    
    /**
     * @class app.dialogsService
     * @memberOf app
     * 
     * @description
     *
     * The `dialogsService` module provides central management of the various Modal Dialog 
     * windows that are invoked througout the applciation.
     * 
     * @requires
     *   - ui bootstrap: provides the modal window styling
     */
    angular
        .module('app.dialogsService',['ui.bootstrap'])
        /**
         * @ngdoc service
         * @name app.dialogsService.service:dialogsService
         * @description
         * 
         * Factory for the Dialogs Service
         */
        .factory('dialogsService', dialogsService);

    dialogsService.$inject = ['$modal'];
    /* @ngInject */
    function dialogsService($modal) {
		// exposed service methods
        var service = {
			confirm: confirm,
			addMailOwner: addMailOwner,
			deleteMailOwner: deleteMailOwner,
			editMailOwner: editMailOwner,
			addCRID: addCRID,
			deleteCRID: deleteCRID,
			editCRID: editCRID,
			addCRIDToMailOwner: addCRIDToMailOwner,
			addPermit: addPermit,
			deletePermit: deletePermit,
			editPermit: editPermit,
			addPermitToMailOwner: addPermitToMailOwner,
			addMailerId: addMailerId,
			deleteMailerId: deleteMailerId,
			editMailerId: editMailerId,
			addMailerIdToMailOwner: addMailerIdToMailOwner
		};
        
        // expose the service
        return service;
     	
        /**
         * @ngdoc method
         * @name confirm
         * @methodOf app.dialogsService.service:dialogsService
         * @param {string} message - Modal window message text
         * @param {string} title - Modal window title text
         * @param {array} buttons - array of Modal button text
         * @description
         * 
         * generic confirm Modal Window
         */
	 	function confirm(message, title, buttons){
			 var modalInstance = $modal.open({
				templateUrl: 'app/core/confirmModal.html',
				controller: 'ConfirmModalController',
				controllerAs: 'vm',
				resolve: {
					data: function(){
						return {
							message: message,
							title: title,
							buttons: buttons
						};	
					}
				},
				size: 'md'
			 });
			 
			 return modalInstance.result;
		 }
         
		 /**
         * @ngdoc method
         * @name addMailOwner
         * @methodOf app.dialogsService.service:dialogsService
         * @param {string} title - Modal window title text
         * @param {array} buttons - array of Modal button text
         * @description
         * 
         * add Mail Owner Modal Window
         */
		 function addMailOwner(title, buttons){
			 var modalInstance = $modal.open({
				templateUrl: 'app/mailOwners/mailOwnerAddModal.html',
				controller: 'MailOwnerAddModalController',
				controllerAs: 'vm',
				resolve: {
					data: function(){
						return {
							title: title,
							buttons: buttons
						};	
					}
				},
				size: 'md'
			 });
			 
			 return modalInstance.result;
		 }
		 
         /**
         * @ngdoc method
         * @name deleteMailOwner
         * @methodOf app.dialogsService.service:dialogsService
         * @param {string} title - Modal window title text
         * @param {string} message - Modal window title text
         * @param {array} buttons - array of Modal button text
         * @param {string} id - Mailer Owner Database ID (unique key)
         * @description
         * 
         * delete Mail Owner Modal Window
         */
		 function deleteMailOwner(title, message, buttons, id){
			 var modalInstance = $modal.open({
				templateUrl: 'app/mailOwners/mailOwnerDeleteModal.html',
				controller: 'MailOwnerDeleteModalController',
				controllerAs: 'vm',
				resolve: {
					data: function(){
						return {
							title: title,
							message: message,
							buttons: buttons,
							id: id
						};	
					}
				},
				size: 'md'
			 });
			 
			 return modalInstance.result;
		 }
		 
         /**
         * @ngdoc method
         * @name editMailOwner
         * @methodOf app.dialogsService.service:dialogsService
         * @param {string} title - Modal window title text
         * @param {array} buttons - array of Modal button text
         * @param {string} id - Mailer Owner Database ID (unique key)
         * @description
         * 
         * edit Mail Owner Modal Window
         */
		 function editMailOwner(title, buttons, id){
			 var modalInstance = $modal.open({
				templateUrl: 'app/mailOwners/mailOwnerEditModal.html',
				controller: 'MailOwnerEditModalController',
				controllerAs: 'vm',
				resolve: {
					data: function(){
						return {
							title: title,
							buttons: buttons,
							id: id
						};	
					}
				},
				size: 'md'
			 });
			 
			 return modalInstance.result;
		 }
		 
         /**
         * @ngdoc method
         * @name addCRID
         * @methodOf app.dialogsService.service:dialogsService
         * @param {string} title - Modal window title text
         * @param {array} message - array of Modal button text
         * @description
         * 
         * add CRID Modal Window
         */
		 function addCRID(title, buttons){
			 var modalInstance = $modal.open({
				templateUrl: 'app/CRIDs/cridAddModal.html',
				controller: 'CRIDAddModalController',
				controllerAs: 'vm',
				resolve: {
					data: function(){
						return {
							title: title,
							buttons: buttons
						};	
					}
				},
				size: 'md'
			 });
			 
			 return modalInstance.result;
		 }
		 
         /**
         * @ngdoc method
         * @name deleteCRID
         * @methodOf app.dialogsService.service:dialogsService
         * @param {string} title - Modal window title text
         * @param {string} message - Modal window message text
         * @param {array} buttons - array of Modal button text
         * @param {string} id - Mailer Owner Database ID (unique key)
         * @description
         * 
         * delete CRID Modal Window
         */
		 function deleteCRID(title, message, buttons, id){
			 var modalInstance = $modal.open({
				templateUrl: 'app/CRIDs/cridDeleteModal.html',
				controller: 'CRIDDeleteModalController',
				controllerAs: 'vm',
				resolve: {
					data: function(){
						return {
							title: title,
							message: message,
							buttons: buttons,
							id: id
						};	
					}
				},
				size: 'md'
			 });
			 
			 return modalInstance.result;
		 }
         
		 /**
         * @ngdoc method
         * @name editCRID
         * @methodOf app.dialogsService.service:dialogsService
         * @param {string} title - Modal window title text
         * @param {array} buttons - array of Modal button text
         * @param {string} id - Mailer Owner Database ID (unique key)
         * @description
         * 
         * edit CRID Modal Window
         */
		 function editCRID(title, buttons, id){
			 var modalInstance = $modal.open({
				templateUrl: 'app/CRIDs/cridEditModal.html',
				controller: 'CRIDEditModalController',
				controllerAs: 'vm',
				resolve: {
					data: function(){
						return {
							title: title,
							buttons: buttons,
							id: id
						};	
					}
				},
				size: 'md'
			 });
			 
			 return modalInstance.result;
		 }
		 
         /**
         * @ngdoc method
         * @name addCRIDToMailOwner
         * @methodOf app.dialogsService.service:dialogsService
         * @param {string} title - Modal window title text
         * @param {array} buttons - array of Modal button text
         * @param {string} id - Mailer Owner Database ID (unique key)
         * @description
         * 
         * add CRID to Current Mail Owner Modal Window
         */
		 function addCRIDToMailOwner(title, buttons, id){
			 var modalInstance = $modal.open({
				templateUrl: 'app/CRIDs/cridAddToMailOwnerModal.html',
				controller: 'CRIDAddToMailOwnerModalController',
				controllerAs: 'vm',
				resolve: {
					data: function(){
						return {
							title: title,
							buttons: buttons,
							id: id
						};	
					}
				},
				size: 'md'
			 });
			 
			 return modalInstance.result;
		 }
		 
         /**
         * @ngdoc method
         * @name addPermit
         * @methodOf app.dialogsService.service:dialogsService
         * @param {string} title - Modal window title text
         * @param {array} buttons - array of Modal button text
         * @description
         * 
         * add Permit Modal Window
         */
		 function addPermit(title, buttons){
			 var modalInstance = $modal.open({
				templateUrl: 'app/permits/permitAddModal.html',
				controller: 'PermitAddModalController',
				controllerAs: 'vm',
				resolve: {
					data: function(){
						return {
							title: title,
							buttons: buttons
						};	
					}
				},
				size: 'md'
			 });
			 
			 return modalInstance.result;
		 }
		 
         /**
         * @ngdoc method
         * @name deletePermit
         * @methodOf app.dialogsService.service:dialogsService
         * @param {string} title - Modal window title text
         * @param {string} message - Modal window message text
         * @param {array} buttons - array of Modal button text
         * @param {string} id - Mailer Owner Database ID (unique key)
         * @description
         * 
         * delete Permit Modal Window
         */
		 function deletePermit(title, message, buttons, id){
			 var modalInstance = $modal.open({
				templateUrl: 'app/permits/permitDeleteModal.html',
				controller: 'PermitDeleteModalController',
				controllerAs: 'vm',
				resolve: {
					data: function(){
						return {
							title: title,
							message: message,
							buttons: buttons,
							id: id
						};	
					}
				},
				size: 'md'
			 });
			 
			 return modalInstance.result;
		 }
		 
         /**
         * @ngdoc method
         * @name editPermit
         * @methodOf app.dialogsService.service:dialogsService
         * @param {string} title - Modal window title text
         * @param {array} buttons - array of Modal button text
         * @param {string} id - Mailer Owner Database ID (unique key)
         * @description
         * 
         * edit Permit Modal Window
         */
		 function editPermit(title, buttons, id){
			 var modalInstance = $modal.open({
				templateUrl: 'app/permits/permitEditModal.html',
				controller: 'PermitEditModalController',
				controllerAs: 'vm',
				resolve: {
					data: function(){
						return {
							title: title,
							buttons: buttons,
							id: id
						};	
					}
				},
				size: 'md'
			 });
			 
			 return modalInstance.result;
		 }
		 
         /**
         * @ngdoc method
         * @name addPermitToMailOwner
         * @methodOf app.dialogsService.service:dialogsService
         * @param {string} title - Modal window title text
         * @param {array} buttons - array of Modal button text
         * @param {string} id - Mailer Owner Database ID (unique key)
         * @description
         * 
         * add Permit to Current Mail Owner Modal Window
         */
		 function addPermitToMailOwner(title, buttons, id){
			 var modalInstance = $modal.open({
				templateUrl: 'app/permits/permitAddToMailOwnerModal.html',
				controller: 'PermitAddToMailOwnerModalController',
				controllerAs: 'vm',
				resolve: {
					data: function(){
						return {
							title: title,
							buttons: buttons,
							id: id
						};	
					}
				},
				size: 'md'
			 });
			 
			 return modalInstance.result;
		 }
		 
         /**
         * @ngdoc method
         * @name addMailerId
         * @methodOf app.dialogsService.service:dialogsService
         * @param {string} title - Modal window title text
         * @param {array} buttons - array of Modal button text
         * @description
         * 
         * add Mailer Id Modal Window
         */
		 function addMailerId(title, buttons){
			 var modalInstance = $modal.open({
				templateUrl: 'app/mailerIds/mailerIdAddModal.html',
				controller: 'MailerIdAddModalController',
				controllerAs: 'vm',
				resolve: {
					data: function(){
						return {
							title: title,
							buttons: buttons
						};	
					}
				},
				size: 'md'
			 });
			 
			 return modalInstance.result;
		 }
		 
         /**
         * @ngdoc method
         * @name deleteMailerId
         * @methodOf app.dialogsService.service:dialogsService
         * @param {string} title - Modal window title text
         * @param {string} message - Modal window message text
         * @param {array} buttons - array of Modal button text
         * @param {string} id - Mailer Owner Database ID (unique key)
         * @description
         * 
         * delete Mailer Id Modal Window
         */
		 function deleteMailerId(title, message, buttons, id){
			 var modalInstance = $modal.open({
				templateUrl: 'app/mailerIds/mailerIdDeleteModal.html',
				controller: 'MailerIdDeleteModalController',
				controllerAs: 'vm',
				resolve: {
					data: function(){
						return {
							title: title,
							message: message,
							buttons: buttons,
							id: id
						};	
					}
				},
				size: 'md'
			 });
			 
			 return modalInstance.result;
		 }
		 
         /**
         * @ngdoc method
         * @name editMailerId
         * @methodOf app.dialogsService.service:dialogsService
         * @param {string} title - Modal window title text
         * @param {array} buttons - array of Modal button text
         * @param {string} id - Mailer Owner Database ID (unique key)
         * @description
         * 
         * edit Mailer Id Modal Window
         */
		 function editMailerId(title, buttons, id){
			 var modalInstance = $modal.open({
				templateUrl: 'app/mailerIds/mailerIdEditModal.html',
				controller: 'MailerIdEditModalController',
				controllerAs: 'vm',
				resolve: {
					data: function(){
						return {
							title: title,
							buttons: buttons,
							id: id
						};	
					}
				},
				size: 'md'
			 });
			 
			 return modalInstance.result;
		 }
		 
         /**
         * @ngdoc method
         * @name addMailerIdToMailOwner
         * @methodOf app.dialogsService.service:dialogsService
         * @param {string} title - Modal window title text
         * @param {array} buttons - array of Modal button text
         * @param {string} id - Mailer Owner Database ID (unique key)
         * @description
         * 
         * add Mailer Id to Current Mail Owner Modal Window
         */
		 function addMailerIdToMailOwner(title, buttons, id){
			 var modalInstance = $modal.open({
				templateUrl: 'app/mailerIds/mailerIdAddToMailOwnerModal.html',
				controller: 'MailerIdAddToMailOwnerModalController',
				controllerAs: 'vm',
				resolve: {
					data: function(){
						return {
							title: title,
							buttons: buttons,
							id: id
						};	
					}
				},
				size: 'md'
			 });
			 
			 return modalInstance.result;
		 }
	}
})();
