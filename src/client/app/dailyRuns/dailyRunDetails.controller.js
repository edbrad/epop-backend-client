/* jshint -W109, -W101, -W064, -W064, -W116, -W033, -W106, -W109, -W117, -W032, -W014, -W027, -W033 */
(function () {
    'use strict';
   
    angular
        .module('app.dailyRunDetails', ['lbServices'])
        .controller('DailyRunDetailsController', DailyRunDetailsController);

    DailyRunDetailsController.$inject = ['logger', '$scope', '$timeout', '$http',  '$q', 'EDocStatement'];
    
    /* @ngInject */
    function DailyRunDetailsController(logger, $scope, $timeout, $http, $q, EDocStatement) {
        // establish view model
        var vm = this;
        
        // work variables (internal)
        var promises = void[];          // storage for the asyncronous function list (for $q)
        
        var currentDate = new Date();
        
        // view model properties
        vm.title = 'Daily Run Details';
        
        vm.statements = [];
        
        vm.createPDF = function(){
            
        };
        
        // format numbers (piece counts) w/ comma's (numeralJS library)
        vm.numberFormat = function(number){
            return numeral(number).format('0,0');
        }; 
    }
   
   
})();
