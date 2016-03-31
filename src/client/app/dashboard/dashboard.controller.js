/* jshint -W109, -W101, -W064, -W064, -W116, -W033, -W106, -W109, -W117, -W032, -W014, -W027, -W033 */
(function () {
    'use strict';

    angular
        .module('app.dashboard', ['lbServices', 'chart.js'])
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
        vm.pieLabels = ["Profit Permit Imprint", "Profit Stamp", "Profit Meter", "Non-Profit Permit Imprint", "Non-Profit Stamp", "Non-Profit Meter"];
        vm.pieData = [300, 500, 100, 300, 500, 100];
        vm.pieColors = ["#00ff00", "#ff9900", "#00ffff", "#ffff00", "#cc99ff", "#ff00ff"];
        
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
        
        function getMailOwners() {
            MailOwner.find(
                function (result) {
                    vm.mailOwners = result;
                });
        }
        
        function getEDocStatements(){
            EDocStatement.find(
                function (result) {
                    vm.eDocStatements = result;
                    buildPieChart();
                });
        }
        
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
        
        function getMailOwnerCount() {
            MailOwner.count(
                function (result) {
                    vm.mailOwnerCount = result;
                });
        }
        
        function getCRIDCount() {
            CRID.count(
                function (result) {
                    vm.CRIDCount = result;
                });
        }
        
        function getPermitCount() {
            Permit.count(
                function (result) {
                    vm.PermitCount = result;
                });
        }
        
        function getMailerIDCount() {
            MailerID.count(
                function (result) {
                    vm.MailerIDCount = result;
                });
        }
        
        vm.reformatDate = function(date){
            return moment(date).format('dddd, MMMM Do, YYYY');
        }
        
    }
})();
