(function () {
    'use strict';

    /**
     * @class app.fileInputService
     * @memberOf app
     *
     * @description
     *
     * The fileInput Service provides local file input functionality for the application.
     * 
     */
    angular
        .module('app.fileInputService', [])
        /**
         * @ngdoc service
         * @name app.fileInputService.service:fileInputService
         * @description
         *
         * Factory for the fileInputService Service
         */
        .factory('fileInputService', fileInputService);

    fileInputService.$inject = ['$q'];
    /* @ngInject */
    function fileInputService($q) {
		// exposed service methods
        var service = {
			readTextFileAsync: readTextFileAsync
		};

		return service;

		function readTextFileAsync(file) {
			var deferred = $q.defer(),
				fileReader = new FileReader(),
				fileName = file.name,
				fileType = file.type,
				fileSize = file.size;
				fileReader.readAsText(file);

			/*Reference: Other options*/
			//fileReader.readAsDataURL(file);
			//fileReader.readAsBinaryString(file);
			//fileReader.readAsArrayBuffer(file);

			fileReader.onload = function (e) {
				deferred.resolve(e.target.result);
			};
			return deferred.promise;
		}

	}
})();
