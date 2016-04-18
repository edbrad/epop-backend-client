(function () {
    'use strict';

    /**
     * @class app.dashboard
     * @memberOf app
     * 
     * @description
     *
     * The `dashboard` module provides an overview of EPOP.
     * 
     * @requires
     *   
     * lbServices (Loopback API service)
     * chart.js (charting library)
     *
     */   
    angular
        .module('app.dashboard', ['lbServices', 'chart.js'])
        /**
         * @ngdoc controller
         * @name app.dashboard.controller:DashboardController
         * @param {object} $q: Angular Asyncronous execution support
         * @param {object} dataservice: TODO REMOVE
         * @param {object} $scope: Angular Scope object
         * @param {object} MailOwner: Mail Owner
         * @param {object} CRID: CRID
         * @param {object} Permit: Permit
         * @param {object} MailerID: Mailer ID
         * @param {object} EDocStatement: eDoc Statement
         * @param {object} logpger: Internal Logging object
         * @description
         * 
         * Controller for Dashboard View
         * 
         */
        .controller('DashboardController', DashboardController);

    DashboardController.$inject = ['$q', 'dataservice', 'MailOwner', 'CRID', 'Permit', 'MailerID','EDocStatement', 'logger'];
    /* @ngInject */
    function DashboardController($q, dataservice, MailOwner, CRID, Permit, MailerID, EDocStatement, logger) {
        var vm = this;
        vm.news = {
            title: 'EPOP Backend Client',
            description: 'Manage EPOP Backend Data.'
        };
        
        vm.title = 'Dashboard';
        
        vm.mailOwners = [];
        vm.mailOwnerCount = [];
        
        vm.CRIDs = [];
        vm.CRIDCount = [];
        
        vm.permits = [];
        vm.permitCount = [];
        
        vm.mailerIDs = [];
        vm.mailerIDCount = [];
        
        vm.eDocStatements =[];
        
        vm.currentDate = new Date();

        activate();
        
        // Pie Chart
        vm.pieLabels = ["Profit Permit Imprint", "Profit Stamp", 
                        "Profit Meter", "Non-Profit Permit Imprint", 
                        "Non-Profit Stamp", "Non-Profit Meter"];
        vm.pieData = [300, 500, 100, 300, 500, 100];
        vm.pieColors = ["#00ff00", "#ff9900", "#00ffff", 
                        "#ffff00", "#cc99ff", "#ff00ff"];
        
        // Line Chart
        vm.lineLabels = ["January", "February", "March", "April", "May", "June", "July"];
        vm.lineSeries = ['Pieces'];
        vm.lineData = [
            [10000000, 11004000, 9000000, 12000000, 11431000, 14000000, 13000000]
        ];
        vm.onLineClick = function (points, evt) {
            console.log(points, evt);
        }
        
        // Bar Chart
        vm.barLabels = ["January", "February", "March", "April", "May", "June", "July"];
        vm.barSeries = ['Schemes'];
        vm.barData = [
            [300, 320, 280, 400, 324, 380, 430]
        ];
        
        vm.barColors = ["red"];
        
        vm.onBar2Click = function (points, evt) {
            console.log(points, evt);
        }
        
        /**
         * @ngdoc method
         * @name activate
         * @methodOf app.dashboard.controller:DashboardController
         * @description
         * 
         * initalize the view
         */     
        function activate() {
            var promises = [
                getMailOwners(), 
                getMailOwnerCount(), 
                getCRIDCount(), 
                getPermitCount(),
                getMailerIDCount(),
                getEDocStatements()
            ];
            return $q.all(promises).then(function() {
                logger.info('Activated Dashboard View');
            });
        }
        
        /**
         * @ngdoc method
         * @name getMailOwner
         * @methodOf app.dashboard.controller:DashboardController
         * @description
         * 
         * get all Mail Owners
         */     
        function getMailOwners() {
            MailOwner.find(
                function (result) {
                    vm.mailOwners = result;
                });
        }
        
        /**
         * @ngdoc method
         * @name getEDocStatements
         * @methodOf app.dashboard.controller:DashboardController
         * @description
         * 
         * get all eDoc Statements
         */    
        function getEDocStatements(){
            EDocStatement.find(
                function (result) {
                    vm.eDocStatements = result;
                    buildPieChart();
                });
        }
        
        /**
         * @ngdoc method
         * @name buildPieChart
         * @methodOf app.dashboard.controller:DashboardController
         * @description
         * 
         * build the Pie Chart
         */    
        function buildPieChart(){
            // initialize/define data fields
            vm.pieData = [];
            var FP_PI_Postage = 0.0;
            var FP_ST_Postage = 0.0;
            var FP_MT_Postage = 0.0;
            var NP_PI_Postage = 0.0;
            var NP_ST_Postage = 0.0;
            var NP_MT_Postage = 0.0;
            
            // tally postage by rate type
            for (var i=0; i < vm.eDocStatements.length; i++) {    
                FP_PI_Postage += vm.eDocStatements[i].FP_PI_Postage;
                FP_ST_Postage += vm.eDocStatements[i].FP_ST_Postage;
                FP_MT_Postage += vm.eDocStatements[i].FP_MT_Postage;
                NP_PI_Postage += vm.eDocStatements[i].NP_PI_Postage;
                NP_ST_Postage += vm.eDocStatements[i].NP_ST_Postage;
                NP_MT_Postage += vm.eDocStatements[i].NP_MT_Postage;
            }
            
            // apply totals to  pie chart
            vm.pieData = [FP_PI_Postage, FP_ST_Postage, FP_MT_Postage, NP_PI_Postage, NP_ST_Postage, NP_MT_Postage];
        }
        
        /**
         * @ngdoc method
         * @name getMailOwnerCount
         * @methodOf app.dashboard.controller:DashboardController
         * @description
         * 
         * Get the count of Mail Owners
         */    
        function getMailOwnerCount() {
            MailOwner.count(
                function (result) {
                    vm.mailOwnerCount = result;
                });
        }
        
        /**
         * @ngdoc method
         * @name getCRIDCount
         * @methodOf app.dashboard.controller:DashboardController
         * @description
         * 
         * Get the count of CRIDs
         */    
        function getCRIDCount() {
            CRID.count(
                function (result) {
                    vm.CRIDCount = result;
                });
        }
        
        /**
         * @ngdoc method
         * @name getPermitCount
         * @methodOf app.dashboard.controller:DashboardController
         * @description
         * 
         * Get the count of Permits
         */  
        function getPermitCount() {
            Permit.count(
                function (result) {
                    vm.PermitCount = result;
                });
        }
        
        /**
         * @ngdoc method
         * @name getMailerIDCount
         * @methodOf app.dashboard.controller:DashboardController
         * @description
         * 
         * Get the count of Mailer ID's
         */  
        function getMailerIDCount() {
            MailerID.count(
                function (result) {
                    vm.MailerIDCount = result;
                });
        }
        
        /**
         * @ngdoc method
         * @name reformatDate
         * @methodOf app.dashboard.controller:DashboardController
         * @returns {string} formatted date
         * @description
         * 
         * Reformat the date
         */  
        vm.reformatDate = function(date){
            return moment(date).format('dddd, MMMM Do, YYYY');
        }
        
    }
})();
