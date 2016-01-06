(function () {
    'use strict';

    angular
        .module('app.mailOwnerDetail', ['lbServices', 'app.dialogsService', 'ui.grid', 'ui.grid.pagination', 'ui.grid.resizeColumns', 'ui.grid.moveColumns', 'ui.grid.selection', 'ui.grid.exporter'])
        .controller('MailOwnerDetailController', MailOwnerDetailController);

    MailOwnerDetailController.$inject = ['$q', 'MailOwner', 'logger', '$scope', '$stateParams', 'dialogsService'];
    /* @ngInject */
    function MailOwnerDetailController($q, MailOwner, logger, $scope, $stateParams, dialog) {
        var vm = this;
        vm.title = 'Mail Owner Detail';
        vm.mailOwner = [];
        
        var promises = void[]; // asynchronous functions array
        
        $scope.cridsGridOptions = {
            columnDefs:[
                {name: 'CRID', displayName: 'CRID'}
            ]
        };
        
        $scope.permitsGridOptions = {
            columnDefs:[
                {name: 'PermitNumber', displayName: '#'},
                {name: 'PermitCity', displayName: 'City'},
                {name: 'PermitState', displayName: 'State'},
                {name: 'PermitZip5', displayName: 'Zip'}
            ]
        };
        
        $scope.mailerIdsGridOptions = {
            columnDefs:[
                {name: 'MailerID', displayName: 'Mailer ID'},
                {name: 'MailerName', displayName: 'Mailer Name'} 
            ]
        };
        
        
        vm.formatCityStateZip = function(city, state, zip5, zip4){
            return city + ', ' + state + ' ' + zip5;
        };
        
        activate();
        
        function activate() {
            promises = [getMailOwner(), getCRIDs(), getPermits(), getMailerIDs()];
            return $q.all(promises).then(function() {
                logger.info('Activated Mail Owner Detail View');
            });
        }
        
        function getMailOwner() {
            MailOwner.findById({id: $stateParams.id},
                function (result) {
                    vm.mailOwner = result;
                });
        }
        
        function getCRIDs() {
            MailOwner.CRIDs({id: $stateParams.id},
                function (result) {
                    $scope.cridsGridOptions.data = result;
                });
        }
        
        function getPermits() {
            MailOwner.Permits({id: $stateParams.id},
                function (result) {
                    $scope.permitsGridOptions.data = result;
                });
        }
        
        function getMailerIDs() {
            MailOwner.MailerIDs({id: $stateParams.id},
                function (result) {
                    $scope.mailerIdsGridOptions.data = result;
                });
        }
    }
})();
