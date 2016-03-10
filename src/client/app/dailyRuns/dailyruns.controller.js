/* jshint -W109, -W101, -W064, -W064, -W116, -W033, -W106, -W109, -W117, -W032, -W014, -W027, -W033 */
(function () {
    'use strict';
   
    angular
        .module('app.dailyruns', [])
        .controller('DailyRunsController', DailyRunsController);

    DailyRunsController.$inject = ['logger', '$scope', '$timeout', '$http',  '$q', 'EDocStatement'];
    
    /* @ngInject */
    function DailyRunsController(logger, $scope, $timeout, $http, $q, EDocStatement) {
        // establish view model
        var vm = this;
        
        // work variables (internal)
        var promises = void[];          // storage for the asyncronous function list (for $q)
        
        // view model properties
        vm.title = 'Daily Runs';
        
        vm.dailyRuns = [];
        vm.statements = [];
        
        activate();
         
        function activate() {
            promises = [getEDocStatements()];
            return $q.all(promises).then(function() {
                logger.info('Activated Daily Runs View');
            });
        }
        
        // collect eDoc Statements from database (filtered by current date)
        function getEDocStatements() {
            EDocStatement.find(
                function(result) {
                    vm.statements = result;
                    logger.log("Statement count: " + vm.statements.length);
                    buildDailyRunsList();
                });
        }
        
        //
        function buildDailyRunsList(){
            vm.dailyRuns = [];
            var r = -1;
            for (var i = 0; i < (vm.statements.length); i++) {
                // check if the Daily Run exists
                console.log("statement DailyRun_ID:" + vm.statements[i].Daily_ID)
                /*var r = vm.dailyRuns.Daily_ID.indexOf(vm.statements[i].Daily_ID)*/
                r = lookupDailyID("{'Daily_ID': vm.statements[i].Daily_ID}");
                
                // if not, create a new run
                if (r === -1){
                    console.log("not found: " + vm.statements[i].Daily_ID)
                    vm.dailyRuns.push({ Daily_ID: vm.statements[i].Daily_ID, 
                                    Description: vm.statements[i].Description,
                                    TotalPieceCount: vm.statements[i].TotalPieceCount,
                                    TotalPostage: vm.statements[i].TotalPostage
                                })
                }
                // otherwise, tally the piece & postage counts
                else{
                    vm.dailyRuns[r].TotalPieceCount += vm.statements[i].TotalPieceCount;
                    vm.dailyRuns[r].TotalPostage += vm.statements[i].TotalPostage;
                }
            } 
        }
        //
        function lookupDailyID(searchParms) {
            var searchValue = searchParms;
            var index = -1;

            _.each(vm.statements, function(data, idx) {
                if (_.isEqual(data, searchValue)) {
                    index = idx;
                    return;
                }
            })
            return index; 
        }
    }
})();
