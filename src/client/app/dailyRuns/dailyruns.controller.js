/* jshint -W109, -W101, -W064, -W064, -W116, -W033, -W106, -W109, -W117, -W032, -W014, -W027, -W033 */
(function () {
    'use strict';
   
    angular
        .module('app.dailyruns', [])
        .controller('DailyRunsController', DailyRunsController);

    DailyRunsController.$inject = ['logger', '$scope', '$timeout', '$http',  '$q'];
    
    /* @ngInject */
    function DailyRunsController(logger, $scope, $timeout, $http, $q) {
        // establish view model
        var vm = this;
        
        // work variables (internal)
        var promises = void[];          // storage for the asyncronous function list (for $q)
        
        // view model properties
        vm.title = 'Daily Runs';
    }
})();
