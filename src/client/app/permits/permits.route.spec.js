/* jshint -W117, -W030 */
describe('permits routes', function () {
    describe('state', function () {
        var view = 'app/permits/permits.html';

        beforeEach(function() {
            module('app.permits', bard.fakeToastr);
            bard.inject('$httpBackend', '$location', '$rootScope', '$state', '$templateCache');
        });

        beforeEach(function() {
            $templateCache.put(view, '');
        });

        it('should map state admin to url /permits ', function() {
            expect($state.href('permits', {})).to.equal('/permits');
        });

        it('should map /permits route to Permits View template', function () {
            expect($state.get('permits').templateUrl).to.equal(view);
        });

        it('of permits should work with $state.go', function () {
            $state.go('permits');
            $rootScope.$apply();
            expect($state.is('permits'));
        });
    });
});
