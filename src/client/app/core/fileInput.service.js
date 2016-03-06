/* jshint -W109, -W101, -W064, -W064, -W116, -W033, -W106, -W109, -W117, -W032, -W014, -W027, -W033 */
(function () {
    'use strict';

    angular
        .module('app.fileInputService', [])
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
		};

	}
})();