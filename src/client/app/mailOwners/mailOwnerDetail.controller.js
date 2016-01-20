(function () {
    'use strict';

    angular
        .module('app.mailOwnerDetail', ['lbServices', 'app.dialogsService', 'ui.grid', 'ui.grid.pagination', 'ui.grid.resizeColumns', 'ui.grid.moveColumns', 'ui.grid.selection', 'ui.grid.exporter'])
        .controller('MailOwnerDetailController', MailOwnerDetailController);

    MailOwnerDetailController.$inject = ['$q', 'MailOwner', 'logger', '$scope', '$stateParams', 'dialogsService'];
    /* @ngInject */
    function MailOwnerDetailController($q, MailOwner, logger, $scope, $stateParams, dialog) {
        // establish View Model
        var vm = this;
        
        // assign View Title
        vm.title = 'Mail Owner Detail';
        
        // storage for the selected Mail Owner
        vm.mailOwner = [];
        
        // asynchronous functions array storage
        var promises = void[]; 
        
        // initialize UI Grid layout/formatting options for displaying related CRIDs
        $scope.cridsGridOptions = {
            columnDefs:[
                {name: 'CRID', displayName: 'CRID'}
            ]
        };
        
        // initialize UI Grid layout/formatting options for displaying related Permits
        $scope.permitsGridOptions = {
            columnDefs:[
                {name: 'PermitNumber', displayName: '#'},
                {name: 'PermitCity', displayName: 'City'},
                {name: 'PermitState', displayName: 'State'},
                {name: 'PermitZip5', displayName: 'Zip'}
            ]
        };
        
        // initialize UI Grid layout/formatting options for displaying related Mailer Id's
        $scope.mailerIdsGridOptions = {
            columnDefs:[
                {name: 'MailerID', displayName: 'Mailer ID'},
                {name: 'MailerName', displayName: 'Mailer Name'} 
            ]
        };
        
        // format the Mail Owner City/State/Zip line for display
        vm.formatCityStateZip = function(city, state, zip5, zip4){
            return city + ', ' + state + ' ' + zip5;
        };
        
        // activate/initialize view
        activate();
        
        function activate() {
            promises = [getMailOwner(), getCRIDs(), getPermits(), getMailerIDs()];
            return $q.all(promises).then(function() {
                logger.info('Activated Mail Owner Detail View');
            });
        }
        
        // collect selected Mail Owner from database
        function getMailOwner() {
            MailOwner.findById({id: $stateParams.id},
                function (result) {
                    vm.mailOwner = result;
                });
        }
        
        // collect related CRID's for the Mail Owner from the database
        function getCRIDs() {
            MailOwner.CRIDs({id: $stateParams.id},
                function (result) {
                    $scope.cridsGridOptions.data = result;
                });
        }
        
        // collect related Permits for the Mail Owner from the database
        function getPermits() {
            MailOwner.Permits({id: $stateParams.id},
                function (result) {
                    $scope.permitsGridOptions.data = result;
                });
        }
        
        // collect related Mailer Id's for the Mail Owner from the database
        function getMailerIDs() {
            MailOwner.MailerIDs({id: $stateParams.id},
                function (result) {
                    $scope.mailerIdsGridOptions.data = result;
                });
        }
    }
})();
