/* jshint -W117, -W030 */
describe('crids routes', function () {
    describe('state', function () {
        var view = 'app/CRIDs/crids.html';

        beforeEach(function() {
            module('app.CRIDs', bard.fakeToastr);
            bard.inject('$httpBackend', '$location', '$rootScope', '$state', '$templateCache');
        });

        beforeEach(function() {
            $templateCache.put(view, '');
        });

        it('should map state admin to url /crids ', function() {
            expect($state.href('mailowners', {})).to.equal('/crids');
        });

        it('should map /crids route to CRIDs View template', function () {
            expect($state.get('crids').templateUrl).to.equal(view);
        });

        it('of crids should work with $state.go', function () {
            $state.go('crids');
            $rootScope.$apply();
            expect($state.is('crids'));
        });
    });
});
