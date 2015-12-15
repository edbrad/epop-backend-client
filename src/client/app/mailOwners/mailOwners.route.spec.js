/* jshint -W117, -W030 */
describe('mailOwners routes', function () {
    describe('state', function () {
        var view = 'app/mailOwners/mailOwners.html';

        beforeEach(function() {
            module('app.mailOwners', bard.fakeToastr);
            bard.inject('$httpBackend', '$location', '$rootScope', '$state', '$templateCache');
        });

        beforeEach(function() {
            $templateCache.put(view, '');
        });

        it('should map state admin to url /mailowners ', function() {
            expect($state.href('mailowners', {})).to.equal('/mailowners');
        });

        it('should map /mailowners route to Mail Owners View template', function () {
            expect($state.get('mailOwners').templateUrl).to.equal(view);
        });

        it('of mailAwners should work with $state.go', function () {
            $state.go('mailowners');
            $rootScope.$apply();
            expect($state.is('mailowners'));
        });
    });
});
