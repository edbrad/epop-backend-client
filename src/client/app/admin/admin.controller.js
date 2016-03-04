(function () {
    'use strict';

    angular
        .module('app.admin', ['ngFileUpload'])
        .controller('AdminController', AdminController);

    AdminController.$inject = ['logger', '$scope', '$timeout', '$http', 'Upload'];
    /* @ngInject */
    function AdminController(logger, $scope, $timeout, $http, Upload) {
        var vm = this;
        vm.title = 'Admin';

        activate();

        function activate() {
            logger.info('Activated Admin View');
        }
        
        $scope.uploadPic = function (file) {
            $scope.formUpload = true;
            if (file != null) {
                $scope.upload(file)
            }
        };
        
        $scope.upload = function (file, resumable) {
            $scope.errorMsg = null;
            if ($scope.howToSend === 1) {
                uploadUsingUpload(file, resumable);
            } else if ($scope.howToSend == 2) {
                uploadUsing$http(file);
            } else {
                uploadS3(file);
            }
        };
        
        $scope.isResumeSupported = Upload.isResumeSupported();

        $scope.restart = function (file) {
            if (Upload.isResumeSupported()) {
                $http.get('https://angular-file-upload-cors-srv.appspot.com/upload?restart=true&name=' + encodeURIComponent(file.name)).then(function () {
                    $scope.upload(file, true);
                });
            } else {
                $scope.upload(file);
            }
        };

        $scope.chunkSize = 100000;
        function uploadUsingUpload(file, resumable) {
            file.upload = Upload.upload({
                url: 'https://angular-file-upload-cors-srv.appspot.com/upload' + $scope.getReqParams(),
                resumeSizeUrl: resumable ? 'https://angular-file-upload-cors-srv.appspot.com/upload?name=' + encodeURIComponent(file.name) : null,
                resumeChunkSize: resumable ? $scope.chunkSize : null,
                headers: {
                    'optional-header': 'header-value'
                },
                data: { username: $scope.username, file: file }
            });

            file.upload.then(function (response) {
                $timeout(function () {
                    file.result = response.data;
                });
            }, function (response) {
                if (response.status > 0)
                    $scope.errorMsg = response.status + ': ' + response.data;
            }, function (evt) {
                // Math.min is to fix IE which reports 200% sometimes
                file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
            });

            file.upload.xhr(function (xhr) {
                // xhr.upload.addEventListener('abort', function(){console.log('abort complete')}, false);
            });
        }

        function uploadUsing$http(file) {
            file.upload = Upload.http({
                url: 'https://angular-file-upload-cors-srv.appspot.com/upload' + $scope.getReqParams(),
                method: 'POST',
                headers: {
                    'Content-Type': file.type
                },
                data: file
            });

            file.upload.then(function (response) {
                file.result = response.data;
            }, function (response) {
                if (response.status > 0)
                    $scope.errorMsg = response.status + ': ' + response.data;
            });

            file.upload.progress(function (evt) {
                file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
            });
        }

        function uploadS3(file) {
            file.upload = Upload.upload({
                url: $scope.s3url,
                method: 'POST',
                data: {
                    key: file.name,
                    AWSAccessKeyId: $scope.AWSAccessKeyId,
                    acl: $scope.acl,
                    policy: $scope.policy,
                    signature: $scope.signature,
                    'Content-Type': file.type === null || file.type === '' ? 'application/octet-stream' : file.type,
                    filename: file.name,
                    file: file
                }
            });

            file.upload.then(function (response) {
                $timeout(function () {
                    file.result = response.data;
                });
            }, function (response) {
                if (response.status > 0)
                    $scope.errorMsg = response.status + ': ' + response.data;
            });

            file.upload.progress(function (evt) {
                file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
            });
            storeS3UploadConfigInLocalStore();
        }

        $scope.generateSignature = function () {
            $http.post('/s3sign?aws-secret-key=' + encodeURIComponent($scope.AWSSecretKey), $scope.jsonPolicy).
                success(function (data) {
                    $scope.policy = data.policy;
                    $scope.signature = data.signature;
                });
        };

        if (localStorage) {
            $scope.s3url = localStorage.getItem('s3url');
            $scope.AWSAccessKeyId = localStorage.getItem('AWSAccessKeyId');
            $scope.acl = localStorage.getItem('acl');
            $scope.success_action_redirect = localStorage.getItem('success_action_redirect');
            $scope.policy = localStorage.getItem('policy');
            $scope.signature = localStorage.getItem('signature');
        }

        $scope.success_action_redirect = $scope.success_action_redirect || window.location.protocol + '//' + window.location.host;
        $scope.jsonPolicy = $scope.jsonPolicy || '{\n  "expiration": "2020-01-01T00:00:00Z",\n  "conditions": [\n    {"bucket": "angular-file-upload"},\n    ["starts-with", "$key", ""],\n    {"acl": "private"},\n    ["starts-with", "$Content-Type", ""],\n    ["starts-with", "$filename", ""],\n    ["content-length-range", 0, 524288000]\n  ]\n}';
        $scope.acl = $scope.acl || 'private';

        function storeS3UploadConfigInLocalStore() {
            if ($scope.howToSend === 3 && localStorage) {
                localStorage.setItem('s3url', $scope.s3url);
                localStorage.setItem('AWSAccessKeyId', $scope.AWSAccessKeyId);
                localStorage.setItem('acl', $scope.acl);
                localStorage.setItem('success_action_redirect', $scope.success_action_redirect);
                localStorage.setItem('policy', $scope.policy);
                localStorage.setItem('signature', $scope.signature);
            }
        }
        
    }
})();
