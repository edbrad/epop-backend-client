(function () {
    'use strict';

    angular
        .module('app.dashboard', ['lbServices'])
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

        activate();
        
        function activate() {
            var promises = [
                getMessageCount(), 
                getPeople(), 
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

        function getMessageCount() {
            return dataservice.getMessageCount().then(function (data) {
                vm.messageCount = data;
                return vm.messageCount;
            });
        }

        function getPeople() {
            return dataservice.getPeople().then(function (data) {
                vm.people = data;
                return vm.people;
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
                });
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
    }
})();
